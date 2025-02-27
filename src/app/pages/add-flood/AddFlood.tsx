import React, { useState, useEffect } from "react";
import { db } from "@/firebase"; // Ensure you have configured Firebase and Firestore
import { collection, addDoc } from "firebase/firestore";
import { logFloodAction } from "@/utils/logging";

interface AddDataProps {
  polygon: google.maps.LatLng[]; // Now correctly expects an array
  barangay: string;
  handleCancel: () => void;
  onSeverityChange: (severity: string) => void; // New prop for severity change
}

   
const AddFlood: React.FC<AddDataProps> = ({
  barangay,
  polygon,
  handleCancel,
  onSeverityChange, // Destructure the new prop
}) => {
  const [date, setDate] = useState<string>("");
  const [waterLevel, setWaterLevel] = useState<number>();
  const [rainfallAmount, setRainfallAmount] = useState<number>();
  const [casualties, setCasualties] = useState<number | "">("");
  const [cause, setCause] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState<string>("low"); // State for severity

  // Update severity based on water level
  useEffect(() => {
    let newSeverity = "low"; // Default severity
    if (waterLevel) {
      if (waterLevel > 1.5) {
        newSeverity = "high";
      } else if (waterLevel > 0.5) {
        newSeverity = "moderate";
      }
    }
    setSeverity(newSeverity);
    onSeverityChange(newSeverity); // Call the severity change handler immediately
  }, [waterLevel, onSeverityChange]);

  const validateNumberInput = (value: string): boolean => {
    const number = parseFloat(value);
    return !isNaN(number) && number >= 0;
  };
  
  const handleWaterLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateNumberInput(value)) {
      setWaterLevel(parseFloat(value));
    } else {
      setWaterLevel(0);
    }
  };
  
  const handleRainfallAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateNumberInput(value)) {
      setRainfallAmount(parseFloat(value));
    } else {
      setRainfallAmount(0);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!barangay) {
      setLoading(false);
      window.alert("Please select a barangay.");
      return;
    }
    if (!date || !cause || !waterLevel || !rainfallAmount) {
      setLoading(false);
      window.alert("Please fill in all required fields.");
      return;
    }
    if (rainfallAmount <= 0) {
      setLoading(false);
      window.alert("Please enter a valid rainfall amount.");
      return;
    }
    if (waterLevel <= 0) {
      console.log('parseWaterLevel', waterLevel)
      setLoading(false);
      window.alert("Please enter a valid Water Level amount.");
      return;
    }

    if (polygon.length > 2) {
      const polygonCoordinates = polygon.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }));

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
        await logFloodAction("add", barangay);
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

  // Determine background color based on severity
  const getBackgroundColor = () => {
    switch (severity) {
      case "high":
        return "bg-[#7F00FF] text-white"; // Violet for high severity
      case "moderate":
        return "bg-[#FFC0CB] text-black"; // Pink for moderate severity
      default:
        return "bg-[#FFFFFF]"; // White for low severity
    }
  };

  return (
    <div className={`flex flex-col bg-opacity-50 text-zinc-700 dark:bg-zinc-800 rounded-xl shadow w-auto min-w-[30rem] h-auto my-auto p-4`}>
      <div className="flex justify-between">
        <span className="font-bold text-lg dark:text-zinc-100">
          Add Flood Data
        </span>
        <button
          onClick={() => handleCancel()}
          className="btn-outline hover:bg-secondary btn btn-sm rounded-md text-neutral-700 dark:text-white"
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
        <div className="gap-3 grid grid-cols-2">
          <input
            type="number"
            placeholder="Water Level (in meters)"
            value={waterLevel}
            onChange={handleWaterLevelChange}
            className="sn-input w-full"
          />
          {/* Display Severity */}
          <div className={`flex rounded-md ${getBackgroundColor()}`}>
            <p className="font-semibold text-sm m-auto">Severity: {severity}</p>
          </div>
          <input
            type="number"
            placeholder="Rainfall Amount (in mm)"
            value={rainfallAmount}
            onChange={handleRainfallAmountChange}
            className="sn-input w-full"
          />
        </div>

        {/* Impact Data */}
        <div className="flex gap-3">
          <div className="flex gap-3">
            <select
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              className="sn-select w-full"
            >
              <option value="">Select Cause of Flood</option>
              <option value="Super typhoon">Super typhoon</option>
              <option value="Typhoon">Typhoon</option>
              <option value="Severe tropical storm">Severe tropical storm</option>
              <option value="Tropical storm">Tropical storm</option>
              <option value="Tropical depression">Tropical depression</option>
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
          className={`btn mt-4 btn-primary text-white mx-auto bg-primary${
            loading && "btn-disabled"
          }`}
        >
          {loading ? "Loading..." : "Save Flood Data"}
        </button>
      </div>
    </div>
  );
};

export default AddFlood;