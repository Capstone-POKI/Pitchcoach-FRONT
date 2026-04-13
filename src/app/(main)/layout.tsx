"use client";

import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isListPage = pathname === "/list";
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {!isListPage && <Sidebar />}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
