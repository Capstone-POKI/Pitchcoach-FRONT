"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { getPitchQuestions, postQuestionAnswer } from "@/apis/PitchApi";
import { QAQuestion } from "@/types/QNAAnalysisType";

type RecordingState = "idle" | "recording" | "recorded";

function QAPracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pitchId = searchParams.get("pitch_id");

  const [questions, setQuestions] = useState<QAQuestion[]>(() => {
    if (typeof window === "undefined" || !pitchId) return [];
    const cached = sessionStorage.getItem(`qa_questions_${pitchId}`);
    return cached ? (JSON.parse(cached) as QAQuestion[]) : [];
  });

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(
    () =>
      typeof window === "undefined" ||
      !pitchId ||
      !sessionStorage.getItem(`qa_questions_${pitchId}`),
  );

  useEffect(() => {
    if (!pitchId || questions.length > 0) return;
    getPitchQuestions(pitchId)
      .then((res) => setQuestions(res.questions))
      .catch(console.error)
      .finally(() => setIsLoadingQuestions(false));
    // pitchId 변경 시 한 번만 fetch, questions는 의도적으로 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pitchId]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const answerIdsRef = useRef<string[]>([]);

  const startRecording = useCallback(async () => {
    setSubmitError(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setCurrentBlob(blob);
      setRecordingState("recorded");
      stream.getTracks().forEach((t) => t.stop());
    };

    recorder.start();
    setRecordingState("recording");
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.requestData();
    mediaRecorderRef.current?.stop();
  }, []);

  const handleNext = useCallback(async () => {
    if (!currentBlob || isSubmitting) return;
    const question = questions[currentIndex];

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await postQuestionAnswer(question.question_id, currentBlob);
      answerIdsRef.current.push(result.answer.answer_id);
    } catch {
      setSubmitError("답변 제출에 실패했습니다. 다시 시도해 주세요.");
      setIsSubmitting(false);
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      sessionStorage.setItem(
        `qa_answer_ids_${pitchId}`,
        JSON.stringify(answerIdsRef.current),
      );
      router.push(`/new/qna/feedback?pitch_id=${pitchId}`);
    } else {
      setCurrentIndex(nextIndex);
      setCurrentBlob(null);
      setRecordingState("idle");
      setIsSubmitting(false);
    }
  }, [currentBlob, isSubmitting, questions, currentIndex, pitchId, router]);

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon
            icon="mdi:loading"
            className="w-8 h-8 animate-spin text-blue-600"
          />
          <p className="text-gray-400 text-sm">질문을 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <p className="text-gray-400 text-sm">생성된 질문이 없습니다.</p>
      </div>
    );
  }

  const total = questions.length;
  const question = questions[currentIndex];
  const isLast = currentIndex === total - 1;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center pt-12 px-4 pb-16">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500 font-medium">
            질문 {currentIndex + 1} / {total}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
          <div
            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-start gap-3 mb-10">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full font-semibold shrink-0 text-sm">
              Q{currentIndex + 1}
            </div>
            <p className="text-[18px] font-semibold text-gray-800 leading-snug mt-1">
              {question.question}
            </p>
          </div>

          {/* Recording UI */}
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
                recordingState === "recording"
                  ? "bg-red-100 animate-pulse"
                  : recordingState === "recorded"
                    ? "bg-green-100"
                    : "bg-blue-100"
              }`}
            >
              <Icon
                icon={
                  recordingState === "recorded"
                    ? "mdi:check-circle-outline"
                    : "fluent:mic-record-20-regular"
                }
                width="40"
                className={
                  recordingState === "recording"
                    ? "text-red-500"
                    : recordingState === "recorded"
                      ? "text-green-600"
                      : "text-blue-600"
                }
              />
            </div>

            <p className="text-gray-500 text-sm">
              {recordingState === "idle" && "준비되면 녹음을 시작하세요"}
              {recordingState === "recording" && "녹음 중..."}
              {recordingState === "recorded" && "녹음이 완료되었습니다"}
            </p>

            {recordingState === "idle" && (
              <button
                onClick={startRecording}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <Icon icon="fluent:mic-record-20-regular" width="20" />
                녹음 시작
              </button>
            )}

            {recordingState === "recording" && (
              <button
                onClick={stopRecording}
                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 transition-colors"
              >
                <Icon icon="fluent:stop-20-regular" width="20" />
                답변 완료
              </button>
            )}

            {recordingState === "recorded" && (
              <button
                onClick={() => {
                  setCurrentBlob(null);
                  setRecordingState("idle");
                }}
                className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-2 text-sm transition-colors"
              >
                <Icon icon="mdi:refresh" width="18" />
                다시 녹음
              </button>
            )}
          </div>
        </div>

        {submitError && (
          <p className="text-red-500 text-sm text-center mb-4">{submitError}</p>
        )}

        {/* Next / Submit button */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={recordingState !== "recorded" || isSubmitting}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            {isSubmitting && (
              <Icon icon="mdi:loading" className="animate-spin" width="18" />
            )}
            {isLast ? "완료하기" : "다음 질문"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QAPracticePage() {
  return (
    <Suspense>
      <QAPracticeContent />
    </Suspense>
  );
}
