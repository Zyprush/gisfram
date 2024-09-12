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
    await setDoc(householdRef, household); // Restore the document with the sa
    await deleteDoc(doc(db, "archived", household.id)); // Remove from 'archived'
    
    window.alert("Household restored successfully!");
    
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
  const handlePermanentDelete = async (householdId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this household? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "archived", householdId));
      window.alert("Household permanently deleted!");
      setArchivedHouseholds((prev) =>
        prev.filter((item) => item.id !== householdId)
      );
    } catch (error) {
      console.error("Error deleting household: ", error);
      window.alert("Error deleting household. Please try again.");
    }
  };

  const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBarangay(e.target.value);
  };

  return (
    <Layout>
      <Authenticator />
      <div className="flex flex-1 h-screen justify-start items-start">
      <Link className="btn btn-sm tex-white fixed top-5 right-8 btn-primary" href={"/pages/household"}>back</Link>
        <div className="p-4 md:p-10 border border-neutral-200 dark:border-neutral-700 bg-zinc-100 dark:bg-neutral-900 flex flex-col gap-8 flex-1 w-full h-full">
          <div className="flex gap-4">
            <select
              value={barangay}
              onChange={handleBarangayChange}
              className="border border-neutral-200 dark:border-neutral-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-md p-2 text-sm"
            >
              <option value="">All Barangays</option>
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
          </div>

          {loading ? (
            <div className="flex justify-center items-center flex-1 text-gray-500 dark:text-gray-400">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="flex-1 p-5 bg-white dark:bg-zinc-800 rounded-lg dark:border dark:border-zinc-700 dark:border-opacity-40 dark:bg-opacity-45 mb-auto h-80 overflow-y-auto">
              {archivedHouseholds.length > 0 ? (
                <table className="table-auto w-full text-left">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Barangay</th>
                      <th className="px-4 py-2">House No.</th>
                      <th className="px-4 py-2">Head of Household</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedHouseholds.map((household) => (
                      <tr key={household.id}>
                        <td className="border px-4 py-2">{household.barangay}</td>
                        <td className="border px-4 py-2">{household.houseNo}</td>
                        <td className="border px-4 py-2">
                          {household.headInfo.name}
                        </td>
                        <td className="border px-4 py-2">
                          <button
                            onClick={() => handleRestore(household)}
                            className="btn btn-sm btn-primary mr-2"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() =>
                              handlePermanentDelete(household.id)
                            }
                            className="btn btn-sm btn-error"
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
