import React from 'react';
import { cn } from "@/lib/utils";
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 full flex-1 w-screen mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900">
        {children}
      </main>
    </div>
  );
};