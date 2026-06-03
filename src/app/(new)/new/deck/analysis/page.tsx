"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FeedbackSummary from "@/components/analysis/FeedbackSummary";
import SlideFeedback from "@/components/analysis/SlideFeedback";
import BottomChooseBar from "@/components/common/BottomChooseBar";
import { Icon } from "@iconify/react";
import { GetIrDeckDetail } from "@/apis/PitchApi";
import { GetIrDeckResponse } from "@/types/PitchType";

function IRAnalysisContent() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get("ir_deck_id");

  const [data, setData] = useState<GetIrDeckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const isFetching = useRef(false);

  const fetchData = useCallback(async () => {
    if (!deckId || isFetching.current) return;

    try {
      isFetching.current = true;
      const res = await GetIrDeckDetail(deckId);

      setData((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(res)) return prev;
        return res;
      });

      if (res.analysis_status !== "IN_PROGRESS") {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    } finally {
      isFetching.current = false;
    }
  }, [deckId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (data?.analysis_status === "IN_PROGRESS") {
      const interval = setInterval(() => {
        fetchData();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [data?.analysis_status, fetchData]);

  if (loading || data?.analysis_status === "IN_PROGRESS") {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Icon
          icon="mdi:loading"
          className="h-12 w-12 animate-spin text-blue-600"
        />
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">
            IR Deck을 분석하고 있습니다
          </p>
          <p className="mt-1 text-sm text-slate-500">
            잠시만 기다려 주세요 (약 30초~1분 소요)
          </p>
        </div>
      </div>
    );
  }

  if (data?.analysis_status === "FAILED") {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Icon
          icon="mdi:alert-circle-outline"
          className="h-12 w-12 text-red-500"
        />
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">
            분석에 실패했습니다
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {data.error_message || "파일을 분석할 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  if (!data || !data.deck_score || !data.presentation_guide) return null;

  return (
    <div className="w-full bg-[#F8F9FA] min-h-screen py-8">
      <div className="w-full mx-auto flex flex-col gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#111] mb-1">
            IR Deck 분석
          </h1>
          <p className="text-base text-gray-500">
            세션별 IR Deck 분석 및 개선 추이
          </p>
        </div>

        <div className="grid grid-cols-[1fr_260px] items-start">
          <div className="bg-white rounded-2xl border border-gray-100 p-7">
            <SlideFeedback type="deck" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="scale-90 origin-top">
              <FeedbackSummary data={data.deck_score} />
            </div>
          </div>
        </div>

        {data.criteria_scores && data.criteria_scores.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 w-full">
            <h2 className="text-[20px] font-semibold mb-4">
              공고문 기준 평가 결과
            </h2>

            <div className="grid grid-cols-[1.7fr_1px_1.2fr] gap-5">
              <div className="flex flex-col gap-3">
                {data.criteria_scores.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      setExpandedIdx(expandedIdx === idx ? null : idx)
                    }
                    className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-5 min-h-[110px] flex flex-col justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <p
                      className={`text-[15px] text-[#111827] leading-5 mb-2 ${expandedIdx === idx ? "" : "line-clamp-3"}`}
                    >
                      {item.pitchcoach_interpretation}
                    </p>
                    <p className="text-[14px] text-[#2563EB] font-medium">
                      → {item.ir_guide}
                    </p>
                  </div>
                ))}
              </div>

              <div className="w-full bg-gray-200" />

              <div className="flex flex-col gap-1.5">
                {data.criteria_scores.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      setExpandedIdx(expandedIdx === idx ? null : idx)
                    }
                    className="flex gap-5 items-start px-3 py-5 min-h-[105px] cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="text-[#2563EB] text-[32px] font-semibold w-[60px] flex items-center justify-center">
                      {item.score}
                    </div>
                    <p
                      className={`text-[15px] text-[#374151] leading-6 ${expandedIdx === idx ? "" : "line-clamp-3"}`}
                    >
                      {item.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-7 w-full">
          <h2 className="text-[20px] font-semibold mb-2">발표 가이드</h2>
          <p className="text-base text-gray-500 mb-5">
            공고 기준에 맞춘 발표 흐름과 강조 포인트입니다
          </p>

          <div className="bg-[#FEF9C3] rounded-2xl px-7 py-6 mb-5">
            <p className="text-[18px] font-semibold mb-4">
              강조해야 할 슬라이드
            </p>

            <div className="grid grid-cols-2 gap-x-9 gap-y-4">
              {data.presentation_guide.emphasized_slides.map((s, i) => (
                <div key={i} className="text-[15px] text-[#374151] leading-7">
                  <span className="font-semibold mr-2">
                    슬라이드 {s.slide_number}
                  </span>
                  {s.reason}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-4">
            <div className="border border-gray-200 rounded-2xl p-8">
              <p className="text-[18px] font-semibold mb-5">발표 가이드</p>
              <ul className="space-y-4">
                {data.presentation_guide.guide.map((g, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-[#374151]">
                    <span className="text-[#2563EB] font-semibold w-5">
                      {i + 1}.
                    </span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-gray-200 rounded-2xl p-8">
              <p className="text-[18px] font-semibold mb-5">발표 시간 배분</p>
              <ul className="space-y-4">
                {data.presentation_guide.time_allocation.map((t, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-[#374151]">
                    <span className="text-[#2563EB] font-semibold w-5">
                      {i + 1}.
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <BottomChooseBar type="voice" pitchId={data?.pitch_id} />
    </div>
  );
}

export default function IRAnalysisPage() {
  return (
    <Suspense>
      <IRAnalysisContent />
    </Suspense>
  );
}
