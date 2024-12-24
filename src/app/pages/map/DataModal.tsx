"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

interface Position {
  lat: number;
  lng: number;
}

interface Flood {
  position: Position[];
  id: string;
  cause: string;
  waterLevel: number;
  casualties: number;
  rainfallAmount: number;
  date: string;
  severity: string;
  barangay: string;
}

interface HouseholdData {
  member: any[];
  headInfo: {
    gender: string;
    name: string;
    age: number;
    contact: string;
    pwd: boolean;
    indigenous: boolean;
    pregnant: boolean;
  };
  position: Position;
  femaleCount: number;
  pwdCount: number;
  indigenousCount: number;
  memberTotal: number;
  seniorCount: number;
  pregnantCount: number;
  houseStruc: string;
  year: string;
  barangay: string;
  sitio: string;
  houseNo: string;
  members: Array<{
    name: string;
    age: number;
    gender: string;
    contact?: string;
    pwd: boolean;
    indigenous: boolean;
    pregnant: boolean;
  }>;
  maleCount: number;
  date: string;
}

function isPointInPolygon(point: Position, polygon: Position[]): boolean {
  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }

  return inside;
}

function getAffectedPopulation(floods: Flood[], households: HouseholdData[]): number {
  let totalAffected = 0;

  households.forEach(household => {
    if (!household.position) return;
    
    const isAffected = floods.some(flood => 
      flood.position && isPointInPolygon(household.position, flood.position)
    );

    if (isAffected) {
      totalAffected += household.memberTotal || 0;
    }
  });

  return totalAffected;
}

const DataModal = ({ barangay, year }: { barangay: string, year: string }) => {
  const [loading, setLoading] = useState(false);
  const [indigenousCount, setIndigenousCount] = useState(0);
  const [pwdCount, setPwdCount] = useState(0);
  const [seniorCount, setSeniorCount] = useState(0);
  const [totalPregnant, setTotalPregnant] = useState(0);
  const [totalPopulation, setTotalPopulation] = useState(0);
  const [totalAffected, setTotalAffected] = useState(0);

  const getTotalPopulation = (households: HouseholdData[]) => {
    return households.reduce((total, household) => {
      return total + (household.memberTotal || 0);
    }, 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const householdsQuery = query(
          collection(db, "households"),
          ...(barangay ? [where("barangay", "==", barangay)] : []),
          ...(year ? [where("year", "==", year)] : [])
        );
        
        const floodsQuery = query(
          collection(db, "floods"),
          ...(barangay ? [where("barangay", "==", barangay)] : [])
        );

        const [householdsSnapshot, floodsSnapshot] = await Promise.all([
          getDocs(householdsQuery),
          getDocs(floodsQuery)
        ]);

        const householdsData: HouseholdData[] = [];
        const floodsData: Flood[] = [];

        householdsSnapshot.forEach((doc) => {
          const data = doc.data() as HouseholdData;
          householdsData.push(data);
        });

        floodsSnapshot.forEach((doc) => {
          const data = doc.data() as Flood;
          floodsData.push(data);
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
        setTotalPopulation(getTotalPopulation(householdsData));
        setTotalAffected(getAffectedPopulation(floodsData, householdsData));

      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [barangay, year]);

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
      datalabels: {
        color: '#fff',
        formatter: (value: number, context: any) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${value} ${label}`;
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
        <div className="flex-row p-4 pl-0 bg-white shadow dark:bg-zinc-900 rounded-lg dark:border dark:border-zinc-900 h-auto flex mr-auto ml-0 mx-auto items-start justify-start dark:text-zinc-400 text-zinc-600">
          <div className="h-60">
            <Pie data={pieData} options={pieOptions} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="bg-yellow-100 p-2 rounded shadow">
              <p className="font-semibold">Indigenous</p>
              <p>{indigenousCount}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded shadow">
              <p className="font-semibold">PWD</p>
              <p>{pwdCount}</p>
            </div>
            <div className="bg-pink-100 p-2 rounded shadow">
              <p className="font-semibold">Pregnant</p>
              <p>{totalPregnant}</p>
            </div>
            <div className="bg-teal-100 p-2 rounded shadow">
              <p className="font-semibold">Senior</p>
              <p>{seniorCount}</p>
            </div>
            <div className="col-span-2 bg-gray-100 p-2 rounded shadow">
              <p className="font-semibold">Total Population</p>
              <p>{totalPopulation}</p>
            </div>
            <div className="col-span-2 bg-red-300 p-2 rounded shadow">
              <p className="font-semibold">Total Affected</p>
              <p>{totalAffected}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataModal;