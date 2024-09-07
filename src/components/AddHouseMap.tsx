"use client";
import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Marker,
} from "@react-google-maps/api";
import { IconFocusCentered } from "@tabler/icons-react";
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
import { paluanCoords } from "@/app/pages/map/paluanCoords";
import AddHouse from "@/app/pages/add-house/AddHouse";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
  borderRadius: "10px",
};

const center = { lat: 13.397099, lng: 120.459089 };

const AddHouseMap: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [barangayName, setBarangayName] = useState<string>("");
  const [boundary, setBoundary] = useState<any>(paluanCoords);
  const [addHouse, setAddHouse] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [marker, setMarker] = useState<google.maps.LatLng | undefined>(
    undefined
  );

  const handlePanToCenter = () => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
    }
  };

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
    const polygon = new google.maps.Polygon({ paths: boundary });
    if (!google.maps.geometry.poly.containsLocation(clickedLocation, polygon)) {
      alert("Action outside Boundary is not allowed!");
      return;
    }
    if (addHouse) {
      if (boundary !== paluanCoords) {
        setMarker(clickedLocation);
      } else {
        alert("Please select a Barangay!");
      }
    }
  };

  const handleCancel = () => {
    setAddHouse(false);
    setBoundary(paluanCoords);
    setBarangayName("");
    setMarker(undefined);
  };
  return (
    <div className="relative">
      {addHouse && (
        <div className="absolute top-20 left-4 right-auto transform z-10 p-3 px-4 rounded-xl gap-3 bg-white shadow-2xl dark:bg-neutral-900 dark:shadow-lg flex flex-col">
          <select
            value={barangayName}
            onChange={handleSelect}
            className="sn-select mr-auto"
            disabled={!!marker}
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
          
          {marker ? (
            <AddHouse
              barangay={barangayName}
              marker={marker}
              handleCancel={handleCancel}
            />
          ) : null}
        </div>
      )}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 flex p-3 px-4 rounded-xl gap-3 bg-white shadow dark:bg-neutral-900 dark:shadow-lg">
        {addHouse ? (
          <button
            onClick={handleCancel}
            className="btn-outline dark:text-white text-neutral hover:bg-neutral btn btn-sm"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setAddHouse(true)}
            className="btn-primary text-white btn btn-sm tooltip tooltip-bottom"
            data-tip="Return to Paluan"
          >
            Add Household
          </button>
        )}

        <button
          onClick={handlePanToCenter}
          className="btn-primary text-white px-1 btn btn-sm tooltip tooltip-bottom"
          data-tip="Return to Paluan"
        >
          <IconFocusCentered />
        </button>
      </div>
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={11.6}
          mapTypeId="roadmap"
          onClick={handleMapClick}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          options={{ fullscreenControl: false }}
        >
          {boundary && (
            <>
              <Polyline
                path={boundary}
                options={{
                  strokeColor: "#FF0000",
                }}
              />
            </>
          )}
          {marker && <Marker position={marker} />}
        </GoogleMap>
      )}
    </div>
  );
};

export default AddHouseMap;
