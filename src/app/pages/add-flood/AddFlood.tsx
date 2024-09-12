import React, { useState } from "react";
import { db } from "@/firebase"; // Ensure you have configured Firebase and Firestore
import { collection, addDoc } from "firebase/firestore";
interface AddDataProps {
  polygon: google.maps.LatLng[]; // Now correctly expects an array
  barangay: string;
  handleCancel: () => void;
}

const AddFlood: React.FC<AddDataProps> = ({
  barangay,
  polygon,
  handleCancel,
}) => {
  const [date, setDate] = useState<string>("");

  const [waterLevel, setWaterLevel] = useState<number | "">("");
  const [rainfallAmount, setRainfallAmount] = useState<number | "">("");
  const [casualties, setCasualties] = useState<number | "">("");
  const [cause, setCause] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    if (!barangay || !date || !cause) {
      setLoading(false);
      window.alert("Please fill in all required fields.");
      return;
    }

    if (polygon.length > 2) {
      const polygonCoordinates = polygon.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }));

      let severity = "low";
      if (waterLevel && waterLevel > 0.5 && waterLevel <= 1.5) {
        severity = "moderate";
      } else if (waterLevel && waterLevel > 1.5) {
        severity = "high";
      }
      const floodData = {
        position: polygonCoordinates,
        date,
        barangay,
        severity,
        waterLevel: waterLevel || "undefined",
        rainfallAmount: rainfallAmount || "undefined",
        cause: cause || "undefined",
        casualties: casualties || 0,
      };

      try {
        const docRef = await addDoc(collection(db, "floods"), floodData);
        handleCancel();
        alert("Flood data has been successfully submitted");
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      alert("Flood drawing or Polygon data is missing or empty!");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col bg-[#f0f6f9] bg-opacity-50 text-zinc-700 dark:bg-zinc-800 rounded-xl shadow w-auto min-w-[30rem] h-auto my-auto p-4">
      <div className="flex justify-between">
        <span className="font-bold text-lg dark:text-zinc-100">
          Add Flood Data
        </span>
        <button
          onClick={() => handleCancel()}
          className="btn-primary btn btn-sm rounded-md dark:bg-neutral-700 dark:text-white"
        >
          Cancel
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-4 w-full">
        {/* Basic Information */}
        <div className="flex gap-3">
          <div className="flex flex-col justify-start items-start gap-2 w-full">
            <label
              htmlFor="date"
              className="dark:text-gray-200 text-sm font-bold"
            >
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-tip="Date of the flood"
              className="sn-input"
            />
          </div>
        </div>

        {/* Environmental Data */}
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Water Level (in meters)"
            value={waterLevel}
            onChange={(e) => setWaterLevel(parseFloat(e.target.value) || "")}
            className="sn-input w-full"
          />
          <input
            type="number"
            placeholder="Rainfall Amount (in mm)"
            value={rainfallAmount}
            onChange={(e) =>
              setRainfallAmount(parseFloat(e.target.value) || "")
            }
            className="sn-input w-full"
          />
        </div>

        {/* Impact Data */}
        <div className="flex gap-3">
          {/* <input
            type="number"
            placeholder="Casualties"
            value={casualties}
            onChange={(e) => setCasualties(parseInt(e.target.value) || "")}
            className="sn-input w-full"
          /> */}
          <div className="flex gap-3">
            <select
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              className="sn-select w-full"
            >
              <option value="">Select Cause of Flood</option>
              <option value="Tropical cyclones">
                Tropical cyclones (typhoons)
              </option>
              <option value="Monsoon rains">Monsoon rains</option>
              <option value="River overflow">River overflow</option>
              <option value="Storm surges">Storm surges</option>
              <option value="Dam releases">Dam releases</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`btn mt-4 text-white mx-auto bg-primary dark:bg-neutral-700 dark:text-white ${
            loading ? "btn-disabled" : "btn-primary"
          }`}
        >
          Save Flood Data
        </button>
      </div>
    </div>
  );
};

export default AddFlood;
