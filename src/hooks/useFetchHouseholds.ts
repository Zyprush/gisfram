import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

const useFetchHouseholds = (barangayName: string, house: boolean, sitio: string, year: string = "") => {
  const [households, setHouseholds] = useState<any[]>([]);
  console.log('year', year)

  useEffect(() => {
    if (!house) return; // Only fetch if the `house` state is true

    const fetchHouseholdData = async () => {
      try {
        const ref = collection(db, "households");
        let q =
          barangayName === ""
            ? query(ref)
            : query(ref, where("barangay", "==", barangayName));

        if (sitio) {
          q = query(q, where("sitio", "==", sitio));
        }

        if (year) {
          q = query(q, where("year", "==", year));
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedHouseholds = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setHouseholds(fetchedHouseholds);
        });

        return () => unsubscribe(); // Cleanup the subscription
      } catch (error) {
        console.error("Error fetching household data:", error);
      }
    };

    fetchHouseholdData();
  }, [barangayName, house, sitio, year]);

  return households;
};

export default useFetchHouseholds;
