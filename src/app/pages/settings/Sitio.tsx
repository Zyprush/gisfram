import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface Barangay {
  name: string;
}

interface Sitio {
  name: string;
  barangay: string;
}

const Sitio: React.FC = () => {
  const [sitio, setSitio] = useState<Sitio[]>([]);
  const [barangay, setBarangay] = useState<Barangay[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSitio, setSelectedSitio] = useState<Sitio | null>(null);

  useEffect(() => {
    const fetchSitioAndBarangay = async () => {
      const sitioDoc = await getDoc(doc(db, "settings", "sitio"));
      const barangayDoc = await getDoc(doc(db, "settings", "barangays"));

      if (sitioDoc.exists()) {
        setSitio(sitioDoc.data().sitio || []);
      }
      if (barangayDoc.exists()) {
        setBarangay(barangayDoc.data().barangays || []);
      }
    };
    fetchSitioAndBarangay();
  }, []);

  const saveSitio = async () => {
    if (!isFormValid()) {
      setError("Please complete all fields.");
      return;
    }

    setError(null);
    setLoading(true);
    await setDoc(doc(db, "settings", "sitio"), { sitio });
    setLoading(false);
    setIsEditing(false);
  };

  const isFormValid = () => {
    return sitio.every(
      (sitio) => sitio.name?.trim() !== "" && sitio.barangay?.trim() !== ""
    );
  };

  const handleSitioChange = (
    index: number,
    field: keyof Sitio,
    value: string
  ) => {
    setSitio((prevSitio) =>
      prevSitio.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleRequirementsChange = (requirements: string) => {
    if (!selectedSitio) return;

    const sitioIndex = sitio.findIndex((s) => s.name === selectedSitio.name);
    if (sitioIndex === -1) return;

    setSitio(
      sitio.map((sitio, index) =>
        index === sitioIndex ? { ...sitio, requirements } : sitio
      )
    );
  };

  const deleteSitio = (index: number) =>
    setSitio(sitio.filter((_, i) => i !== index));

  const addSitio = () =>
    setSitio([
      ...sitio,
      {
        name: "",
        barangay: "",
      },
    ]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const openRequirementsModal = (sitio: Sitio) => {
    setSelectedSitio(sitio);
  };

  return (
    <div className="bg-[#f0f6f9] bg-opacity-55 shadow text-zinc-600 dark:text-zinc-200 dark:bg-neutral-800 rounded-xl p-4 h-full">
      <div className="flex justify-between items-center">
        <span className="font-bold mb-2 text-primary dark:text-white text-lg">Sitio</span>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex flex-col space-y-3">
        {sitio.length > 0 &&
          sitio.map((sitio, index) => (
            <div key={index} className="w-full">
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    type="text"
                    placeholder="Sitio Name"
                    value={sitio.name}
                    onChange={(e) => handleSitioChange(index, "name", e.target.value)}
                    className="sn-input w-full sm:w-auto"
                  />
                  <select
                    value={sitio.barangay}
                    onChange={(e) => handleSitioChange(index, "barangay", e.target.value)}
                    className="sn-select w-full sm:w-auto"
                  >
                    <option value="">Select Barangay</option>
                    {barangay?.map((barangay, i) => (
                      <option key={i} value={barangay?.name}>
                        {barangay?.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteSitio(index)}
                    className="btn btn-sm rounded-md text-white btn-error w-full sm:w-auto"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <table className="table w-full">
                  <tbody>
                    <tr className="border border-neutral-200 dark:border-neutral-700">
                      <td className="w-1/2">{sitio.name}</td>
                      <td className="w-1/2">{sitio.barangay}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          ))}
      </div>
      {isEditing && (
        <div className="flex flex-col sm:flex-row gap-3 mt-5 justify-start">
          <button
            onClick={addSitio}
            className="btn btn-sm rounded-none text-primary btn-outline w-full sm:w-auto"
          >
            Add Sitio
          </button>
          <button
            onClick={saveSitio}
            className="btn btn-sm rounded-none btn-primary text-white w-full sm:w-auto"
            disabled={!isFormValid() || loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
      <button
        onClick={toggleEdit}
        className="btn btn-sm mt-5 text-primary btn-outline rounded-sm dark:text-white w-full sm:w-auto"
      >
        {isEditing ? "Cancel" : "Edit"}
      </button>
    </div>
  );
};

export default Sitio;
