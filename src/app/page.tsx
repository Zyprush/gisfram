"use client";
import { SignedIn } from "@/components/signed-in";
import { SignedOut } from "@/components/signed-out";
import Link from "next/link";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { LoggedIn } from "@/components/LoggedIn";
import { auth } from "@/firebase";

export default function Home() {
  const [user] = useAuthState(auth);
  const [signOut] = useSignOut(auth);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
      <SignedIn>
        <LoggedIn />
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg text-center dark:bg-gray-800">
          <h1 className="text-4xl font-bold text-primary-500 mb-4 dark:text-primary-400">
            Welcome!
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Signed in as <span className="font-semibold">{user?.email}</span>
          </p>
          <p className="mt-2 text-lg">
            Email verified:{" "}
            {user?.emailVerified ? (
              <span className="text-green-500 font-bold dark:text-green-400">
                Verified
              </span>
            ) : (
              <span className="text-red-500 font-bold dark:text-red-400">
                Not verified
              </span>
            )}
          </p>
          <button
            onClick={signOut}
            className="mt-6 px-6 py-2 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition dark:bg-red-600 dark:hover:bg-red-700"
          >
            Sign out
          </button>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-500 mb-6 dark:text-primary-400">
            Welcome to GISFRAM-POM !
          </h1>
          <Link
            href="/pages/sign-in"
            className="inline-block px-8 py-2 bg-primary-500 text-white font-semibold rounded-full shadow-lg hover:bg-primary-600 transition dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            Sign in
          </Link>
          <Link
            href="/pages/sign-up"
            className="inline-block px-8 py-2 ml-4 bg-gray-500 text-white font-semibold rounded-full shadow-lg hover:bg-gray-600 transition dark:bg-gray-600 dark:hover:bg-gray-700"
          >
            Create account
          </Link>
        </div>
      </SignedOut>
    </main>
  );
}
