"use client";

import { usePathname } from "next/navigation";
import StepNavbar from "@/components/common/StepNavbar";

const steps = [
  {
    key: "basic",
    label: "기본 정보",
    paths: ["/notice/basic", "/notice/type"],
  },
  {
    key: "upload",
    label: "공고 업로드",
    paths: ["/notice/upload"],
  },
  {
    key: "analysis",
    label: "분석 결과 확인",
    paths: ["/notice/analysis"],
  },
];

export default function NoticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const currentStep = steps.findIndex((step) =>
    step.paths.some((path) => pathname.startsWith(path)),
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <StepNavbar
        steps={steps.map(({ key, label }) => ({ key, label }))}
        currentStep={currentStep < 0 ? 0 : currentStep}
      />

      <main className="flex flex-1 justify-center px-6 py-8 pb-28">
        {children}
      </main>
    </div>
  );
}
