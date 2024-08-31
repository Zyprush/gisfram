// settingsService.ts
import { db } from "@/firebase"; // Adjust the path to your Firebase config
import { doc, getDoc } from "firebase/firestore";

interface SettingData {
  value: string;
}

export const getSetting = async (name: string): Promise<string | null> => {
  try {
    const docRef = doc(db, "settings", name);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as SettingData;
      return data.value;
    } else {
      console.log(`No document found for setting: ${name}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching setting ${name}:`, error);
    throw error;
  }
};