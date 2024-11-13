"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { logFloodAction } from "@/utils/logging";

interface EditFloodDataProps {
  id: string;
  currentData: any;
  onCancel: () => void;
  onSave: () => void;
}

const EditFloodData: React.FC<EditFloodDataProps> = ({
  id,
  currentData,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState(currentData);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Update the formData
    setFormData({ ...formData, [name]: value });

    // Automatically update severity based on water level changes
    if (name === "waterLevel") {
      const waterLevel = parseFloat(value);
      let severity = "";
      
      if (waterLevel <= 0.5) {
        severity = "low";
      } else if (waterLevel <= 1.5) {
        severity = "moderate";
      } else {
        severity = "high";
      }

      // Set the calculated severity in the formData
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        severity,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, "floods", id);
      await updateDoc(docRef, formData);
      await logFloodAction('update', formData.barangay);
      onSave(); // Call onSave to refresh the data and close the edit form
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-1/2 mx-auto">
      <input
        type="date"
        name="date"
        value={formData.date || ''}
        onChange={handleChange}
        className="border text-zinc-600 dark:text-zinc-300 dark:bg-zinc-800 dark:bg-opacity-50 border-neutral-200 dark:border-neutral-700 rounded-md p-2 text-sm"
      />

      <input
        type="number"
        name="waterLevel"
        value={formData.waterLevel || ''}
        onChange={handleChange}
        className="border text-zinc-600 dark:text-zinc-300 dark:bg-zinc-800 dark:bg-opacity-50 border-neutral-200 dark:border-neutral-700 rounded-md p-2 text-sm"
        placeholder="Water Level (m)"
      />

      <select
        name="severity"
        value={formData.severity || ''}
        onChange={handleChange}
        className="border text-zinc-600 dark:text-zinc-300 dark:bg-zinc-800 dark:bg-opacity-50 border-neutral-200 dark:border-neutral-700 rounded-md p-2 text-sm"
      >
        <option value="">Select Severity</option>
        <option value="Low">Low</option>
        <option value="Moderate">Moderate</option>
        <option value="High">High</option>
      </select>
      
      <input
        type="number"
        name="rainfallAmount"
        value={formData.rainfallAmount || ''}
        onChange={handleChange}
        className="border text-zinc-600 dark:text-zinc-300 dark:bg-zinc-800 dark:bg-opacity-50 border-neutral-200 dark:border-neutral-700 rounded-md p-2 text-sm"
        placeholder="Rainfall Amount (mm)"
      />
      
      <div className="flex gap-4 mr-0 ml-auto">
        <button
          type="button"
          className="btn btn-outline rounded-sm dark:text-white text-zinc-600 hover:bg-black"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`btn rounded-sm text-white px-5 ${loading ? "btn-disabled" : "btn-primary"}`}
          disabled={loading}
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default EditFloodData;
