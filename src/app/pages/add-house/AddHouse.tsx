import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

interface AddDataProps {
  handleCancel: () => void;
  marker: google.maps.LatLng | undefined;
  barangay: string;
}

const AddHouse: React.FC<AddDataProps> = ({
  handleCancel,
  marker,
  barangay,
}) => {
  const [houseNo, setHouseNo] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [headName, setHeadName] = useState("");
  const [headAge, setHeadAge] = useState<number | "">();
  const [headPwd, setHeadPwd] = useState(false);
  const [headContact, setHeadContact] = useState<string | undefined>("");
  const [headIndigenous, setHeadIndigenous] = useState(false);
  const [headGender, setHeadGender] = useState("Male");
  const [headPregnant, setHeadPregnant] = useState(false); // Added headPregnant state
  const [houseStruc, setHouseStruc] = useState("");
  const [members, setMembers] = useState<
    {
      name: string;
      age: number | "";
      pwd: boolean;
      contact?: string;
      indigenous: boolean;
      pregnant: boolean;
      gender: string;
    }[]
  >([]);

  useEffect(() => {
    if (marker)
      console.log("Marker position:", { lat: marker.lat(), lng: marker.lng() });
  }, [marker]);

  const addMember = () =>
    setMembers([
      ...members,
      {
        name: "",
        age: 0,
        pwd: false,
        indigenous: false,
        pregnant: false,
        gender: "Male",
      },
    ]);

  const handleMemberChange = (index: number, field: string, value: any) => {
    setMembers((prevMembers) =>
      prevMembers.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const deleteMember = (index: number) =>
    setMembers(members.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setLoading(true);

    const requiredFields = [
      { field: houseNo, msg: "Please enter a House Number." },
      { field: houseStruc, msg: "Please select a House Structure." },
      { field: headName, msg: "Please enter the Head of Household Name." },
      { field: headContact, msg: "Please enter the Head of Household Contact." },
      { field: headAge, msg: "Please enter the Head of Household Age." },
      { field: headGender, msg: "Please select the Head of Household Gender." },
    ];

    for (const { field, msg } of requiredFields) {
      if (!field) {
        setLoading(false);
        window.alert(msg);
        return;
      }
    }

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const memberRequired = ["name", "age", "gender"];
      for (const key of memberRequired) {
        if (!member[key as keyof typeof member]) {
          setLoading(false);
          window.alert(`Please complete required fields for member ${i + 1}.`);
          return;
        }
      }
    }

    // Initialize the counts
    let femaleCount = 0;
    let pwdCount = 0;
    let indigenousCount = 0;
    let seniorCount = 0;
    let pregnantCount = 0;

    // Count the head of household
    if (headGender === "Female") femaleCount++;
    if (headPwd) pwdCount++;
    if (headIndigenous) indigenousCount++;
    if (parseInt(String(headAge)) >= 60) seniorCount++; 
    if (headPregnant) pregnantCount++; 

    // Count the members
    members.forEach((member) => {
      if (member.gender === "Female") femaleCount++;
      if (member.pwd) pwdCount++;
      if (member.indigenous) indigenousCount++;
      if (parseInt(String(member.age)) >= 60) seniorCount++;
      if (member.pregnant) pregnantCount++; // Add to pregnant count if member is pregnant
    });

    const householdData = {
      position: { lat: marker?.lat(), lng: marker?.lng() },
      date: new Date().toISOString(),
      barangay,
      houseNo,
      head: headName,
      memberTotal: members.length + 1,
      headInfo: {
        name: headName,
        age: headAge,
        pwd: headPwd,
        contact: headContact || "undefined",
        indigenous: headIndigenous,
        pregnant: headPregnant,
        gender: headGender,
      },
      houseStruc,
      femaleCount,
      pwdCount,
      indigenousCount,
      seniorCount, // Include senior count
      pregnantCount, // Include pregnant count
      members,
    };

    try {
      const docRef = await addDoc(collection(db, "households"), householdData);
      console.log("Document written with ID: ", docRef.id);
      handleCancel();
      alert("Household data submitted!");
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Error adding document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f0f6f9] bg-opacity-55 shadow text-zinc-600 dark:text-zinc-200 dark:bg-neutral-800 rounded-xl p-4 w-auto">
      <div className="flex justify-between mb-2">
        <span className="font-bold text-sm">Add Household Data</span>
        <button
          onClick={handleCancel}
          className="btn-outline text-primary dark:text-white btn btn-sm"
        >
          Cancel
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {/* Main info */}
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="House No"
            value={houseNo}
            onChange={(e) => setHouseNo(parseInt(e.target.value) || "")}
            className="sn-input"
          />
          <select
            value={houseStruc}
            onChange={(e) => setHouseStruc(e.target.value)}
            className="sn-select"
          >
            <option value="">House Structure</option>
            <option value="concrete">Concrete</option>
            <option value="light materials">Light Materials</option>
            <option value="mix">Mix</option>
          </select>
        </div>
        {/* Household leader */}
        <span className="font-bold text-sm ">Household Leader</span>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Head of Household Name"
            value={headName}
            onChange={(e) => setHeadName(e.target.value)}
            className="sn-select"
          />
          <input
            type="number"
            placeholder="Age"
            value={headAge}
            onChange={(e) => setHeadAge(parseInt(e.target.value) || 0)}
            className="sn-select"
          />
          <select
            value={headGender}
            onChange={(e) => setHeadGender(e.target.value)}
            className="sn-select"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input
            type="number"
            placeholder="Contact"
            value={headContact}
            onChange={(e) => setHeadContact(e.target.value)}
            className="sn-select"
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={headPwd}
              onChange={(e) => setHeadPwd(e.target.checked)}
              className="checkbox checkbox-xs checkbox-primary"
            />
            <span className="ml-2 text-sm">PWD</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={headIndigenous}
              onChange={(e) => setHeadIndigenous(e.target.checked)}
              className="checkbox checkbox-xs checkbox-primary"
            />
            <span className="ml-2 text-sm">Indigenous</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={headPregnant} // Fixed onChange handler
              onChange={(e) => setHeadPregnant(e.target.checked)}
              className="checkbox checkbox-xs checkbox-primary"
            />
            <span className="ml-2 text-sm">Pregnant</span>
          </label>
        </div>
        {/* Members */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-sm">Members</span>
          <button onClick={addMember} className="btn btn-xs btn-primary">
            Add Member
          </button>
        </div>
        {members.length > 0 &&
          members.map((member, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                placeholder="Member Name"
                value={member.name}
                onChange={(e) =>
                  handleMemberChange(index, "name", e.target.value)
                }
                className="sn-select"
              />
              <input
                type="number"
                placeholder="Age"
                value={member.age}
                onChange={(e) =>
                  handleMemberChange(index, "age", parseInt(e.target.value))
                }
                className="sn-select"
              />
              <select
                value={member.gender}
                onChange={(e) =>
                  handleMemberChange(index, "gender", e.target.value)
                }
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
                className="sn-select"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={member.pwd}
                  onChange={(e) =>
                    handleMemberChange(index, "pwd", e.target.checked)
                  }
                  className="checkbox checkbox-xs checkbox-primary"
                />
                <span className="ml-2 text-sm">PWD</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={member.indigenous}
                  onChange={(e) =>
                    handleMemberChange(index, "indigenous", e.target.checked)
                  }
                  className="checkbox checkbox-xs checkbox-primary"
                />
                <span className="ml-2 text-sm">Indigenous</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={member.pregnant}
                  onChange={(e) =>
                    handleMemberChange(index, "pregnant", e.target.checked)
                  }
                  className="checkbox checkbox-xs checkbox-primary"
                />
                <span className="ml-2 text-sm">Pregnant</span>
              </label>
              <button
                onClick={() => deleteMember(index)}
                className="btn btn-xs btn-error"
              >
                Delete
              </button>
            </div>
          ))}
        <button
          disabled={loading}
          onClick={handleSubmit}
          className={`btn btn-sm btn-primary ${loading ? "loading" : ""}`}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default AddHouse;
