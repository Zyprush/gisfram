import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

interface ViewEditDataProps {
  id: string;
  setViewHouse: React.Dispatch<React.SetStateAction<string>>;
}

const ViewEditHouse: React.FC<ViewEditDataProps> = ({ id, setViewHouse }) => {
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

  const addMember = () => {
    const newMember = {
      name: "",
      age: "",
      gender: "Male",
      contact: "",
      pwd: false,
      indigenous: false,
    };

    setData({
      ...data,
      member: [...(data?.member || []), newMember], // Ensure member is an array
    });
  };

  const deleteMember = (index: number) => {
    const newMembers = data.member.filter((_: any, i: number) => i !== index);
    setData({ ...data, member: newMembers });
  };

  const handleSubmit = async () => {
    if (!data.barangay || !data.houseNo || !data.houseStruc) {
      window.alert("Please fill in all required fields for the household.");
      return;
    }
  
    if (!data.headInfo.name || !data.headInfo.age || !data.headInfo.gender) {
      window.alert(
        "Please fill in all required fields for the head of the household."
      );
      return;
    }
  
    if (
      data.member &&
      typeof data.member === "object" &&
      !Array.isArray(data.member)
    ) {
      data.member = [data.member];
    }
  
    for (const mem of data.member || []) {
      if (!mem.name || !mem.age || !mem.gender) {
        window.alert(
          "Please fill in all required fields for each household member."
        );
        return;
      }
    }
  
    // Define counts before conditionally assigning them
    let memberTotal = 0;
    let femaleCount = 0;
    let pwdCount = 0;
    let indigenousCount = 0;
  
    // Calculate counts
    console.log("data.member", data.member);
  
    if (data.member && Array.isArray(data.member)) {
      memberTotal = data.member.length + 1; // Including the head of household
      femaleCount =
        data.member.filter((m: any) => m.gender === "Female").length +
        (data.headInfo.gender === "Female" ? 1 : 0); // Count head if female
      pwdCount =
        data.member.filter((m: any) => m.pwd).length +
        (data.headInfo.pwd ? 1 : 0);
      indigenousCount =
        data.member.filter((m: any) => m.indigenous).length +
        (data.headInfo.indigenous ? 1 : 0);
    } else {
      memberTotal = 1; // Only the head of household is included
      femaleCount = data.headInfo.gender === "Female" ? 1 : 0;
      pwdCount = data.headInfo.pwd ? 1 : 0;
      indigenousCount = data.headInfo.indigenous ? 1 : 0;
    }
  
    setLoading(true);
    try {
      const docRef = doc(db, "households", id);
      // Update the document with the member total and counts
      await updateDoc(docRef, {
        ...data,
        memberTotal,
        femaleCount,
        pwdCount,
        indigenousCount, // Include these fields in the update
      });
  
      setIsEditing(false);
      setViewHouse(""); // Close the modal after submit
      window.alert(`Data updated successfully! Total members: ${memberTotal}`);
    } catch (e) {
      console.error("Error updating document: ", e);
      window.alert("Error updating data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record? This action cannot be undone."
    );
    if (confirmDelete) {
      setLoading(true);
      try {
        const docRef = doc(db, "households", id);
        await deleteDoc(docRef);
        window.alert("Record deleted successfully!");
        setViewHouse(""); // Close the modal after deletion
      } catch (e) {
        console.error("Error deleting document: ", e);
        window.alert("Error deleting data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data found</div>;

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 w-full h-full bg-zinc-900 bg-opacity-80 dark:bg-zinc-800 dark:bg-opacity-80 py-6 flex p-20 flex-col justify-center items-center sm:py-12 z-50 text-zinc-700 dark:text-zinc-300">
      <div className="flex flex-col bg-white dark:bg-zinc-800 rounded-xl shadow-sm w-[70rem] h-full p-4 overflow-y-auto border border-zinc-200 dark:border-neutral-700">
        <div className="flex justify-between gap-4">
          <span className="font-bold text-lg">
            {isEditing ? "Edit" : "View"} Household Data
          </span>
          <div className="flex justify-between gap-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-sm btn-outline hover:bg-black mr-2"
            >
              {isEditing ? "Cancel Edit" : "Edit"}
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-outline btn-sm rounded-md hover:bg-black text-error"
            >
              Delete
            </button>
            <button
              onClick={() => setViewHouse("")}
              className="btn btn-sm btn-primary text-white"
            >
              Close
            </button>
          </div>
        </div>

        {/* Main info */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="House No"
              value={data.houseNo}
              onChange={(e) => handleInputChange("houseNo", e.target.value)}
              disabled={!isEditing}
              className="sn-input"
            />
            <select
              value={data.houseStruc}
              onChange={(e) => handleInputChange("houseStruc", e.target.value)}
              disabled={!isEditing}
              className="sn-select"
            >
              <option value="concrete">Concrete</option>
              <option value="cement">Cement</option>
              <option value="mix">Mix</option>
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
              className="sn-input"
            />
            <input
              type="number"
              placeholder="Age"
              value={data.headInfo.age}
              onChange={(e) =>
                handleHeadInfoChange("age", parseInt(e.target.value) || "")
              }
              disabled={!isEditing}
              className="sn-input"
            />
            <select
              value={data.headInfo.gender}
              onChange={(e) => handleHeadInfoChange("gender", e.target.value)}
              disabled={!isEditing}
              className="sn-select"
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
              className="sn-input"
            />
          </div>

          {/* Member info */}
          <div className="flex justify-between items-center">
            <span className="font-bold">Household Members</span>
            {isEditing && (
              <button
                onClick={addMember}
                className="btn btn-outline btn-sm text-zinc-700 hover:bg-black dark:text-white"
              >
                Add Member
              </button>
            )}
          </div>
          {data.member?.map((member: any, index: number) => (
            <div className="flex gap-3" key={index}>
              <input
                type="text"
                placeholder="Member Name"
                value={member.name}
                onChange={(e) =>
                  handleMemberChange(index, "name", e.target.value)
                }
                disabled={!isEditing}
                className="sn-input"
              />
              <input
                type="number"
                placeholder="Age"
                value={member.age}
                onChange={(e) =>
                  handleMemberChange(index, "age", parseInt(e.target.value))
                }
                disabled={!isEditing}
                className="sn-input"
              />
              <select
                value={member.gender}
                onChange={(e) =>
                  handleMemberChange(index, "gender", e.target.value)
                }
                disabled={!isEditing}
                className="sn-select"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="text"
                placeholder="Contact (Optional)"
                value={member.contact}
                onChange={(e) =>
                  handleMemberChange(index, "contact", e.target.value)
                }
                disabled={!isEditing}
                className="sn-input"
              />
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  checked={member.pwd}
                  onChange={(e) =>
                    handleMemberChange(index, "pwd", e.target.checked)
                  }
                  disabled={!isEditing}
                  className="checkbox checkbox-primary checbox-xs"
                />
                <span className="label-text text-xs ml-1 font-semibold">
                  PWD
                </span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  checked={member.indigenous}
                  onChange={(e) =>
                    handleMemberChange(index, "indigenous", e.target.checked)
                  }
                  disabled={!isEditing}
                  className="checkbox checkbox-primary checbox-xs"
                />
                <span className="label-text text-xs ml-1 font-semibold">
                  Indigenous
                </span>
              </label>
              {isEditing && (
                <button
                  onClick={() => deleteMember(index)}
                  className="btn btn-outline btn-sm rounded-md text-error my-auto"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        {isEditing && (
          <button
            onClick={handleSubmit}
            className="btn btn-primary mt-4 px-5 text-white mx-auto"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewEditHouse;
