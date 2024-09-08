import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

const useFetchHouseholds = (barangayName: string, house: boolean) => {
  const [households, setHouseholds] = useState<any[]>([]);

  useEffect(() => {
    if (!house) return; // Only fetch if the `house` state is true

    const fetchHouseholdData = async () => {
      try {
        const ref = collection(db, "households");
        const q =
          barangayName === ""
            ? query(ref)
            : query(ref, where("barangay", "==", barangayName));

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
  }, [barangayName, house]);

  return households;
};

export default useFetchHouseholds;
