"use client";
import React, { useState, useEffect, useRef } from "react";
import { Authenticator } from "@/components/Authenthicator";
import { Layout } from "@/components/Layout";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  addDoc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import ViewEditHouse from "../add-flood/ViewEditHouse";
import Link from "next/link";
import { camelCaseToTitleCase } from "@/lib/string";
import { Printer, FileDown, ArrowUpDown } from "lucide-react";

interface Household {
  id: string;
  barangay: string;
  houseNo: string;
  memberTotal: number;
  headInfo: {
    name: string;
    age: number;
    gender: string;
  };
}
// Create a more specific type for sortable keys
type SortableKey = 'barangay' | 'houseNo' | 'headName';

type SortConfig = {
  key: SortableKey | null;
  direction: 'asc' | 'desc';
};

const Households = () => {
  const [barangay, setBarangay] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewHouse, setViewHouse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const printRef = useRef<HTMLDivElement>(null);


  // Fetch households from Firestore
  useEffect(() => {
    const fetchHouseholds = async () => {
      setLoading(true);
      try {
        const householdRef = collection(db, "households");
        let q = barangay
          ? query(householdRef, where("barangay", "==", barangay))
          : householdRef;

        const querySnapshot = await getDocs(q);
        const fetchedHouseholds: Household[] = [];
        querySnapshot.forEach((doc) => {
          fetchedHouseholds.push({ id: doc.id, ...doc.data() } as Household);
        });
        setHouseholds(fetchedHouseholds);
      } catch (error) {
        console.error("Error fetching households: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHouseholds();
  }, [barangay, viewHouse]);

  // Handle export to CSV using processed data
  const handleExport = () => {
    const processedData = getProcessedHouseholds();

    const headers = ["Barangay", "House No.", "Head of Household", "Age", "Gender", "Total Members"];
    const csvData = [
      headers.join(","),
      ...processedData.map(household => [
        camelCaseToTitleCase(household.barangay),
        household.houseNo,
        household.headInfo.name,
        household.headInfo.age,
        household.headInfo.gender,
        household.memberTotal
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `households_${barangay || "all"}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Handle print using processed data
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const processedData = getProcessedHouseholds();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Households - ${barangay ? camelCaseToTitleCase(barangay) : "All Barangays"}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>Households - ${barangay ? camelCaseToTitleCase(barangay) : "All Barangays"}</h1>
          <table>
            <thead>
              <tr>
                <th>Barangay</th>
                <th>House No.</th>
                <th>Head of Household</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Total Members</th>
              </tr>
            </thead>
            <tbody>
              ${processedData.map(household => `
                <tr>
                  <td>${camelCaseToTitleCase(household.barangay)}</td>
                  <td>${household.houseNo}</td>
                  <td>${household.headInfo.name}</td>
                  <td>${household.headInfo.age}</td>
                  <td>${household.headInfo.gender}</td>
                  <td>${household.memberTotal}</td>
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

  // Handle the Archive function (move to 'archived' collection with the same id)
  const handleArchive = async (householdId: string) => {
    const confirmArchive = window.confirm(
      "Are you sure you want to archive this household?"
    );
    if (!confirmArchive) return;
    try {
      const householdRef = doc(db, "households", householdId);
      const archivedRef = doc(db, "archived", householdId); // Use the same document ID

      const householdDoc = await getDoc(householdRef);
      if (!householdDoc.exists()) {
        throw new Error("Household document does not exist.");
      }
      await setDoc(archivedRef, householdDoc.data());
      await deleteDoc(householdRef);
      setHouseholds((prev) => prev.filter((item) => item.id !== householdId));

      window.alert("Household archived successfully!");
    } catch (error) {
      console.error("Error archiving household: ", error);
      window.alert("Error archiving household. Please try again.");
    }
  };

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Function to get the value to sort by
  const getSortValue = (household: Household, key: SortableKey): string => {
    switch (key) {
      case 'barangay':
        return household.barangay.toLowerCase();
      case 'houseNo':
        return household.houseNo.toLowerCase();
      case 'headName':
        return household.headInfo.name.toLowerCase();
      default:
        return '';
    }
  };

  // Sort the filtered households
  const getSortedHouseholds = (householdsToSort: Household[]) => {
    if (!sortConfig.key) return householdsToSort;

    return [...householdsToSort].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key as SortableKey);
      const bValue = getSortValue(b, sortConfig.key as SortableKey);

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Filter function that can be reused
  const getFilteredHouseholds = (householdsToFilter: Household[]) => {
    return householdsToFilter.filter(
      household =>
        (!barangay || household.barangay === barangay) &&
        (household.headInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          household.houseNo.toString().includes(searchTerm))
    );
  };

  // Get processed data (filtered and sorted)
  const getProcessedHouseholds = () => {
    const filtered = getFilteredHouseholds(households);
    return getSortedHouseholds(filtered);
  };

  // Search filter
  const filteredHouseholds = households.filter(
    (household) =>
      household.headInfo.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      household.houseNo.toString().includes(searchTerm)
  );


  // Get sorted households after filtering
  const sortedHouseholds = getSortedHouseholds(filteredHouseholds);

  const processedHouseholds = getProcessedHouseholds();

  // Column header component
  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: SortConfig['key'] }) => (
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

  const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBarangay(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Layout>
      <Authenticator />
      <div className="flex flex-1 h-screen justify-start items-start">
        <Link
          className="btn btn-sm tex-white fixed top-5 right-8 btn-primary"
          href={"/pages/archive"}
        >
          Archive
        </Link>
        {viewHouse && (
          <ViewEditHouse id={viewHouse} setViewHouse={setViewHouse} />
        )}
        <div className="p-4 md:p-10 border border-neutral-200 dark:border-neutral-700 bg-zinc-100 dark:bg-neutral-900 flex flex-col gap-8 flex-1 w-full h-full overflow-x-scroll">
          <div className="flex gap-4">
            <select
              value={barangay}
              onChange={handleBarangayChange}
              className="border border-neutral-200 dark:border-neutral-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-md p-2 text-xs"
            >
              <option value="">Select Barangay</option>
              <option value="alipaoy">Alipaoy</option>
              <option value="bagongSilangPob">Bagong Silang Pob</option>
              <option value="handangTumulongPob">Handang Tumulong Pob</option>
              <option value="harrison">Harrison</option>
              <option value="lumangbayan">Lumangbayan</option>
              <option value="mananao">Mananao</option>
              <option value="mapaladPob">Mapalad Pob</option>
              <option value="marikit">Marikit</option>
              <option value="PagAsaNgBayanPob">Pag-Asa Ng Bayan Pob</option>
              <option value="sanJosePob">San Jose Pob</option>
              <option value="silahisNgPagAsaPob">Silahis Ng Pag-Asa Pob</option>
              <option value="tubili">Tubili</option>
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by head name or house number"
              className="border w-80 border-neutral-200 dark:border-neutral-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-md p-2 text-xs"
            />
            <button
              onClick={handleExport}
              className="btn btn-sm text-white  btn-primary"
              title="Export to CSV"
            >
              <FileDown size={16} />
              Export
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-sm text-white  btn-primary"
              title="Print"
            >
              <Printer size={16} />
              Print
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center flex-1 text-gray-500 dark:text-gray-400">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="flex-1 p-5 bg-white dark:bg-zinc-800 rounded-lg dark:border dark:border-zinc-700 dark:border-opacity-40 dark:bg-opacity-45 mb-auto h-80 overflow-y-auto">
              {processedHouseholds.length > 0 ? (
                <table className="table-auto w-full text-left">
                  <thead>
                    <tr className="text-sm text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700 text-left p-2 font-semibold">
                      <SortableHeader label="Barangay" sortKey="barangay" />
                      <SortableHeader label="House No." sortKey="houseNo" />
                      <SortableHeader label="Head of Household" sortKey="headName" />
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHouseholds.map((household) => (
                      <tr
                        key={household.id}
                        className="text-xs text-neutral-600 dark:text-neutral-300"
                      >
                        <td className="p-2">
                          {camelCaseToTitleCase(household.barangay)}
                        </td>
                        <td className="p-2">{household.houseNo}</td>
                        <td className="p-2 capitalize">
                          {household.headInfo.name}
                        </td>
                        <td className="p-2 flex gap-4">
                          <button
                            onClick={() => setViewHouse(household.id)}
                            className="dark:text-white btn text-zinc-500 hover:bg-black btn-xs btn-outline rounded-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleArchive(household.id)}
                            className="text-white btn btn-xs btn-warning rounded-sm"
                          >
                            Archive
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>No households found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Households;
