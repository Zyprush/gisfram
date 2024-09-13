"use client";
import React, { useState, useEffect } from "react";
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

const Households = () => {
  const [barangay, setBarangay] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewHouse, setViewHouse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);

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


  // Search filter
  const filteredHouseholds = households.filter(
    (household) =>
      household.headInfo.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      household.houseNo.toString().includes(searchTerm)
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
        <Link className="btn btn-sm tex-white fixed top-5 right-8 btn-primary" href={"/pages/archive"}>Archive</Link>
      {viewHouse && <ViewEditHouse id={viewHouse} setViewHouse={setViewHouse} />}
        <div className="p-4 md:p-10 border border-neutral-200 dark:border-neutral-700 bg-zinc-100 dark:bg-neutral-900 flex flex-col gap-8 flex-1 w-full h-full overflow-x-scroll">
          <div className="flex gap-4">
            <select
              value={barangay}
              onChange={handleBarangayChange}
              className="border border-neutral-200 dark:border-neutral-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-md p-2 text-xs"
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
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by head name or house number"
              className="border border-neutral-200 dark:border-neutral-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-md p-2 text-xs"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center flex-1 text-gray-500 dark:text-gray-400">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="flex-1 p-5 bg-white dark:bg-zinc-800 rounded-lg dark:border dark:border-zinc-700 dark:border-opacity-40 dark:bg-opacity-45 mb-auto h-80 overflow-y-auto">
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
