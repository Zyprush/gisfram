import { Authenticator } from "@/components/Authenthicator";
import { Layout } from "@/components/Layout";
import SettingsItem from "@/components/SettingsItem";
import { IconSettings } from "@tabler/icons-react";
import Link from "next/link";

const Settings = () => {
  return (
    <Layout>
      <Authenticator />
      <div className="flex h-screen">
        <div className="p-2 md:p-8 border border-neutral-200  dark:border-neutral-700 bg-[#f5f5f5] dark:bg-neutral-900 flex flex-col items-start justify-start gap-5 w-full h-full ">
          <div className="flex items-start justify-start gap-5">
            <SettingsItem title="System Name" name="sysName" />
            <SettingsItem title="Address" name="address" />
            <Link href={"/pages/password"} className="p-4 flex flex-col bg-white text-zinc-600 dark:text-zinc-200 dark:bg-neutral-800 rounded-lg dark:border shadow-sm dark:border-neutral-700 h-full min-w-60 dark:bg-opacity-40">
              <span className="flex font-semibold justify-between mt-1">
                <h1>Password</h1>
                <span className="text-white">
                  <IconSettings className="text-zinc-600 dark:text-zinc-200"/>
                </span>
              </span>
              <p className="mt-auto mb-0 text-sm text-zinc-500 dark:text-zinc-300">Change your password here</p>
            </Link>
            <Link href={"/pages/boundary"} className="p-4 flex flex-col bg-white text-zinc-600 dark:text-zinc-200 dark:bg-neutral-800 rounded-lg dark:border shadow-sm dark:border-neutral-700 h-full min-w-60 dark:bg-opacity-40">
              <span className="flex font-semibold justify-between mt-1">
                <h1>Boundary</h1>
                <span  className="dark:text-white">
                  <IconSettings />
                </span>
              </span>
              <p className="mt-auto mb-0 text-sm text-zinc-500 dark:text-zinc-300">Change boundary of the map</p>
            </Link>
          </div>
          <SettingsItem title="About Us" name="aboutUs" />
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
