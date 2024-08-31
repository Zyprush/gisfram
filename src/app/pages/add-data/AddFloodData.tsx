import React, { useState } from "react";
import { db } from "@/firebase"; // Ensure you have configured Firebase and Firestore
import { collection, addDoc } from "firebase/firestore";

interface AddDataProps {
  setAddData: React.Dispatch<React.SetStateAction<boolean>>;
  marker: google.maps.LatLng | undefined;
}

const AddFloodData: React.FC<AddDataProps> = ({ setAddData, marker }) => {
  const [barangay, setBarangay] = useState("");
  const [date, setDate] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [waterLevel, setWaterLevel] = useState<number | "">("");
  const [rainfallAmount, setRainfallAmount] = useState<number | "">("");
  const [casualties, setCasualties] = useState<number | "">("");
  const [damages, setDamages] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    if (!barangay || !date || !severity) {
      setLoading(false);
      window.alert("Please fill in all required fields.");
      return;
    }

    if (marker) {
      const floodData = {
        position: { lat: marker.lat(), lng: marker.lng() },
        date,
        barangay,
        severity,
        waterLevel: waterLevel || "undefined",
        rainfallAmount: rainfallAmount || "undefined",
        casualties: casualties || 0,
      };

      try {
        const docRef = await addDoc(collection(db, "floods"), floodData);
        console.log("Document written with ID: ", docRef.id);
        setAddData(false); // Close the form after submission
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 w-full h-full bg-zinc-900 bg-opacity-80 py-6 flex p-20 flex-col justify-center items-center sm:py-12 z-50 text-zinc-700">
      <div className="flex flex-col bg-[#f0f6f9] rounded-xl shadow-sm w-[70rem] h-full p-4">
        <div className="flex justify-between">
          <span className="font-bold text-lg">Add Flood Data</span>
          <button
            onClick={() => setAddData(false)}
            className="btn-primary btn btn-sm rounded-md"
          >
            Cancel
          </button>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {/* Basic Information */}
          <div className="flex flex-row justify-start items-center gap-2">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-tip="Date of the flood"
                className="border-zinc-200 focus:outline-none text-sm p-2 rounded-md bg-white text-zinc-700 tooltip tooltip-top"
              />
            </div>

          <div className="flex gap-3">
            <select
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              data-tip="Barangay"
              className="select border-zinc-200 focus:outline-none tooltip tooltip-top"
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

            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="select border-zinc-200 focus:outline-none"
            >
              <option value="">Select Severity</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Environmental Data */}
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Water Level (in meters)"
              value={waterLevel}
              onChange={(e) => setWaterLevel(parseFloat(e.target.value) || "")}
              className="input input-bordered border-zinc-200 focus:outline-none text-sm"
            />
            <input
              type="number"
              placeholder="Rainfall Amount (in mm)"
              value={rainfallAmount}
              onChange={(e) =>
                setRainfallAmount(parseFloat(e.target.value) || "")
              }
              className="input input-bordered border-zinc-200 focus:outline-none text-sm"
            />
          </div>

          {/* Impact Data */}
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Casualties"
              value={casualties}
              onChange={(e) => setCasualties(parseInt(e.target.value) || "")}
              className="input input-bordered border-zinc-200 focus:outline-none text-sm"
            />
            <input
              type="text"
              placeholder="Damages (description)"
              value={damages}
              onChange={(e) => setDamages(e.target.value)}
              className="input input-bordered border-zinc-200 focus:outline-none text-sm"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`btn mt-4 text-white mx-auto ${
              loading ? "btn-disabled" : "btn-primary"
            } `}
          >
            Save Flood Data
          </button>
        </div>

        <div className="m-auto mb-0 text-xs text-zinc-500">
          Add data at location:
          {marker
            ? ` Latitude: ${marker.lat()}, Longitude: ${marker.lng()}`
            : "No location selected"}
        </div>
      </div>
    </div>
  );
};

export default AddFloodData;
