import React, { useEffect, useState } from "react";
import { db } from "@/firebase"; // Ensure you have configured Firebase and Firestore
import { collection, addDoc } from "firebase/firestore";

interface AddDataProps {
  setAddData: React.Dispatch<React.SetStateAction<boolean>>;
  marker: google.maps.LatLng | undefined;
}

const AddData: React.FC<AddDataProps> = ({ setAddData, marker }) => {
  const [barangay, setBarangay] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [headName, setHeadName] = useState("");
  const [headAge, setHeadAge] = useState<number | "">("");
  const [headPwd, setHeadPwd] = useState(false);
  const [headContact, setHeadContact] = useState("");
  const [headIndigenous, setHeadIndigenous] = useState(false);
  const [headGender, setHeadGender] = useState("Male");
  const [houseStruc, setHouseStruc] = useState("");
  const [members, setMembers] = useState<
    { name: string; age: number | ""; pwd: boolean; contact?: string; indigenous: boolean; gender: string }[]
  >([]);

  useEffect(() => {
    if (marker) {
      console.log("Marker position:", {
        lat: marker.lat(),
        lng: marker.lng(),
      });
    }
  }, [marker]);

  const addMember = () => {
    setMembers([...members, { name: "", age: "", pwd: false, indigenous: false, gender: "Male" }]);
  };

  const handleMemberChange = (index: number, field: string, value: any) => {
    const newMembers = [...members];
    (newMembers[index] as any)[field] = value;
    setMembers(newMembers);
  };

  const handleSubmit = async () => {
    if (marker) {
      const householdData = {
        position: { lat: marker.lat(), lng: marker.lng() },
        date: new Date().toISOString(),
        barangay,
        houseNo,
        head: {
          name: headName,
          age: headAge,
          pwd: headPwd,
          contact: headContact || undefined,
          indigenous: headIndigenous,
          gender: headGender,
        },
        houseStruc,
        member: members,
      };

      try {
        const docRef = await addDoc(collection(db, "households"), householdData);
        console.log("Document written with ID: ", docRef.id);
        setAddData(false); // Close the form after submission
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  };

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 w-full h-full bg-zinc-800 bg-opacity-50 py-6 flex p-20 flex-col justify-center items-center sm:py-12 z-50 text-zinc-700">
      <div className="flex flex-col bg-white rounded-xl shadow-sm w-full h-full p-4">
        <div className="flex justify-between">
          <span className="font-bold ">Add Household Data</span>
          <button
            onClick={() => setAddData(false)}
            className="btn-primary btn btn-sm"
          >
            Cancel
          </button>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <input
            type="text"
            placeholder="Barangay"
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            className="input input-bordered"
          />
          <input
            type="text"
            placeholder="House No"
            value={houseNo}
            onChange={(e) => setHouseNo(e.target.value)}
            className="input input-bordered"
          />
          <input
            type="text"
            placeholder="Head of Household Name"
            value={headName}
            onChange={(e) => setHeadName(e.target.value)}
            className="input input-bordered"
          />
          <input
            type="number"
            placeholder="Head of Household Age"
            value={headAge}
            onChange={(e) => setHeadAge(parseInt(e.target.value) || "")}
            className="input input-bordered"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={headPwd}
              onChange={(e) => setHeadPwd(e.target.checked)}
            />
            Person with Disability (PWD)
          </label>
          <input
            type="text"
            placeholder="Contact (Optional)"
            value={headContact}
            onChange={(e) => setHeadContact(e.target.value)}
            className="input input-bordered"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={headIndigenous}
              onChange={(e) => setHeadIndigenous(e.target.checked)}
            />
            Indigenous
          </label>
          <select
            value={headGender}
            onChange={(e) => setHeadGender(e.target.value)}
            className="select select-bordered"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            placeholder="House Structure"
            value={houseStruc}
            onChange={(e) => setHouseStruc(e.target.value)}
            className="input input-bordered"
          />

          {/* Members Section */}
          <div className="flex flex-col gap-2">
            <span className="font-bold">Household Members</span>
            {members.map((member, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                  className="input input-bordered"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={member.age}
                  onChange={(e) => handleMemberChange(index, "age", parseInt(e.target.value) || "")}
                  className="input input-bordered"
                />
                <select
                  value={member.gender}
                  onChange={(e) => handleMemberChange(index, "gender", e.target.value)}
                  className="select select-bordered"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={member.pwd}
                    onChange={(e) => handleMemberChange(index, "pwd", e.target.checked)}
                  />
                  PWD
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={member.indigenous}
                    onChange={(e) => handleMemberChange(index, "indigenous", e.target.checked)}
                  />
                  Indigenous
                </label>
                <input
                  type="text"
                  placeholder="Contact (Optional)"
                  value={member.contact || ""}
                  onChange={(e) => handleMemberChange(index, "contact", e.target.value)}
                  className="input input-bordered"
                />
              </div>
            ))}
            <button onClick={addMember} className="btn btn-sm btn-secondary">
              Add Member
            </button>
          </div>

          <button onClick={handleSubmit} className="btn btn-primary mt-4">
            Save Household Data
          </button>
        </div>

        <div className=" m-auto mb-0 text-xs text-zinc-500">
          Add data at location:
          {marker
            ? ` Latitude: ${marker.lat()}, Longitude: ${marker.lng()}`
            : "No location selected"}
        </div>
      </div>
    </div>
  );
};

export default AddData;
