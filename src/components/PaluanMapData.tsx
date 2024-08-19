"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Marker,
} from "@react-google-maps/api";
import { paluanCoords } from "@/app/pages/add-data/paluanCoords";
import { IconFocusCentered } from "@tabler/icons-react";
import {
  getDocs,
  collection,
  query,
  where,
  DocumentData,
  Query,
} from "firebase/firestore";
import { db } from "@/firebase"; // Make sure to import your Firestore instance

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const center = { lat: 13.4341, lng: 120.4603 };

const options = {
  mapTypeId: "roadmap" as google.maps.MapTypeId,
  zoom: 11.3,
};

interface HouseholdData {
  id: string;
  position: { lat: number; lng: number };
  barangay: string;
  head: { name: string };
  houseNo: string;
  // Add other fields as needed
}

const PaluanMapData: React.FC = () => {
  const [data, setData] = useState<HouseholdData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [barangayFilter, setBarangayFilter] = useState<string>("");
  const [nameSearch, setNameSearch] = useState<string>("");
  const [houseNumberSearch, setHouseNumberSearch] = useState<string>(""); // Add state for house number filter
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["geometry"],
  });

  const fetchFilteredData = async () => {
    try {
      let householdsQuery: Query<DocumentData> = collection(db, "households");
      // Dynamically build the query based on filters
      const queryConstraints = [];

      if (barangayFilter) {
        queryConstraints.push(where("barangay", "==", barangayFilter));
      }

      if (nameSearch) {
        queryConstraints.push(
          where("head", ">=", nameSearch),
          where("head", "<=", nameSearch + "\uf8ff")
        );
      }

      if (houseNumberSearch) {
        queryConstraints.push(where("houseNo", "==", houseNumberSearch));
      }

      // Apply the constraints to the query
      if (queryConstraints.length > 0) {
        householdsQuery = query(householdsQuery, ...queryConstraints);
      }

      const querySnapshot = await getDocs(householdsQuery);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as HouseholdData[];

      setData(fetchedData);
    } catch (e) {
      console.error("Error fetching documents: ", e);
      setError("Error fetching data");
    }
  };

  useEffect(() => {
    fetchFilteredData(); // Fetch data initially
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoaded) return <div>Loading...</div>;

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const clickedLocation = event.latLng;
    const polygon = new google.maps.Polygon({ paths: paluanCoords });
    if (google.maps.geometry.poly.containsLocation(clickedLocation, polygon)) {
      // setMarker(clickedLocation);
    } else {
      alert("Action outside Paluan is not allowed!");
    }
  };

  const handlePanToCenter = () => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
    }
  };

  const handleFilterSubmit = () => {
    fetchFilteredData();
  };

  return (
    <>
      <div className="text-zinc-700 absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center p-2 gap-3">
      <div className="flex gap-2 items-center bg-white rounded-lg shadow-sm w-auto p-2">

        <select
          value={barangayFilter}
          onChange={(e) => setBarangayFilter(e.target.value)}
          className="select border-zinc-200 focus:outline-none"
        >
          <option value="">Select Barangay</option>
          <option value="Alipaoy">Alipaoy</option>
          <option value="Barangay 5">Barangay 5</option>
          <option value="Barangay 2">Barangay 2</option>
          <option value="Harrison">Harrison</option>
          <option value="Lumangbayan">Lumangbayan</option>
          <option value="Mananao">Mananao</option>
          <option value="Barangay 1">Barangay 1</option>
          <option value="Marikit">Marikit</option>
          <option value="Barangay 4">Barangay 4</option>
          <option value="Barangay 6">Barangay 6</option>
          <option value="Barangay 3">Barangay 3</option>
          <option value="Tubili">Tubili</option>
        </select>
        <input
          type="text"
          placeholder="Head of Family"
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          className="input input-bordered border-zinc-200 focus:outline-none text-sm"
        />
        <input
          type="text"
          placeholder="House Number"
          value={houseNumberSearch}
          onChange={(e) => setHouseNumberSearch(e.target.value)}
          className="input input-bordered border-zinc-200 focus:outline-none text-sm"
        />
        <button
          onClick={handleFilterSubmit}
          className="bg-primary text-white p-1 rounded text-sm py-4 px-6"
        >
          Search
        </button>
      </div>

        <button
          onClick={handlePanToCenter}
          className="bg-primary text-white p-1 rounded tooltip tooltip-bottom"
          data-tip="Return to Paluan"
        >
          <IconFocusCentered />
        </button>
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
        options={{ fullscreenControl: false}}
      >
        <Polyline
          path={paluanCoords}
          options={{ strokeColor: "#FF0000", strokeWeight: 3 }}
        />
        {data.map((household) => (
          <Marker
            key={household.id}
            position={household.position}
            title={`House NO: ${household.houseNo}\nHead: ${household.head}\nBarangay: ${household.barangay}`}
            // onClick={(household)=>{console.log(household.id)}}
          />
        ))}
      </GoogleMap>

      {error && <div>Error: {error}</div>}
    </>
  );
};

export default PaluanMapData;
