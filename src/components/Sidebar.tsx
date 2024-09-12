"use client";
import React, { useEffect, useState } from "react";
import {
  Sidebar as UISidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar";
import {
  IconOutbound,
  IconSettings,
  IconAlertTriangle,
  IconMap,
  IconHelpOctagon,
  IconCloud,
  IconSun,
  IconMoon,
  IconTablePlus,
  IconCreditCard,
  IconChartBarPopular,
  IconChevronLeft,
  IconChevronRight,
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
    label: "Map Data",
    href: "/pages/map",
    icon: (
      <IconMap className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" stroke={2.4} />
    ),
  },
  {
    label: "Add Household",
    href: "/pages/add-house",
    icon: (
      <IconTablePlus className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" stroke={2.4} />
    ),
  },
  {
    label: "Add Flood",
    href: "/pages/add-flood",
    icon: (
      < IconCloud className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" stroke={2.4} />
    ),
  },
  {
    label: "Settings",
    href: "/pages/settings",
    icon: (
      <IconSettings className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" stroke={2.4} />
    ),
  },
];

export const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [brandName, setBrandName] = useState("GISFRAM");
  const [signOut] = useSignOut(auth);
  const { theme, setTheme } = useTheme();

  // Retrieve the saved sidebar state from localStorage on mount
  useEffect(() => {
    const storedSidebarState = localStorage.getItem("sidebarOpen");
    if (storedSidebarState !== null) {
      setOpen(JSON.parse(storedSidebarState));
    }
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

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(open));
  }, [open]);

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
  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <UISidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 bg-base dark:bg-neutral-900">
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
                  <IconOutbound className="text-neutral-600 dark:text-neutral-200 h-5 w-5 flex-shrink-0" stroke={2.5} />
                ),
              }}
              onClick={handleLogout}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-neutral-200 dark:border-white/[0.2] dark:bg-zinc-800 dark:bg-opacity-45 text-zinc-500 dark:text-zinc-100 -ml-1 mr-auto"
          >
            {theme === "dark" ? (
              <IconSun className="h-5 w-5" />
            ) : (
              <IconMoon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={toggleSidebar}
            className="absolute -right-4 bottom-36 text-black dark:text-white bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-full p-2 z-50"
          >
            {open ? (
              <IconChevronLeft className="w-4 h-4 " />
            ) : (
              <IconChevronRight className="w-4 h-4" />
            )}
          </button>
          <div className="ml-0 mr-auto">
            <SidebarLink
              link={{
                label: "Admin",
                href: "#",
                icon: (
                  <Image
                    src="/img/avatar.svg"
                    className="h-7 w-7 flex-shrink-0 rounded-full dark:bg-base"
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
