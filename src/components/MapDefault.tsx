"use client";
import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
} from "@react-google-maps/api";
import { paluanCoords } from "@/app/pages/add-data/paluanCoords";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const center = { lat: 13.397099, lng: 120.459089 }; //fix the map

const options = {
  mapTypeId: "roadmap" as google.maps.MapTypeId,
  zoom: 11.6, //fix the zoom
};

const dashedPolylineOptions = {
    strokeColor: "#000",
    strokeWeight: 1.5,
    strokeOpacity: 1.0,
    icons: [
      {
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        offset: "0%",
      },
      {
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        offset: "50%",
      },
    ],
  };

const MapDefault: React.FC = () => {
  const [error] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={options.zoom}
        mapTypeId={options.mapTypeId}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        options={{ fullscreenControl: false }}
      >
        <Polyline
          path={paluanCoords}
          options={{ strokeColor: "#000", strokeWeight: 1.5 }}
        />
      </GoogleMap>

      {error && <div>Error: {error}</div>}
    </>
  );
};

export default MapDefault;