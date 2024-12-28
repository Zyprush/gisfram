"use client";
import React, { useState, useRef, useEffect, LegacyRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  Polygon,
  Data,
} from "@react-google-maps/api";
import { paluanCoords } from "@/app/pages/add-flood/paluanCoords";
import { IconChevronDown } from "@tabler/icons-react";
import Loading from "./Loading";
import AnalysisModal from "@/app/pages/map/AnalysisModal";
import useFetchHouseholds from "@/hooks/useFetchHouseholds";
import useFetchFloods from "@/hooks/useFetchFloods"; // Import your custom hook
import DataModal from "@/app/pages/map/DataModal";
import { GeoJsonMenu, ZoomOutButton } from "./MapButtons";
import PrintHeader from "./PrintHeader";
import { harrison } from "../lib/boundary/harrison";
import { alipaoy } from "@/lib/boundary/alipaoy";
import { bagongSilangPob } from "@/lib/boundary/bagongSilangPob";
import { lumangbayan } from "@/lib/boundary/lumangbayan";
import { mananao } from "@/lib/boundary/mananao";
import { marikit } from "@/lib/boundary/marikit";
import { pagAsaNgBayanPob } from "@/lib/boundary/pagAsaNgBayanPob";
import { silahisNgPagAsaPob } from "@/lib/boundary/silahisNgPagAsaPob";
import { sanJosePob } from "@/lib/boundary/sanJosePob";
import { handangTumulongPob, tubili, mapaladPob } from "./barangayCoord";
import Sitio from "@/app/pages/settings/Sitio";
import { db } from "@/firebase";
import { getDoc, doc } from "firebase/firestore";
import Link from "next/link";

const center = { lat: 13.397099, lng: 120.459089 };

const options = {
  mapTypeId: "roadmap" as google.maps.MapTypeId,
  zoom: 11.6,
};
interface PaluanMapDataProps {
  mpRef: React.RefObject<HTMLDivElement | null>;
  chartRef: React.RefObject<HTMLDivElement | null>; // Assuming the chart is a div, adjust if it's another element
  print: boolean;
}

const PaluanMapData: React.FC<PaluanMapDataProps> = ({
  mpRef,
  chartRef,
  print,
}) => {
  const currentYear = new Date().getFullYear();
  const [boundary, setBoundary] = useState<any>(paluanCoords);
  const [house, setHouse] = useState<boolean>(false);
  const [flood, setFlood] = useState<boolean>(false); // Added flood state
  const [sitio, setSitio] = useState("");
  const [sitioList, setSitioList] = useState<Sitio[]>([]);
  const [analysis, setAnalysis] = useState<boolean>(false);
  const [barangayName, setBarangayName] = useState<string>("");
  const [year, setYear] = useState<string>(""); // Added year state
  const households = useFetchHouseholds(barangayName, house, sitio, year);
  const floods = useFetchFloods(barangayName, year, flood); // Fetch floods data
  const mapRef = useRef<google.maps.Map | null>(null);
  const [hoveredSeverity, setHoveredSeverity] = useState<string>("");

  const [geoJsonData, setGeoJsonData] = useState<{ [key: string]: any }>({});
  const [geoJsonFiles, setGeoJsonFiles] = useState<
    Array<{ name: string; file: string }>
  >([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const [isVisible, setIsVisible] = useState(false); 

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });
  // Function to pan and zoom to the selected barangay
  const panAndZoomToBarangay = (coordinates: google.maps.LatLngLiteral[]) => {
    if (mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach((coord) => bounds.extend(coord));
      mapRef.current.fitBounds(bounds); // Automatically fits the boundary
    }
  };

  useEffect(() => {
    const fetchSitio = async () => {
      const sitioDoc = await getDoc(doc(db, "settings", "sitio"));

      if (sitioDoc.exists()) {
        const sitioList = sitioDoc.data().sitio || [];
        const filteredSitioList = sitioList.filter(
          (sitio: Sitio) => sitio.barangay === barangayName
        );
        setSitioList(filteredSitioList);
      }
    };
    fetchSitio();
  }, [barangayName]);

  const handleSelect = (e: any) => {
    const selectedBarangay = e.target.value;
    setBarangayName(selectedBarangay);
    const barangayBoundaries = {
      alipaoy,
      bagongSilangPob,
      handangTumulongPob,
      harrison,
      lumangbayan,
      mananao,
      mapaladPob,
      marikit,
      pagAsaNgBayanPob,
      sanJosePob,
      silahisNgPagAsaPob,
      tubili,
    };
    setBoundary(
      barangayBoundaries[selectedBarangay as keyof typeof barangayBoundaries] ||
        paluanCoords
    );
    panAndZoomToBarangay(
      barangayBoundaries[selectedBarangay as keyof typeof barangayBoundaries] ||
        paluanCoords
    );
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const clickedLocation = event.latLng;
    const polygonShape = new google.maps.Polygon({ paths: boundary });

    if (
      !google.maps.geometry.poly.containsLocation(clickedLocation, polygonShape)
    ) {
      alert("Action outside the selected barangay boundary is not allowed!");
    }
  };

  const handlePanToCenter = () => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
    }
  };

  useEffect(() => {
    fetch("/api/geojson-files")
      .then((response) => response.json())
      .then((files) => {
        console.log("Loaded files:", files);
        setGeoJsonFiles(files);
      })
      .catch((err) => {
        console.error("Error loading GeoJSON file list:", err);
      });
  }, []);

  useEffect(() => {
    selectedFiles.forEach((file) => {
      if (!geoJsonData[file]) {
        // Only fetch if not already loaded
        fetch(`/geojson/${file}`)
          .then((response) => response.json())
          .then((data) => {
            console.log("Loaded GeoJSON data for file:", file);
            setGeoJsonData((prevData) => ({ ...prevData, [file]: data }));
          })
          .catch((err) => {
            console.error("Error loading GeoJSON data:", err);
          });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles]);

  const handleFileSelect = (file: string) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.includes(file)
        ? prevSelected.filter((f) => f !== file)
        : [...prevSelected, file]
    );
  };

  const handleCenterMap = () => {
    if (mapRef.current) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(options.zoom);
    }
  };

  const mapContainerStyle = {
    width: "100%",
    height: print ? "85vh" : "100%", // Adjust height based on print mode
    borderRadius: print ? "0" : "10px",
  };

  if (!isLoaded) return <Loading />;

  return (
    <div className="h-full flex w-full">
      <ZoomOutButton onZoomOut={handleCenterMap} />
      <GeoJsonMenu
        geoJsonFiles={geoJsonFiles}
        selectedFiles={selectedFiles}
        onSelectFile={handleFileSelect}
      />
      <div className="relative w-full">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="absolute left-2 top-3 z-10 p-2 bg-white dark:bg-zinc-800  rounded shadow"
        >
          <IconChevronDown
            className={`text-xl text-zinc-600 dark:text-zinc-300 transition-all duration-300 ${
              isVisible ? "rotate-180" : ""
            }`}
          />
        </button>
        {isVisible && (
          <div className="flex gap-2 items-center absolute left-2 top-14 z-10 bg-white dark:bg-zinc-800 rounded-lg shadow-sm w-auto text-sm flex-col text-zinc-700 dark:text-zinc-200 transition-all duration-300 ease-linear">
            <div className="flex gap-4 justify-start mr-auto ml-0 p-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={house}
                  onChange={(e) => setHouse(e.target.checked)}
                  className="checkbox checkbox-xs checkbox-secondary rounded-md"
                />
                <span className="ml-1 text-xs font-semibold">Household</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={flood}
                  onChange={(e) => setFlood(e.target.checked)}
                  className="checkbox checkbox-xs checkbox-secondary rounded-md"
                />
                <span className="ml-1 text-xs font-semibold">Flood</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs checkbox-secondary rounded-md"
                  onChange={(e) => setAnalysis(e.target.checked)}
                />
                <span className="ml-1 text-xs font-semibold">Analysis</span>
              </label>
            </div>

            <div className="flex gap-2 ml-0 mr-auto px-4 pb-4">
              <select
                value={barangayName}
                onChange={handleSelect}
                className="sn-select mr-auto"
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
                <option value="silahisNgPagAsaPob">
                  Silahis Ng Pag-Asa Pob
                </option>
                <option value="tubili">Tubili</option>
              </select>

              {barangayName && house && (
                <select
                  value={sitio}
                  onChange={(e) => setSitio(e.target.value)}
                  className="sn-select"
                  //   className="p-2 text-sm border-primary border-2 rounded-sm"
                >
                  <option value="">Select sitio</option>
                  {sitioList?.map((sitio, i) => (
                    <option key={i} value={sitio?.name}>
                      {sitio?.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="sn-select w-40"
              >
                <option value="">Year</option>
                {Array.from({ length: 30 }, (_, i) => currentYear - i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>
            {flood && (
              <div className="flex gap-2 p-4 ml-0 mr-auto items-center">
                <span className="text-zinc-700 dark:text-white font-extrabold">
                  Flood legend
                </span>
                <span className="bg-[#FFFFFF] p-2 py-1 text-xs rounded-sm text-zinc-700 font-semibold">
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
            {analysis && (
              <div
                className="flex flex-col justify-start gap-3 bg-white dark:bg-zinc-800 p-4"
                ref={chartRef as LegacyRef<HTMLDivElement>}
              >
                <div className="print-header hidden">
                  <PrintHeader />
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-3">
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
                  <DataModal barangay={barangayName} year={year} flood={flood} />
                </div>
              </div>
            )}
          </div>
        )}
        <div
          className="h-full grid grid-cols-1 grid-rows-1 w-full gap-0"
          ref={mpRef as LegacyRef<HTMLDivElement>}
        >
          <div className="print-header hidden print:z-50">
            <PrintHeader />
          </div>
          <div className="w-full h-full flex" id="map">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={options.zoom}
              mapTypeId={options.mapTypeId}
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
                streetViewControl: true, // Disable street view
              }}
            >
              {selectedFiles.map(
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
              )}
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
                      onMouseOver={() => setHoveredSeverity(floodData.severity)}
                      onMouseOut={() => setHoveredSeverity("")}
                    />
                  ))
                : null}
            </GoogleMap>
            <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl fixed z-40 bottom-8 right-20">
              <Link
                href={`/pages/map/print?barangayName=${encodeURIComponent(
                  barangayName ?? ""
                )}&year=${encodeURIComponent(
                  year ?? ""
                )}&house=${encodeURIComponent(
                  house ?? ""
                )}&flood=${encodeURIComponent(
                  flood ?? ""
                )}&analysis=${encodeURIComponent(
                  analysis ?? ""
                )}&sitio=${encodeURIComponent(
                  sitio ?? ""
                )}&geojson=${encodeURIComponent(selectedFiles.join(","))}`}
                className="btn btn-primary btn-sm text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Print
              </Link>
            </div>
          </div>
          {hoveredSeverity && (
            <div className={`flood-severity-tooltip top-10 transform -translate-x-1/2 bg-white dark:bg-zinc-800 text-black dark:text-zinc-300 px-2 p-5 text-2xl fixed flex rounded-lg capitalize`} style={{ left: '50%' }}>
              {hoveredSeverity}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaluanMapData;
