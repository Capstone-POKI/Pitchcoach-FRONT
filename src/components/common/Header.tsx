"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: "Pitch 목록", href: "/list" },
    { label: "현재 Pitch", href: "/home" },
  ];

  return (
    <header className="w-full border-b border-[#E5E7EB] bg-white">
      <div className="flex h-17 items-center px-6">
        <div className="flex items-center gap-2 font-bold">
          <span className="block h-5 w-5 rounded-[50%_50%_0_50%] bg-yellow-300" />
          <span className="text-xl">
            PITCH<span className="text-blue-600">COACH</span>
          </span>
        </div>

        <nav className="ml-15 flex items-center gap-8">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (pathname === "/" && item.href === "/home");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex h-17 items-center text-lg font-medium ${
                  active ? "text-blue-600" : "text-slate-600"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto">
          <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-white">
            <Icon icon="mdi:account" className="h-5 w-6 text-blue-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
