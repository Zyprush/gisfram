"use client";
import React, { useEffect, useState } from "react";
import {
  Sidebar as UISidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconLayoutDashboard,
  IconSettings,
  IconChartHistogram,
  IconAlertTriangle,
  IconMap,
  IconHelpOctagon,
  IconRipple,
  IconSun,
  IconMoon,
  IconMapPin,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import { getSetting } from "@/app/pages/settings/getSetting";
import { useTheme } from "next-themes";

const links = [
  {
    label: "Dashboard",
    href: "/pages/dashboard",
    icon: (
      <IconLayoutDashboard className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Add data",
    href: "/pages/add-data",
    icon: (
      <IconMap className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Map Data",
    href: "/pages/map",
    icon: (
      <IconMapPin className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Barangay",
    href: "/pages/barangay",
    icon: (
      <IconHelpOctagon className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Hazard",
    href: "/pages/hazard",
    icon: (
      <IconAlertTriangle className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Flood Data",
    href: "/pages/flood",
    icon: (
      <IconRipple className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Analysis",
    href: "/pages/analysis",
    icon: (
      <IconChartHistogram className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Settings",
    href: "/pages/settings",
    icon: (
      <IconSettings className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
];

export const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [brandName, setBrandName] = useState("GISFRAM");
  const [signOut] = useSignOut(auth);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchBrandName = async () => {
      try {
        const name = await getSetting("sysName");
        if (name) setBrandName(name);
      } catch (error) {
        console.error("Error fetching brand name:", error);
      }
    };
    fetchBrandName();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <UISidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 bg-white dark:bg-neutral-900">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {open ? <Logo brandName={brandName} /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: (
                  <IconArrowLeft className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                ),
              }}
              onClick={handleLogout}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-neutral-200 dark:border-white/[0.2] dark:bg-gray-900 text-zinc-500 dark:text-zinc-100 ml-0 mr-auto"
          >
            {theme === "dark" ? (
              <IconSun className="h-5 w-5" />
            ) : (
              <IconMoon className="h-5 w-5" />
            )}
          </button>
          <div className="ml-0 mr-auto ">
            <SidebarLink
              link={{
                label: "Admin",
                href: "#",
                icon: (
                  <Image
                    src="/img/avatar.svg"
                    className="h-7 w-7 flex-shrink-0 rounded-full dark:bg-white"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </div>
      </SidebarBody>
    </UISidebar>
  );
};

const Logo: React.FC<{ brandName: string }> = ({ brandName }) => {
  return (
    <Link
      href="/pages/dashboard"
      className="font-normal flex space-x-2 items-center text-sm dark:text-white text-black py-1 relative z-20"
    >
      <Image
        src="/img/logo.png"
        className="h-7 w-7 flex-shrink-0 rounded-full"
        width={50}
        height={50}
        alt="Logo"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-lg text-black dark:text-white whitespace-pre"
      >
        {brandName}
      </motion.span>
    </Link>
  );
};

const LogoIcon: React.FC = () => {
  return (
    <Link
      href="/pages/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image
        src="/img/logo.png"
        className="h-7 w-7 flex-shrink-0 rounded-full"
        width={50}
        height={50}
        alt="Logo"
      />
    </Link>
  );
};
