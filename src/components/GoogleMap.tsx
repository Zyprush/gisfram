"use client";
import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Marker,
} from "@react-google-maps/api";
import { paluanCoords } from "@/app/pages/add-data/paluanCoords";
import { IconBrowserPlus, IconFocusCentered } from "@tabler/icons-react";
import AddData from "@/app/pages/add-data/AddData";
import Loading from "./Loading";

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

const GoogleMapComponent: React.FC = () => {
  const [marker, setMarker] = useState<google.maps.LatLng>();
  const [showAddData, setShowAddData] = useState<boolean>(false);
  const [viewEditData, setViewEditData] = useState<boolean>(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  if (!isLoaded) return <div><Loading/></div>;

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
    {/* <ViewEditData id="5paHBCxOThBd8v5XAlol" setViewEditData={setViewEditData}/> */}
      {showAddData && <AddData setAddData={setShowAddData} marker={marker} />}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex p-2 gap-3 bg-white shadow rounded-md ">
        {marker && (
          <button
            className=" bg-primary text-white p-1 rounded tooltip tooltip-bottom"
            data-tip="Add a Household"
            onClick={() => setShowAddData(true)}
          >
            <IconBrowserPlus />
          </button>
        )}
        <button
          onClick={handlePanToCenter}
          className=" bg-primary text-white p-1 rounded tooltip tooltip-bottom"
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
        {marker && (
          <Marker position={marker}/>
        )}
      </GoogleMap>
    </>
  );
};

export default GoogleMapComponent;
