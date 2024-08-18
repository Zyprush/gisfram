"use client";
import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Marker,
} from "@react-google-maps/api";
import { paluanCoords } from "@/app/pages/map/paluanCoords";
import { IconFocusCentered } from "@tabler/icons-react";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const center = { lat: 13.4341, lng: 120.4603 };

const options = {
  mapTypeId: "roadmap" as google.maps.MapTypeId,
  zoom: 11.3,
};

const GoogleMapComponent: React.FC = () => {
  const [marker, setMarker] = useState<google.maps.LatLng>();
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  if (!isLoaded) return <div>Loading...</div>;

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
      <div className="absolute top-8 right-28 z-10 flex flex-col">
        <button
          onClick={handlePanToCenter}
          className=" bg-teal-600 text-white p-2 rounded"
        >
          <IconFocusCentered/>
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
       options={{fullscreenControl:false}}
      >
        <Polyline
          path={paluanCoords}
          options={{ strokeColor: "#FF0000", strokeWeight: 3 }}
        />
        <Marker position={center} title="Paluan, Occidental Mindoro" />
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </>
  );
};

export default GoogleMapComponent;
