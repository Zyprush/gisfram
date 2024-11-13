import { db } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";

// Define the log entry type
interface LogEntry {
  action: string;
  timestamp: Date;
}

// Format date to MM-DD-YYYY HH:MM:SS
const formatDate = (date: Date): string => {
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

// Main logging function
export const logAction = async (action: string): Promise<void> => {
  try {
    const timestamp = new Date();

    // Create the log entry
    const logEntry: LogEntry = {
      action,
      timestamp,
    };

    // Save to Firestore
    await addDoc(collection(db, "history"), logEntry);

    console.log(`Log saved: ${action} at ${formatDate(timestamp)}`);
  } catch (error) {
    console.error("Error saving log:", error);
    throw error;
  }
};

// Helper functions for common actions
export const logHouseholdAction = async (
  actionType:
    | "add"
    | "update"
    | "delete"
    | "archive"
    | "restored"
    | "exported"
    | "printed"
    | "printedMap"
    | "printedAnalysis",
  householdName: string
) => {
  const actionMessages = {
    add: `${householdName} has been added to the household`,
    update: `${householdName} has been updated in the household`,
    delete: `${householdName} has been deleted from the household`,
    archive: `${householdName} has been moved to the archive`,
    restored: `${householdName} has been restored from the archive`,
    exported: `The household data of ${householdName} has been exported`,
    printed: `The household data of ${householdName} has been printed`,
    printedMap: `The Map Data has been printed`,
    printedAnalysis: `The Analysis has been printed`,
  };

  await logAction(actionMessages[actionType]);
};

export const logFloodAction = async (
  actionType: "add" | "update" | "delete" | "resolved" | "exported" | "printed",
  barangay: string
) => {
  const actionMessages = {
    add: `Flood Data of Brgy. ${barangay} has been added.`,
    update: `Flood status in Brgy. ${barangay} has been updated.`,
    delete: `Flood record in Brgy. ${barangay} has been deleted.`,
    resolved: `Flood situation in Brgy. ${barangay} has been marked as resolved.`,
    exported: `The flood data of ${barangay} has been exported.`,
    printed: `The flood data of ${barangay} has been printed.`,
  };
  await logAction(actionMessages[actionType]);
};

export const logSystemAction = async (
  actionType: "edit",
  name: string
) => {
  const actionMessages = {
    edit: `The ${name} has been edited`,
  };

  await logAction(actionMessages[actionType]);
};
