"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BottomNextBar from "@/components/common/BottomNextBar";
import { PostPitch } from "@/apis/PitchApi";

const noticeOptions = [
  {
    id: "PDF",
    title: "공고문 PDF 파일이 있습니다",
    desc: "PDF 파일을 업로드하여 자동으로 분석합니다",
  },
  {
    id: "MANUAL",
    title: "공고문이 있지만, PDF 파일 형태가 아닙니다",
    desc: "공고문 내용을 직접 입력해 주세요",
  },
  {
    id: "NONE",
    title: "공고가 없는 피치입니다",
    desc: "공고 분석을 생략하고 IR Deck 분석으로 이동합니다",
  },
];

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);

  const title = searchParams.get("title") || "";
  const pitch_type = searchParams.get("pitch_type") as any;
  const duration_minutes = Number(searchParams.get("duration_minutes"));

  const handleNext = async () => {
    if (!selected) return;

    try {
      const result = await PostPitch({
        title,
        pitch_type,
        duration_minutes,
        notice_type: selected as any,
      });

      const pitchId = result.pitch_id;

      if (selected === "PDF") {
        router.push(`/notice/upload?pitch_id=${pitchId}`);
      } else if (selected === "MANUAL") {
        router.push(`/notice/analysis?pitch_id=${pitchId}`);
      } else {
        router.push(`/new/deck/upload?pitch_id=${pitchId}`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "피칭 생성 실패");
    }
  };

  return (
    <>
      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">공고 유무 확인</h1>
          <p className="mt-1 text-sm text-slate-500">
            공고문 업로드 또는 직접 입력을 통해, 해당 공고에 최적화된 맞춤
            코칭을 경험해보세요.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            {noticeOptions.map((option) => {
              const isSelected = selected === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelected(option.id)}
                  className={`rounded-lg border p-4 text-left transition
                    ${
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-blue-600"
                    }
                  `}
                >
                  <p
                    className={`text-sm font-semibold ${
                      isSelected ? "text-blue-600" : "text-slate-900"
                    }`}
                  >
                    {option.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{option.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNextBar disabled={!selected} onClick={handleNext} />
    </>
  );
}
