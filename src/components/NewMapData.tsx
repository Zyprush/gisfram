"use client";
import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Data } from "@react-google-maps/api";
import Loading from "./Loading";
import { ZoomOutButton, GeoJsonMenu } from "./MapButtons";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
  borderRadius: "10px",
};
const center = { lat: 13.397099, lng: 120.459089 };
const options = {
  mapTypeId: "roadmap" as google.maps.MapTypeId,
  zoom: 11.6,
};

const MapData: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<{ [key: string]: any }>({});
  const [geoJsonFiles, setGeoJsonFiles] = useState<Array<{ name: string, file: string }>>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  useEffect(() => {
    fetch('/api/geojson-files')
      .then(response => response.json())
      .then(files => {
        console.log("Loaded files:", files);
        setGeoJsonFiles(files);
      })
      .catch(err => {
        console.error("Error loading GeoJSON file list:", err);
        setError("Error loading GeoJSON file list");
      });
  }, []);

  useEffect(() => {
    selectedFiles.forEach(file => {
      if (!geoJsonData[file]) { // Only fetch if not already loaded
        fetch(`/geojson/${file}`)
          .then((response) => response.json())
          .then((data) => {
            console.log("Loaded GeoJSON data for file:", file);
            setGeoJsonData(prevData => ({ ...prevData, [file]: data }));
          })
          .catch((err) => {
            console.error("Error loading GeoJSON data:", err);
            setError(`Error loading GeoJSON data for ${file}`);
          });
      }
    });
  }, [selectedFiles]);

  const handleFileSelect = (file: string) => {
    setSelectedFiles(prevSelected =>
      prevSelected.includes(file)
        ? prevSelected.filter(f => f !== file)
        : [...prevSelected, file]
    );
  };

  const handleCenterMap = () => {
    if (mapRef.current) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(options.zoom);
    }
  };

  if (!isLoaded) return <div><Loading /></div>;

  return (
    <>
      <ZoomOutButton onZoomOut={handleCenterMap} />

      <GeoJsonMenu
        geoJsonFiles={geoJsonFiles}
        selectedFiles={selectedFiles}
        onSelectFile={handleFileSelect}
      />

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
        {selectedFiles.map((file) => (
          geoJsonData[file] && (
            <Data
              key={file}
              onLoad={(data) => {
                console.log("Loading GeoJSON data onto map for file:", file);
                data.addGeoJson(geoJsonData[file]);
                data.setStyle({
                  strokeColor: "#FF0000",
                  fillColor: "#FF0000",
                  strokeOpacity: 1.0,
                  strokeWeight: 1.5,
                  fillOpacity: 0.0,
                  icon: {
                    url: "/warning.svg",
                    scaledSize: new google.maps.Size(20, 20),
                    anchor: new google.maps.Point(15, 15),
                  }
                });
              }}
            />
          )
        ))}
      </GoogleMap>

      {error && <div className="absolute bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Error: {error}</div>}
    </>
  );
};

export default MapData;
