"use client";

import React, { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import BottomNextBar from "@/components/common/BottomNextBar";
import { uploadAndAnalyzeVoice } from "@/apis/PitchApi";
import { SlideTimestamp } from "@/types/VoiceAnalysisType";
import Image from "next/image";

function PitchRecordingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pitchId = searchParams.get("pitch_id");

  const [slides, setSlides] = useState<{ url: string; number: number }[]>([]);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [timestamps, setTimestamps] = useState<SlideTimestamp[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const savedSlides = sessionStorage.getItem("pitch_slides");
    if (savedSlides) {
      try {
        const parsed = JSON.parse(savedSlides);
        setTimeout(() => {
          setSlides(parsed);
        }, 0);
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  const totalSlides = slides.length > 0 ? slides.length : 1;

  const stopRecordingAndGetBlob = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(new Blob());
        return;
      }
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setRecordedBlob(audioBlob);
        resolve(audioBlob);
      };
      mediaRecorderRef.current.stop();
    });
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      const now = performance.now();
      setStartTime(now);
      setTimestamps([
        { slide_number: 1, start_timestamp: 0, end_timestamp: 0 },
      ]);
    } catch (err) {
      console.error(err);
      alert("마이크 권한이 필요합니다.");
    }
  };

  const handleRestart = () => {
    if (confirm("녹음을 처음부터 다시 시작하시겠습니까?")) {
      if (mediaRecorderRef.current && isRecording)
        mediaRecorderRef.current.stop();
      setRecordedBlob(null);
      setIsRecording(false);
      setIsPaused(false);
      setTimestamps([]);
      setStartTime(null);
      setCurrentSlide(1);
      startRecording();
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };
  const handleStopRecording = async () => {
    if (!isRecording || !mediaRecorderRef.current) return;

    const now = performance.now();
    const elapsed = parseFloat(((now - (startTime || now)) / 1000).toFixed(1));

    setTimestamps((prev) => {
      const updated = [...prev];
      if (updated[currentSlide - 1]) {
        updated[currentSlide - 1].end_timestamp = elapsed;
      }
      return updated;
    });

    const blob = await stopRecordingAndGetBlob();

    setRecordedBlob(blob);
    setIsRecording(false);
    setIsPaused(false);
  };

  const handleNextSlide = () => {
    if (currentSlide >= totalSlides || !startTime) return;
    const now = performance.now();
    const elapsed = parseFloat(((now - startTime) / 1000).toFixed(1));
    setTimestamps((prev) => {
      const updated = [...prev];
      updated[currentSlide - 1].end_timestamp = elapsed;
      updated.push({
        slide_number: currentSlide + 1,
        start_timestamp: elapsed,
        end_timestamp: elapsed,
      });
      return updated;
    });
    setCurrentSlide((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    console.log("1. handleSubmit 호출됨", { isSubmitting, pitchId });
    if (isSubmitting || !pitchId) {
      console.warn("2. 진입 컷됨", { isSubmitting, pitchId });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalBlob = recordedBlob;
      const finalTimestamps = [...timestamps];

      if (isRecording && mediaRecorderRef.current) {
        console.log("3. 녹음 중단 시도");
        const now = performance.now();
        const elapsed = parseFloat(
          ((now - (startTime || now)) / 1000).toFixed(1),
        );

        if (finalTimestamps[currentSlide - 1]) {
          finalTimestamps[currentSlide - 1].end_timestamp = elapsed;
        }

        finalBlob = await stopRecordingAndGetBlob();
        console.log("4. 녹음 중단 완료 및 Blob 획득", finalBlob);

        setIsRecording(false);
        setIsPaused(false);
      }

      console.log("5. 최종 Blob 체크", finalBlob?.size);
      if (!finalBlob || finalBlob.size === 0) {
        console.error("6. Blob 없음");
        setIsSubmitting(false);
        alert("녹음 데이터가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      console.log("7. API 전송 시작", { pitchId, finalTimestamps });

      console.log(
        "📊 slide_timestamps:",
        JSON.stringify(finalTimestamps, null, 2),
      );

      const res = await uploadAndAnalyzeVoice(
        pitchId,
        finalBlob,
        finalTimestamps,
      );

      console.log("8. API 응답 완료", res);

      if (res?.voice_analysis_id) {
        router.push(
          `/new/voice/analysis?pitch_id=${pitchId}&voice_id=${res.voice_analysis_id}`,
        );
        return;
      }
    } catch (error: unknown) {
      console.error("X. 에러 발생:", error);

      if (error instanceof Error) {
        const isTimeout =
          error.message.includes("timeout") ||
          (error as { code?: string }).code === "ECONNABORTED";

        if (isTimeout) {
          router.push(`/new/voice/analysis?pitch_id=${pitchId}`);
          return;
        }
      }

      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center pt-10 pb-32">
      <div className="w-full max-w-[1400px] px-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#111]">피칭 녹음</h1>
            <p className="text-[#666] text-base">
              슬라이드를 넘기면서 녹음을 진행하세요
            </p>
          </div>
          <div className="flex gap-3">
            {!isRecording && !recordedBlob ? (
              <button
                onClick={startRecording}
                className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition flex items-center gap-2 shadow-md"
              >
                <Icon icon="mdi:microphone" className="w-5 h-5" /> 녹음 시작
              </button>
            ) : (
              <>
                <button
                  onClick={handleRestart}
                  className="bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition"
                >
                  <Icon icon="mdi:refresh" className="w-5 h-5" /> 재시작
                </button>
                {isRecording && (
                  <>
                    <button
                      onClick={handlePauseResume}
                      className={`bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition ${isPaused ? "text-blue-600 border-blue-200" : ""}`}
                    >
                      <Icon
                        icon={isPaused ? "mdi:play" : "mdi:pause"}
                        className="w-5 h-5"
                      />
                      {isPaused ? "다시 시작" : "일시정지"}
                    </button>
                    <button
                      onClick={handleStopRecording}
                      className="bg-[#D33B4D] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition shadow-sm"
                    >
                      <Icon
                        icon="mdi:stop-circle-outline"
                        className="w-5 h-5"
                      />
                      녹음 완료
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="relative w-full bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8">
          {slides.length > 0 && (
            <div className="absolute top-3 right-14 text-[13px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full z-50">
              {currentSlide} / {totalSlides}
            </div>
          )}
          <div className="relative top-4 w-full aspect-[16/9] bg-[#F9FAFB] rounded-2xl overflow-hidden border border-gray-200">
            <div className="absolute inset-0 z-10">
              {slides.length > 0 ? (
                <Image
                  src={slides[currentSlide - 1].url}
                  alt={`Slide ${currentSlide}`}
                  fill
                  sizes="100vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <Icon
                    icon="mdi:image-off-outline"
                    className="w-12 h-12 text-gray-200"
                  />
                  <span className="text-gray-300 italic text-xl font-light">
                    슬라이드를 불러오고 있습니다...
                  </span>
                </div>
              )}
            </div>
            {slides.length > 0 && currentSlide < totalSlides && (
              <button
                onClick={handleNextSlide}
                className="absolute right-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all z-[100] shadow-2xl active:scale-95 border border-white/20"
              >
                <Icon icon="mdi:chevron-right" className="w-12 h-12" />
              </button>
            )}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
              {slides.length > 0 &&
                [...Array(totalSlides)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i + 1 ? "bg-[#3B82F6] w-8" : "bg-gray-200 w-2"}`}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNextBar
        disabled={!pitchId || !recordedBlob || isSubmitting}
        onClick={handleSubmit}
      />
    </div>
  );
}

export default function PitchRecordingPage() {
  return (
    <Suspense>
      <PitchRecordingContent />
    </Suspense>
  );
}
