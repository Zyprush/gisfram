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
  const [polygons, setPolygons] = useState<google.maps.LatLngLiteral[][]>([]);
  const [currentPolygon, setCurrentPolygon] = useState<
    google.maps.LatLngLiteral[]
  >([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPoint = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setCurrentPolygon((prev) => [...prev, newPoint]);
    }
  };

  const finishPolygon = () => {
    if (currentPolygon.length > 2 && polygons.length < 20) {
      setPolygons((prev) => [...prev, currentPolygon]);
      setCurrentPolygon([]);
    } else if (polygons.length >= 20) {
      alert("Maximum of 20 polygons reached!");
    }
  };

  const clearPolygons = () => {
    setPolygons([]);
    setCurrentPolygon([]);
  };

  const handlePanToCenter = () => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
    }
  };

  const handleSimulate = async () => {
    if (polygons.length === 0) {
      alert("Please add at least one polygon before simulating.");
      return;
    }

    try {
      const householdsRef = collection(db, "households");
      const querySnapshot = await getDocs(householdsRef);
      const households = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as { id: string; position: { lat: number; lng: number } }[];

      const results = households.filter((household) => {
        const position = new google.maps.LatLng(
          household.position.lat,
          household.position.lng
        );

        return polygons.some((polygonCoords) => {
          const polygon = new google.maps.Polygon({ paths: polygonCoords });
          return google.maps.geometry.poly.containsLocation(position, polygon);
        });
      });

      console.log("Households inside the polygons:", results);
      alert(`${results.length} households found inside the polygons.`);
    } catch (error) {
      console.error("Error fetching households:", error);
    }
  };

  if (!isLoaded)
    return (
      <div>
        <Loading />
      </div>
    );

  return (
    <>
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-10 flex items-center p-2 gap-3">
        <div className="flex gap-2 items-center bg-white dark:bg-zinc-800 rounded-lg shadow-sm w-auto p-2 px-3 border border-zinc-200 dark:border-neutral-700 text-sm">
          <button
            onClick={clearPolygons}
            className="bg-primary text-white p-1 rounded text-sm py-3.5 px-6"
          >
            Clear
          </button>

          <button
            onClick={finishPolygon}
            className="bg-primary text-white p-1 rounded text-sm py-3.5 px-6"
          >
            Add Polygon
          </button>

          <button
            onClick={handleSimulate}
            className="bg-primary text-white p-1 rounded text-sm py-3.5 px-6"
          >
            Simulate
          </button>
        </div>

        <button
          onClick={handlePanToCenter}
          className="bg-primary text-white p-1 rounded tooltip tooltip-bottom"
          data-tip="Return to Paluan"
        >
          <IconFocusCentered />
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={options.zoom}
        mapTypeId={options.mapTypeId}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        onClick={handleMapClick}
        options={{ fullscreenControl: false }}
      >
        {/* Render the current polygon being drawn */}
        {currentPolygon.length > 2 && (
          <Polygon
            paths={currentPolygon}
            options={{ 
              fillColor: "#FF0000", 
              fillOpacity: 0.4,
              strokeColor: "#FF0000", 
              strokeWeight: 2 
            }}
          />
        )}

        {/* Render finished polygons */}
        {polygons.map((polygonCoords, index) => (
          <Polygon
            key={index}
            paths={polygonCoords}
            options={{
              fillColor: "#0000FF",   
              fillOpacity: 0.4,       
              strokeColor: "#0000FF", 
              strokeWeight: 2,       
            }}
          />
        ))}
      </GoogleMap>
    </>
  );
};

export default SimulationMap;
