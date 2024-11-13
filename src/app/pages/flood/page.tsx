"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  deleteDoc,
  orderBy,
  doc,
} from "firebase/firestore";
import { Layout } from "@/components/Layout";
import EditFloodData from "./EditFloodData";
import { Authenticator } from "@/components/Authenthicator";
import { camelCaseToTitleCase } from "@/lib/string";
import { Printer, FileDown, ArrowUpDown } from "lucide-react";
import { usePinVerification } from "@/hooks/usePinVerification";
import { PinVerificationModal } from "@/components/PinVerificationModal";

interface Position {
  lat: number;
  lng: number;
}

interface FloodRecord {
  id: string;
  barangay: string;
  date: string;
  severity: string;
  waterLevel: number;
  rainfallAmount: number;
  position: Position[];
}

type SortableKey = 'barangay' | 'date' | 'severity' | 'waterLevel' | 'rainfallAmount';

type SortConfig = {
  key: SortableKey | null;
  direction: 'asc' | 'desc';
};

const FloodData = () => {
  const [floodData, setFloodData] = useState<FloodRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState<{ from: string; to: string; barangay: string }>({
    from: "",
    to: "",
    barangay: "",
  });
  const [barangays, setBarangays] = useState<string[]>([]);
  const {
    isPinModalOpen,
    setIsPinModalOpen,
    pin,
    setPin,
    error,
    verifyPin,
    requirePin
  } = usePinVerification();

  const fetchFloodData = async () => {
    setLoading(true);
    try {
      let q = collection(db, "floods");
      const queryConstraints: any[] = [];

      // Add date filters if they exist
      if (filters.from && filters.to) {
        queryConstraints.push(where("date", ">=", filters.from));
        queryConstraints.push(where("date", "<=", filters.to));
      } else if (filters.from) {
        queryConstraints.push(where("date", ">=", filters.from));
      } else if (filters.to) {
        queryConstraints.push(where("date", "<=", filters.to));
      }

      // Add barangay filter if selected
      if (filters.barangay) {
        // Create case-insensitive options for the barangay name
        const barangayName = filters.barangay.trim();
        queryConstraints.push(where("barangay", "==", barangayName));
      }

      // Add ordering
      queryConstraints.push(orderBy("date", "desc"));
      queryConstraints.push(limit(50));

      // Construct and execute query
      const querySnapshot = await getDocs(query(q, ...queryConstraints));

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FloodRecord[];

      setFloodData(data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloodData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "floods", id));
        setFloodData(floodData.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting document: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditSave = () => {
    setEditId(null);
    fetchFloodData();
  };

  // Sorting functions
  const getSortValue = (record: FloodRecord, key: SortableKey): string | number => {
    switch (key) {
      case 'barangay':
        return record.barangay.toLowerCase();
      case 'date':
        return record.date;
      case 'severity':
        return record.severity.toLowerCase();
      case 'waterLevel':
        return record.waterLevel;
      case 'rainfallAmount':
        return record.rainfallAmount;
      default:
        return '';
    }
  };

  const handleSort = (key: SortableKey) => {
    setSortConfig(current => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortedData = (dataToSort: FloodRecord[]) => {
    if (!sortConfig.key) return dataToSort;

    return [...dataToSort].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key as SortableKey);
      const bValue = getSortValue(b, sortConfig.key as SortableKey);

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleExport = () => {
    const processedData = getSortedData(floodData);

    // Create headers for basic data and position columns
    const basicHeaders = ["Barangay", "Date", "Severity", "Water Level (m)", "Rainfall Amount (mm)"];

    // Find the maximum number of positions in any record
    const maxPositions = Math.max(...processedData.map(record => record.position?.length || 0));

    // Create position headers (Position 1 Lat, Position 1 Lng, Position 2 Lat, etc.)
    const positionHeaders = Array.from({ length: maxPositions }, (_, i) =>
      [`Position ${i + 1} Lat`, `Position ${i + 1} Lng`]
    ).flat();

    const headers = [...basicHeaders, ...positionHeaders];

    const csvData = [
      headers.join(","),
      ...processedData.map(record => {
        // Basic data
        const basicData = [
          camelCaseToTitleCase(record.barangay),
          record.date,
          record.severity,
          record.waterLevel,
          record.rainfallAmount
        ];

        // Position data
        const positionData = Array.from({ length: maxPositions }, (_, i) => {
          const pos = record.position?.[i];
          return pos ? [pos.lat, pos.lng] : ['', ''];
        }).flat();

        return [...basicData, ...positionData].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flood_data_${filters.barangay || "all"}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Modified print function
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const processedData = getSortedData(floodData);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Flood Data - ${filters.barangay ? camelCaseToTitleCase(filters.barangay) : "All Barangays"}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { text-align: center; }
            .positions { font-size: 0.9em; color: #666; }
          </style>
        </head>
        <body>
          <h1>Flood Data - ${filters.barangay ? camelCaseToTitleCase(filters.barangay) : "All Barangays"}</h1>
          <table>
            <thead>
              <tr>
                <th>Barangay</th>
                <th>Date</th>
                <th>Severity</th>
                <th>Water Level (m)</th>
                <th>Rainfall Amount (mm)</th>
                <th>Positions</th>
              </tr>
            </thead>
            <tbody>
              ${processedData.map(record => `
                <tr>
                  <td>${camelCaseToTitleCase(record.barangay)}</td>
                  <td>${record.date}</td>
                  <td>${record.severity}</td>
                  <td>${record.waterLevel}</td>
                  <td>${record.rainfallAmount}</td>
                  <td class="positions">
                    ${record.position?.map((pos, index) =>
      `Position ${index + 1}: (${pos.lat}, ${pos.lng})<br/>`
    ).join("") || "No positions available"}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const sortedData = getSortedData(floodData);

  // Column header component
  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: SortableKey }) => (
    <th
      className="p-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown
          size={14}
          className={`
            ${sortConfig.key === sortKey ? 'opacity-100' : 'opacity-50'}
            ${sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}
          `}
        />
      </div>
    </th>
  );

  const fetchBarangays = async () => {
    const barangaysQuery = query(collection(db, "floods"));
    const querySnapshot = await getDocs(barangaysQuery);
    const uniqueBarangays = new Set<string>();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.barangay) {
        uniqueBarangays.add(data.barangay);
      }
    });

    setBarangays(Array.from(uniqueBarangays).sort());
  };

  useEffect(() => {
    fetchBarangays();
  }, []);

  return (
    <Layout>
      <Authenticator />
      <div className="flex flex-1 h-screen">
        <div className="p-2 md:p-8 border border-neutral-200 dark:border-neutral-700 bg-zinc-100 dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
          <div className="flex gap-4 mb-4 items-center">
            <label className="text-xs text-zinc-600 dark:text-zinc-300" htmlFor="from">
              From
            </label>
            <input
              type="date"
              id="from"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-zinc-800 dark:bg-opacity-50 rounded-md p-2 text-xs"
            />
            <label className="text-xs text-zinc-600 dark:text-zinc-300" htmlFor="to">
              To
            </label>
            <input
              type="date"
              id="to"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-zinc-800 dark:bg-opacity-50 rounded-md p-2 text-xs"
            />
            <select
              value={filters.barangay}
              onChange={(e) => setFilters({ ...filters, barangay: e.target.value })}
              className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-zinc-800 dark:bg-opacity-50 rounded-md p-2 text-xs text-zinc-600 dark:text-zinc-300 ml-4"
            >
              <option value="">All Barangays</option>
              {barangays.map((barangay) => (
                <option key={barangay} value={barangay}>
                  {camelCaseToTitleCase(barangay)}
                </option>
              ))}
            </select>
            <button
              onClick={fetchFloodData}
              disabled={loading}
              className={`btn btn-sm my-auto text-white ${loading ? "btn-disabled" : "btn-primary"
                }`}
            >
              Filter
            </button>
            <button
              onClick={() => requirePin(handleExport)}
              className="btn btn-sm text-white btn-primary"
              title="Export to CSV"
            >
              <FileDown size={16} />
              Export
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-sm text-white btn-primary"
              title="Print"
            >
              <Printer size={16} />
              Print
            </button>
          </div>

          {editId ? (
            <EditFloodData
              id={editId}
              currentData={floodData.find((data) => data.id === editId)}
              onCancel={() => setEditId(null)}
              onSave={handleEditSave}
            />
          ) : (
            <div className="p-3 rounded-xl bg-white dark:bg-opacity-50 dark:bg-zinc-800 border dark:border-zinc-700 bg-opacity-50">
              <table className="table-auto w-full">
                <thead>
                  <tr className="text-sm text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700 text-left p-2 font-semibold">
                    <SortableHeader label="Barangay" sortKey="barangay" />
                    <SortableHeader label="Date" sortKey="date" />
                    <SortableHeader label="Severity" sortKey="severity" />
                    <SortableHeader label="Water Level" sortKey="waterLevel" />
                    <SortableHeader label="Rainfall Amount" sortKey="rainfallAmount" />
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((data) => (
                    <tr
                      key={data.id}
                      className="text-xs text-neutral-600 dark:text-neutral-300"
                    >
                      <td className="p-2">{camelCaseToTitleCase(data.barangay)}</td>
                      <td className="p-2">{data.date}</td>
                      <td className="p-2">{data.severity}</td>
                      <td className="p-2">{data.waterLevel} m</td>
                      <td className="p-2">{data.rainfallAmount} mm</td>
                      <td className="p-2 flex gap-4">
                        <button
                          onClick={() => setEditId(data.id)}
                          className="dark:text-white btn text-zinc-500 hover:bg-black btn-xs btn-outline rounded-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(data.id)}
                          className="text-white btn btn-xs btn-error rounded-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        pin={pin}
        onPinChange={setPin}
        onVerify={verifyPin}
        error={error}
      />
    </Layout>
  );
};

export default FloodData;