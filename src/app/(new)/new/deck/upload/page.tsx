"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import BottomNextBar from "@/components/common/BottomNextBar";
import { PostIrDeckAnalyze } from "@/apis/PitchApi";

export default function IRDeckUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pitchId = searchParams.get("pitch_id");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleNext = async () => {
    if (!file || !pitchId) return;

    try {
      setLoading(true);
      const result = await PostIrDeckAnalyze(pitchId, file);
      router.push(
        `/new/deck/analysis?pitch_id=${pitchId}&ir_deck_id=${result.ir_deck_id}`,
      );
    } catch (error: unknown) {
      const errorMsg =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "";
      if (errorMsg.includes("limit")) {
        alert("파일 용량이 너무 큽니다. 10MB 이하의 PDF를 업로드해주세요.");
      } else {
        alert("IR Deck 업로드 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              IR Deck 업로드
            </h1>
            <p className="text-sm text-gray-500">
              IR 덱을 업로드하면 AI가 슬라이드 단위로 개선 포인트를 제시합니다.
            </p>
          </div>

          <label
            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-xl bg-white transition-colors cursor-pointer group ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="p-4 bg-blue-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Icon
                  icon={loading ? "mdi:loading" : "mdi:upload"}
                  className={`w-8 h-8 text-blue-500 ${loading ? "animate-spin" : ""}`}
                />
              </div>

              <p className="mb-1 text-lg font-semibold text-gray-900">
                {file ? file.name : "클릭하여 파일 업로드"}
              </p>
              <p className="text-sm text-gray-400">PDF 파일 (최대 10MB)</p>
            </div>

            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>
        </div>
      </div>

      <BottomNextBar disabled={!file || loading} onClick={handleNext} />
    </div>
  );
}
