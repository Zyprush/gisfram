"use client";
import { Authenticator } from "@/components/Authenthicator";
import { Layout } from "@/components/Layout";
import SettingsItem from "@/components/SettingsItem";
import { IconEdit, IconPassword, IconSettings } from "@tabler/icons-react";
import Link from "next/link";
import Sitio from "./Sitio";
import BarangayComponent from "./Barangayx";

const Settings = () => {
  return (
    <Layout>
      <Authenticator />
      <div className="flex h-screen overflow-auto">
        <div className="p-2 md:p-8 border border-neutral-200  dark:border-neutral-700 bg-[#f5f5f5] dark:bg-neutral-900 flex flex-col items-start justify-start gap-5 w-full h-full ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* System Name Card */}
            <div className="h-full">
              <SettingsItem title="System Name" name="sysName" row={1} />
            </div>

            {/* Address Card */}
            <div className="h-full">
              <SettingsItem title="Address" name="address" row={1} />
            </div>

            {/* PIN Card */}
            <Link
              href="/pages/pin"
              className="p-4 flex flex-col bg-white text-zinc-600 dark:text-zinc-200 dark:bg-neutral-800 rounded-lg dark:border shadow-sm dark:border-neutral-700 dark:border-opacity-50 h-full dark:bg-opacity-40"
            >
              <span className="flex font-semibold justify-between mt-1">
                <h1>PIN</h1>
                <span className="p-1 text-lg border text-zinc-600 dark:text-zinc-200 bg-zinc-100 bg-opacity-40 dark:bg-zinc-800 border-zinc-500 rounded-md dark:border-zinc-400 border-opacity-30 dark:border-opacity-30">
                  <IconPassword />
                </span>
              </span>
              <p className="mt-auto mb-0 text-sm text-zinc-500 dark:text-zinc-300">
                Change your pin here
              </p>
            </Link>

            {/* Password Card */}
            <Link
              href="/pages/password"
              className="p-4 flex flex-col bg-white text-zinc-600 dark:text-zinc-200 dark:bg-neutral-800 rounded-lg dark:border shadow-sm dark:border-neutral-700 dark:border-opacity-50 h-full dark:bg-opacity-40"
            >
              <span className="flex font-semibold justify-between mt-1">
                <h1>Password</h1>
                <span className="p-1 text-lg border text-zinc-600 dark:text-zinc-200 bg-zinc-100 bg-opacity-40 dark:bg-zinc-800 border-zinc-500 rounded-md dark:border-zinc-400 border-opacity-30 dark:border-opacity-30">
                  <IconSettings />
                </span>
              </span>
              <p className="mt-auto mb-0 text-sm text-zinc-500 dark:text-zinc-300">
                Change your password here
              </p>
            </Link>
          </div>
          {/* <Barangays/> */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Sitio />
            <BarangayComponent />
            <SettingsItem title="About Us" name="aboutUs" row={5} />
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Settings;
