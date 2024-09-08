"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toTitleCase } from "@/lib/string";

interface HouseholdData {
  member: any[];
  headInfo: {
    gender: string;
  };
  femaleCount: number;
  pwdCount: number;
  indigenousCount: number;
  memberTotal: number;
}

const DataModal = ({ barangay }: { barangay: string }) => {
  const [loading, setLoading] = useState(false);
  const [indigenousCount, setIndigenousCount] = useState(0);
  const [pwdCount, setPwdCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [totalHousehold, setTotalHousehold] = useState(0);
  const [totalMale, setTotalMale] = useState(0);

  useEffect(() => {
    const fetchHouseholdData = async () => {
      setLoading(true);
      try {
        const q = barangay
          ? query(
              collection(db, "households"),
              where("barangay", "==", barangay)
            )
          : query(collection(db, "households"));

        const querySnapshot = await getDocs(q);

        let totalIndigenous = 0;
        let totalPWD = 0;
        let totalFemales = 0;
        let totalMales = 0;
        let totalHouseholds = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data() as HouseholdData;

          totalIndigenous += data.indigenousCount || 0;
          totalPWD += data.pwdCount || 0;
          totalFemales += data.femaleCount || 0;
          totalHouseholds += 1; // Each document is one household

          // For male count, subtract the number of females from the total members
          const totalMembers = data.memberTotal;
          totalMales += totalMembers - (data.femaleCount || 0);
        });

        setIndigenousCount(totalIndigenous);
        setPwdCount(totalPWD);
        setFemaleCount(totalFemales);
        setTotalHousehold(totalHouseholds);
        setTotalMale(totalMales);
      } catch (error) {
        console.error("Error fetching household data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHouseholdData();
  }, [barangay]);

  return (
    <div className="flex flex-1 h-auto w-full  justify-start items-start">
      {loading ? (
        <div className="flex justify-center items-center flex-1 text-gray-500 dark:text-gray-400">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="flex-col p-5 bg-white dark:bg-zinc-900 rounded-lg dark:border dark:border-zinc-900 dark:border-opacity-40 dark:bg-opacity-45 h-auto flex mr-auto ml-0 mx-auto items-start justify-start dark:text-zinc-400 text-zinc-600">
          <span className="text-lg font-bold text-primary dark:text-zinc-300">
            {barangay ? "Barangay" : "Paluan"} Status
          </span>
          <span className="flex gap-2 items-center">
            <p className="font-bold text-primary text-xl dark:text-zinc-200">
              {indigenousCount}
            </p>
            <p className="text-xs">Indigenous Count</p>
          </span>
          <span className="flex gap-2 items-center">
            <p className="font-bold text-primary text-xl dark:text-zinc-200">
              {pwdCount}
            </p>
            <p className="text-xs">PWD Count</p>
          </span>
          <span className="flex gap-2 items-center">
            <p className="font-bold text-primary text-xl dark:text-zinc-200">
              {femaleCount}
            </p>
            <p className="text-xs">Female Count</p>
          </span>
          <span className="flex gap-2 items-center">
            <p className="font-bold text-primary text-xl dark:text-zinc-200">
              {totalHousehold}
            </p>
            <p className="text-xs">Total Households</p>
          </span>
          <span className="flex gap-2 items-center">
            <p className="font-bold text-primary text-xl dark:text-zinc-200">
              {totalMale}
            </p>
            <p className="text-xs">Total Male</p>
          </span>
        </div>
      )}
    </div>
  );
};

export default DataModal;
