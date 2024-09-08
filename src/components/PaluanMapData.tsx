import React, { useState, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline, Polygon } from "@react-google-maps/api";
import { paluanCoords } from "@/app/pages/add-flood/paluanCoords";
import { IconFocusCentered } from "@tabler/icons-react";
import Loading from "./Loading";
import { alipaoy, bagongSilangPob, handangTumulongPob, lumangbayan, mananao, mapaladPob, marikit, PagAsaNgBayanPob, sanJosePob, silahisNgPagAsaPob, tubili } from "./barangayCoord";
import ViewEditHouse from "@/app/pages/add-flood/ViewEditHouse";
import AnalysisModal from "@/app/pages/map/AnalysisModal";
import useFetchHouseholds from "@/hooks/useFetchHouseholds";
import useFetchFloods from "@/hooks/useFetchFloods"; // Import your custom hook

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

const PaluanMapData: React.FC = () => {
  const [boundary, setBoundary] = useState<any>(paluanCoords);
  const [house, setHouse] = useState<boolean>(false);
  const [flood, setFlood] = useState<boolean>(false); // Added flood state
  const [analysis, setAnalysis] = useState<boolean>(false);
  const [viewHouse, setViewHouse] = useState<string>("");
  const [barangayName, setBarangayName] = useState<string>("");
  const [year, setYear] = useState<string>(""); // Added year state
  const households = useFetchHouseholds(barangayName, house);
  const floods = useFetchFloods(barangayName, year, flood); // Fetch floods data
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

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
      barangayBoundaries[selectedBarangay as keyof typeof barangayBoundaries] || paluanCoords
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

  if (!isLoaded) return <Loading />;

  return (
    <div className="relative">
      {viewHouse && <ViewEditHouse id={viewHouse} setViewHouse={setViewHouse} />}
      <div className="flex gap-2 items-center absolute left-2 top-2 z-10 bg-white dark:bg-zinc-800 rounded-lg shadow-sm w-auto p-4 text-sm flex-col text-zinc-700 dark:text-zinc-200">
        <div className="flex gap-4 justify-start mr-auto ml-0">
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
              checked={flood} // Bind the flood checkbox to state
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
        <div className="flex gap-2 ml-0 mr-auto">
          <select value={barangayName} onChange={handleSelect} className="sn-select mr-auto ">
            <option value="">Select Barangay</option>
            <option value="alipaoy">Alipaoy</option>
            <option value="bagongSilangPob">Bagong Silang Pob</option>
            <option value="handangTumulongPob">Handang Tumulong Pob</option>
            <option value="lumangbayan">Lumangbayan</option>
            <option value="mananao">Mananao</option>
            <option value="mapaladPob">Mapalad Pob</option>
            <option value="marikit">Marikit</option>
            <option value="PagAsaNgBayanPob">Pag-Asa Ng Bayan Pob</option>
            <option value="sanJosePob">San Jose Pob</option>
            <option value="silahisNgPagAsaPob">Silahis Ng Pag-Asa Pob</option>
            <option value="tubili">Tubili</option>
          </select>
          <input
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="sn-input w-20"
          />
          <button onClick={handlePanToCenter} className="btn-primary text-white px-1 btn btn-sm">
            <IconFocusCentered />
          </button>
        </div>
        {/* TODO:affected sa baha */}
        {analysis && <AnalysisModal barangay={barangayName} />}
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
        options={{
          fullscreenControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
        }}
      >
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
              onClick={() => setViewHouse(household.id)}
              title={`house no: ${household.houseNo.toString()}\nhead name: ${household.head}\nmember: ${household.memberTotal}`}
            />
          ))}
        {flood ?
          floods.length > 0 &&
          floods.map((floodData, index) => (
            <Polygon
              key={index}
              paths={floodData.position}
              options={{
                fillColor: "#0000FF",
                fillOpacity: 0.35,
                strokeColor: "#0000FF",
                strokeOpacity: 0.45,
                strokeWeight: 2,
              }}
              onClick={() => console.log(`Flood details: ${floodData}`)} // Optional: Handle polygon click
            />
          )): null}
      </GoogleMap>
    </div>
  );
};

export default PaluanMapData;
