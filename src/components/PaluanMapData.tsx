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
import { db } from "@/firebase";
import { query, collection, where, onSnapshot } from "firebase/firestore";
import ViewEditHouse from "@/app/pages/add-flood/ViewEditHouse";

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
  const [viewHouse, setViewHouse] = useState<string>("");
  const [barangayName, setBarangayName] = useState<string>("");
  const [households, setHouseholds] = useState<any[]>([]); // Store fetched household data
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
    if (house) {
      const fetchHouseholdData = async () => {
        try {
          const ref = collection(db, "households");
          const q =
            barangayName === ""
              ? query(ref)
              : query(ref, where("barangay", "==", barangayName));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedHouseholds = querySnapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
            setHouseholds(fetchedHouseholds); // Set the fetched household data
          });
          // Clean up the listener on unmount
          return () => unsubscribe();
        } catch (error) {
          console.error("Error fetching household data:", error);
        }
      };
      fetchHouseholdData();
    }
  }, [barangayName, house]);

  if (!isLoaded) return <Loading />;

  return (
    <div className="relative">
      {viewHouse && (
        <ViewEditHouse id={viewHouse} setViewHouse={setViewHouse} />
      )}
      <div className="flex gap-2 items-center absolute left-2 top-2 z-10 bg-white dark:bg-zinc-800 rounded-lg shadow-sm w-auto p-4 text-sm flex-col text-zinc-700 dark:text-zinc-200">
        <div className="flex gap-4 justify-start mr-auto ml-0">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={house}
              onChange={(e) => setHouse(e.target.checked)}
              className="checkbox checkbox-sm checkbox-secondary"
            />
            <span className="ml-2 text-sm font-semibold">Household</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-secondary"
              // Flood checkbox remains for later use
            />
            <span className="ml-2 text-sm font-semibold">Flood</span>
          </label>
        </div>
        <div className="flex gap-2">
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
        {/* Draw the barangay boundary */}
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

        {/* Display household markers if "house" is checked */}
        {house &&
          households.length > 0 &&
          households.map((household, index) => (
            <Marker
              key={index}
              position={{
                lat: household.position.lat,
                lng: household.position.lng,
              }}
              onClick={() => setViewHouse(household.id)} // This sets the household ID to view
              title={`house no: ${household.houseNo.toString()}\nhead name: ${
                household.head
              }\nmember: ${household.memberTotal}`}
            />
          ))}
      </GoogleMap>
    </div>
  );
};

export default PaluanMapData;
