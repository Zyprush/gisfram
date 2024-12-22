/* eslint-disable @next/next/no-img-element */
"use client";
import PrintHeader from "@/components/PrintHeader";
import useFetchFloods from "@/hooks/useFetchFloods";
import useFetchHouseholds from "@/hooks/useFetchHouseholds";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import AnalysisModal from "@/app/pages/map/AnalysisModal";
import DataModal from "../DataModal";
import {
  GoogleMap,
  Marker,
  Polygon,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import Loading from "@/components/Loading";
import { paluanCoords } from "../paluanCoords";
import { getSetting } from "../../settings/getSetting";

const Print = () => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const reactToPrintFn = useReactToPrint({
    content: () => contentRef.current,
  });
  const searchParams = useSearchParams();
  const mapContainerStyle = {
    width: "100%",
    height: "141mm", // Adjust height based on print mode
    borderRadius: "0",
  };
  const center = { lat: 13.397099, lng: 120.459089 };

  const options = {
    mapTypeId: "roadmap" as google.maps.MapTypeId,
    zoom: 11.6,
  };
  // Extract query data from the URL
  const barangayName = searchParams.get("barangayName") || "Paluan";
  const year = searchParams.get("year") || "";
  const house = searchParams.get("house") === "true";
  const flood = searchParams.get("flood") === "true";
  const sitio = searchParams.get("sitio") || "";
  const [boundary, setBoundary] = useState<any>(paluanCoords);
  const [printName, setPrintName] = useState("");

  const households = useFetchHouseholds(barangayName, house, sitio, year);
  const floods = useFetchFloods(barangayName, year, flood); // Fetch floods data
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  useEffect(() => {
    const fetchBrandName = async () => {
      try {
        const name = await getSetting("printedBy");
        if (name) setPrintName(name);
      } catch (error) {
        console.error("Error fetching brand name:", error);
      }
    };
    fetchBrandName();
  }, []);

  if (!isLoaded) return <Loading />;

  return (
    <div className="flex justify-center items-center w-screen h-full py-10 print:p-0 print:bg-white overflow-x-hidden">
      <div
        ref={contentRef}
        className="w-[210mm] tahoma h-[297mm] mx-auto p-0 text-center bg-white border border-gray-200 shadow-lg text-zinc-700 relative"
      >
        <div className="print:z-50 mt-5">
          <PrintHeader />
        </div>
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex w-full justify-between items-start">
            <div className="flex gap-2 p-4 items-center  border border-zinc-200">
              <h1 className="text-xl capitalize font-bold">
                {barangayName}{" "}
                <span className="font-normal text-sm">
                  {sitio ? `${sitio}` : " "}
                </span>{" "}
                {year}
              </h1>
            </div>
            {flood && (
              <div className="flex gap-2 p-2 text-xs items-center  border border-zinc-200">
                <span className="text-zinc-700 dark:text-white font-extrabold ">
                  Flood legend
                </span>
                <span className="bg-[#FFFFFF] border p-2 py-1 text-xs rounded-sm text-zinc-700 font-semibold">
                  low
                </span>
                <span className="bg-[#FFC0CB] p-2 py-1 text-xs rounded-sm text-zinc-700 font-semibold">
                  moderate
                </span>
                <span className="bg-[#7F00FF] p-2 py-1 text-xs rounded-sm font-semibold">
                  high
                </span>
              </div>
            )}
          </div>

          <div className="w-full h-full flex" id="map">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={options.zoom}
              mapTypeId={options.mapTypeId}
              options={{
                fullscreenControl: false,
                mapTypeControl: false, // Set to true to enable map type control
                mapTypeControlOptions: {
                  position: google.maps.ControlPosition.TOP_RIGHT,
                  style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                },
                mapTypeId: "satellite", // Set the default map type to satellite view
                streetViewControl: false, // Disable street view
              }}
            >
              {/* {selectedFiles.map(
                (file) =>
                  geoJsonData[file] && (
                    <Data
                      key={file}
                      onLoad={(data) => {
                        console.log(
                          "Loading GeoJSON data onto map for file:",
                          file
                        );
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
                          },
                        });
                      }}
                    />
                  )
              )} */}
              {boundary && (
                <Polyline
                  path={boundary}
                  options={{
                    strokeColor: "#FF0000",
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                  }}
                />
              )}
              {house &&
                households.length > 0 &&
                households.map((household, index) => (
                  <Marker
                    key={index}
                    position={{
                      lat: household.position.lat,
                      lng: household.position.lng,
                    }}
                    title={`HOUSE NO.: ${household.houseNo
                      .toString()
                      .toUpperCase()}\nHEAD NAME: ${household.head.toUpperCase()}\nTOTAL MEMBER: ${
                      household.memberTotal
                    }`}
                  />
                ))}
              {flood
                ? floods.length > 0 &&
                  floods.map((floodData, index) => (
                    <Polygon
                      key={index}
                      paths={floodData.position}
                      options={{
                        strokeColor:
                          floodData.severity === "high"
                            ? "#7F00FF"
                            : floodData.severity === "moderate"
                            ? "#FFC0CB"
                            : "#FFFFFF",
                        fillColor:
                          floodData.severity === "high"
                            ? "#7F00FF"
                            : floodData.severity === "moderate"
                            ? "#FFC0CB"
                            : "#FFFFFF",
                        fillOpacity: 0.3,
                        strokeOpacity: 0.45,
                        strokeWeight: 2,
                        zIndex:
                          floodData.severity === "high"
                            ? 100
                            : floodData.severity === "moderate"
                            ? 50
                            : 1,
                      }}
                      onClick={() => console.log(`Flood details: ${floodData}`)} // Optional: Handle polygon click
                    />
                  ))
                : null}
            </GoogleMap>
          </div>
          <div className="flex gap-3 w-full">
            <div className="flex w-2/5 flex-col gap-3">
              <AnalysisModal
                barangay={barangayName}
                year={year}
                gender="Male"
              />
              <AnalysisModal
                barangay={barangayName}
                year={year}
                gender="Female"
              />
            </div>
            <DataModal barangay={barangayName} year={year} />
          </div>
          <div className="text-zinc-600 flex flex-col absolute bottom-0 right-10 p-3">
            {printName}
            <span className="text-xs">Printed By</span>
          </div>
        </div>
      </div>
      <button
        onClick={reactToPrintFn}
        className="fixed bottom-10 right-10 btn btn-primary text-white mt-5"
      >
        Print
      </button>
    </div>
  );
};

export default Print;
