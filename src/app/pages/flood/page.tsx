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

const FloodData = () => {
  const [floodData, setFloodData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ from: string; to: string; barangay: string }>({
    from: "",
    to: "",
    barangay: "",
  });

  const fetchFloodData = async () => {
    setLoading(true);
    try {
      const conditions: any[] = [];

      // Add date filters
      if (filters.from && filters.to) {
        conditions.push(
          where("date", ">=", filters.from),
          where("date", "<=", filters.to)
        );
      } else if (filters.from) {
        conditions.push(where("date", ">=", filters.from));
      } else if (filters.to) {
        conditions.push(where("date", "<=", filters.to));
      }

      // Add barangay filter if selected
      if (filters.barangay) {
        conditions.push(where("barangay", "==", filters.barangay));
      }

      // Firebase requires fields used in 'where' to also be included in 'orderBy'
      const q = query(
        collection(db, "floods"),
        ...conditions,
        orderBy("date", "desc"),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFloodData(data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch flood data when filters change
  useEffect(() => {
    fetchFloodData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "floods", id));
        setFloodData(floodData.filter((item) => item.id !== id)); // Optimistic UI update
      } catch (error) {
        console.error("Error deleting document: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditSave = () => {
    setEditId(null); // Close the edit mode
    fetchFloodData(); // Refresh data after editing
  };

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
              {/* Add barangay options */}
              <option value="Alipaoy">Alipaoy</option>
              <option value="Barangay 5">Barangay 5</option>
              <option value="Barangay 2">Barangay 2</option>
              <option value="Harrison">Harrison</option>
              <option value="Lumangbayan">Lumangbayan</option>
              <option value="Mananao">Mananao</option>
              <option value="Barangay 1">Barangay 1</option>
              <option value="Marikit">Marikit</option>
              <option value="Barangay 4">Barangay 4</option>
              <option value="Barangay 6">Barangay 6</option>
              <option value="Barangay 3">Barangay 3</option>
              <option value="Tubili">Tubili</option>
            </select>
            <button
              onClick={fetchFloodData}
              disabled={loading}
              className={`btn btn-sm my-auto text-white ${
                loading ? "btn-disabled" : "btn-primary"
              }`}
            >
              Filter
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
                    <th className="p-2">Barangay</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Severity</th>
                    <th className="p-2">Water Level</th>
                    <th className="p-2">Rainfall Amount</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {floodData.map((data) => (
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
    </Layout>
  );
};

export default FloodData;
