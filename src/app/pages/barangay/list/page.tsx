"use client";
import { Authenticator } from "@/components/Authenthicator";
import { Layout } from "@/components/Layout";
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import Link from "next/link";

interface Barangay {
  id: string;
  name: string;
}

const BoundaryList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchBarangays = async () => {
      const barangayCollection = collection(db, "barangay");
      const barangaySnapshot = await getDocs(barangayCollection);
      const barangayList = barangaySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Barangay[];
      setBarangays(barangayList);
      setIsLoading(false);
    };

    fetchBarangays();
  }, []);

  const handleEdit = async (id: string) => {
    if (!newName.trim()) return;
    setIsSaving(true);

    const barangayDoc = doc(db, "barangay", id);
    await updateDoc(barangayDoc, { name: newName });
    setBarangays((prev) =>
      prev.map((barangay) =>
        barangay.id === id ? { ...barangay, name: newName } : barangay
      )
    );
    setEditId(null);
    setNewName("");
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this barangay?")) {
      return;
    }

    setIsDeleting(id);

    const barangayDoc = doc(db, "barangay", id);
    await deleteDoc(barangayDoc);
    setBarangays((prev) => prev.filter((barangay) => barangay.id !== id));

    setIsDeleting(null);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setNewName("");
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Layout>
      <Authenticator />
      <div className="flex flex-1 h-screen">
        <div className="p-2 md:p-8 border border-neutral-200 dark:border-neutral-700 bg-zinc-100 dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
          <div className="absolute top-4 right-8 z-10 flex p-3 px-4 rounded-xl gap-3 bg-white shadow dark:bg-neutral-800 dark:shadow-lg dark:border dark:border-opacity-40 dark:border-zinc-600">
            <Link
              href={"/pages/barangay"}
              className="bg-primary text-white p-2 px-4 rounded tooltip tooltip-bottom flex gap-2 items-center text-xs btn-sm font-semibold dark:bg-primary-dark"
            >
              Back
            </Link>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-opacity-50 dark:bg-zinc-800 border dark:border-zinc-700 bg-opacity-50 mx-auto min-w-80">
            <table className="table-auto w-full">
              <thead>
                <tr className="text-sm text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700 text-left p-2 font-semibold">
                  <th className="p-2 text-left">Barangay</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {barangays.map((barangay) => (
                  <tr
                    key={barangay.id}
                    className="text-xs text-neutral-600 dark:text-neutral-300"
                  >
                    <td className="p-2">
                      {editId === barangay.id ? (
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-zinc-800 dark:bg-opacity-50 rounded-md p-2 text-xs text-zinc-600 dark:text-zinc-300 flex justify-start"
                        />
                      ) : (
                        barangay.name
                      )}
                    </td>
                    <td className="p-2 flex gap-4 justify-end items-center">
                      {editId === barangay.id ? (
                        <div className="flex justify-center items-center gap-2 my-auto">
                          <button
                            onClick={handleCancelEdit}
                            className="dark:text-white btn text-zinc-500 hover:bg-black btn-xs btn-outline rounded-sm"
                            disabled={isSaving}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEdit(barangay.id)}
                            className="text-white btn btn-xs btn-primary rounded-sm"
                            disabled={isSaving}
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center gap-2 my-auto">
                          <button
                            onClick={() => {
                              setEditId(barangay.id);
                              setNewName(barangay.name);
                            }}
                            className="dark:text-white btn text-zinc-500 hover:bg-black btn-xs btn-outline rounded-sm"
                            disabled={isSaving || isDeleting === barangay.id}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(barangay.id)}
                            className="text-white btn btn-xs btn-error rounded-sm"
                            disabled={isSaving || isDeleting === barangay.id}
                          >
                            {isDeleting === barangay.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BoundaryList;
