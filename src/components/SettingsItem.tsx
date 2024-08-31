"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/firebase"; // Adjust the path to your Firebase config
import { doc, getDoc, setDoc } from "firebase/firestore";
import { IconPencil } from "@tabler/icons-react";

const SettingsItem = ({ name, title }: { name: string; title: string }) => {
  const [value, setValue] = useState<string>("");
  const [inputVisible, setInputVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fetch the data on initial load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "settings", name);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setValue(docSnap.data().value);
        } else {
          console.log("No such document!");
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name]); // Added name to dependency array

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError(`${title} cannot be empty.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const docRef = doc(db, "settings", name);
      await setDoc(docRef, { value }, { merge: true }); // Fixed: Use 'value' instead of 'name'
      setInputVisible(false); // Hide input after successful update
      console.log("Document successfully written!");
    } catch (err) {
      console.error("Error writing document:", err);
      setError(`Failed to update ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 min-w-60">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">{title}</h2>
        {!inputVisible && !loading && (
          <button
            onClick={() => setInputVisible(true)}
            className="text-white"
          >
            <IconPencil />
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {!inputVisible ? (
            <div className="flex flex-col items-start gap-4">
              <p className="text-sm dark:text-neutral-300">
                {value || `No ${title.toLowerCase()} set`}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center gap-4"
            >
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input input-bordered dark:bg-neutral-800 text-zinc-900 dark:text-white w-full"
                placeholder={`Enter ${title.toLowerCase()}`}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputVisible(false);
                    setError("");
                  }}
                  className="btn btn-outline btn-sm text-white rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-success btn-sm text-white rounded-sm"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
      )}
    </div>
  );
};

export default SettingsItem;
