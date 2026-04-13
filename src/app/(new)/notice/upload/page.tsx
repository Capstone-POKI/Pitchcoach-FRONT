"use client";

import { useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BottomNextBar from "@/components/common/BottomNextBar";
import { Icon } from "@iconify/react";
import { PostNoticeAnalyze } from "@/apis/PitchApi";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const pitchId = searchParams.get("pitch_id");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleNext = async () => {
    if (!file || !pitchId) return;

    try {
      setLoading(true);
      const result = await PostNoticeAnalyze(pitchId, file);
      router.push(`/notice/analysis?pitch_id=${pitchId}&notice_id=${result.notice_id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || "파일 업로드 및 분석 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">
            공고문 PDF 업로드
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            공고문 PDF 파일을 업로드해주세요
          </p>

          <div
            onClick={() => !loading && inputRef.current?.click()}
            className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition hover:border-blue-600 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Icon
                icon={loading ? "mdi:loading" : "mdi:upload"}
                className={`h-6 w-6 text-blue-600 ${loading ? "animate-spin" : ""}`}
              />
            </div>

            {!file ? (
              <>
                <p className="text-sm font-medium text-slate-700">
                  클릭하여 파일 업로드
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  PDF 파일 (최대 10MB)
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-700">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <BottomNextBar disabled={!file || loading} onClick={handleNext} />
    </>
  );
}
