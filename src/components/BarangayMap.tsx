"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Polygon,
} from "@react-google-maps/api";
import { paluanCoords } from "@/app/pages/add-data/paluanCoords";
import { IconFocusCentered } from "@tabler/icons-react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import Link from "next/link";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
  borderRadius: "10px",
};

const center = { lat: 13.397099, lng: 120.459089 };

const BarangayMap: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [polyfill, setPolyfill] = useState<google.maps.LatLng[]>([]);
  const [barangayName, setBarangayName] = useState<string>("");
  const [searchResult, setSearchResult] = useState<google.maps.LatLng[]>([]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!isLoaded || !event.latLng || !window.google) return;

    const clickedLocation = event.latLng;
    setPolyfill([...polyfill, clickedLocation]); // Add new point to the polygon
  };

  const handleSave = async () => {
    if (polyfill.length === 0) {
      alert("No points have been added to the polygon.");
      return;
    }

    const name = prompt("What would you like to name this barangay?");
    if (!name) return;

    const barangayRef = collection(db, "barangay");
    const q = query(barangayRef, where("name", "==", name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("That barangay already exists.");
      return;
    }

    await addDoc(barangayRef, {
      name,
      polygon: polyfill.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      })),
    });

    alert("Barangay saved successfully!");
    setPolyfill([]); // Reset after saving
  };

  const handleClearPolyfill = () => {
    setPolyfill([]); // Clear the polyfill
  };

  const handlePanToCenter = () => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
    }
  };

  const handleSearch = async () => {
    if (!barangayName) return;

    const barangayRef = collection(db, "barangay");
    const q = query(barangayRef, where("name", "==", barangayName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Barangay not found.");
      return;
    }

    const data = querySnapshot.docs[0].data();
    const polygon = data.polygon.map(
      (coord: { lat: number; lng: number }) =>
        new google.maps.LatLng(coord.lat, coord.lng)
    );

    setSearchResult(polygon);

    if (mapRef.current && polygon.length > 0) {
      mapRef.current.panTo(polygon[0]);
    }
  };

  const clearSearch = () => {
    setSearchResult([]); // Clear the search result
    setBarangayName(""); // Clear the input field
  };

  return (
    <>
      {polyfill.length == 0 && (
        // only show this if there is no polyfill
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex p-3 px-4 rounded-xl gap-3 bg-white shadow dark:bg-neutral-900 dark:shadow-lg">
          <input
            type="text"
            placeholder="Search Barangay"
            value={barangayName}
            onChange={(e) => setBarangayName(e.target.value)}
            className="p-2 rounded text-sm text-zinc-600"
          />
          <button
            onClick={handleSearch}
            className="bg-primary text-white p-2 rounded tooltip tooltip-bottom flex gap-2 items-center text-sm dark:bg-primary-dark"
          >
            Search
          </button>
          <button
            onClick={handlePanToCenter}
            className="bg-primary text-white p-1 rounded tooltip tooltip-bottom px-2 dark:bg-primary-dark"
            data-tip="Return to Paluan"
          >
            <IconFocusCentered />
          </button>
        </div>
      )}

      <div className="absolute top-4 right-8 z-10 flex p-3 px-4 rounded-xl gap-3 bg-white shadow dark:bg-neutral-900 dark:shadow-lg">
        <Link
          href={"/pages/barangay/list"}
          className="bg-primary text-white p-2 rounded tooltip tooltip-bottom flex gap-2 items-center text-xs btn-sm font-semibold dark:bg-primary-dark"
        >
          Barangay List
        </Link>
      </div>

      {polyfill.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex p-3 rounded-xl gap-3 bg-white shadow dark:bg-neutral-900 dark:shadow-lg">
          <button
            onClick={handleClearPolyfill}
            className="btn btn-sm btn-outline dark:text-white text-zinc-600 hover:bg-black"
            data-tip="Clear the Polygon"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            className="btn btn-sm btn-primary text-white"
            data-tip="Save the Polygon"
          >
            Save
          </button>
        </div>
      )}
      {searchResult.length > 0 && (
        <div className="fixed bottom-4 right-8 md:right-20 z-10 flex p-3 rounded-xl gap-3 bg-white shadow dark:bg-neutral-900 dark:shadow-lg">
          <button
            onClick={clearSearch}
            className="btn btn-sm btn-primary text-white"
            data-tip="Clear the Search Result"
          >
            Clear search
          </button>
        </div>
      )}

      {isLoaded && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={11.6}
          mapTypeId="roadmap"
          onClick={handleMapClick}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          options={{ fullscreenControl: false }}
        >
          <Polyline
            path={paluanCoords}
            options={{ strokeColor: "#FF0000", strokeWeight: 2 }}
          />

          {polyfill.length > 0 && (
            <Polygon
              paths={polyfill}
              options={{
                fillColor: "#0000FF",
                strokeColor: "#0000FF",
                strokeWeight: 2,
              }}
            />
          )}

          {searchResult.length > 0 && (
            <Polygon
              paths={searchResult}
              options={{
                fillColor: "#8A2BE2",
                strokeColor: "#8A2BE2",
                strokeWeight: 2,
              }}
            />
          )}
        </GoogleMap>
      )}
    </>
  );
};

export default BarangayMap;
