"use client";
import React, { useState, useRef } from "react";
import { GoogleMap, Polygon, useJsApiLoader } from "@react-google-maps/api";
import { IconFocusCentered } from "@tabler/icons-react";
import Loading from "./Loading";
import { db } from "@/firebase"; // Firestore instance
import { collection, getDocs } from "firebase/firestore";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
  borderRadius: "10px",
};

const center = { lat: 13.397099, lng: 120.459089 }; // Fix the map center

const options = {
  mapTypeId: "roadmap" as google.maps.MapTypeId,
  zoom: 11.6, // Fix the zoom
};

const SimulationMap: React.FC = () => {
  const handleSimulate = async () => {
    try {
      // Fetch households from Firestore
      const householdsRef = collection(db, "households");
      const querySnapshot = await getDocs(householdsRef);
      const households = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as {
        id: string;
        position: { lat: number; lng: number };
        memberTotal: number;
      }[];

      // Filter households inside the polygons
      const results = households.filter((household) => {
        const position = new google.maps.LatLng(
          household.position.lat,
          household.position.lng
        );
      });

      // Calculate total number of people affected
      const totalAffected = results.reduce(
        (sum, household) => sum + (household.memberTotal || 0),
        0
      );
      console.log("Households inside the polygons:", results);
      alert(
        `${results.length} households affected. Total people affected: ${totalAffected}`
      );
    } catch (error) {
      console.error("Error fetching households:", error);
    }
  };

  
  return (
    <>
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-10 flex items-center p-2 gap-3">
        <div className="flex gap-2 items-center bg-white dark:bg-zinc-800 rounded-lg shadow-sm w-auto p-2 px-3 border border-zinc-200 dark:border-neutral-700 text-sm">
          <button
            onClick={handleSimulate}
            className="btn btn-sm btn-primary text-white rounded text-sm"
          >
            Simulate
          </button>
        </div>
      </div>
    </>
  );
};

export default SimulationMap;
