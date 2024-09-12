"use client";

import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FirebaseError } from "firebase/app";
import { SignedOut } from "@/components/signed-out";
import { SignedIn } from "@/components/signed-in";
import { LoggedIn } from "@/components/LoggedIn";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import BgParticles from "@/components/BgParticles";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(email, password);
      if (user) {
        router.push("/pages/map");
      }
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        // Error messages mapping
        const errorMessages: { [key: string]: string } = {
          "auth/invalid-credential": "Invalid email or password. Please try again.",
          "auth/user-disabled": "This account has been disabled. Please contact support.",
          "auth/too-many-requests": "Too many failed login attempts. Please try again later.",
          "auth/wrong-password": "The password is incorrect. Please try again.",
          "auth/user-not-found": "No user found with this email. Please check and try again.",
        };

        // Display user-friendly error message
        const message = errorMessages[error.code] || "An unexpected error occurred. Please try again.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <section>
      <div className="flex h-screen bg-gray-950 items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-8">
        <BgParticles />
        <div className="xl:mx-auto xl:w-full shadow-md p-4 max-w-[23rem] bg-white z-10 pt-5 pb-10">
          <div className="mb-2 flex justify-center"></div>
          <h2 className="text-center text-2xl font-bold leading-tight text-primary">Sign in</h2>
          <form className="mt-8" method="POST" onSubmit={onSubmit}>
            <div className="space-y-5">
              <div>
                <label className="text-base font-medium text-gray-900">Email address</label>
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
                  <label className="text-base font-medium text-gray-900">Password</label>
                </div>
                <div className="mt-2 relative">
                  <input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className="flex h-10 text-black w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                  >
                    {showPassword ? <IconEye /> : <IconEyeOff />}
                  </button>
                </div>
              </div>

              <div>
                <SignedOut>
                  <button className="btn btn-primary w-full rounded-none text-white" type="submit">
                    Sign In
                  </button>
                </SignedOut>
                <SignedIn>
                  <LoggedIn />
                  <button className="btn btn-primary w-full rounded-none text-white" type="submit">
                    Signing In
                  </button>
                </SignedIn>
              </div>
            </div>
          </form>
          {loading && <p>Loading...</p>}
          {/* Display error message based on FirebaseError, if present */}
          {error && (
            <p className="text-red-500 border border-red-500 text-sm font-semibold p-2 rounded-md mt-4 text-center">
              {error?.code === "auth/invalid-credential" && "Invalid email or password. Please try again."}
              {error?.code === "auth/user-disabled" && "This account has been disabled. Please contact support."}
              {error?.code === "auth/too-many-requests" && "Too many failed login attempts. Please try again later."}
              {error?.code === "auth/wrong-password" && "The password is incorrect. Please try again."}
              {error?.code === "auth/user-not-found" && "No user found with this email. Please check and try again."}
            </p>
          )}
        </div>
      </div>
      <ToastContainer />
    </section>
  );
}
