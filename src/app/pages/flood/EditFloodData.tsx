"use client";
import React, { useState } from "react";
import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, "floods", id);
      await updateDoc(docRef, formData);
      onSave(); // Call onSave to refresh the data and close the edit form
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-1/2 mx-auto">
      <select
        name="barangay"
        value={formData.barangay || ''}
        onChange={handleChange}
        data-tip="Barangay"
        className="border border-neutral-200 dark:border-neutral-700 rounded-md p-2"
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
        type="date"
        name="date"
        value={formData.date || ''}
        onChange={handleChange}
        className="border border-neutral-200 dark:border-neutral-700 rounded-md p-2"
      />

      <select
        name="severity"
        value={formData.severity || ''}
        onChange={handleChange}
        className="border border-neutral-200 dark:border-neutral-700 rounded-md p-2"
      >
        <option value="">Select Severity</option>
        <option value="Low">Low</option>
        <option value="Moderate">Moderate</option>
        <option value="High">High</option>
      </select>

      <input
        type="number"
        name="waterLevel"
        value={formData.waterLevel || ''}
        onChange={handleChange}
        className="border border-neutral-200 dark:border-neutral-700 rounded-md p-2"
        placeholder="Water Level (m)"
      />
      <input
        type="number"
        name="rainfallAmount"
        value={formData.rainfallAmount || ''}
        onChange={handleChange}
        className="border border-neutral-200 dark:border-neutral-700 rounded-md p-2"
        placeholder="Rainfall Amount (mm)"
      />
      <input
        type="number"
        name="casualties"
        value={formData.casualties || ''}
        onChange={handleChange}
        className="border border-neutral-200 dark:border-neutral-700 rounded-md p-2"
        placeholder="Casualties"
      />
      <div className="flex gap-4 mr-0 ml-auto">
        <button
          type="button"
          className="btn btn-outline rounded-sm text-white"
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
