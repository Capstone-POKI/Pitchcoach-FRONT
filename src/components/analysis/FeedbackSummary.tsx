"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { FeedbackData } from "@/types/IRAnalysisType";

export default function FeedbackSummary({ data }: { data: FeedbackData }) {
  const [openSummary, setOpenSummary] = useState(true);
  const [openStrengths, setOpenStrengths] = useState(false);
  const [openImprovements, setOpenImprovements] = useState(false);

  const percentage = data.total_score;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 flex flex-col items-center">
        <p className="text-sm opacity-80 mb-1">종합 점수</p>
        <p className="text-3xl font-bold">{data.total_score}점</p>

        {/* 간단한 원형 UI */}
        <div className="mt-4 w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center text-sm">
          {percentage}%
        </div>
      </div>

      {/* ✅ 피드백 요약 (드롭다운) */}
      <div className="bg-gray-100 rounded-xl p-4">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setOpenSummary((prev) => !prev)}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Icon icon="mdi:comment-text-outline" />
            피드백 요약
          </div>
          <Icon
            icon="mdi:chevron-down"
            className={`transition-transform ${openSummary ? "rotate-180" : ""}`}
          />
        </div>
        <div
          className={`mt-2 overflow-hidden transition-all ${openSummary ? "max-h-[1000px]" : "max-h-[60px]"}`}
        >
          <p
            className={`text-sm text-gray-600 leading-relaxed ${openSummary ? "" : "line-clamp-3"}`}
          >
            {data.structure_summary}
          </p>
        </div>
      </div>

      {/* ✅ 강점 (드롭다운) */}
      <div className="bg-green-50 rounded-xl p-4">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setOpenStrengths((prev) => !prev)}
        >
          <div className="flex items-center gap-2 text-green-700 font-semibold">
            <Icon icon="mdi:check-circle" />
            강점
          </div>
          <Icon
            icon="mdi:chevron-down"
            className={`transition-transform text-green-700 ${openStrengths ? "rotate-180" : ""}`}
          />
        </div>
        <div
          className={`mt-2 overflow-hidden transition-all ${openStrengths ? "max-h-[1000px]" : "max-h-[60px]"}`}
        >
          <ul
            className={`list-disc ml-5 text-sm text-green-800 space-y-1 ${openStrengths ? "" : "line-clamp-3"}`}
          >
            {data.strengths.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ✅ 개선점 (드롭다운) */}
      <div className="bg-orange-50 rounded-xl p-4">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setOpenImprovements((prev) => !prev)}
        >
          <div className="flex items-center gap-2 text-orange-600 font-semibold">
            <Icon icon="mdi:alert-circle" />
            개선점
          </div>
          <Icon
            icon="mdi:chevron-down"
            className={`transition-transform text-orange-600 ${openImprovements ? "rotate-180" : ""}`}
          />
        </div>
        <div
          className={`mt-2 overflow-hidden transition-all ${openImprovements ? "max-h-[1000px]" : "max-h-[60px]"}`}
        >
          <ul
            className={`list-disc ml-5 text-sm text-orange-800 space-y-1 ${openImprovements ? "" : "line-clamp-3"}`}
          >
            {data.improvements.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
