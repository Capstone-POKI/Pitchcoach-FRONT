"use client";

import { usePathname } from "next/navigation";
import StepNavbar from "@/components/common/StepNavbar";

const steps = [
  {
    key: "pitch-info",
    label: "Pitch 정보 입력",
    paths: ["/notice/basic", "/notice/info"],
  },
  {
    key: "ir-deck",
    label: "IR Deck 분석",
    paths: ["/new/deck/upload", "/new/deck/analysis"],
  },
  {
    key: "pitching",
    label: "피칭 분석",
    paths: ["/new/voice/upload", "/new/voice/analysis"],
  },
  {
    key: "qna",
    label: "Q&A 훈련",
    paths: ["/new/qna/type", "/new/qna/practice", "/new/qna/list"],
  },
  {
    key: "report",
    label: "리포트 확인",
    paths: ["/notice/report", "/notice/analysis"],
  },
];

export default function NoticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const currentStep = Math.max(
    0,
    steps.findIndex((step) =>
      step.paths.some((path) => pathname.startsWith(path)),
    ),
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <StepNavbar
        steps={steps.map(({ key, label }) => ({ key, label }))}
        currentStep={currentStep}
      />

      <main className="flex flex-1 justify-center px-6 py-8 pb-28">
        <div className="w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
