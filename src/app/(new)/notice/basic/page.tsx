"use client";

import { useState } from "react";
import BottomNextBar from "@/components/common/BottomNextBar";

const pitchTypes = [
  {
    id: "ELEVATOR",
    title: "엘리베이터 피치",
    desc: "짧고 간결한 3분 피치 (Deck 불필요)",
  },
  { id: "VC_DEMO", title: "VC 데모데이", desc: "투자자 대상 피치" },
  { id: "GOVERNMENT", title: "정부지원사업", desc: "정부·공공기관 지원사업" },
  { id: "COMPETITION", title: "창업경진대회", desc: "창업 경진대회 발표용" },
];

export default function Page() {
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [pitchTime, setPitchTime] = useState("");

  const isValid =
    title.trim() !== "" && selectedType && pitchTime.trim() !== "";

  const nextUrl = `/notice/type?title=${encodeURIComponent(title)}&pitch_type=${selectedType}&duration_minutes=${pitchTime}`;

  return (
    <>
      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">기본 정보 입력</h1>
          <p className="mt-1 text-sm text-slate-500">
            IR 코칭을 위한 기본 정보를 입력해주세요
          </p>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Pitch 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2024 스타트업 경진대회"
              className="w-full rounded-md bg-gray-100 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Pitch 유형 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {pitchTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedType(item.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selectedType === item.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-blue-600"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Pitch 시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={pitchTime}
              onChange={(e) => setPitchTime(e.target.value)}
              placeholder="발표 시간을 분 단위로 입력하세요 (1~20분)"
              className="w-full rounded-md bg-gray-100 px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* nextHref에 쿼리 스트링이 포함된 URL을 전달 */}
      <BottomNextBar disabled={!isValid} nextHref={nextUrl} />
    </>
  );
}
