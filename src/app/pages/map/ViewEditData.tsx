import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface ViewEditDataProps {
  id: string;
  setViewEditData: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewEditData: React.FC<ViewEditDataProps> = ({ id, setViewEditData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "households", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          setError("No such document!");
        }
      } catch (e) {
        setError("Error fetching document");
        console.error("Error fetching document: ", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (field: string, value: any) => {
    setData({ ...data, [field]: value });
  };

  const handleHeadInfoChange = (field: string, value: any) => {
    setData({ ...data, headInfo: { ...data.headInfo, [field]: value } });
  };

  const handleMemberChange = (index: number, field: string, value: any) => {
    const newMembers = [...data.member];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setData({ ...data, member: newMembers });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "households", id);
      await updateDoc(docRef, data);
      setIsEditing(false);
      window.alert("Data updated successfully!");
    } catch (e) {
      console.error("Error updating document: ", e);
      window.alert("Error updating data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data found</div>;

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 w-full h-full bg-zinc-900 bg-opacity-80 py-6 flex p-20 flex-col justify-center items-center sm:py-12 z-50 text-zinc-700">
      <div className="flex flex-col bg-[#f0f6f9] rounded-xl shadow-sm w-[70rem] h-full p-4 overflow-y-auto">
        <div className="flex justify-between">
          <span className="font-bold text-lg">
            {isEditing ? "Edit" : "View"} Household Data
          </span>
          <div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-sm btn-secondary mr-2"
            >
              {isEditing ? "Cancel Edit" : "Edit"}
            </button>
            <button
              onClick={() => setViewEditData(false)}
              className="btn btn-sm btn-primary"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {/* Main info */}
          <div className="flex gap-3">
            <select
              value={data.barangay}
              onChange={(e) => handleInputChange("barangay", e.target.value)}
              disabled={!isEditing}
              className="select border-zinc-200 focus:outline-none"
            >
              {/* Add options for barangays */}
            </select>
            <input
              type="text"
              placeholder="House No"
              value={data.houseNo}
              onChange={(e) => handleInputChange("houseNo", e.target.value)}
              disabled={!isEditing}
              className="input input-bordered border-zinc-200 focus:outline-none text-sm"
            />
            <select
              value={data.houseStruc}
              onChange={(e) => handleInputChange("houseStruc", e.target.value)}
              disabled={!isEditing}
              className="select select-bordered border-zinc-200 focus:outline-none"
            >
              {/* Add options for house structures */}
            </select>
          </div>

          {/* Head info */}
          <span className="font-bold">Household Leader</span>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Head of Household Name"
              value={data.headInfo.name}
              onChange={(e) => handleHeadInfoChange("name", e.target.value)}
              disabled={!isEditing}
              className="input input-bordered border-zinc-200 focus:outline-none text-sm"
            />
            <input
              type="number"
              placeholder="Age"
              value={data.headInfo.age}
              onChange={(e) => handleHeadInfoChange("age", parseInt(e.target.value) || "")}
              disabled={!isEditing}
              className="input input-bordered border-zinc-200 focus:outline-none text-sm"
            />
            <select
              value={data.headInfo.gender}
              onChange={(e) => handleHeadInfoChange("gender", e.target.value)}
              disabled={!isEditing}
              className="select select-bordered border-zinc-200 focus:outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="text"
              placeholder="Contact (Optional)"
              value={data.headInfo.contact}
              onChange={(e) => handleHeadInfoChange("contact", e.target.value)}
              disabled={!isEditing}
              className="input input-bordered border-zinc-200 focus:outline-none text-sm"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.headInfo.pwd}
                onChange={(e) => handleHeadInfoChange("pwd", e.target.checked)}
                disabled={!isEditing}
              />
              PWD
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.headInfo.indigenous}
                onChange={(e) => handleHeadInfoChange("indigenous", e.target.checked)}
                disabled={!isEditing}
              />
              Indigenous
            </label>
          </div>

          {/* Members Section */}
          <div className="flex flex-col gap-3">
            <span className="font-bold">Household Members</span>
            {data.member.map((member: any, index: number) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                  disabled={!isEditing}
                  className="input input-bordered border-zinc-200 focus:outline-none text-sm"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={member.age}
                  onChange={(e) => handleMemberChange(index, "age", parseInt(e.target.value) || "")}
                  disabled={!isEditing}
                  className="input input-bordered border-zinc-200 focus:outline-none text-sm"
                />
                <select
                  value={member.gender}
                  onChange={(e) => handleMemberChange(index, "gender", e.target.value)}
                  disabled={!isEditing}
                  className="select select-bordered border-zinc-200 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input
                  type="text"
                  placeholder="Contact (Optional)"
                  value={member.contact || ""}
                  onChange={(e) => handleMemberChange(index, "contact", e.target.value)}
                  disabled={!isEditing}
                  className="input input-bordered border-zinc-200 focus:outline-none text-sm"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={member.pwd}
                    onChange={(e) => handleMemberChange(index, "pwd", e.target.checked)}
                    disabled={!isEditing}
                  />
                  PWD
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={member.indigenous}
                    onChange={(e) => handleMemberChange(index, "indigenous", e.target.checked)}
                    disabled={!isEditing}
                  />
                  Indigenous
                </label>
              </div>
            ))}
          </div>

          {isEditing && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`btn mt-4 text-white mx-auto ${
                loading ? "btn-disabled" : "btn-primary"
              }`}
            >
              Save Changes
            </button>
          )}
        </div>

        <div className="m-auto mb-0 text-xs text-zinc-500">
          Data location: Latitude: {data.position.lat}, Longitude: {data.position.lng}
        </div>
      </div>
    </div>
  );
};

export default ViewEditData;