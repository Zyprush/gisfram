"use client";

import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FirebaseError } from "firebase/app"; // Import FirebaseError

export default function Page() {
  const router = useRouter();
  const [signInUserWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await signInUserWithEmailAndPassword(email, password);
      router.push("/pages/dashboard");
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        // Define custom error messages based on Firebase error codes
        const errorMessages: { [key: string]: string } = {
          "auth/invalid-credential":
            "Invalid email or password. Please try again.",
          "auth/user-disabled":
            "This account has been disabled. Please contact support.",
          "auth/too-many-requests":
            "Too many failed login attempts. Please try again later.",
          "auth/wrong-password":
            "The password is incorrect. Please try again.",
          "auth/user-not-found":
            "No user found with this email. Please check and try again.",
          // Add more error codes and messages as needed
        };

        // Display the appropriate error message
        toast.error(
          errorMessages[error.code] ||
            "An unexpected error occurred. Please try again."
        );
      } else {
        // Display a generic error message for unexpected errors
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <section>
      <div className="flex h-screen bg-white items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-8">
        <div className="xl:mx-auto xl:w-full shadow-md p-4 xl:max-w-sm 2xl:max-w-md">
          <div className="mb-2 flex justify-center"></div>
          <h2 className="text-center text-2xl font-bold leading-tight text-black">
            Sign in
          </h2>
          <form className="mt-8" method="POST" onSubmit={onSubmit}>
            <div className="space-y-5">
              <div>
                <label className="text-base font-medium text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    placeholder="Email"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className="flex h-10 text-black w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-base font-medium text-gray-900">
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    placeholder="Password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className="flex h-10 text-black w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <button
                  className="inline-flex w-full items-center justify-center rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
                  type="submit"
                >
                  Sign In
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Add ToastContainer to display toasts */}
      <ToastContainer />
    </section>
  );
}
