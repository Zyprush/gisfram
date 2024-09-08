"use client";
import React, { useState, useEffect } from "react";
import { Authenticator } from "@/components/Authenthicator";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const AnalysisModal = ({ barangay }: { barangay: string }) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number | "all">(currentYear);
  const [floodData, setFloodData] = useState<number[]>(Array(12).fill(0));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFloodData = async () => {
      setLoading(true);
      try {
        const floodsRef = collection(db, "floods");
        let q;

        if (year === "all") {
          q = query(floodsRef); // Fetch all years
        } else {
          q = query(
            floodsRef,
            where("date", ">=", `${year}-01-01`),
            where("date", "<=", `${year}-12-31`)
          );
        }

        const querySnapshot = await getDocs(q);
        const monthlyFloods = Array(12).fill(0);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const floodDate = new Date(data.date);
          const month = floodDate.getMonth(); // getMonth returns 0 for January, 11 for December

          if (!barangay || data.barangay === barangay) {
            monthlyFloods[month]++;
          }
        });

        setFloodData(monthlyFloods);
      } catch (error) {
        console.error("Error fetching flood data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFloodData();
  }, [year, barangay]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear =
      e.target.value === "all" ? "all" : parseInt(e.target.value);
    setYear(selectedYear);
  };

  const data = {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        label: "Number of Floods",
        data: floodData,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
      <div className="flex flex-1 h-40 w-[28rem] justify-start items-start">
        <div className="p-1 flex flex-col gap-1 flex-1 w-full h-full">
          <div className="flex gap-4">
            <select
              value={year}
              onChange={handleYearChange}
              className="border border-neutral-200 dark:border-neutral-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 rounded-md p-1 text-xs"
            >
              <option value="all">All Years</option>
              {Array.from({ length: 10 }, (_, i) => currentYear - i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center flex-1 text-gray-500 dark:text-gray-400">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="flex-1 p-5 bg-white dark:bg-zinc-900 rounded-lg dark:border dark:border-zinc-900 dark:border-opacity-40 dark:bg-opacity-45 mb-auto h-80 flex items-center justify-center">
              <Bar data={data} options={options} />
            </div>
          )}
        </div>
      </div>
  );
};

export default AnalysisModal;
