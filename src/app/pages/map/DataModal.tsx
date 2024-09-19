"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from "chart.js";
import useFetchHouseholds from "@/hooks/useFetchHouseholds";
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the datalabels plugin

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, ChartDataLabels); // Register the plugin

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
  const [totalPopulation, setTotalPopulation] = useState(0); // State for total population

  // Function to get total population based on affected households
  const getTotalPopulation = (households: HouseholdData[]) => {
    return households.reduce((total, household) => {
      return total + (household.memberTotal || 0); // Sum up memberTotal for each household
    }, 0);
  };

  const households = useFetchHouseholds(barangay, true); // Fetch households filtered by barangay

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
        const householdsData: HouseholdData[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as HouseholdData;
          householdsData.push(data); // Collect household data
        });

        let totalIndigenous = 0;
        let totalPWD = 0;
        let totalPregnant = 0;
        let seniorCount = 0;

        householdsData.forEach((data) => {
          totalIndigenous += data.indigenousCount || 0;
          totalPWD += data.pwdCount || 0;
          totalPregnant += data.pregnantCount || 0;
          seniorCount += data.seniorCount || 0;
        });

        setIndigenousCount(totalIndigenous);
        setPwdCount(totalPWD);
        setTotalPregnant(totalPregnant);
        setSeniorCount(seniorCount);
        setTotalPopulation(getTotalPopulation(householdsData)); // Set total population
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
        hoverOffset: 0,
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
      datalabels: { // Update this section to display both label and value
        color: '#fff',
        formatter: (value: number, context: any) => {
          const label = context.chart.data.labels[context.dataIndex]; // Get the label
          return `${value} ${label}`; // Format as "value label"
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
        <div className="flex-col p-5 bg-white shadow dark:bg-zinc-900 rounded-lg dark:border dark:border-zinc-900 h-auto flex mr-auto ml-0 mx-auto items-start justify-start dark:text-zinc-400 text-zinc-600">
          <span className="text-lg font-bold text-primary dark:text-zinc-300">
            Vulnerable Groups 
          </span>
          <div className="h-64 w-full mt-4">
            <Pie data={pieData} options={pieOptions} />
          </div>
          {/* Display the data counts */}
          <div className="mt-4">
            <p>Indigenous: {indigenousCount}</p>
            <p>PWD: {pwdCount}</p>
            <p>Pregnant: {totalPregnant}</p>
            <p>Senior: {seniorCount}</p>
            <p>Total Population: {totalPopulation}</p> {/* Total population count */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataModal;
