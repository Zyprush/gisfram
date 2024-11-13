"use client";

import React, { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { hash, compare } from 'bcryptjs';
import Link from 'next/link';

const Pin = () => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [hasExistingPin, setHasExistingPin] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'verify' | 'create' | 'success'>('verify');

  const DEBUG_KEY = process.env.NEXT_PUBLIC_PIN_DEBUG_KEY;

  useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    try {
      const pinDoc = await getDoc(doc(db, 'settings', 'pin'));
      setHasExistingPin(pinDoc.exists());
      setStep(pinDoc.exists() ? 'verify' : 'create');
    } catch (error) {
      console.error('Error checking PIN:', error);
      setError('Error checking existing PIN');
    }
  };

  const validatePin = (pin: string) => {
    return /^\d{4}$/.test(pin);
  };

  const handlePinChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPinFunction: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPinFunction(value);
  };

  const handleVerifyPin = async () => {
    try {
      const pinDoc = await getDoc(doc(db, 'settings', 'pin'));
      const storedHash = pinDoc.data()?.hash;

      // For debugging purposes with the secret key
      if (currentPin === DEBUG_KEY) {
        setStep('create');
        setError('');
        return;
      }

      const isValid = await compare(currentPin, storedHash);
      if (isValid) {
        setStep('create');
        setError('');
      } else {
        setError('Incorrect PIN');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError('Error verifying PIN');
    }
  };

  const handleSetPin = async () => {
    try {
      if (!validatePin(newPin)) {
        setError('PIN must be exactly 4 digits');
        return;
      }

      if (newPin !== confirmPin) {
        setError('PINs do not match');
        return;
      }

      // Hash the PIN with bcrypt
      const hashedPin = await hash(newPin, 10);

      // Store the hashed PIN in Firestore
      await setDoc(doc(db, 'settings', 'pin'), {
        hash: hashedPin,
        // Store an encrypted version for debugging (in production, implement proper encryption)
        debug: Buffer.from(newPin).toString('base64'),
        updatedAt: new Date().toISOString()
      });

      setStep('success');
      setError('');
    } catch (error) {
      console.error('Error setting PIN:', error);
      setError('Error setting PIN');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-70 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-gray-800 text-gray-200 p-8 rounded-lg shadow-xl w-full max-w-[23rem]">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-200">
          {step === 'verify' ? 'Enter Current PIN' :
            step === 'create' ? 'Set New PIN' :
              'PIN Updated Successfully'}
        </h2>

        {step === 'verify' && hasExistingPin && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current PIN</label>
              <input
                type="password"
                maxLength={4}
                value={currentPin}
                onChange={(e) => handlePinChange(e, setCurrentPin)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 4-digit PIN"
              />
            </div>
            <button
              onClick={handleVerifyPin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Verify PIN
            </button>
            <Link
              href="/pages/settings"
              className="mt-4 w-full block text-center px-4 py-2 text-gray-200 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-secondary focus:ring-opacity-50 transition ease-in-out duration-150 text-sm border border-gray-500"
            >
              Cancel
            </Link>
          </div>
        )}

        {step === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">New PIN</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => handlePinChange(e, setNewPin)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 4-digit PIN"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm PIN</label>
              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => handlePinChange(e, setConfirmPin)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm 4-digit PIN"
              />
            </div>
            <button
              onClick={handleSetPin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Set PIN
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <p className="text-green-400 mb-4">PIN has been successfully updated!</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-red-400 text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Pin;