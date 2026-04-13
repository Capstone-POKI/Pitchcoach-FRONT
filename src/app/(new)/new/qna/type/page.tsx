"use client";

import React, { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import BottomNextBar from "@/components/common/BottomNextBar";
import { updatePitchQAMode } from "@/apis/PitchApi";

export default function QnATrainingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pitchId = searchParams.get("pitch_id");

  const [selectedOption, setSelectedOption] = useState<
    "GUIDE_ONLY" | "REALTIME" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!selectedOption || !pitchId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await updatePitchQAMode(pitchId, selectedOption);
      if (res) {
        const nextPath =
          selectedOption === "GUIDE_ONLY"
            ? "/new/qna/list"
            : "/new/qna/practice";
        router.push(`${nextPath}?pitch_id=${pitchId}`);
      }
    } catch (error) {
      console.error(error);
      alert("훈련 모드 설정 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  }, [selectedOption, pitchId, isSubmitting, router]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center pb-40">
      <div className="w-full max-w-[900px] px-3 flex-grow flex flex-col justify-center">
        <div className="w-full bg-white rounded-[32px] border-1 border-gray-200 p-10">
          <div className="mb-6">
            <h1 className="text-[26px] font-bold text-[#111] mb-1">Q&A 훈련</h1>
            <p className="text-[#666] text-base">
              AI가 생성한 예상 질문으로 Q&A를 준비하세요
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => setSelectedOption("GUIDE_ONLY")}
              disabled={isSubmitting}
              className={`flex flex-col items-start p-8 rounded-[24px] border-2 transition-all text-left
                ${
                  selectedOption === "GUIDE_ONLY"
                    ? "border-[#3B82F6] bg-[#F0F7FF]"
                    : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
                }`}
            >
              <div
                className={`p-3 rounded-xl mb-6 ${selectedOption === "GUIDE_ONLY" ? "bg-[#3B82F6] text-white" : "bg-[#EFF4FF] text-[#3B82F6]"}`}
              >
                <Icon icon="mdi:file-document-outline" className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#111] mb-2">
                질문만 보기
              </h3>
              <p className="text-[#888] text-sm leading-relaxed">
                예상 질문과 답변 가이드를 확인하세요
              </p>
            </button>

            <button
              onClick={() => setSelectedOption("REALTIME")}
              disabled={isSubmitting}
              className={`flex flex-col items-start p-8 rounded-[24px] border-2 transition-all text-left
                ${
                  selectedOption === "REALTIME"
                    ? "border-[#3B82F6] bg-[#F0F7FF]"
                    : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
                }`}
            >
              <div
                className={`p-3 rounded-xl mb-6 ${selectedOption === "REALTIME" ? "bg-[#3B82F6] text-white" : "bg-[#EFF4FF] text-[#3B82F6]"}`}
              >
                <Icon icon="mdi:microphone-outline" className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#111] mb-2">
                실시간 연습하기
              </h3>
              <p className="text-[#888] text-sm leading-relaxed">
                실제 피칭 질문에 답변하며 연습하세요
              </p>
            </button>
          </div>
        </div>
      </div>

      <BottomNextBar
        disabled={!selectedOption || isSubmitting}
        onClick={handleSubmit}
      />
    </div>
  );
}
