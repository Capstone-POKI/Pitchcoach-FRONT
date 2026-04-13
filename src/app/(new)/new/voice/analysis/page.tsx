"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import FeedbackSummary from "@/components/analysis/FeedbackSummary";
import SlideFeedback from "@/components/analysis/SlideFeedback";
import BottomNextBar from "@/components/common/BottomNextBar";
import { GetVoiceAnalysisResponse } from "@/types/VoiceAnalysisType";
import { getVoiceAnalysisDetail } from "@/apis/PitchApi";
import { Icon } from "@iconify/react";

export default function VoiceAnalysisPage() {
  const searchParams = useSearchParams();
  const voiceId = searchParams.get("voice_id");

  const [data, setData] = useState<GetVoiceAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!voiceId) return;
    try {
      const res = await getVoiceAnalysisDetail(voiceId);
      setData(res);
      if (res.analysis_status !== "IN_PROGRESS") {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [voiceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (data?.analysis_status === "IN_PROGRESS") {
      const interval = setInterval(() => {
        fetchData();
      }, 5000);
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
            음성을 분석하고 있습니다
          </p>
          <p className="mt-1 text-sm text-slate-500">
            잠시만 기다려 주세요 (약 1분 소요)
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
            {data.error_message || "파일을 처리할 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const wpm = data.wpm || 0;
  const getSpeedPercent = (val: number) => {
    if (val <= 120) return 20;
    if (val <= 170) return 50;
    return 80;
  };
  const percent = getSpeedPercent(wpm);

  return (
    <div className="w-full bg-[#F8F9FA] min-h-screen px-6 py-8">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#111] mb-1">
            음성 분석 결과
          </h1>
          <p className="text-sm text-gray-500">발표 분석이 완료되었습니다</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#E6EDF7] rounded-xl p-6 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-1">발표 시간</p>
            <p className="text-[24px] font-bold text-[#2563EB]">
              {data.audio_duration_display}
            </p>
          </div>
          <div className="bg-[#E6F4EA] rounded-xl p-6 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-1">발표 속도</p>
            <p className="text-[24px] font-bold text-[#16A34A]">
              {data.wpm} WPM
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-6">
          <div className="flex flex-col gap-4">
            <div className="bg-white h-fit rounded-2xl border border-gray-100 p-6">
              <h2 className="text-[16px] font-semibold mb-4">세부 기준 점수</h2>
              <div className="grid grid-cols-2 gap-4">
                {data.detail_scores?.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between mb-2 text-sm">
                      <span>{item.category}</span>
                      <span className="text-blue-600 font-semibold">
                        {item.score}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-[18px] font-semibold mb-5">
                음성 전달력 분석
              </h2>
              <div className="bg-[#EAF7EF] rounded-xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[14px] text-gray-700 font-medium">
                    말하기 속도
                  </span>
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-[22px] font-bold text-[#16A34A]">
                    {data.delivery_analysis?.speaking_speed.metric_value}
                  </span>
                  <span className="text-[14px] text-gray-500 mb-1">
                    ({data.delivery_analysis?.speaking_speed.metric_label})
                  </span>
                </div>
                <div className="relative h-3 rounded-full overflow-hidden flex">
                  <div className="bg-gray-300 w-[33%]" />
                  <div className="bg-green-500 w-[34%]" />
                  <div className="bg-orange-400 w-[33%]" />
                  <div
                    className="absolute top-[-3px] w-[8px] h-[18px] bg-green-700 rounded-full border-2 border-white shadow-sm"
                    style={{ left: `calc(${percent}% - 4px)` }}
                  />
                </div>
                <div className="flex justify-between text-[12px] text-gray-500 mt-2">
                  <span>느림</span>
                  <span>적정</span>
                  <span>빠름</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {data.delivery_analysis?.items.map((item, idx) => {
                  const isOpen = expandedIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl p-4 bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          icon="mdi:chat-processing-outline"
                          className="w-5 h-5 text-gray-400 mt-1"
                        />
                        <div className="flex-1">
                          <p className="text-[14px] font-semibold mb-1">
                            {item.category}
                          </p>
                          <p
                            className={`text-[13px] text-gray-600 leading-6 ${isOpen ? "" : "line-clamp-2"}`}
                          >
                            {item.feedback}
                          </p>
                          <button
                            onClick={() =>
                              setExpandedIndex(isOpen ? null : idx)
                            }
                            className="text-[12px] text-blue-500 mt-1 font-medium"
                          >
                            {isOpen ? "접기" : "더보기"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <FeedbackSummary
            data={{
              total_score: data.total_score,
              structure_summary: data.structure_summary,
              strengths: data.overall_strengths,
              improvements: data.overall_improvements,
            }}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <SlideFeedback type="voice" />
        </div>
      </div>
      <BottomNextBar nextHref={`/new/qna/type?pitch_id=${data.pitch_id}`} />
    </div>
  );
}
