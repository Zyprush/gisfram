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
    <div className="bg-[#f0f6f9] bg-opacity-55 shadow text-zinc-600 dark:text-zinc-200 dark:bg-neutral-800 rounded-xl p-4 w-auto">
      <div className="flex justify-between items-center">
        <span className="font-bold mb-2 text-primary dark:text-white text-lg">Sitio</span>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {sitio.length > 0 &&
        sitio.map((sitio, index) => (
          <div key={index} className="flex gap-3">
            {isEditing ? (
              <div className="flex gap-3 mt-3 items-center">
                <input
                  type="text"
                  placeholder="Sitio Name"
                  value={sitio.name}
                  onChange={(e) =>
                    handleSitioChange(index, "name", e.target.value)
                  }
                  //   className="p-2 text-sm border-primary border-2 rounded-sm w-80"
                  className="sn-input"
                />
                <select
                  value={sitio.barangay}
                  onChange={(e) =>
                    handleSitioChange(index, "barangay", e.target.value)
                  }
                  className="sn-select"
                  //   className="p-2 text-sm border-primary border-2 rounded-sm"
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
                  className="btn btn-sm rounded-md text-white btn-error"
                >
                  Delete
                </button>
              </div>
            ) : (
              <div className="w-full">
                <table className="table w-full">
                  <tbody>
                    <tr className="border border-neutral-200 dark:border-neutral-700 ">
                      <td className="w-80">{sitio.name}</td>
                      <td>{sitio.barangay}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      {isEditing && (
        <div className="mx-auto flex gap-5 mt-5">
          <button
            onClick={addSitio}
            className="btn btn-sm rounded-none text-primary btn-outline"
          >
            Add Sitio
          </button>
          <button
            onClick={saveSitio}
            className="btn btn-sm rounded-none btn-primary text-white"
            disabled={!isFormValid() || loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
      <button
        onClick={toggleEdit}
        className="btn btn-sm mt-5 text-primary btn-outline rounded-sm dark:text-white"
      >
        {isEditing ? "Cancel" : "Edit"}
      </button>
    </div>
  );
};

export default Sitio;
