import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
} from "firebase/firestore";

interface ViewEditDataProps {
  id: string;
  setViewHouse: React.Dispatch<React.SetStateAction<string>>;
}

interface Sitio {
  name: string;
  barangay: string;
}

const ViewEditHouse: React.FC<ViewEditDataProps> = ({ id, setViewHouse }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // State to hold counts
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [pwdCount, setPwdCount] = useState(0);
  const [indigenousCount, setIndigenousCount] = useState(0);
  const [seniorCount, setSeniorCount] = useState(0);
  const [pregnantCount, setPregnantCount] = useState(0);
  const [sitioList, setSitioList] = useState<Sitio[]>([]);

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

  useEffect(() => {
    if (data) {
      let male = 0;
      let female = 0;
      let pwd = 0;
      let indigenous = 0;
      let senior = 0;
      let pregnant = 0;

      // Include the head of the household in the counts
      if (data.headInfo) {
        if (data.headInfo.gender === "Male") male++;
        if (data.headInfo.gender === "Female") female++;
        if (data.headInfo.pwd) pwd++;
        if (data.headInfo.indigenous) indigenous++;
        if (data.headInfo.age >= 60) senior++;
        if (data.headInfo.pregnant) pregnant++;
      }

      // Count the members
      data.members?.forEach((member: any) => {
        if (member.gender === "Male") male++;
        if (member.gender === "Female") female++;
        if (member.pwd) pwd++;
        if (member.indigenous) indigenous++;
        if (member.age >= 60) senior++;
        if (member.pregnant) pregnant++;
      });

      setMaleCount(male);
      setFemaleCount(female);
      setPwdCount(pwd);
      setIndigenousCount(indigenous);
      setSeniorCount(senior);
      setPregnantCount(pregnant);
    }
  }, [data]);

  const handleInputChange = (field: string, value: any) => {
    setData({ ...data, [field]: value });
  };

  const handleHeadInfoChange = (field: string, value: any) => {
    setData({ ...data, headInfo: { ...data.headInfo, [field]: value } });
  };

  const handleMemberChange = (index: number, field: string, value: any) => {
    const newMembers = [...data.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setData({ ...data, members: newMembers });
  };

  const addMember = () => {
    const newMember = {
      name: "",
      age: "",
      gender: "Male",
      contact: "",
      pwd: false,
      indigenous: false,
      pregnant: false,
    };

    setData({
      ...data,
      members: [...(data?.members || []), newMember], // Ensure member is an array
    });
  };

  const deleteMember = (index: number) => {
    const newMembers = data.members.filter((_: any, i: number) => i !== index);
    setData({ ...data, members: newMembers });
  };

  useEffect(() => {
    if (data && data.barangay) {  // Ensure data is defined and has barangay
      const fetchSitio = async () => {
        const sitioDoc = await getDoc(doc(db, "settings", "sitio"));
  
        if (sitioDoc.exists()) {
          const sitioList = sitioDoc.data().sitio || [];
          const filteredSitioList = sitioList.filter((sitio: Sitio) => sitio.barangay === data.barangay);
          setSitioList(filteredSitioList);
        }
      };
      fetchSitio();
    }
  }, [data?.barangay]);  // Use optional chaining to safely check barangay

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

    console.log("data.members", data.members);
    for (const mem of data.members || []) {
      if (!mem.name || !mem.age || !mem.gender) {
        window.alert(
          "Please fill in all required fields for each household member."
        );
        return;
      }
    }

    setLoading(true);
    try {
      const docRef = doc(db, "households", id);
      await updateDoc(docRef, {
        ...data,
        maleCount,
        femaleCount,
        pwdCount,
        indigenousCount,
        seniorCount,
        pregnantCount,
        memberTotal: data.members.length + 1,
      });

      setIsEditing(false);
      setViewHouse(""); // Close the modal after submit
      window.alert(`Data updated successfully!`);
    } catch (e) {
      console.error("Error updating document: ", e);
      window.alert("Error updating data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to archive this record? This action cannot be undone."
    );
    if (confirmDelete) {
      setLoading(true);
      try {
        const docRef = doc(db, "households", id);
        const docSnap = await getDoc(docRef); // Fetch the document to archive its data

        if (docSnap.exists()) {
          await addDoc(collection(db, "archived", id), {
            ...docSnap.data(),
            archivedAt: new Date(),
          });
        }

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
              onClick={handleArchive}
              className="btn btn-outline btn-sm rounded-md hover:bg-black text-error"
            >
              Archive
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
              type="text"
              placeholder="House No"
              value={data.houseNo}
              onChange={(e) => handleInputChange("houseNo", e.target.value)}
              disabled={!isEditing}
              className="sn-input"
            />
            <select
              value={data?.sitio}
              onChange={(e) => handleInputChange("sitio", e.target.value)}
              className="sn-select"
              disabled={!isEditing}
            >
              <option value="">Select sitio</option>
              {sitioList?.map((sitio, i) => (
                <option key={i} value={sitio?.name}>
                  {sitio?.name}
                </option>
              ))}
            </select>
            <select
              value={data.year}
              onChange={(e) => handleInputChange("year", e.target.value)}
              className="sn-select w-20"
              disabled={!isEditing}
              required
            >
              <option value="">Year</option>
              {Array.from({ length: 20 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
            <select
              value={data.houseStruc}
              onChange={(e) => handleInputChange("houseStruc", e.target.value)}
              disabled={!isEditing}
              className="sn-select"
            >
              <option value="Concrete">Concrete</option>
              <option value="Lightweight Materials">
                Lightweight Materials
              </option>
              <option value="Salvage">Salvage</option>
              <option value="Mix">Mix</option>
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
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                checked={data.headInfo.pregnant}
                onChange={(e) =>
                  handleHeadInfoChange("pregnant", e.target.checked)
                }
                disabled={!isEditing}
                className="checkbox checkbox-primary checbox-xs"
              />
              <span className="label-text text-xs ml-1 font-semibold">
                Pregnant
              </span>
            </label>
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
          {data.members?.map((member: any, index: number) => (
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
                  handleMemberChange(
                    index,
                    "age",
                    parseInt(e.target.value) || ""
                  )
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
                  checked={member.pregnant}
                  onChange={(e) =>
                    handleMemberChange(index, "pregnant", e.target.checked)
                  }
                  disabled={!isEditing}
                  className="checkbox checkbox-primary checbox-xs"
                />
                <span className="label-text text-xs ml-1 font-semibold">
                  Pregnant
                </span>
              </label>
              {isEditing && (
                <button
                  onClick={() => deleteMember(index)}
                  className="btn btn-sm btn-error text-white"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <button
            onClick={handleSubmit}
            className="btn btn-primary mt-4 text-white"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewEditHouse;
