"use client";
import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  Marker,
  Polyline,
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
import AddFlood from "@/app/pages/add-flood/AddFlood";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
  borderRadius: "10px",
};

const center = { lat: 13.397099, lng: 120.459089 };

const AddFloodMap: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [barangayName, setBarangayName] = useState<string>("");
  const [boundary, setBoundary] = useState<any>(paluanCoords);
  const [addFlood, setAddFlood] = useState<boolean>(false);
  const [polygon, setPolygon] = useState<google.maps.LatLng[]>([]);

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
    const polygonShape = new google.maps.Polygon({ paths: boundary });

    // Check if the clicked location is within the selected barangay's boundary
    if (!google.maps.geometry.poly.containsLocation(clickedLocation, polygonShape)) {
      alert("Action outside Boundary is not allowed!");
      return;
    }

    if (addFlood) {
      if (boundary !== paluanCoords) {
        // Add clicked location to the polygon coordinates
        setPolygon((prev) => [...prev, clickedLocation]);
      } else {
        alert("Please select a Barangay!");
      }
    }
  };

  const handleCancel = () => {
    setAddFlood(false);
    setBoundary(paluanCoords);
    setBarangayName("");
    setPolygon([]);
  };

  return (
    <div className="relative">
      {addFlood && (
        <div className="absolute top-2 left-2 right-auto transform z-10 p-3 px-4 rounded-xl gap-3 bg-white shadow-2xl dark:bg-neutral-900 dark:shadow-lg flex flex-col">
          <select
            value={barangayName}
            onChange={handleSelect}
            className="sn-select mr-auto"
            disabled={polygon.length > 0}
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

          {polygon.length > 2 && (
            <AddFlood
              barangay={barangayName}
              polygon={polygon}
              handleCancel={handleCancel}
            />
          )}
        </div>
      )}

      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 flex p-3 px-4 rounded-xl gap-3 bg-white shadow dark:bg-neutral-900 dark:shadow-lg">
        {addFlood ? (
          <button
            onClick={handleCancel}
            className="btn-outline dark:text-white text-neutral hover:bg-neutral btn btn-sm"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setAddFlood(true)}
            className="btn-primary text-white btn btn-sm tooltip tooltip-bottom"
            data-tip="Return to Paluan"
          >
            Add Flood
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
          options={{
            fullscreenControl: false,
            mapTypeControl: true, // Set to true to enable map type control
            mapTypeControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT,
              // style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            },
          }}
        >
          {boundary && (
            <Polyline
              path={boundary}
              options={{
                strokeColor: "#FF0000",
              }}
            />
          )}

          {polygon.length > 0 && (
            <Polygon
              path={polygon.map((point) => ({
                lat: point.lat(),
                lng: point.lng(),
              }))}
              options={{
                strokeColor: "#0000FF",
                fillColor: "#0000FF",
                fillOpacity: 0.4,
              }}
            />
          )}
        </GoogleMap>
      )}
    </div>
  );
};

export default AddFloodMap;
