"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import BottomNextBar from "@/components/common/BottomNextBar";
import { generateReport, getReport } from "@/apis/PitchApi";
import { GenerateReportResponse } from "@/types/ReportType";

// ─── Static criteria (not from API) ──────────────────────────────────────────
const CRITERIA = [
  {
    title: "시장성",
    weight: 40,
    description:
      "시장 규모와 성장성, 타겟 고객의 명확성과 접근 가능성을 평가합니다. TAM-SAM-SOM 구조와 수익 구조가 뚜렷하고 현실적이어야 합니다.",
  },
  {
    title: "필요성 (pain point)",
    weight: 25,
    description:
      "해결하는 문제의 구체성과 긴박성, 고객의 pain point가 충분히 검증되었는지 평가합니다. 기존 대안 대비 차별점을 논리적으로 설명할 수 있어야 합니다.",
  },
  {
    title: "기술 혁신성",
    weight: 20,
    description:
      "제안된 솔루션 및 구현 기술의 독창성과 경쟁 우위 요소를 평가합니다. 기술 실현 가능성과 특허·지식재산 현황도 함께 고려됩니다.",
  },
  {
    title: "팀 핵심 역량",
    weight: 15,
    description:
      "창업팀의 경험·스킬셋·역할 분담이 사업 성공 가능성과 일치하는지 평가합니다. 도메인 전문성과 실행력을 중심으로 채점합니다.",
  },
];

// ─── Radar Chart ──────────────────────────────────────────────────────────────

function RadarChart({ data }: { data: { label: string; score: number }[] }) {
  const cx = 150,
    cy = 132,
    r = 88;
  const n = data.length;
  const levels = 4;

  const pt = (i: number, scale: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return { x: cx + r * scale * Math.cos(a), y: cy + r * scale * Math.sin(a) };
  };

  const polygon = data
    .map((d, i) => pt(i, d.score / 100))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const labelAnchors = (i: number): "middle" | "start" | "end" => {
    const a = (-90 + (360 * i) / n + 360) % 360;
    if (a > 200 && a < 340) return "end";
    if (a > 20 && a < 160) return "start";
    return "middle";
  };

  return (
    <svg width="300" height="265" viewBox="0 0 300 265">
      {Array.from({ length: levels }).map((_, lv) => {
        const s = (lv + 1) / levels;
        return (
          <polygon
            key={lv}
            points={Array.from({ length: n })
              .map((_, i) => {
                const p = pt(i, s);
                return `${p.x},${p.y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        );
      })}
      {Array.from({ length: n }).map((_, i) => {
        const p = pt(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        );
      })}
      <polygon
        points={polygon}
        fill="rgba(59,130,246,0.15)"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      {data.map((d, i) => {
        const p = pt(i, d.score / 100);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#3B82F6" />;
      })}
      {data.map((d, i) => {
        const p = pt(i, 1.32);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={labelAnchors(i)}
            dominantBaseline="middle"
            fontSize="10.5"
            fontWeight="600"
            fill="#374151"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 30,
    stroke = 6,
    circ = 2 * Math.PI * r;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={stroke}
      />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke="white"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={circ - (score / 100) * circ}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
      />
      <text
        x="40"
        y="44"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill="white"
      >
        {Math.round(score)}%
      </text>
    </svg>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon
            icon="mdi:file-chart-outline"
            className="w-8 h-8 text-blue-500"
          />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[18px] font-bold text-[#111] mb-1">
          AI 리포트를 생성하고 있습니다
        </p>
        <p className="text-[14px] text-gray-400">
          분석 결과를 종합하는 중입니다. 잠시만 기다려 주세요.
        </p>
      </div>
      <div className="flex gap-2 mt-2">
        {["IR Deck 분석", "음성 분석", "Q&A 분석", "종합 채점"].map(
          (step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
              <span className="text-[12px] text-gray-400">{step}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

// ─── Main Report View ─────────────────────────────────────────────────────────

function ReportView({
  data,
  pitchId,
}: {
  data: GenerateReportResponse;
  pitchId: string | null;
}) {
  const [openQna, setOpenQna] = useState<number | null>(null);

  const radar = data.radar_chart.labels.map((label, i) => ({
    label,
    score: data.radar_chart.scores[i],
  }));

  const coreElements = data.detail_scores.map((d) => ({
    label: d.title,
    score: d.score,
  }));

  const topicCoverage = data.bar_chart.items.map((item, i) => ({
    ...item,
    highlight: item.score >= 75,
    i,
  }));

  const qnaQuestions: { question: string }[] = (() => {
    if (typeof window === "undefined" || !pitchId) return [];
    const raw = sessionStorage.getItem(`qa_questions_${pitchId}`);
    return raw ? JSON.parse(raw) : [];
  })();

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="max-w-[960px] mx-auto px-4 py-8 flex flex-col gap-5">
        {/* Header */}
        <div>
          <h1 className="text-[24px] font-bold text-[#111]">최종 리포트</h1>
          <p className="text-[#888] text-sm mt-0.5">
            IR Deck, 피칭, Q&A 분석 결과 리포트
          </p>
        </div>

        {/* ── 종합 진단 ── */}
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
          <div className="grid grid-cols-[auto_1fr_210px] gap-6 items-center">
            <div className="flex flex-col items-center">
              <p className="text-[12px] font-semibold text-gray-400 mb-1 self-start">
                종합 진단
              </p>
              <RadarChart data={radar} />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-gray-400 mb-4">
                핵심 요소 준비도
              </p>
              <div className="flex flex-col gap-3.5">
                {coreElements.map((el, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[13px] mb-1.5">
                      <span className="text-gray-700 font-medium">
                        {el.label}
                      </span>
                      <span className="text-gray-500">
                        {Math.round(el.score)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3B82F6] rounded-full"
                        style={{ width: `${el.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] rounded-[18px] p-5 text-white flex flex-col items-center gap-3">
              <p className="text-[11px] opacity-70 tracking-wide">총합 점수</p>
              <p className="text-[44px] font-bold leading-none">
                {Math.round(data.final_score)}
                <span className="text-[18px] font-semibold ml-0.5">점</span>
              </p>
              <ScoreRing score={data.final_score} />
              <p className="text-[11px] opacity-75 text-center leading-relaxed">
                {data.summary}
              </p>
            </div>
          </div>
        </div>

        {/* ── Pitchcoach 채점 기준 (static) ── */}
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-[16px] font-bold text-[#111] mb-5">
            Pitchcoach 채점 기준
          </h2>
          <div className="grid grid-cols-[1fr_220px] gap-8">
            <div className="grid grid-cols-2 gap-4">
              {CRITERIA.map((c, i) => (
                <div key={i} className="bg-[#F8F9FA] rounded-[14px] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold text-white bg-[#3B82F6] px-2 py-0.5 rounded-full">
                      {c.weight}%
                    </span>
                    <span className="text-[13px] font-bold text-[#111]">
                      {c.title}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[12px] font-semibold text-gray-400 mb-3">
                추가 심사 기준
              </p>
              <div className="flex flex-col gap-3">
                {CRITERIA.map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[13px] mb-1.5">
                      <span className="text-gray-700">
                        {c.title.split(" ")[0]}
                      </span>
                      <span className="text-gray-500 font-medium">
                        {c.weight}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.weight * 2.5}%`,
                          background: [
                            "#3B82F6",
                            "#60A5FA",
                            "#93C5FD",
                            "#BFDBFE",
                          ][i],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Q&A 답변 피드백 (sessionStorage에서 질문 목록) ── */}
        {qnaQuestions.length > 0 && (
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
            <h2 className="text-[16px] font-bold text-[#111] mb-4">
              Q&A 답변 피드백
            </h2>
            <div className="flex flex-col gap-2">
              {qnaQuestions.map((item, i) => (
                <div
                  key={i}
                  className="rounded-[12px] border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenQna(openQna === i ? null : i)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-[14px] font-medium text-[#111] flex-1">
                      {item.question}
                    </span>
                    <Icon
                      icon={
                        openQna === i ? "mdi:chevron-up" : "mdi:chevron-down"
                      }
                      className="w-5 h-5 text-gray-400 shrink-0"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4 Score Cards ── */}
        <div className="grid grid-cols-2 gap-4">
          {data.detail_scores.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 pr-2">
                  <p className="text-[15px] font-bold text-[#111]">
                    {card.title}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>
                <span className="text-[30px] font-bold text-[#2563EB] leading-none shrink-0">
                  {Math.round(card.score)}
                  <span className="text-[14px]">점</span>
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full mb-4">
                <div
                  className="h-full bg-[#3B82F6] rounded-full"
                  style={{ width: `${card.score}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-bold text-green-600 mb-2">
                    강점
                  </p>
                  <ul className="flex flex-col gap-1">
                    {card.strengths.map((s, si) => (
                      <li
                        key={si}
                        className="text-[12px] text-gray-600 flex gap-1.5 leading-relaxed"
                      >
                        <span className="text-green-400 shrink-0 mt-0.5">
                          •
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-amber-600 mb-2">
                    개선점
                  </p>
                  <ul className="flex flex-col gap-1">
                    {card.improvements.map((s, si) => (
                      <li
                        key={si}
                        className="text-[12px] text-gray-600 flex gap-1.5 leading-relaxed"
                      >
                        <span className="text-amber-400 shrink-0 mt-0.5">
                          •
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 핵심 주제 커버리지 ── */}
        {topicCoverage.length > 0 && (
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
            <h2 className="text-[16px] font-bold text-[#111] mb-1">
              핵심 주제 커버리지
            </h2>
            <p className="text-[13px] text-gray-400 mb-5">
              각 주제별 발표에서 다뤄진 비중을 분석한 결과입니다
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                <div className="w-3 h-3 rounded-sm bg-[#3B82F6]" /> 우수
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                <div className="w-3 h-3 rounded-sm bg-[#F59E0B]" /> 보완 필요
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
              {topicCoverage.map((t, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <span className="text-gray-700 font-medium">{t.label}</span>
                    <span
                      className="font-semibold"
                      style={{ color: t.highlight ? "#3B82F6" : "#F59E0B" }}
                    >
                      {Math.round(t.score)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${t.score}%`,
                        background: t.highlight ? "#3B82F6" : "#F59E0B",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 개선 포인트 ── */}
        {data.improvement_points.length > 0 && (
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
            <h2 className="text-[16px] font-bold text-[#111] mb-4">
              개선 포인트
            </h2>
            <div className="flex flex-col gap-3">
              {data.improvement_points.map((pt, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[#3B82F6] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon icon="mdi:check" className="w-3 h-3 text-[#3B82F6]" />
                  </div>
                  <p className="text-[14px] text-gray-700 leading-relaxed">
                    {pt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNextBar disabled={false} nextHref="/home" />
    </div>
  );
}

// ─── Page Entry ───────────────────────────────────────────────────────────────

function ReportContent() {
  const searchParams = useSearchParams();
  const pitchId = searchParams.get("pitch_id");

  const [reportData, setReportData] = useState<GenerateReportResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pitchId) {
      setError("pitch_id가 없습니다. 올바른 경로로 접근해 주세요.");
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        // Step 1: 리포트 생성
        const generated = await generateReport(pitchId);

        // Step 2: report_id가 있으면 전체 리포트 조회
        if (generated.report_id) {
          try {
            const full = await getReport(generated.report_id);
            setReportData(full.ai_report ?? generated);
          } catch {
            setReportData(generated);
          }
        } else {
          setReportData(generated);
        }
      } catch {
        setError("리포트 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingScreen />;

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center gap-4">
        <Icon
          icon="mdi:alert-circle-outline"
          className="w-12 h-12 text-red-400"
        />
        <p className="text-[16px] font-semibold text-gray-700">
          {error ?? "데이터를 불러올 수 없습니다."}
        </p>
      </div>
    );
  }

  return <ReportView data={reportData} pitchId={pitchId} />;
}

export default function ReportPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ReportContent />
    </Suspense>
  );
}
