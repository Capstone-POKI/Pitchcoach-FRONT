"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import BottomNextBar from "@/components/common/BottomNextBar";
import { getPitchQuestions} from "@/apis/PitchApi";
import { GetQAListResponse } from "@/types/QNAAnalysisType";

export default function QnAListPage() {
  const searchParams = useSearchParams();
  const pitchId = searchParams.get("pitch_id");

  const [data, setData] = useState<GetQAListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async (regenerate = false) => {
    if (!pitchId) return;
    try {
      setLoading(true);
      const res = await getPitchQuestions(pitchId, regenerate);
      setData(res);
    } catch (error) {
      console.error("Failed to fetch QnA:", error);
    } finally {
      setLoading(false);
    }
  }, [pitchId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const mode = data?.qa_training.mode || "GUIDE_ONLY";

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center pt-8 pb-24">
      <div className="w-full max-w-[920px] px-4">
        <div className="w-full bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 p-6">
          <div className="mb-5 ml-1 flex justify-between items-end">
            <div>
              <h1 className="text-[20px] font-bold text-[#111] mb-1">
                {mode === "REALTIME" ? "Q&A 답변 피드백" : "예상 질문 목록"}
              </h1>
              <p className="text-[#666] text-[13px]">
                {mode === "REALTIME" 
                  ? "투자자가 물어볼 가능성이 높은 질문과 나의 답변에 대한 피드백입니다"
                  : "투자자가 물어볼 가능성이 높은 질문들입니다"}
              </p>
            </div>
            <button 
              onClick={() => fetchQuestions(true)}
              className="text-[12px] text-blue-600 flex items-center gap-1 hover:underline mb-1"
            >
              <Icon icon="mdi:refresh" /> 가이드 재생성
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-blue-600" />
                <div className="text-gray-400 text-sm font-medium">질문을 분석하고 있습니다...</div>
              </div>
            ) : data?.questions && data.questions.length > 0 ? (
              data.questions.map((item, index) => (
                <div key={item.question_id}>
                  {mode === "GUIDE_ONLY" ? (
                    <div className="p-4 rounded-[16px] border border-gray-50 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                      <div className="flex items-start gap-2.5 mb-2.5">
                        <div className="bg-[#3B82F6] text-white text-[9px] font-black w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                          Q{index + 1}
                        </div>
                        <h3 className="text-[15.5px] font-bold text-[#111] leading-snug">
                          {item.question}
                        </h3>
                      </div>
                      <div className="bg-[#F6F9FF] rounded-xl p-3.5 ml-7">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon icon="mdi:comment-text-outline" className="w-3.5 h-3.5 text-[#3B82F6]" />
                          <span className="text-[#3B82F6] font-bold text-[11.5px]">답변 가이드</span>
                        </div>
                        <p className="text-[#555] text-[13px] leading-relaxed">
                          {item.answer_guide}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* --- REALTIME UI --- */
                    <div className="p-5 rounded-[18px] border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                      <div className="flex items-start gap-2.5 mb-4">
                        <div className="bg-[#3B82F6] text-white text-[10px] font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          Q{index + 1}
                        </div>
                        <h3 className="text-[18px] font-bold text-[#111827] leading-snug">
                          {item.question}
                        </h3>
                      </div>
                      {/* 실제 답변 데이터 (서버 응답에 user_answer 등이 있다면 반영) */}
                      <div className="bg-[#F4F7FB] rounded-[14px] px-5 py-4 ml-9 mb-3">
                        <div className="text-[14px] font-semibold text-[#111827] mb-2">A. 나의 답변</div>
                        <p className="text-[14px] leading-7 text-[#4B5563] whitespace-pre-line">
                          {/* 실시간 모드일 때 사용자가 녹음했던 답변 텍스트 노출 */}
                          {"사용자 답변 데이터가 이곳에 표시됩니다."}
                        </p>
                      </div>
                      {/* 피드백 혹은 가이드 */}
                      <div className="bg-[#F4F7FB] rounded-[14px] px-5 py-4 ml-9">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon icon="mdi:comment-text-outline" className="w-4 h-4 text-[#2563EB]" />
                          <span className="text-[14px] font-semibold text-[#111827]">답변 피드백</span>
                        </div>
                        <p className="text-[14px] leading-7 text-[#4B5563] whitespace-pre-line">
                          {item.answer_guide}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-gray-400 text-sm">생성된 질문이 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      <BottomNextBar 
        disabled={loading} 
        nextHref={`/new/deck/analysis?pitch_id=${pitchId}`} 
      />
    </div>
  );
}