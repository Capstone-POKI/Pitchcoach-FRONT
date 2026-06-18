"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import BottomNextBar from "@/components/common/BottomNextBar";
import { getAnswerFeedback } from "@/apis/PitchApi";
import { GetAnswerFeedbackResponse, QAQuestion } from "@/types/QNAAnalysisType";

interface FeedbackItem {
  question: QAQuestion;
  feedback: GetAnswerFeedbackResponse;
}

function QnAFeedbackContent() {
  const searchParams = useSearchParams();
  const pitchId = searchParams.get("pitch_id");

  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!pitchId) {
        setError("피드백 데이터를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      const rawQuestions = sessionStorage.getItem(`qa_questions_${pitchId}`);
      const rawAnswerIds = sessionStorage.getItem(`qa_answer_ids_${pitchId}`);
      const questions: QAQuestion[] = rawQuestions ? JSON.parse(rawQuestions) : [];
      const answerIds: string[] = rawAnswerIds ? JSON.parse(rawAnswerIds) : [];

      if (answerIds.length === 0) {
        setError("피드백 데이터를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      try {
        const feedbacks = await Promise.all(answerIds.map((id) => getAnswerFeedback(id)));
        setItems(feedbacks.map((feedback, i) => ({ question: questions[i], feedback })));
      } catch {
        setError("피드백을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [pitchId]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center pt-8 pb-24">
      <div className="w-full max-w-[920px] px-4">
        <div className="w-full bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 p-6">
          <div className="mb-5 ml-1">
            <h1 className="text-[20px] font-bold text-[#111] mb-1">
              Q&A 답변 피드백
            </h1>
            <p className="text-[#666] text-[13px]">
              실시간 연습에서 제출한 답변과 AI 피드백입니다
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Icon
                  icon="mdi:loading"
                  className="w-8 h-8 animate-spin text-blue-600"
                />
                <p className="text-gray-400 text-sm">
                  피드백을 불러오고 있습니다...
                </p>
              </div>
            ) : error ? (
              <div className="py-20 text-center text-gray-400 text-sm">
                {error}
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.feedback.answer_id}
                  className="p-5 rounded-[18px] border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                >
                  {/* 질문 */}
                  <div className="flex items-start gap-2.5 mb-4">
                    <div className="bg-[#3B82F6] text-white text-[10px] font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      Q{index + 1}
                    </div>
                    <h3 className="text-[18px] font-bold text-[#111827] leading-snug">
                      {item.question.question}
                    </h3>
                  </div>

                  {/* 나의 답변 */}
                  <div className="bg-[#F4F7FB] rounded-[14px] px-5 py-4 ml-9 mb-3">
                    <div className="text-[14px] font-semibold text-[#111827] mb-2">
                      A. 나의 답변
                    </div>
                    <p className="text-[14px] leading-7 text-[#4B5563] whitespace-pre-line">
                      {item.feedback.transcription}
                    </p>
                  </div>

                  {/* 피드백 */}
                  <div className="bg-[#F4F7FB] rounded-[14px] px-5 py-4 ml-9">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon
                        icon="mdi:comment-text-outline"
                        className="w-4 h-4 text-[#2563EB]"
                      />
                      <span className="text-[14px] font-semibold text-[#111827]">
                        답변 피드백
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon
                            icon="mdi:check-circle-outline"
                            className="w-4 h-4 text-green-500"
                          />
                          <span className="text-[13px] font-semibold text-green-700">
                            강점
                          </span>
                        </div>
                        <p className="text-[13px] leading-6 text-[#4B5563] whitespace-pre-line pl-5">
                          {item.feedback.strengths}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon
                            icon="mdi:alert-circle-outline"
                            className="w-4 h-4 text-amber-500"
                          />
                          <span className="text-[13px] font-semibold text-amber-700">
                            보완점
                          </span>
                        </div>
                        <p className="text-[13px] leading-6 text-[#4B5563] whitespace-pre-line pl-5">
                          {item.feedback.weaknesses}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNextBar
        disabled={loading}
        nextHref={`/new/report?pitch_id=${pitchId}`}
      />
    </div>
  );
}

export default function QnAFeedbackPage() {
  return (
    <Suspense>
      <QnAFeedbackContent />
    </Suspense>
  );
}
