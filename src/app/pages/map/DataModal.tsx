"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from "chart.js";

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

interface HouseholdData {
  member: any[];
  headInfo: {
    gender: string;
  };
  femaleCount: number;
  pwdCount: number;
  indigenousCount: number;
  memberTotal: number;
  seniorCount: number;
  pregnantCount: number;
}

const DataModal = ({ barangay }: { barangay: string }) => {
  const [loading, setLoading] = useState(false);
  const [indigenousCount, setIndigenousCount] = useState(0);
  const [pwdCount, setPwdCount] = useState(0);
  const [seniorCount, setSeniorCount] = useState(0);
  const [totalPregnant, setTotalPregnant] = useState(0);
  const [totalHousehold, setTotalHousehold] = useState(0);

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
        let totalPregnant = 0;
        let totalHouseholds = 0;
        let seniorCount = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data() as HouseholdData;

          totalIndigenous += data.indigenousCount || 0;
          totalPWD += data.pwdCount || 0;
          totalPregnant += data.pregnantCount || 0;
          totalHouseholds += 1; 
          seniorCount += data.seniorCount || 0;
        });

        setIndigenousCount(totalIndigenous);
        setPwdCount(totalPWD);
        setTotalPregnant(totalPregnant);
        setTotalHousehold(totalHouseholds);
        setSeniorCount(seniorCount);
      } catch (error) {
        console.error("Error fetching household data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHouseholdData();
  }, [barangay]);

  // Pie chart data and options
  const pieData = {
    labels: ['Indigenous', 'PWD', 'Pregnant', 'Senior'],
    datasets: [
      {
        data: [indigenousCount, pwdCount, totalPregnant, seniorCount],
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384', '#4BC0C0'],
        hoverOffset: 4,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-1 h-auto w-full justify-start items-start">
      {loading ? (
        <div className="flex justify-center items-center flex-1 text-gray-500 dark:text-gray-400">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="flex-col p-5 bg-white dark:bg-zinc-900 rounded-lg dark:border dark:border-zinc-900 h-auto flex mr-auto ml-0 mx-auto items-start justify-start dark:text-zinc-400 text-zinc-600">
          <span className="text-lg font-bold text-primary dark:text-zinc-300">
            {barangay ? "Barangay" : "Paluan"} Status
          </span>
          <div className="h-64 w-full mt-4">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DataModal;
