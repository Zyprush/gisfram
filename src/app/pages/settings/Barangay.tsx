import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface Barangay {
  name: string;
  number: string;
}

const Barangays: React.FC = () => {
  const fixedBarangays: string[] = [
    "alipaoy",
    "bagongSilangPob",
    "handangTumulongPob",
    "harrison",
    "lumangbayan",
    "mananao",
    "mapaladPob",
    "marikit",
    "pagAsaNgBayanPob",
    "sanJosePob",
    "silahisNgPagAsaPob",
    "tubili"
  ];

  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [editingBarangays, setEditingBarangays] = useState<Barangay[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBarangays = async () => {
      const barangaysDoc = await getDoc(doc(db, "settings", "barangay"));
      if (barangaysDoc.exists()) {
        const existingBarangays = barangaysDoc.data().barangays as Barangay[] || [];
        const updatedBarangays = fixedBarangays.map(name => {
          const existingBarangay = existingBarangays.find(o => o.name === name);
          return existingBarangay || { name, number: "" };
        });
        setBarangays(updatedBarangays);
        setEditingBarangays(updatedBarangays);
      } else {
        const newBarangays = fixedBarangays.map(name => ({ name, number: "" }));
        setBarangays(newBarangays);
        setEditingBarangays(newBarangays);
      }
    };
    fetchBarangays();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveBarangays = async () => {
    if (!isFormValid()) {
      setError("Please complete all fields correctly.");
      return;
    }

    if (window.confirm("Are you sure you want to save the changes?")) {
      setError(null);
      setLoading(true);
      await setDoc(doc(db, "settings", "barangays"), { barangays: editingBarangays });
      setBarangays(editingBarangays);
      setLoading(false);
      setIsEditing(false);
    }
  };

  const isFormValid = (): boolean => {
    return editingBarangays.every(barangay => 
     barangay.name.trim() !== ""
    );
  };


  const handleBarangayChange = (index: number, value: string, field: keyof Omit<Barangay, 'name'>) => {
    setEditingBarangays(prevBarangays =>
      prevBarangays.map((barangay, i) => 
        i === index ? { ...barangay, [field]: value } : barangay
      )
    );
  };

  const toggleEdit = () => {
    if (isEditing) {
      // If we're exiting edit mode, save changes
      setIsEditing(false);
      setBarangays(editingBarangays);
    } else {
      // If we're entering edit mode, reset editingBarangays to current barangays
      setEditingBarangays([...barangays]);
      setIsEditing(true);
    }
    setError(null);
  };

  const cancelEditing = () => {
    if (window.confirm("Are you sure you want to cancel editing? All unsaved changes will be lost.")) {
      setEditingBarangays([...barangays]);
      setIsEditing(false);
      setError(null);
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg border flex flex-col gap-3 text-zinc-600">
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-primary text-xl">Barangays</span>
        <button
          onClick={toggleEdit}
          className="btn btn-sm rounded-none btn-outline text-primary"
        >
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {isEditing ? (
        <div className="flex flex-col gap-3">
          {editingBarangays.map((barangay, index) => (
            <div key={index} className="flex gap-3 items-center">
              <span className="w-40">{barangay.name}</span>
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="number"
                  value={barangay.number}
                  onChange={(e) => handleBarangayChange(index, e.target.value, "number")}
                  className={`p-2 text-sm border-2 rounded-sm w-60 border-primary`}
                />
    
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangay Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {barangays.map((barangay, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{barangay.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{barangay.number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isEditing && (
        <div className="mx-auto flex gap-5 mt-4">
          <button
            onClick={saveBarangays}
            className="btn btn-sm rounded-none btn-primary text-white"
            disabled={!isFormValid() || loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={cancelEditing}
            className="btn btn-sm rounded-none btn-outline text-red-500"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Barangays;