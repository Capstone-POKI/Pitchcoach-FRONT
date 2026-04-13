"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

const menus = [
  {
    label: "대시보드",
    href: "/home",
    icon: "mdi:view-dashboard-outline",
  },
  {
    label: "공고 분석",
    href: "/analysis/posting",
    icon: "mdi:file-document-outline",
  },
  {
    label: "IR Deck 분석",
    href: "/analysis/ir",
    icon: "mdi:presentation",
  },
  {
    label: "음성 분석",
    href: "/analysis/voice",
    icon: "mdi:microphone-outline",
  },
  {
    label: "Q&A 훈련",
    href: "/training/qa",
    icon: "mdi:comment-question-outline",
  },
  {
    label: "AI 리포트",
    href: "/report",
    icon: "mdi:chart-box-outline",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-50 flex-col border-r bg-white border-[#E5E7EB] px-4 py-6">
      {/* Menu */}
      <nav className="flex flex-col gap-2">
        {menus.map((menu) => {
          const active = pathname.startsWith(menu.href);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition
                ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-gray-100"
                }
              `}
            >
              <Icon
                icon={menu.icon}
                className={`h-5 w-5 ${
                  active ? "text-white" : "text-slate-400"
                }`}
              />
              {menu.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto mb-15">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-300 py-2 text-sm font-semibold text-slate-900 hover:bg-yellow-500">
          <Icon icon="mdi:plus" className="h-4 w-4" />새 리허설
        </button>
      </div>
    </aside>
  );
}
