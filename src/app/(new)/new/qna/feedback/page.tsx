"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import BottomNextBar from "@/components/common/BottomNextBar";

interface QnAItem {
  id: number;
  question: string;
  answer: string;
  feedback: string;
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
            answer:
              "저희 솔루션은 단순히 발표 내용을 녹음하고 텍스트로 변환하는 수준을 넘어, IR Deck 내용과 발표 음성을 함께 분석해 투자자 관점의 예상 질문과 답변 피드백까지 제공합니다. 기존 발표 코칭 서비스가 음성 전달력이나 스크립트 첨삭 중 하나에 집중하는 반면, 저희는 문서·음성·질의응답을 통합 분석하여 실제 피칭 상황에 가까운 피드백을 제공한다는 점에서 차별화됩니다.",
            feedback:
              "차별화 포인트는 잘 드러나지만, 경쟁사 대비 어떤 기능이 구체적으로 부족한지 또는 자사만의 정량적 우위가 무엇인지 한 문장 정도 더 보강하면 설득력이 높아집니다.",
          },
          {
            id: 2,
            question: "현재 고객 확보 현황과 향후 확장 계획은 어떻게 되나요?",
            answer:
              "현재는 초기 검증 단계로, 예비 창업자와 학생 창업팀을 중심으로 파일럿 테스트를 진행하고 있습니다. 향후에는 창업지원기관, 액셀러레이터, 대학 창업 교육 프로그램과 연계해 B2B2C 형태로 확장하고, 이후 스타트업 액셀러레이팅 시장 전반으로 확장할 계획입니다.",
            feedback:
              "확장 방향은 자연스럽지만, 현재 검증 규모나 파일럿 참여 수처럼 구체적인 숫자가 있으면 신뢰도가 더 높아집니다.",
          },
          {
            id: 3,
            question: "초기 자금은 어떻게 사용할 계획인가요?",
            answer:
              "초기 자금은 우선 AI 분석 기능 고도화와 서비스 안정화에 가장 많이 투입할 계획입니다. 구체적으로는 AI 모델 연동 및 서버 인프라 구축에 약 50%, 사용자 확보를 위한 마케팅과 실증 운영에 30%, 나머지 20%는 UI/UX 개선과 운영 인력 확보에 배분할 예정입니다.",
            feedback:
              "예산 배분은 명확합니다. 다만 각 항목이 왜 필요한지, 특히 모델 고도화와 서버 인프라가 서비스 경쟁력과 어떻게 연결되는지 한 번 더 짚어주면 좋습니다.",
          },
          {
            id: 4,
            question:
              "시장 진입 장벽이 낮아 보이는데, 경쟁이 심화되면 어떻게 대응하시겠습니까?",
            answer:
              "단순 Q&A 생성 기능 자체는 진입 장벽이 낮을 수 있지만, 저희는 공고문·IR Deck·발표 음성을 통합 분석해 실제 투자자 피드백 흐름을 반영하는 구조를 구축하고 있습니다. 또한 서비스 사용 과정에서 축적되는 발표 데이터와 피드백 데이터는 점차 모델 성능과 추천 정확도를 높이는 자산이 되어 후발주자와의 격차를 만들 수 있습니다.",
            feedback:
              "좋은 방향입니다. 데이터 축적이 경쟁 우위라는 점은 설득력 있으니, 여기에 네트워크 효과나 기관 파트너십 같은 요소까지 더하면 더 강해집니다.",
          },
          {
            id: 5,
            question: "향후 3년간 매출 목표와 달성 근거는 무엇인가요?",
            answer:
              "1년 차에는 파일럿과 초기 기관 계약을 중심으로 시장 적합성을 검증하고, 2년 차부터는 창업지원기관과 액셀러레이터 대상 B2B 계약을 확대해 안정적인 매출 기반을 만들 계획입니다. 3년 차에는 누적 데이터와 서비스 고도화를 바탕으로 정기 구독형 모델로 전환하여 반복 매출 구조를 강화하는 것을 목표로 하고 있습니다.",
            feedback:
              "방향성은 적절하지만, 연도별 예상 고객 수나 계약 단가 등 매출 추정의 계산 근거가 들어가면 훨씬 투자자 친화적인 답변이 됩니다.",
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
              Q&A 답변 피드백
            </h1>
            <p className="text-[#666] text-[13px]">
              투자자가 물어볼 가능성이 높은 질문과 답변 피드백입니다
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="py-10 text-center text-gray-400 text-xs font-medium">
                질문을 불러오고 있습니다...
              </div>
            ) : (
              qnaList.map((item, index) => (
                <div
                  key={item.id}
                  className="p-5 rounded-[18px] border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                >
                  {/* 질문 */}
                  <div className="flex items-start gap-2.5 mb-4">
                    <div className="bg-[#3B82F6] text-white text-[10px] font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      Q{index + 1}
                    </div>
                    <h3 className="text-[18px] font-bold text-[#111827] leading-snug">
                      {item.question}
                    </h3>
                  </div>

                  {/* 답변 */}
                  <div className="bg-[#F4F7FB] rounded-[14px] px-5 py-4 ml-9 mb-3">
                    <div className="text-[14px] font-semibold text-[#111827] mb-2">
                      A. 답변
                    </div>
                    <p className="text-[14px] leading-7 text-[#4B5563] whitespace-pre-line">
                      {item.answer}
                    </p>
                  </div>

                  {/* 피드백 */}
                  <div className="bg-[#F4F7FB] rounded-[14px] px-5 py-4 ml-9">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon
                        icon="mdi:comment-text-outline"
                        className="w-4 h-4 text-[#2563EB]"
                      />
                      <span className="text-[14px] font-semibold text-[#111827]">
                        답변 피드백
                      </span>
                    </div>
                    <p className="text-[14px] leading-7 text-[#4B5563] whitespace-pre-line">
                      {item.feedback}
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
