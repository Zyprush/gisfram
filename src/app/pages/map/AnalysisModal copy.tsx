"use client";
import React, { useState, useEffect } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

declare var google: any; // Assuming you're using Google Maps

const AnalysisModal = ({ barangay }: { barangay: string }) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number | "all">(currentYear);
  const [maleAgeGroups, setMaleAgeGroups] = useState<number[]>(
    Array(10).fill(0)
  ); // Age groups: 0-10, 11-20, ..., 91-100
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFloodData = async () => {
      setLoading(true);
      try {
        // Fetch flood data
        const floodsRef = collection(db, "floods");
        let q;

        if (year === "all") {
          q = query(floodsRef);
        } else {
          q = query(
            floodsRef,
            where("date", ">=", `${year}-01-01`),
            where("date", "<=", `${year}-12-31`)
          );
        }

        const floodSnapshot = await getDocs(q);
        const floodPolygons: google.maps.Polygon[] = [];
        floodSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.polygon) {
            // Create Google Maps Polygon from flood data polygon points
            const polygon = new google.maps.Polygon({
              paths: data.polygon.map(
                (point: { lat: number; lng: number }) =>
                  new google.maps.LatLng(point.lat, point.lng)
              ),
            });
            floodPolygons.push(polygon);
          }
        });

        // Fetch households
        const householdsRef = collection(db, "households");
        const householdsSnapshot = await getDocs(householdsRef);
        const households = householdsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as {
          id: string;
          position: { lat: number; lng: number };
          headInfo: { gender: string; age: number };
          members: { gender: string; age: number }[];
        }[];

        const maleCounts = Array(10).fill(0); // Age groups: 1-10, 11-20, ..., 91-100

        // Filter households inside any flood polygons
        households.forEach((household) => {
          const position = new google.maps.LatLng(
            household.position.lat,
            household.position.lng
          );
          const isInsidePolygon = floodPolygons.some((polygon) =>
            google.maps.geometry.poly.containsLocation(position, polygon)
          );

          if (isInsidePolygon) {
            // Count males in head
            if (household.headInfo.gender === "Male") {
              const ageGroupIndex = Math.min(
                Math.floor(household.headInfo.age / 10),
                9
              );
              maleCounts[ageGroupIndex]++;
            }

            // Count males in members
            household.members.forEach((member) => {
              if (member.gender === "Male") {
                const ageGroupIndex = Math.min(Math.floor(member.age / 10), 9);
                maleCounts[ageGroupIndex]++;
              }
            });
          }
        });

        setMaleAgeGroups(maleCounts);
      } catch (error) {
        console.error("Error fetching flood or household data: ", error);
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

  // Chart data
  const data = {
    labels: [
      "1-10",
      "11-20",
      "21-30",
      "31-40",
      "41-50",
      "51-60",
      "61-70",
      "71-80",
      "81-90",
      "91-100",
    ],
    datasets: [
      {
        label: "Male Residents",
        data: maleAgeGroups,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
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
            <Bar data={data} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisModal;
