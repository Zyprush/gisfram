import React, { useState, useEffect } from "react";
import useFetchFloods from "@/hooks/useFetchFloods";
import useFetchHouseholds from "@/hooks/useFetchHouseholds";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register necessary chart components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Types for households and floods
interface Household {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  barangay: string;
  headInfo: {
    name: string;
    age: number;
    gender: string;
    contact: string;
    pwd: boolean;
    indigenous: boolean;
    pregnant: boolean;
  };
  members: { age: number }[];
}

interface Flood {
  id: string;
  position: { lat: number; lng: number }[];
  date: string; // ISO string format
  barangay: string;
}

// Utility function to check if a point is inside a polygon
const isPointInPolygon = (
  point: any,
  polygon: google.maps.LatLng[]
): boolean => {
  const bounds = new google.maps.Polygon({ paths: polygon });
  return google.maps.geometry.poly.containsLocation(point, bounds);
};

const AnalysisModal: React.FC<{ barangay: string; year: string ; gender: string;}> = ({
  barangay,
  year,
  gender
}) => {
  const floods = useFetchFloods(barangay, year, true); // Fetch floods based on barangay and year
  const households = useFetchHouseholds(barangay, true, ""); // Fetch households filtered by barangay
  const [affectedHouseholds, setAffectedHouseholds] = useState<number>(0);
  const [ageDistribution, setAgeDistribution] = useState<number[]>(Array(10).fill(0)); // Array 

  // Filter households that are inside any flood polygon
  const filterHouseholdsInFloods = () => {
    let count = 0;
    const ageCounts = Array(10).fill(0); // Initialize 10 age groups (1-10, 11-20, ..., 91+)
    const affectedHeads: Household["headInfo"][] = []; // Store affected household heads

    households.forEach((house) => {
      floods.forEach((flood) => {
        const polygon = flood.position.map(
          (coord: any) => new google.maps.LatLng(coord.lat, coord.lng)
        );
        const houseLatLng = new google.maps.LatLng(
          house.position.lat,
          house.position.lng
        );
        if (isPointInPolygon(houseLatLng, polygon)) {
          // Only count if the head is male
          if (house.headInfo.gender === gender) {
            count++;
            incrementAgeGroup(ageCounts, house.headInfo.age); // Count head's age
          }
          // Only count male members' ages
          house.members.forEach((member: any) => {
            if (member.gender === gender) {
              incrementAgeGroup(ageCounts, member.age);
            }
          });
        }
      });
    });

    setAffectedHouseholds(count);
    setAgeDistribution(ageCounts);
  };

  // Function to increment the appropriate age group
  const incrementAgeGroup = (ageCounts: number[], age: number) => {
    const index = Math.min(Math.floor(age / 10), 9); // 0-9: index 0, 10-19: index 1, ..., 90+: index 9
    ageCounts[index]++;
  };

  useEffect(() => {
    if (floods.length && households.length) {
      filterHouseholdsInFloods();
    } else {
      setAffectedHouseholds(0);
      setAgeDistribution(Array(10).fill(0)); // Reset age distribution if no data
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floods, households, barangay, year]);

  // Chart.js data and configuration
  const data = {
    labels: [
      "1-10", "11-20", "21-30", "31-40", "41-50", "51-60", "61-70", "71-80", "81-90", "91+"
    ],
    datasets: [
      {
        label: `Affected ${gender} Residents by Age Group`,
        data: ageDistribution,
        backgroundColor: gender === "Female" ? "rgba(255, 105, 180, 0.6)" : "rgba(75, 192, 192, 0.6)",
        borderColor: gender === "Female" ? "rgba(255, 105, 180, 1)" : "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  return (
    <div className="p-4 bg-gray-10 dark:bg-zinc-900 bg-white bg-opacity-200 rounded-lg shadow w-full">
      <div className="">
        <Bar data={data} options={options} />
        <div>
          {/* display the data here */}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
