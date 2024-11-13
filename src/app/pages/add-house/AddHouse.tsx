import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { logHouseholdAction } from "@/utils/logging";

interface AddDataProps {
  handleCancel: () => void;
  marker: google.maps.LatLng | undefined;
  barangay: string;
}
interface Sitio {
  name: string;
  barangay: string;
}

/**
 * AddHouse component is a form for adding household data
 * @param handleCancel cancel function to close the form
 * @param marker google maps marker position
 * @param barangay barangay name
 * @returns JSX element
 */
const AddHouse: React.FC<AddDataProps> = ({
  handleCancel,
  marker,
  barangay,
}) => {
  const [houseNo, setHouseNo] = useState<string | "">("");
  const [year, setYear] = useState<string | "">("");
  const [loading, setLoading] = useState(false);
  const [headName, setHeadName] = useState("");
  const [headAge, setHeadAge] = useState<string>("");
  const [headPwd, setHeadPwd] = useState(false);
  const [headContact, setHeadContact] = useState<string>("");
  const [headIndigenous, setHeadIndigenous] = useState(false);
  const [headGender, setHeadGender] = useState("");
  const [headPregnant, setHeadPregnant] = useState(false); // Added headPregnant state
  const [houseStruc, setHouseStruc] = useState("");
  const [sitioList, setSitioList] = useState<Sitio[]>([]);
  const [sitio, setSitio] = useState("");
  const [members, setMembers] = useState<
    {
      name: string;
      age: string;
      pwd: boolean;
      contact?: string;
      indigenous: boolean;
      pregnant: boolean;
      gender: string;
    }[]
  >([]);

  // Handle contact number input with validation
  const handleContactChange = (value: string, isHead: boolean = true, memberIndex?: number) => {
    // Only allow numbers and limit to 11 digits
    const sanitizedValue = value.replace(/\D/g, '').slice(0, 11);

    if (isHead) {
      setHeadContact(sanitizedValue);
    } else if (memberIndex !== undefined) {
      handleMemberChange(memberIndex, "contact", sanitizedValue);
    }
  };

  // Handle age input with validation
  const handleAgeChange = (value: string, isHead: boolean = true, memberIndex?: number) => {
    // Only allow numbers and empty string
    const numericOnly = value.replace(/[^0-9]/g, '');
    
    if (isHead) {
      setHeadAge(numericOnly);
    } else if (memberIndex !== undefined) {
      handleMemberChange(memberIndex, "age", numericOnly);
    }
  };

  useEffect(() => {
    const fetchSitio = async () => {
      const sitioDoc = await getDoc(doc(db, "settings", "sitio"));

      if (sitioDoc.exists()) {
        const sitioList = sitioDoc.data().sitio || [];
        const filteredSitioList = sitioList.filter((sitio: Sitio) => sitio.barangay === barangay);
        setSitioList(filteredSitioList);

      }
    };
    fetchSitio();
  }, [barangay]);

  useEffect(() => {
    if (marker)
      console.log("Marker position:", { lat: marker.lat(), lng: marker.lng() });
  }, [marker]);

  // Reset pregnancy status when gender changes
  useEffect(() => {
    if (headGender === "Male") {
      setHeadPregnant(false);
    }
  }, [headGender]);

  const addMember = () =>
    setMembers([
      ...members,
      {
        name: "",
        age: "",
        pwd: false,
        indigenous: false,
        pregnant: false,
        gender: "Male",
      },
    ]);

  const handleMemberChange = (index: number, field: string, value: any) => {
    setMembers((prevMembers) =>
      prevMembers.map((m, i) => {
        if (i === index) {
          // Reset pregnancy status when gender changes to Male
          if (field === "gender" && value === "Male") {
            return { ...m, [field]: value, pregnant: false };
          }
          return { ...m, [field]: value };
        }
        return m;
      })
    );
  };

  const deleteMember = (index: number) =>
    setMembers(members.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setLoading(true);

    // Validate contact number length
    if (headContact.length !== 11 || !headContact.startsWith('09')) {
      setLoading(false);
      window.alert("Head contact number must be 11 digits and start with '09'");
      return;
    }

    // Validate members' contact numbers
    for (const member of members) {
      if (member.contact && (member.contact.length !== 11 || !member.contact.startsWith('09'))) {
        setLoading(false);
        window.alert(`Member ${member.name}'s contact number must be 11 digits and start with '09'`);
        return;
      }
    }

    // Validate age for the head of household
    const parsedHeadAge = parseInt(headAge as string, 10);
    if (isNaN(parsedHeadAge) || parsedHeadAge <= 0) {
      setLoading(false);
      window.alert("Please enter a valid age for the Head of Household.");
      return;
    }

    // Validate age for members
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const parsedAge = parseInt(member.age, 10);
      if (isNaN(parsedAge) || parsedAge <= 0) {
        setLoading(false);
        window.alert(`Please enter a valid age for member ${i + 1}.`);
        return;
      }
    }

    const requiredFields = [
      { field: houseNo, msg: "Please enter a House Number." },
      { field: houseStruc, msg: "Please select a House Structure." },
      { field: sitio, msg: "Please select a Sitio, add sitio in the settings if necessary." },
      { field: headName, msg: "Please enter the Head of Household Name." },
      {
        field: headContact,
        msg: "Please enter the Head of Household Contact.",
      },
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
    let maleCount = 0;
    let femaleCount = 0;
    let pwdCount = 0;
    let indigenousCount = 0;
    let seniorCount = 0;
    let pregnantCount = 0;
    let memberCount = members.length + 1;

    // Count the head of household
    if (headGender === "Male") maleCount++;
    if (headGender === "Female") femaleCount++;
    if (headPwd) pwdCount++;
    if (headIndigenous) indigenousCount++;
    if (parseInt(String(headAge)) >= 60) seniorCount++;
    if (headPregnant) pregnantCount++;

    // Count the members
    members.forEach((member) => {
      if (member.gender === "Male") maleCount++;
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
      year,
      sitio,
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
      maleCount, // Include male count
      femaleCount, // Include female count
      pwdCount,
      indigenousCount,
      seniorCount, // Include senior count
      pregnantCount, // Include pregnant count
      members,
    };

    try {
      const docRef = await addDoc(collection(db, "households"), householdData);
      console.log("Document written with ID: ", docRef.id);
      await logHouseholdAction('add', householdData.head,);
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
            type="text"
            placeholder="House No"
            value={houseNo}
            onChange={(e) => setHouseNo(e.target.value)}
            className="sn-input"
          />
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="sn-select w-20"
            required
          >
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
            value={sitio}
            onChange={(e) => setSitio(e.target.value)}
            className="sn-select"
          //   className="p-2 text-sm border-primary border-2 rounded-sm"
          >
            <option value="">Select sitio</option>
            {sitioList?.map((sitio, i) => (
              <option key={i} value={sitio?.name}>
                {sitio?.name}
              </option>
            ))}
          </select>

          <select
            value={houseStruc}
            onChange={(e) => setHouseStruc(e.target.value)}
            className="sn-select"
          >
            <option value="">House Structure</option>
            <option value="Concrete">Concrete</option>
            <option value="Lightweight Materials">Lightweight Materials</option>
            <option value="Salvage">Salvage</option>
            <option value="Mix">Mix</option>
          </select>

        </div>
        {/* Household leader section with updated inputs */}
        <span className="font-bold text-sm">Household Leader</span>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Head of Household Name"
            value={headName}
            onChange={(e) => setHeadName(e.target.value)}
            className="sn-select"
          />
          <input
            type="text"
            placeholder="Age"
            value={headAge}
            onChange={(e) => handleAgeChange(e.target.value)}
            className="sn-select"
          />
          <select
            value={headGender}
            onChange={(e) => setHeadGender(e.target.value)}
            className="sn-select"
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input
            type="text"
            placeholder="Contact (09xxxxxxxxx)"
            value={headContact}
            onChange={(e) => handleContactChange(e.target.value)}
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
          {headGender === "Female" && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={headPregnant}
                onChange={(e) => setHeadPregnant(e.target.checked)}
                className="checkbox checkbox-xs checkbox-primary"
              />
              <span className="ml-2 text-sm">Pregnant</span>
            </label>
          )}
        </div>

        {/* Members section */}
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
                onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                className="sn-select"
              />
              <input
                type="text"
                placeholder="Age"
                value={member.age}
                onChange={(e) => handleAgeChange(e.target.value, false, index)}
                className="sn-select"
              />
              <select
                value={member.gender}
                onChange={(e) => handleMemberChange(index, "gender", e.target.value)}
                className="sn-select"
              >
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="text"
                placeholder="Contact (09xxxxxxxxx)"
                value={member.contact}
                onChange={(e) => handleContactChange(e.target.value, false, index)}
                className="sn-select"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={member.pwd}
                  onChange={(e) => handleMemberChange(index, "pwd", e.target.checked)}
                  className="checkbox checkbox-xs checkbox-primary"
                />
                <span className="ml-2 text-sm">PWD</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={member.indigenous}
                  onChange={(e) => handleMemberChange(index, "indigenous", e.target.checked)}
                  className="checkbox checkbox-xs checkbox-primary"
                />
                <span className="ml-2 text-sm">Indigenous</span>
              </label>
              {member.gender === "Female" && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={member.pregnant}
                    onChange={(e) => handleMemberChange(index, "pregnant", e.target.checked)}
                    className="checkbox checkbox-xs checkbox-primary"
                  />
                  <span className="ml-2 text-sm">Pregnant</span>
                </label>
              )}
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
