"use client";
import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Data } from "@react-google-maps/api";
import Loading from "./Loading";
import { IconArrowBack, IconLocation, IconUpload } from "@tabler/icons-react";

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
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [geoJsonFiles, setGeoJsonFiles] = useState<Array<{ name: string, file: string }>>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);


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
    console.log("Selected file changed:", selectedFile);
    if (selectedFile) {
      setGeoJsonData(null); // Clear existing data
      fetch(`/geojson/${selectedFile}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Loaded GeoJSON data for file:", selectedFile);
          setGeoJsonData(data);
        })
        .catch((err) => {
          console.error("Error loading GeoJSON data:", err);
          setError(`Error loading GeoJSON data for ${selectedFile}`);
        });
    } else {
      setGeoJsonData(null);
    }
  }, [selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedFile = e.target.value || null;
    console.log("Selecting new file:", newSelectedFile);
    setSelectedFile(newSelectedFile);
  };

  const handleCenterMap = () => {
    if (mapRef.current) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(options.zoom);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.geojson')) {
      const formData = new FormData();
      const fileName = file.name.replace(/\s+/g, '_');
      formData.append('file', file, fileName);

      try {
        const response = await fetch('/api/upload-geojson', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          // Refresh the list of GeoJSON files
          const filesResponse = await fetch('/api/geojson-files');
          const files = await filesResponse.json();
          setGeoJsonFiles(files);
          setIsModalOpen(false);
        } else {
          setError('Error uploading file');
        }
      } catch (err) {
        console.error('Error uploading file:', err);
        setError('Error uploading file');
      }
    } else {
      setError('Please select a valid .geojson file');
    }
  };


  if (!isLoaded) return <div><Loading /></div>;

  return (
    <>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
          <select
            value={selectedFile || ''}
            onChange={handleFileSelect}
            className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-2"
          >
            <option value="">Select Visual Data</option>
            {geoJsonFiles.map((file) => (
              <option key={file.file} value={file.file}>
                {file.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <IconUpload size={20} />
          </button>
        </div>
      </div>
      {/* Import Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Import GeoJSON File</h2>
            <input
              type="file"
              accept=".geojson"
              onChange={handleFileUpload}
              className="mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Button to center the map */}
      <button
        onClick={handleCenterMap}
        className="absolute top-4 right-4 z-50 bg-white text-blue-600 border border-blue-600 px-2 py-2 rounded shadow-md hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <IconArrowBack />
      </button>



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
        {geoJsonData && (
          <Data
            key={selectedFile}
            onLoad={(data) => {
              console.log("Loading GeoJSON data onto map for file:", selectedFile);
              data.addGeoJson(geoJsonData);
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
        )}
      </GoogleMap>
      {error && <div className="absolute bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Error: {error}</div>}
    </>
  );
};

export default HazardMap;
