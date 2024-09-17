"use client";
import { SignedIn } from "@/components/signed-in";
import { SignedOut } from "@/components/signed-out"; 
import Link from "next/link";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { LoggedIn } from "@/components/LoggedIn";
import { auth } from "@/firebase";
import Image from "next/image";
import BgParticles from "@/components/BgParticles"; // Import the BgParticles component
import { useState, useEffect } from "react";
import { getSetting } from "./pages/settings/getSetting";

export default function Home() {
  const [user] = useAuthState(auth);
  const [brandName, setBrandName] = useState("GISFRAM");
  const [about, setAbout] = useState(
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque architecto ex, aperiam repudiandae distinctio eum quasi ab fugiat odio eligendi incidunt, voluptate, in quo autem ea et beatae nobis asperiores"
  );
  const [signOut] = useSignOut(auth);

  useEffect(() => {
    const fetchBrandName = async () => {
      try {
        const name = await getSetting("sysName");
        const abo = await getSetting("aboutUs");
        if (name) setBrandName(name);
        if (abo) setAbout(abo);
      } catch (error) {
        console.error("Error fetching brand name:", error);
      }
    };
    fetchBrandName();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-radial bg-gray-950">
      <BgParticles /> {/* Use the BgParticles component */}
      <SignedIn>
        <LoggedIn />
        <div className="w-full max-w-md p-8 z-10 shadow-lg rounded-lg text-center bg-none">
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
        <div className="text-center z-10">
          <div className="flex gap-5 mx-auto flex-col">
            <div className="flex gap-5 items-center mx-auto">
              <Image
                src={"/img/paluan-logo.png"}
                alt="logo"
                height={120}
                width={120}
              />
              <Image
                src="/img/logo.png"
                alt="Logo"
                width={150}
                height={150}
                className="border-shadow"
                draggable="false"
              />
              <Image
                src={"/img/ganado.png"}
                alt="logo"
                height={140}
                width={140}
              />
            </div>

            <span className="flex flex-col justify-start items-start max-w-[35rem] my-auto p-6 bg-zinc-950 bg-opacity-80 rounded-lg border border-zinc-800">
              <p className="text-xl uppercase font-semibold text-white dark:text-white">
                {brandName}
              </p>
              <p className="text-xs mt-4 text-white dark:text-white text-justify">
                {about}
              </p>
              <Link
                href="/pages/sign-in"
                className="btn btn-outline text-white hover:bg-white hover:text-black font-bold mt-10 mx-auto"
              >
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </SignedOut>
    </main>
  );
}
