"use client";

import React, { useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import BottomNextBar from "@/components/common/BottomNextBar";
import { uploadAndAnalyzeVoice } from "@/apis/PitchApi";
import { SlideTimestamp } from "@/types/VoiceAnalysisType";

export default function PitchRecordingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pitchId = searchParams.get("pitch_id");

  const [currentSlide, setCurrentSlide] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [timestamps, setTimestamps] = useState<SlideTimestamp[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const totalSlides = 5;

  const stopRecordingAndGetBlob = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) return;

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setRecordedBlob(audioBlob);
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
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
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setRecordedBlob(null);
    setIsRecording(false);
    setIsPaused(false);
    setTimestamps([]);
    setStartTime(null);
    setCurrentSlide(1);
    startRecording();
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

  const stopRecording = async () => {
    if (mediaRecorderRef.current && startTime) {
      const now = performance.now();
      const elapsed = parseFloat(((now - startTime) / 1000).toFixed(1));

      setTimestamps((prev) => {
        const updated = [...prev];
        if (updated[currentSlide - 1]) {
          updated[currentSlide - 1].end_timestamp = elapsed;
        }
        return updated;
      });

      await stopRecordingAndGetBlob();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    let finalBlob = recordedBlob;
    let finalTimestamps = [...timestamps];

    setIsSubmitting(true);

    try {
      if (isRecording && mediaRecorderRef.current) {
        const now = performance.now();
        const elapsed = parseFloat(
          ((now - (startTime || 0)) / 1000).toFixed(1),
        );
        finalTimestamps[currentSlide - 1].end_timestamp = elapsed;
        finalBlob = await stopRecordingAndGetBlob();
        setIsRecording(false);
      }

      if (!finalBlob || finalBlob.size === 0 || !pitchId) {
        throw new Error("데이터가 준비되지 않았습니다.");
      }

      console.log("🚀 [Final Submission Data]");
      console.table(finalTimestamps);
      console.log("📍 Audio File Detail:", {
        size: (finalBlob.size / 1024 / 1024).toFixed(2) + " MB",
        chunks: audioChunksRef.current.length,
      });

      const res = await uploadAndAnalyzeVoice(
        pitchId,
        finalBlob,
        finalTimestamps,
      );

      if (res) {
        router.push(
          `/new/voice/analysis?pitch_id=${pitchId}&voice_id=${res.voice_analysis_id}`,
        );
      }
    } catch (error) {
      console.error(error);
      alert("분석 요청 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setIsSubmitting(false);
      throw error;
    }
  }, [
    recordedBlob,
    isRecording,
    pitchId,
    timestamps,
    startTime,
    currentSlide,
    isSubmitting,
    router,
  ]);

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
                className="bg-[#2563EB] text-white px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition flex items-center gap-2"
              >
                <Icon icon="mdi:microphone" className="w-5 h-5" />
                녹음 시작
              </button>
            ) : (
              <>
                <button
                  onClick={handleRestart}
                  className="bg-white border border-gray-300 px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition"
                >
                  <Icon icon="mdi:refresh" className="w-5 h-5" />
                  재시작
                </button>
                {isRecording && (
                  <>
                    <button
                      onClick={handlePauseResume}
                      className={`bg-white border border-gray-300 px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition ${isPaused ? "text-blue-600" : ""}`}
                    >
                      <Icon
                        icon={isPaused ? "mdi:play" : "mdi:pause"}
                        className="w-5 h-5"
                      />
                      {isPaused ? "다시 시작" : "일시정지"}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="bg-[#D33B4D] text-white px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition"
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

        <div className="relative w-full bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-12">
          <div className="absolute top-4 right-14 text-sm font-medium text-gray-400">
            {currentSlide} / {totalSlides}
          </div>

          <div className="relative w-full aspect-[16/9] bg-[#F9FAFB] rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-300 italic text-2xl font-light">
                [ Slide {currentSlide} Image Area ]
              </span>
            </div>

            {currentSlide < totalSlides && isRecording && !isPaused && (
              <button
                onClick={handleNextSlide}
                className="absolute right-6 w-12 h-12 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-white transition-all z-10"
              >
                <Icon icon="mdi:chevron-right" className="w-8 h-8" />
              </button>
            )}

            <div className="absolute bottom-6 flex gap-2.5">
              {[...Array(totalSlides)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i + 1 ? "bg-[#3B82F6] w-6" : "bg-gray-200 w-2"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNextBar
        disabled={(!recordedBlob && !isRecording) || isSubmitting}
        onClick={handleSubmit}
      />
    </div>
  );
}
