"use client";
import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { IconFocusCentered } from "@tabler/icons-react";
import { paluanCoords } from "@/app/pages/map/paluanCoords";
import AddFlood from "@/app/pages/add-flood/AddFlood";
import { harrison } from "../lib/boundary/harrison";
import { alipaoy } from "@/lib/boundary/alipaoy";
import { bagongSilangPob } from "@/lib/boundary/bagongSilangPob";
import { lumangbayan } from "@/lib/boundary/lumangbayan";
import { mananao } from "@/lib/boundary/mananao";
import { marikit } from "@/lib/boundary/marikit";
import { pagAsaNgBayanPob } from "@/lib/boundary/pagAsaNgBayanPob";
import { silahisNgPagAsaPob } from "@/lib/boundary/silahisNgPagAsaPob";
import { mapaladPob } from "@/lib/boundary/mapaladPob";
import { sanJosePob } from "@/lib/boundary/sanJosePob";
import { handangTumulongPob, tubili } from "./barangayCoord";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
  borderRadius: "10px",
};

const center = { lat: 13.397099, lng: 120.459089 };

const AddFloodMap: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [barangayName, setBarangayName] = useState<string>("");
  const [boundary, setBoundary] = useState<any>(paluanCoords);
  const [showForm, setShowForm] = useState<boolean>(true); //false
  const [polygon, setPolygon] = useState<google.maps.LatLng[]>([]);
  const [severity, setSeverity] = useState<string>("low"); // State for severity

  const handlePanToCenter = () => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
    }
  };

  // Function to pan and zoom to the selected barangay
  const panAndZoomToBarangay = (coordinates: google.maps.LatLngLiteral[]) => {
    if (mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach((coord) => bounds.extend(coord));
      mapRef.current.fitBounds(bounds);
    }
  };

  const handleSelect = (e: any) => {
    const selectedBarangay = e.target.value;
    setBarangayName(selectedBarangay);

    const barangayBoundaries = {
      alipaoy: alipaoy,
      bagongSilangPob: bagongSilangPob,
      handangTumulongPob: handangTumulongPob,
      harrison: harrison,
      lumangbayan: lumangbayan,
      mananao: mananao,
      mapaladPob: mapaladPob,
      marikit: marikit,
      pagAsaNgBayanPob: pagAsaNgBayanPob,
      sanJosePob: sanJosePob,
      silahisNgPagAsaPob: silahisNgPagAsaPob,
      tubili: tubili,
    };
    const selectedBoundary =
      barangayBoundaries[selectedBarangay as keyof typeof barangayBoundaries] ||
      paluanCoords;

    setBoundary(selectedBoundary);
    panAndZoomToBarangay(selectedBoundary);
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const clickedLocation = event.latLng;
    const polygonShape = new google.maps.Polygon({ paths: boundary });

    // Check if the clicked location is within the selected barangay's boundary
    if (
      !google.maps.geometry.poly.containsLocation(clickedLocation, polygonShape)
    ) {
      alert("Action outside Boundary is not allowed!");
      return;
    }

    if (boundary !== paluanCoords) {
      // Add clicked location to the polygon coordinates
      setPolygon((prev) => [...prev, clickedLocation]);
    } else {
      alert("Please select a Barangay!");
    }
  };

  const handleCancel = () => {
    setBoundary(paluanCoords);
    setBarangayName("");
    setPolygon([]);
    setShowForm(false);
    setSeverity("low"); // Reset severity
  };

  const handleUndoLast = () => {
    setPolygon((prev) => prev.slice(0, -1));
  };

  const handleMarkerDragEnd = (index: number, event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const newPolygon = [...polygon];
    newPolygon[index] = event.latLng; // Update the specific vertex
    setPolygon(newPolygon);
  };

  const handleSeverityChange = (newSeverity: string) => {
    setSeverity(newSeverity);
  };

  return (
    <div className="relative">
      {barangayName && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 p-3 px-4 rounded-xl gap-3 bg-white shadow-2xl dark:bg-neutral-900 dark:shadow-lg flex flex-col text-sm text-zinc-700 dark:text-white">
          Please click on the map to add a flood marker
        </div>
      )}
      <div className="absolute top-2 left-2 right-auto transform z-10 p-3 px-4 rounded-xl gap-3 bg-white shadow-2xl dark:bg-neutral-900 dark:shadow-lg flex flex-col">
        <select
          value={barangayName}
          onChange={handleSelect}
          className="sn-select mr-auto"
          disabled={polygon.length > 0}
        >
          <option value="">Select Barangay</option>
          <option value="alipaoy">Alipaoy</option>
          <option value="bagongSilangPob">Bagong Silang Pob</option>
          <option value="handangTumulongPob">Handang Tumulong Pob</option>
          <option value="harrison">Harrison</option>
          <option value="lumangbayan">Lumangbayan</option>
          <option value="mananao">Mananao</option>
          <option value="mapaladPob">Mapalad Pob</option>
          <option value="marikit">Marikit</option>
          <option value="pagAsaNgBayanPob">Pag-Asa Ng Bayan Pob</option>
          <option value="sanJosePob">San Jose Pob</option>
          <option value="silahisNgPagAsaPob">Silahis Ng Pag-Asa Pob</option>
          <option value="tubili">Tubili</option>
        </select>
        <div className="flex gap-5">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showForm}
              onChange={(e) => setShowForm(e.target.checked)}
              className="checkbox checkbox-xs checkbox-secondary rounded-md"
            />
            <span className="ml-1 text-xs font-semibold dark:text-white text-zinc-700">Show Form</span>
          </label>
          {polygon.length > 0 && (
            <button
              onClick={handleUndoLast}
              className="rounded-md btn-sm text-xs text-white btn btn-error"
            >
              Undo Flood
            </button>
          )}
        </div>
        <div>{/* display the polygon map here */}</div>
        {showForm && (
          <AddFlood
            barangay={barangayName}
            polygon={polygon}
            handleCancel={handleCancel}
            onSeverityChange={handleSeverityChange} // Pass severity change handler
          />
        )}
      </div>

      <div className="absolute top-14 right-2 z-10 flex p-2 rounded-xl gap-3 bg-white shadow dark:bg-neutral-900 dark:shadow-lg">
        <button
          onClick={handlePanToCenter}
          className="btn-primary text-white px-1 btn btn-sm tooltip tooltip-bottom"
          data-tip="Return to Paluan"
        >
          <IconFocusCentered />
        </button>
      </div>

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
          options={{
            fullscreenControl: false,
            mapTypeControl: true, // Set to true to enable map type control
            mapTypeControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT,
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            },
            mapTypeId: "satellite", // Set the default map type to satellite view
            streetViewControl: false, // Disable the street view control
          }}
        >
          {boundary && (
            <Polyline
              path={boundary}
              options={{
                strokeColor: "#FF0000",
              }}
            />
          )}

          {polygon.length > 0 && (
            <Polygon
              path={polygon.map((point) => ({
                lat: point.lat(),
                lng: point.lng(),
              }))}
              options={{
                strokeColor: severity === "high" ? "#7F00FF" : severity === "moderate" ? "#FFC0CB" : "#FFFFFF",
                fillColor: severity === "high" ? "#7F00FF" : severity === "moderate" ? "#FFC0CB" : "#FFFFFF", // Corrected color mapping
                fillOpacity: 0.4,
              }}
            />
          )}

          {/* Render markers at each vertex of the polygon */}
          {polygon.map((point, index) => (
            <Marker
              key={index}
              position={{ lat: point.lat(), lng: point.lng() }}
              draggable
              onDragEnd={(event) => handleMarkerDragEnd(index, event)}
              options={{
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 5,
                  fillColor: "#FF0000",
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: "#FFFFFF",
                },
              }}
            />
          ))}
        </GoogleMap>
      )}
    </div>
  );
};

export default AddFloodMap;
