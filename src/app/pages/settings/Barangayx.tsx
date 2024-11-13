import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface Barangay {
    name: string;
    number: string;
}

const BarangayComponent: React.FC = () => {
    const [barangays, setBarangays] = useState<Barangay[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBarangays = async () => {
            const barangayDoc = await getDoc(doc(db, "settings", "barangays"));
            if (barangayDoc.exists()) {
                setBarangays(barangayDoc.data().barangays || []);
            }
        };
        fetchBarangays();
    }, []);

    const saveBarangays = async () => {
        if (!isFormValid()) {
            setError("Please complete all fields.");
            return;
        }

        setError(null);
        setLoading(true);
        try {
            await setDoc(doc(db, "settings", "barangays"), { barangays });
            setLoading(false);
            setIsEditing(false);
        } catch (err) {
            setError("Failed to save changes. Please try again.");
            setLoading(false);
        }
    };

    const isFormValid = () => {
        return barangays.every(
            (barangay) =>
                barangay.name?.trim() !== "" &&
                barangay.number?.trim() !== ""
        );
    };

    const handleBarangayChange = (
        index: number,
        field: keyof Barangay,
        value: string
    ) => {
        setBarangays((prevBarangays) =>
            prevBarangays.map((b, i) => (i === index ? { ...b, [field]: value } : b))
        );
    };

    const deleteBarangay = (index: number) =>
        setBarangays(barangays.filter((_, i) => i !== index));

    const addBarangay = () =>
        setBarangays([
            ...barangays,
            {
                name: "",
                number: String(barangays.length + 1)
            },
        ]);

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    return (
        <div className="bg-[#f0f6f9] bg-opacity-55 shadow text-zinc-600 dark:text-zinc-200 dark:bg-neutral-800 rounded-xl p-4 h-full">
            <div className="flex justify-between items-center">
                <span className="font-bold mb-2 text-primary dark:text-white text-lg">Barangays</span>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <div className="flex flex-col space-y-3">
                {barangays.length > 0 &&
                    barangays.map((barangay, index) => (
                        <div key={index} className="w-full">
                            {isEditing ? (
                                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                    <input
                                        type="text"
                                        placeholder="Barangay Number"
                                        value={barangay.number}
                                        onChange={(e) => handleBarangayChange(index, "number", e.target.value)}
                                        className="sn-input w-full sm:w-32"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Barangay Name"
                                        value={barangay.name}
                                        onChange={(e) => handleBarangayChange(index, "name", e.target.value)}
                                        className="sn-input w-full sm:w-auto"
                                    />
                                    <button
                                        onClick={() => deleteBarangay(index)}
                                        className="btn btn-sm rounded-md text-white btn-error w-full sm:w-auto"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ) : (
                                <table className="table w-full">
                                    <tbody>
                                        <tr className="border border-neutral-200 dark:border-neutral-700">
                                            <td className="w-32">{barangay.number}</td>
                                            <td>{barangay.name}</td>
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
                        onClick={addBarangay}
                        className="btn btn-sm rounded-none text-primary btn-outline w-full sm:w-auto"
                    >
                        Add Barangay
                    </button>
                    <button
                        onClick={saveBarangays}
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

export default BarangayComponent;