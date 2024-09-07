import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

interface AddDataProps {
  setAddData: React.Dispatch<React.SetStateAction<boolean>>;
  marker: google.maps.LatLng | undefined;
  barangay: string;
}

const AddData: React.FC<AddDataProps> = ({ setAddData, marker,barangay }) => {
  const [houseNo, setHouseNo] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [headName, setHeadName] = useState("");
  const [headAge, setHeadAge] = useState<number | "">("");
  const [headPwd, setHeadPwd] = useState(false);
  const [headContact, setHeadContact] = useState<string | undefined>("");
  const [headIndigenous, setHeadIndigenous] = useState(false);
  const [headGender, setHeadGender] = useState("Male");
  const [houseStruc, setHouseStruc] = useState("");
  const [members, setMembers] = useState<
    { name: string; age: number | ""; pwd: boolean; contact?: string; indigenous: boolean; gender: string }[]
  >([]);

  useEffect(() => {
    if (marker) console.log("Marker position:", { lat: marker.lat(), lng: marker.lng() });
  }, [marker]);

  const addMember = () => setMembers([...members, { name: "", age: "", pwd: false, indigenous: false, gender: "Male" }]);

  const handleMemberChange = (index: number, field: string, value: any) =>
    setMembers(members.map((m, i) => (i === index ? { ...m, [field]: value } : m)));

  const deleteMember = (index: number) => setMembers(members.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setLoading(true);

    const requiredFields = [
      { field: houseNo, msg: "Please enter a House Number." },
      { field: houseStruc, msg: "Please select a House Structure." },
      { field: headName, msg: "Please enter the Head of Household Name." },
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

    const householdData = {
      position: { lat: marker?.lat(), lng: marker?.lng() },
      date: new Date().toISOString(),
      barangay,
      houseNo,
      head: headName,
      memberTotal: members.length + 1,
      headInfo: { name: headName, age: headAge, pwd: headPwd, contact: headContact || "undefined", indigenous: headIndigenous, gender: headGender },
      houseStruc,
      members,
    };

    try {
      const docRef = await addDoc(collection(db, "households"), householdData);
      console.log("Document written with ID: ", docRef.id);
      setAddData(false);
    } catch (e) {
      console.error("Error adding document: ", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-900 bg-opacity-80 py-6 flex items-center justify-center z-50">
      <div className="bg-[#f0f6f9] dark:bg-neutral-800 rounded-xl shadow-sm p-4 w-[70rem]">
        <div className="flex justify-between mb-4">
          <span className="font-bold text-lg">Add Household Data</span>
          <button onClick={() => setAddData(false)} className="btn-primary btn btn-sm rounded-md dark:bg-neutral-700">
            Cancel
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {/* Main info */}
          <div className="flex gap-3">
            <input type="number" placeholder="House No" value={houseNo} onChange={(e) => setHouseNo(parseInt(e.target.value) || "")} className="input input-bordered" />
            <select value={houseStruc} onChange={(e) => setHouseStruc(e.target.value)} className="select select-bordered">
              <option value="">House Structure</option>
              <option value="concrete">Concrete</option>
              <option value="cement">Cement</option>
              <option value="mix">Mix</option>
            </select>
          </div>
          {/* Household leader */}
          <span className="font-bold">Household Leader</span>
          <div className="flex gap-3">
            <input type="text" placeholder="Head of Household Name" value={headName} onChange={(e) => setHeadName(e.target.value)} className="input input-bordered" />
            <input type="number" placeholder="Age" value={headAge} onChange={(e) => setHeadAge(parseInt(e.target.value) || "")} className="input input-bordered" />
            <select value={headGender} onChange={(e) => setHeadGender(e.target.value)} className="select select-bordered">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input type="number" placeholder="Contact (Optional)" value={headContact} onChange={(e) => setHeadContact(e.target.value)} className="input input-bordered" />
            <label className="flex items-center">
              <input type="checkbox" checked={headPwd} onChange={(e) => setHeadPwd(e.target.checked)} className="checkbox" />
              <span className="ml-2">PWD</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={headIndigenous} onChange={(e) => setHeadIndigenous(e.target.checked)} className="checkbox" />
              <span className="ml-2">Indigenous</span>
            </label>
          </div>
          {/* Members */}
          <div className="flex justify-between items-center">
            <span className="font-bold">Members</span>
            <button onClick={addMember} className="btn btn-primary btn-sm">Add Member</button>
          </div>
          {members.map((member, index) => (
            <div key={index} className="flex gap-3 mt-3">
              <input type="text" placeholder={`Member ${index + 1} Name`} value={member.name} onChange={(e) => handleMemberChange(index, "name", e.target.value)} className="input input-bordered" />
              <input type="number" placeholder="Age" value={member.age} onChange={(e) => handleMemberChange(index, "age", parseInt(e.target.value))} className="input input-bordered" />
              <select value={member.gender} onChange={(e) => handleMemberChange(index, "gender", e.target.value)} className="select select-bordered">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input type="number" placeholder="Contact (Optional)" value={member.contact} onChange={(e) => handleMemberChange(index, "contact", e.target.value)} className="input input-bordered" />
              <label className="flex items-center">
                <input type="checkbox" checked={member.pwd} onChange={(e) => handleMemberChange(index, "pwd", e.target.checked)} className="checkbox" />
                <span className="ml-2">PWD</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={member.indigenous} onChange={(e) => handleMemberChange(index, "indigenous", e.target.checked)} className="checkbox" />
                <span className="ml-2">Indigenous</span>
              </label>
              <button onClick={() => deleteMember(index)} className="btn btn-error btn-sm">Remove</button>
            </div>
          ))}
          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} className={`btn btn-primary mt-6 ${loading ? "loading" : ""}`}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default AddData;
