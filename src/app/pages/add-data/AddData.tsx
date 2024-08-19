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
  const [loading, setLoading] = useState(false);
  const [headName, setHeadName] = useState("");
  const [headAge, setHeadAge] = useState<number | "">("");
  const [headPwd, setHeadPwd] = useState(false);
  const [headContact, setHeadContact] = useState<string | undefined>("");
  const [headIndigenous, setHeadIndigenous] = useState(false);
  const [headGender, setHeadGender] = useState("Male");
  const [houseStruc, setHouseStruc] = useState("");
  const [members, setMembers] = useState<
    {
      name: string;
      age: number | "";
      pwd: boolean;
      contact?: string;
      indigenous: boolean;
      gender: string;
    }[]
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
    setMembers([
      ...members,
      { name: "", age: "", pwd: false, indigenous: false, gender: "Male" },
    ]);
  };

  const handleMemberChange = (index: number, field: string, value: any) => {
    const newMembers = [...members];
    (newMembers[index] as any)[field] = value;
    setMembers(newMembers);
  };

  const deleteMember = (index: number) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!barangay) {
      setLoading(false);
      window.alert("Please select a Barangay.");
      return;
    }

    if (!houseNo) {
      setLoading(false);
      window.alert("Please enter a House Number.");
      return;
    }

    if (!houseStruc) {
      setLoading(false);
      window.alert("Please select a House Structure.");
      return;
    }

    if (!headName) {
      setLoading(false);
      window.alert("Please enter the Head of Household Name.");
      return;
    }

    if (!headAge) {
      setLoading(false);
      window.alert("Please enter the Head of Household Age.");
      return;
    }

    if (!headGender) {
      setLoading(false);
      window.alert("Please select the Head of Household Gender.");
      return;
    }

    // Check if any member has incomplete required fields
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      if (!member.name) {
        setLoading(false);
        window.alert(`Please enter the name for member ${i + 1}.`);
        return;
      }
      if (!member.age) {
        setLoading(false);
        window.alert(`Please enter the age for member ${i + 1}.`);
        return;
      }
      if (!member.gender) {
        setLoading(false);
        window.alert(`Please select the gender for member ${i + 1}.`);
        return;
      }
    }

    if (marker) {
      const householdData = {
        position: { lat: marker.lat(), lng: marker.lng() },
        date: new Date().toISOString(),
        barangay,
        houseNo,
        head: headName,
        headInfo: {
          name: headName,
          age: headAge,
          pwd: headPwd,
          contact: headContact || "undefined",
          indigenous: headIndigenous,
          gender: headGender,
        },
        houseStruc,
        member: members,
      };

      try {
        const docRef = await addDoc(
          collection(db, "households"),
          householdData
        );
        console.log("Document written with ID: ", docRef.id);
        setAddData(false); // Close the form after submission
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 w-full h-full bg-zinc-900 bg-opacity-80 py-6 flex p-20 flex-col justify-center items-center sm:py-12 z-50 text-zinc-700">
      <div className="flex flex-col bg-[#f0f6f9] rounded-xl shadow-sm w-[70rem] h-full p-4">
        <div className="flex justify-between">
          <span className="font-bold text-lg">Add Household Data</span>
          <button
            onClick={() => setAddData(false)}
            className="btn-primary btn btn-sm rounded-md"
          >
            Cancel
          </button>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {/* main info */}
          <div className="flex gap-3 ">
            <select
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              className="select border-zinc-200 focus:outline-none"
            >
              <option value="">Select Barangay</option>
              <option value="Alipaoy">Alipaoy</option>
              <option value="Barangay 5">Barangay 5</option>
              <option value="Barangay 2">Barangay 2</option>
              <option value="Harrison">Harrison</option>
              <option value="Lumangbayan">Lumangbayan</option>
              <option value="Mananao">Mananao</option>
              <option value="Barangay 1">Barangay 1</option>
              <option value="Marikit">Marikit</option>
              <option value="Barangay 4">Barangay 4</option>
              <option value="Barangay 6">Barangay 6</option>
              <option value="Barangay 3">Barangay 3</option>
              <option value="Tubili">Tubili</option>
            </select>
            <input
              type="text"
              placeholder="House No"
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              className="input input-bordered border-zinc-200 focus:outline-none text-sm"
            />

            <select
              value={houseStruc}
              onChange={(e) => setHouseStruc(e.target.value)}
              className="select select-bordered border-zinc-200 focus:outline-none"
            >
              <option value="">House Structure</option>
              <option value="concrete">Concrete</option>
              <option value="cement">Cement</option>
              <option value="mix">Mix</option>
            </select>
          </div>

          {/* head */}
          <span className="font-bold">Household Leader</span>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Head of Household Name"
              value={headName}
              onChange={(e) => setHeadName(e.target.value)}
              className="input input-bordered border-zinc-200 focus:outline-none text-sm"
            />
            <input
              type="number"
              placeholder="Age"
              value={headAge}
              onChange={(e) => setHeadAge(parseInt(e.target.value) || "")}
              className="input input-bordered border-zinc-200 focus:outline-none text-sm"
            />
            <select
              value={headGender}
              onChange={(e) => setHeadGender(e.target.value)}
              className="select select-bordered border-zinc-200 focus:outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <input
              type="number"
              placeholder="Contact (Optional)"
              value={headContact}
              onChange={(e) => setHeadContact(e.target.value)}
              className="input input-bordered border-zinc-200 focus:outline-none text-sm"
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={headPwd}
                onChange={(e) => setHeadPwd(e.target.checked)}
              />
              PWD
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={headIndigenous}
                onChange={(e) => setHeadIndigenous(e.target.checked)}
              />
              Indigenous
            </label>
          </div>

          {/* Members Section */}
          <div className="flex flex-col gap-3">
            <span className="font-bold">Household Members</span>
            {members.map((member, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) =>
                    handleMemberChange(index, "name", e.target.value)
                  }
                  className="input input-bordered border-zinc-200 focus:outline-none text-sm"
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
                  className="input input-bordered border-zinc-200 focus:outline-none text-sm"
                />
                <select
                  value={member.gender}
                  onChange={(e) =>
                    handleMemberChange(index, "gender", e.target.value)
                  }
                  className="select select-bordered border-zinc-200 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <input
                  type="number"
                  placeholder="Contact (Optional)"
                  value={member.contact || ""}
                  onChange={(e) =>
                    handleMemberChange(index, "contact", e.target.value)
                  }
                  className="input input-bordered border-zinc-200 focus:outline-none text-sm"
                />

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className=""
                    checked={member.pwd}
                    onChange={(e) =>
                      handleMemberChange(index, "pwd", e.target.checked)
                    }
                  />
                  PWD
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={member.indigenous}
                    onChange={(e) =>
                      handleMemberChange(index, "indigenous", e.target.checked)
                    }
                  />
                  Indigenous
                </label>

                <button
                  onClick={() => deleteMember(index)}
                  className="btn btn-sm my-auto rounded-md btn-error"
                >
                  Delete
                </button>
              </div>
            ))}
            <button onClick={addMember} className="btn mx-auto btn-secondary">
              Add Member
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`btn mt-4 text-white mx-auto ${
              loading ? "btn-disabled" : "btn-primary"
            } `}
          >
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