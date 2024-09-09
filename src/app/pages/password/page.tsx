"use client";
import React, { useState, ChangeEvent } from "react";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Password = () => {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPasswords, setShowPasswords] = useState<boolean>(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      alert("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    if (oldPassword === newPassword) {
      alert("New password must be different from the old password.");
      return;
    }

    setLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);

      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        alert("Password updated successfully.");
        router.push("/pages/settings");
      } catch (error: any) {
        if (error instanceof FirebaseError) {
          const errorMessages: { [key: string]: string } = {
            "auth/invalid-credential": "Please enter the correct old password!",
            "auth/user-disabled":
              "This account has been disabled. Please contact support.",
            "auth/too-many-requests":
              "Too many failed login attempts. Please try again later.",
          };
          alert(
            errorMessages[error.code as string] ||
              "An unexpected error occurred. Please try again."
          );
        } else {
          alert("An unexpected error occurred. Please try again.");
        }
      }
    } else {
      alert("No user is currently signed in.");
    }

    setLoading(false);
  };

  const handleOldPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOldPassword(e.target.value);
  };

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const toggleShowPasswords = () => {
    setShowPasswords((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-70 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-gray-800 text-gray-200 p-8 rounded-lg shadow-xl w-full max-w-[23rem]">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-200">
          Change Password
        </h2>

        <div className="space-y-4">
          <div className="relative">
            <input
              type={showPasswords ? "text" : "password"}
              value={oldPassword}
              onChange={handleOldPasswordChange}
              placeholder="Old password"
              className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition ease-in-out duration-150 text-sm"
            />
          </div>

          <div className="relative">
            <input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={handleNewPasswordChange}
              placeholder="New password"
              className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition ease-in-out duration-150 text-sm"
            />
          </div>

          <div className="relative">
            <input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition ease-in-out duration-150 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={toggleShowPasswords}
            className="text-sm text-gray-400 hover:text-gray-200 focus:outline-none"
          >
            {showPasswords ? (
              <span className="flex items-center">
                <IconEyeOff className="mr-1" /> Hide Passwords
              </span>
            ) : (
              <span className="flex items-center">
                <IconEye className="mr-1" /> Show Passwords
              </span>
            )}
          </button>
        </div>

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="mt-4 w-full px-4 py-2 bg-primary text-sm text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-50 transition ease-in-out duration-150"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        <Link
          href="/pages/settings"
          className="mt-4 w-full block text-center px-4 py-2 text-gray-200 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-secondary focus:ring-opacity-50 transition ease-in-out duration-150 text-sm border border-gray-500"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
};

export default Password;
