/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";

const ImgSetting: React.FC<{ fileName: string; name: string }> = ({
  fileName,
  name,
}): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loading state for fetch
  const [uploading, setUploading] = useState<boolean>(false); // Loading state for upload

  // Fetch image URL when not editing
  useEffect(() => {
    if (!isEditing) {
      const fetchImageURL = async () => {
        setLoading(true);
        try {
          const storageRef = ref(storage, `settings/${fileName}`);
          const url = await getDownloadURL(storageRef);
          setImageURL(url);
          setPreview(url);
        } catch (error) {
          console.error("Error fetching image URL", error);
          setImageURL(null); // Handle errors or absence of image
        } finally {
          setLoading(false);
        }
      };

      fetchImageURL();
    }
  }, [isEditing, fileName]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (file) {
      setUploading(true);
      try {
        const storageRef = ref(storage, `settings/${fileName}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setImageURL(url);
        setPreview(url); // Clear preview after successful upload
        setIsEditing(false);
        setFile(null); // Clear file state
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-20 w-auto bg-white dark:bg-zinc-800 rounded-lg gap-3 p-3 tooltip tooltip-top text-zinc-600 dark:border-zinc-700"
      data-tip={name}
    >
      {loading ? (
        <p className="font-semibold text-sm text-zinc-600 dark:text-zinc-400">
          loading
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {isEditing ? (
            <div>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mb-4 w-44 h-20 mx-auto object-contain rounded-lg"
                />
              )}

              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="text-xs border none-input dark:text-zinc-300"
                disabled={uploading}
              />
              <span className="flex gap-2 justify-center items-center mb-0 mt-auto ">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setPreview(null);
                    setFile(null);
                  }}
                  className="btn-outline btn-xs text-neutral btn rounded-none mt-3 hover:bg-error hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="btn-outline btn-xs text-primary btn rounded-none mt-3 hover:bg-primary hover:text-white"
                  disabled={uploading}
                >
                  {uploading ? "loading.." : "Update"}
                </button>
              </span>
            </div>
          ) : (
            <div className="flex flex-row gap-3">
              {loading ? (
                <div className="h-auto flex items-center justify-center dark:text-zinc-300">
                  <span>Loading...</span>
                </div>
              ) : imageURL ? (
                <img
                  src={imageURL}
                  alt="Uploaded"
                  className="w-44 h-20 object-contain"
                />
              ) : (
                <span className="text-xs w-full h-auto font-semibold border rounded p-2 flex items-center justify-center dark:border-zinc-700 dark:text-zinc-300">
                  <p className="text-center">No {name} uploaded</p>
                </span>
              )}
              <span className="flex gap-2 justify-center items-center">
                <button
                  onClick={toggleEdit}
                  className="btn-outline mx-auto text-primary btn btn-xs rounded-none hover:bg-primary hover:text-white"
                >
                  Edit
                </button>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImgSetting;
