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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SignedIn>
      <LoggedIn />
        {/* this should be directing to the dashboard */}
        <div className="full w-screen h-screen text-primary-500">
          <h1 className="text-3xl font-bold">Signed in as</h1>
          <p>{user?.email}</p>
          <p>
            Email verified:{" "}
            {user?.emailVerified ? (
              <span className="text-green-500">Verified</span>
            ) : (
              <span className="text-red-500">Not verified</span>
            )}
          </p>
          <button onClick={signOut} className="text-red-500 font-bold">
            Sign out
          </button>
        </div>
      </SignedIn>
      <SignedOut>
        <Link className="mr-4 underline" href="/pages/sign-in">
          Sign in
        </Link>
        <Link className="mr-4 underline" href="/pages/sign-up">
          Create account
        </Link>
      </SignedOut>
    </main>
  );
}
