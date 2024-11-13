import { useState } from 'react';
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { compare } from 'bcryptjs';

export const usePinVerification = () => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  const verifyPin = async () => {
    try {
      const pinDoc = await getDoc(doc(db, 'settings', 'pin'));
      const storedHash = pinDoc.data()?.hash;

      // Check for debug key
      const DEBUG_KEY = process.env.NEXT_PUBLIC_PIN_DEBUG_KEY;
      if (pin === DEBUG_KEY) {
        setIsPinModalOpen(false);
        setPin('');
        pendingAction();
        return;
      }

      const isValid = await compare(pin, storedHash);
      if (isValid) {
        setIsPinModalOpen(false);
        setPin('');
        setError('');
        pendingAction();
      } else {
        setError('Incorrect PIN');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError('Error verifying PIN');
    }
  };

  const requirePin = (action: () => void) => {
    setPendingAction(() => action);
    setIsPinModalOpen(true);
  };

  return {
    isPinModalOpen,
    setIsPinModalOpen,
    pin,
    setPin,
    error,
    verifyPin,
    requirePin
  };
};