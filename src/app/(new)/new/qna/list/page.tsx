"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import BottomNextBar from "@/components/common/BottomNextBar";

interface QnAItem {
  id: number;
  question: string;
  guide: string;
}

export default function QnAListPage() {
  const [qnaList, setQnaList] = useState<QnAItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const mockData: QnAItem[] = [
          {
            id: 1,
            question: "귀사의 솔루션이 기존 경쟁사 제품과 어떻게 다른가요?",
            guide:
              "차별화 포인트를 명확히 하고, 기술적/비즈니스적 우위를 구체적 데이터와 함께 설명하세요.",
          },
          {
            id: 2,
            question: "현재 고객 확보 현황과 향후 확장 계획은 어떻게 되나요?",
            guide:
              "구체적인 수치(MAU, 전환율 등)와 함께 성장 전략을 단계별로 설명하세요.",
          },
          {
            id: 3,
            question: "초기 자금은 어떻게 사용할 계획인가요?",
            guide:
              "R&D, 마케팅, 인력 등 주요 분야별 예산 배분을 퍼센티지와 함께 설명하세요.",
          },
          {
            id: 4,
            question:
              "시장 진입 장벽이 낮아 보이는데, 경쟁이 심화되면 어떻게 대응하시겠습니까?",
            guide:
              "지속 가능한 경쟁 우위(네트워크 효과, 데이터, 기술 특허 등)를 설명하세요.",
          },
          {
            id: 5,
            question: "향후 3년간 매출 목표와 달성 근거는 무엇인가요?",
            guide:
              "시장 조사 데이터, 파일럿 테스트 결과 등 객관적 근거를 들어 설명하세요.",
          },
        ];
        setQnaList(mockData);
      } catch (error) {
        console.error("Failed to fetch QnA:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center pt-8 pb-24">
      <div className="w-full max-w-[920px] px-4">
        <div className="w-full bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 p-6">
          <div className="mb-5 ml-1">
            <h1 className="text-[20px] font-bold text-[#111] mb-1">
              예상 질문 목록
            </h1>
            <p className="text-[#666] text-[13px]">
              투자자가 물어볼 가능성이 높은 질문들입니다
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="py-10 text-center text-gray-400 text-xs font-medium">
                질문을 불러오고 있습니다...
              </div>
            ) : (
              qnaList.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 rounded-[16px] border border-gray-50 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                >
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
                      <Icon
                        icon="mdi:comment-text-outline"
                        className="w-3.5 h-3.5 text-[#3B82F6]"
                      />
                      <span className="text-[#3B82F6] font-bold text-[11.5px]">
                        답변 가이드
                      </span>
                    </div>
                    <p className="text-[#555] text-[13px] leading-relaxed">
                      {item.guide}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNextBar disabled={false} nextHref="/new/deck/analysis" />
    </div>
  );
}
