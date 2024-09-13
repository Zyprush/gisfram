"use client";

import React, {
  useState,
  useRef,
  useEffect,
  LegacyRef,
} from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  Polygon,
  Data,
} from "@react-google-maps/api";
import { paluanCoords } from "@/app/pages/add-flood/paluanCoords";
import { IconFocusCentered, IconChevronDown } from "@tabler/icons-react";
import Loading from "./Loading";
import {
  alipaoy,
  bagongSilangPob,
  handangTumulongPob,
  lumangbayan,
  mananao,
  mapaladPob,
  marikit,
  PagAsaNgBayanPob,
  sanJosePob,
  silahisNgPagAsaPob,
  tubili,
} from "./barangayCoord";
import AnalysisModal from "@/app/pages/map/AnalysisModal";
import useFetchHouseholds from "@/hooks/useFetchHouseholds";
import useFetchFloods from "@/hooks/useFetchFloods"; // Import your custom hook
import DataModal from "@/app/pages/map/DataModal";
import { GeoJsonMenu, ZoomOutButton } from "./MapButtons";

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
interface PaluanMapDataProps {
  mpRef: React.RefObject<HTMLDivElement | null>;
  chartRef: React.RefObject<HTMLDivElement | null>; // Assuming the chart is a div, adjust if it's another element
}

const PaluanMapData: React.FC<PaluanMapDataProps> = ({ mpRef, chartRef }) => {
  const currentYear = new Date().getFullYear();
  const [boundary, setBoundary] = useState<any>(paluanCoords);
  const [house, setHouse] = useState<boolean>(false);
  const [flood, setFlood] = useState<boolean>(false); // Added flood state
  const [analysis, setAnalysis] = useState<boolean>(false);
  const [barangayName, setBarangayName] = useState<string>("");
  const [year, setYear] = useState<string>(""); // Added year state
  const households = useFetchHouseholds(barangayName, house);
  const floods = useFetchFloods(barangayName, year, flood); // Fetch floods data
  const mapRef = useRef<google.maps.Map | null>(null);

  const [geoJsonData, setGeoJsonData] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState<string | null>(null);
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

  const handleSelect = (e: any) => {
    const selectedBarangay = e.target.value;
    setBarangayName(selectedBarangay);
    const barangayBoundaries = {
      alipaoy,
      bagongSilangPob,
      handangTumulongPob,
      lumangbayan,
      mananao,
      mapaladPob,
      marikit,
      PagAsaNgBayanPob,
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
        setError("Error loading GeoJSON file list");
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
            setError(`Error loading GeoJSON data for ${file}`);
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

  if (!isLoaded) return <Loading />;

  return (
    <>
      <ZoomOutButton onZoomOut={handleCenterMap} />
      <GeoJsonMenu
        geoJsonFiles={geoJsonFiles}
        selectedFiles={selectedFiles}
        onSelectFile={handleFileSelect}
      />
      <div className="relative">
        <div>
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

              <div className="flex gap-2 ml-0 mr-auto px-4">
                <select
                  value={barangayName}
                  onChange={handleSelect}
                  className="sn-select mr-auto"
                >
                  <option value="">Select Barangay</option>
                  <option value="alipaoy">Alipaoy</option>
                  <option value="bagongSilangPob">Bagong Silang Pob</option>
                  <option value="handangTumulongPob">
                    Handang Tumulong Pob
                  </option>
                  <option value="lumangbayan">Lumangbayan</option>
                  <option value="mananao">Mananao</option>
                  <option value="mapaladPob">Mapalad Pob</option>
                  <option value="marikit">Marikit</option>
                  <option value="PagAsaNgBayanPob">Pag-Asa Ng Bayan Pob</option>
                  <option value="sanJosePob">San Jose Pob</option>
                  <option value="silahisNgPagAsaPob">
                    Silahis Ng Pag-Asa Pob
                  </option>
                  <option value="tubili">Tubili</option>
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="sn-select w-40"
                >
                  <option value="">Flood Year</option>
                  {Array.from({ length: 10 }, (_, i) => currentYear - i).map(
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
                  <span className="bg-[#00CCFF] p-2 py-1 text-xs rounded-sm font-semibold">
                    low
                  </span>
                  <span className="bg-[#ff960c] p-2 py-1 text-xs rounded-sm font-semibold">
                    moderate
                  </span>
                  <span className="bg-[#fc1616] p-2 py-1 text-xs rounded-sm font-semibold">
                    high
                  </span>
                </div>
              )}
              <div
                className="flex flex-col gap-5 bg-inherit p-2"
                ref={chartRef as LegacyRef<HTMLDivElement>}
              >
                {analysis && <AnalysisModal barangay={barangayName} year={year} />}
                {analysis && <DataModal barangay={barangayName} />}
              </div>
            </div>
          )}
        </div>
        <div ref={mpRef as LegacyRef<HTMLDivElement>}>
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
                  title={`house no: ${household.houseNo.toString()}\nhead name: ${
                    household.head
                  }\nmember: ${household.memberTotal}`}
                />
              ))}
            {flood
              ? floods.length > 0 &&
                floods.map((floodData, index) => (
                  <Polygon
                    key={index}
                    paths={floodData.position}
                    options={{
                      fillColor:
                        floodData.severity === "low"
                          ? "#00CCFF"
                          : floodData.severity === "moderate"
                          ? "#ff960c"
                          : "#fc1616",
                      fillOpacity: 0.35,
                      strokeColor:
                        floodData.severity === "low"
                          ? "#00CCFF"
                          : floodData.severity === "moderate"
                          ? "#ff960c"
                          : "#ef0000",
                      strokeOpacity: 0.45,
                      strokeWeight: 2,
                    }}
                    onClick={() => console.log(`Flood details: ${floodData}`)} // Optional: Handle polygon click
                  />
                ))
              : null}
          </GoogleMap>
        </div>
      </div>
    </>
  );
};

export default PaluanMapData;
