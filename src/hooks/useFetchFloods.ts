import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const useFetchFloods = (barangayName: string, year: string, flood: boolean) => {
  const [floods, setFloods] = useState<any[]>([]);

  useEffect(() => {
    if (!flood) return;

    const fetchFloodData = async () => {
      try {
        const ref = collection(db, "floods");
        let q = query(ref);
        if (barangayName) {
          q = query(ref, where("barangay", "==", barangayName));
        }
        if (year) {
          q = query(
            q,
            where("date", ">=", `${year}-01-01`),
            where("date", "<=", `${year}-12-31`)
          );
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedFloods = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setFloods(fetchedFloods);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching flood data:", error);
      }
    };

    fetchFloodData();
  }, [barangayName, year, flood]);

  return floods;
};

export default useFetchFloods;
