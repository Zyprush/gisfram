import React, { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { paluanCoords } from "@/app/pages/add-flood/paluanCoords";
import { IconFocusCentered } from "@tabler/icons-react";
import Loading from "./Loading";
import { 
  alipaoy, bagongSilangPob, handangTumulongPob, lumangbayan, mananao, 
  mapaladPob, marikit, PagAsaNgBayanPob, sanJosePob, silahisNgPagAsaPob, tubili 
} from "./barangayCoord";

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
  const [barangayName, setBarangayName] = useState<string>("");
  const mapRef = useRef<google.maps.Map | null>(null);
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  const handleSelect = (e: any) => {
    const selectedBarangay = e.target.value;
    setBarangayName(selectedBarangay);

    switch (selectedBarangay) {
      case "alipaoy":
        setBoundary(alipaoy);
        break;
      case "bagongSilangPob":
        setBoundary(bagongSilangPob);
        break;
      case "handangTumulongPob":
        setBoundary(handangTumulongPob);
        break;
      case "lumangbayan":
        setBoundary(lumangbayan);
        break;
      case "mananao":
        setBoundary(mananao);
        break;
      case "mapaladPob":
        setBoundary(mapaladPob);
        break;
      case "marikit":
        setBoundary(marikit);
        break;
      case "PagAsaNgBayanPob":
        setBoundary(PagAsaNgBayanPob);
        break;
      case "sanJosePob":
        setBoundary(sanJosePob);
        break;
      case "silahisNgPagAsaPob":
        setBoundary(silahisNgPagAsaPob);
        break;
      case "tubili":
        setBoundary(tubili);
        break;
      default:
        setBoundary(paluanCoords);
    }
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const clickedLocation = event.latLng;
    const polygonShape = new google.maps.Polygon({ paths: boundary });

    if (!google.maps.geometry.poly.containsLocation(clickedLocation, polygonShape)) {
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
      <div className="absolute left-2 top-2 z-10 flex items-center gap-3">
        <div className="flex gap-2 items-center bg-white dark:bg-zinc-800 rounded-lg shadow-sm w-auto p-2 px-3 text-sm">
          <select
            value={barangayName}
            onChange={handleSelect}
            className="sn-select mr-auto"
          >
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
          <button
            onClick={handlePanToCenter}
            className="btn-primary text-white px-1 btn btn-sm"
          >
            <IconFocusCentered />
          </button>
        </div>
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
      </GoogleMap>
    </div>
  );
};

export default PaluanMapData;
