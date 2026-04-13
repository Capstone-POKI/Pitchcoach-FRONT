"use client";

import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import BottomNextBar from "@/components/common/BottomNextBar";

export default function QARecorder() {
  const questions = [
    "귀사의 솔루션이 기존 경쟁사 제품과 어떻게 다른가요?",
    "핵심 타겟 고객은 누구인가요?",
    "수익 모델은 어떻게 구성되어 있나요?",
    "기술적 차별점은 무엇인가요?",
    "향후 확장 계획은 무엇인가요?",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Blob[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setRecordings((prev) => {
        const arr = [...prev];
        arr[currentIndex] = blob;
        return arr;
      });
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const nextQuestion = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const allDone =
    recordings.length === 5 && recordings.every((r) => r !== undefined);

  return (
    <div className="bg-gray-50 flex flex-col justify-center items-center pt-30 px-4">
      {/* 카드 */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-8">
        {/* 상단 진행 */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500">
            질문 {currentIndex + 1} / 5
          </span>
        </div>

        {/* 진행 바 */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
          <div
            className="h-2 bg-blue-500 rounded-full"
            style={{ width: `${((currentIndex + 1) / 5) * 100}%` }}
          />
        </div>

        {/* 질문 영역 */}
        <div className="flex items-start gap-3 mb-10">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full font-semibold">
            Q{currentIndex + 1}
          </div>

          <div className="text-lg font-semibold text-gray-800">
            {questions[currentIndex]}
          </div>
        </div>

        {/* 중앙 녹음 영역 */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
            <Icon
              icon="fluent:mic-record-20-regular"
              width="40"
              className="text-blue-600"
            />
          </div>

          <p className="text-gray-500 text-sm">준비되면 녹음을 시작하세요</p>

          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Icon icon="fluent:mic-record-20-regular" width="20" />
              녹음 시작
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-5 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2"
            >
              <Icon icon="fluent:stop-20-regular" width="20" />
              답변 완료
            </button>
          )}
        </div>
      </div>
      {/* 하단 버튼 */}
      <div className="w-full max-w-3xl mt-6 flex justify-end">
        {currentIndex < 4 ? (
          <button
            onClick={nextQuestion}
            disabled={!recordings[currentIndex]}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
          >
            다음 질문
          </button>
        ) : (
          <></>
        )}
      </div>
      <BottomNextBar disabled={!allDone} nextHref="/new/deck/analysis" />{" "}
    </div>
  );
}
