"use client";
import React, { useState, useEffect } from "react";
import { Authenticator } from "@/components/Authenthicator";
import { Layout } from "@/components/Layout";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import Link from "next/link";
import { logHouseholdAction } from "@/utils/logging";

interface Household {
  id: string;
  barangay: string;
  houseNo: string;
  headInfo: {
    name: string;
    age: number;
    gender: string;
  };
}

const Archive = () => {
  const [barangay, setBarangay] = useState("");
  const [loading, setLoading] = useState(false);
  const [archivedHouseholds, setArchivedHouseholds] = useState<Household[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch archived households from Firestore
  useEffect(() => {
    const fetchArchivedHouseholds = async () => {
      setLoading(true);
      try {
        const archiveRef = collection(db, "archived");
        let q = barangay
          ? query(archiveRef, where("barangay", "==", barangay))
          : archiveRef;

        const querySnapshot = await getDocs(q);
        const households: Household[] = [];
        querySnapshot.forEach((doc) => {
          households.push({ id: doc.id, ...doc.data() } as Household);
        });
        setArchivedHouseholds(households);
      } catch (error) {
        console.error("Error fetching archived households: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedHouseholds();
  }, [barangay]);

  // Restore a household back to the households collection
  const handleRestore = async (household: Household) => {
    const confirmRestore = window.confirm(
      "Are you sure you want to restore this household?"
    );
    if (!confirmRestore) return;

    try {
      const householdRef = doc(db, "households", household.id); // Use doc with the same ID
      await setDoc(householdRef, household); // Restore the document
      await deleteDoc(doc(db, "archived", household.id)); // Remove from 'archived'
      
      window.alert("Household restored successfully!");

      await logHouseholdAction('restored', household.headInfo.name);
      
      // Remove from local state
      setArchivedHouseholds((prev) =>
        prev.filter((item) => item.id !== household.id)
      );
    } catch (error) {
      console.error("Error restoring household: ", error);
      window.alert("Error restoring household. Please try again.");
    }
  };

  // Permanently delete a household from the archive collection
  const handlePermanentDelete = async (household: Household) => {  // Change parameter to full household object
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this household? This action cannot be undone."
    );
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, "archived", household.id));
      window.alert("Household permanently deleted!");
      await logHouseholdAction('delete', household.headInfo.name);  // Now we can access the name
      setArchivedHouseholds((prev) =>
        prev.filter((item) => item.id !== household.id)
      );
    } catch (error) {
      console.error("Error deleting household: ", error);
      window.alert("Error deleting household. Please try again.");
    }
  };

  const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBarangay(e.target.value);
  };

  // Search filter
  const filteredHouseholds = archivedHouseholds.filter(
    (household) =>
      household.headInfo.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      household.houseNo.toString().includes(searchTerm)
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Layout>
      <Authenticator />
      <div className="flex flex-1 h-screen justify-start items-start">
        <Link className="btn btn-sm tex-white fixed top-5 right-8 btn-primary" href={"/pages/household"}>
          back
        </Link>
        <div className="p-4 md:p-10 border border-neutral-200 dark:border-neutral-700 bg-zinc-100 dark:bg-neutral-900 flex flex-col gap-8 flex-1 w-full h-full">
          <div className="flex gap-4">
            <select
              value={barangay}
              onChange={handleBarangayChange}
              className="border border-neutral-200 dark:border-neutral-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-md p-2 text-xs"
            >
              <option value="">All Barangays</option>
              {/* Add other barangay options here */}
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by head name or house No."
              className="border w-64 border-neutral-200 dark:border-neutral-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-md p-2 text-xs"
            />
            <p className="text-primary font-bold my-auto text-xl ml-5 dark:text-white">Archive</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center flex-1 text-gray-500 dark:text-gray-400">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="flex-1 p-5 bg-white dark:bg-zinc-800 rounded-lg dark:border dark:border-zinc-700 dark:border-opacity-40 dark:bg-opacity-45 mb-auto h-80 overflow-x-scroll">
              {filteredHouseholds.length > 0 ? (
                <table className="table-auto w-full text-left">
                  <thead>
                    <tr className="text-sm text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700 text-left p-2 font-semibold">
                      <th className="p-2">Barangay</th>
                      <th className="p-2">House No.</th>
                      <th className="p-2">Head of Household</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHouseholds.map((household) => (
                      <tr
                        key={household.id}
                        className="text-xs text-neutral-600 dark:text-neutral-300"
                      >
                        <td className="p-2 capitalize">{household.barangay}</td>
                        <td className="p-2">{household.houseNo}</td>
                        <td className="p-2 capitalize">{household.headInfo.name}</td>
                        <td className="p-2 flex gap-4">
                          <button
                            onClick={() => handleRestore(household)}
                            className="dark:text-white btn text-zinc-500 hover:bg-black btn-xs btn-outline rounded-sm"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(household)}
                            className="text-white btn btn-xs btn-error rounded-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>No archived households found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Archive;
