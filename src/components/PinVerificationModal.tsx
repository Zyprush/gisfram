import React from 'react';

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pin: string;
  onPinChange: (pin: string) => void;
  onVerify: () => void;
  error?: string;
}

export const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
  isOpen,
  onClose,
  pin,
  onPinChange,
  onVerify,
  error
}) => {
  if (!isOpen) return null;

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    onPinChange(value);
  };

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-70 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-gray-800 text-gray-200 p-8 rounded-lg shadow-xl w-full max-w-[23rem]">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-200">
          Enter PIN
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Enter PIN to access</label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
              className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter 4-digit PIN"
              autoFocus
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onVerify}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Verify
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-500 hover:bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-red-400 text-center">{error}</p>
        )}
      </div>
    </div>
  );
};