"use client";
import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Data } from "@react-google-maps/api";
import Loading from "./Loading";
import { IconArrowBack, IconLocation, IconCheck, IconRipple } from "@tabler/icons-react";
import { Menu, Transition } from "@headlessui/react"; // Add this for dropdown UI

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

const HazardMap: React.FC = () => {
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
      {/* Move the button for selecting GeoJSON data next to Map/Satellite */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleCenterMap}
          className="bg-white text-black border px-2 py-2 rounded shadow-md hover:bg-gray-300"
        >
          <IconArrowBack />
        </button>
      </div>

      <div className="absolute top-16 right-4 z-50">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="bg-white text-black font-weight-bold border px-2 py-[7px] rounded hover:bg-gray-300 ">
              <IconRipple />
            </Menu.Button>
          </div>
          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-left bg-white text-black divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {geoJsonFiles.map((file) => (
                  <Menu.Item key={file.file}>
                    {({ active }) => (
                      <div
                        onClick={() => handleFileSelect(file.file)}
                        className={`cursor-pointer px-4 py-2${
                          active ? "bg-gray-100" : "bg-white"
                        } flex justify-between items-center`}
                      >
                        <span>{file.name}</span>
                        {selectedFiles.includes(file.file) && (
                          <IconCheck className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

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

export default HazardMap;
