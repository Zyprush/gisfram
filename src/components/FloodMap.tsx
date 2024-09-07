"use client";
import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Marker,
} from "@react-google-maps/api";
import { paluanCoords } from "@/app/pages/add-flood/paluanCoords";
import {
  IconFocusCentered,
} from "@tabler/icons-react";
import AddData from "@/app/pages/add-flood/AddData";
import Loading from "./Loading";
import AddFloodData from "@/app/pages/add-flood/AddFloodData";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
  borderRadius: "10px",
};

const center = { lat: 13.397099, lng: 120.459089 }; //fix the map certered

const options = {
  mapTypeId: "roadmap" as google.maps.MapTypeId,
  zoom: 11.6, //fix the zoom
};

const FloodMap: React.FC = () => {
  const [marker, setMarker] = useState<google.maps.LatLng>();
  const [showAddData, setShowAddData] = useState<boolean>(false);
  const [showAddFloodRecord, setShowAddFloodRecord] = useState<boolean>(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  if (!isLoaded)
    return (
      <div>
        <Loading />
      </div>
    );

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const clickedLocation = event.latLng;
    const polygon = new google.maps.Polygon({ paths: paluanCoords });
    if (google.maps.geometry.poly.containsLocation(clickedLocation, polygon)) {
      setMarker(clickedLocation);
    } else {
      alert("Action outside Paluan is not allowed!");
    }
  };

  const handlePanToCenter = () => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
    }
  };

  return (
    <>
      {showAddFloodRecord && (
        <AddFloodData setAddData={setShowAddFloodRecord} marker={marker} />
      )}
<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex p-3 px-4 rounded-xl gap-3 bg-white shadow dark:bg-neutral-900 dark:shadow-lg">
  {marker && (
    <button
      className="btn btn-sm btn-primary space-x-1"
      data-tip="Add a Household"
      onClick={() => setShowAddData(true)}
    >
      Add Household
    </button>
  )}
  {marker && (
    <button
      className="btn btn-sm btn-primary space-x-1"
      data-tip="Add Flood Record"
      onClick={() => setShowAddFloodRecord(true)}
    >
      Add Flood Record
    </button>
  )}
  <button
    onClick={handlePanToCenter}
    className="btn-primary text-white btn-sm btn px-1"
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
        onClick={handleMapClick}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        options={{ fullscreenControl: false }}
      >
        <Polyline
          path={paluanCoords}
          options={{ strokeColor: "#FF0000", strokeWeight: 3 }}
        />

        {marker && <Marker position={marker} />}
      </GoogleMap>
    </>
  );
};

export default FloodMap;
