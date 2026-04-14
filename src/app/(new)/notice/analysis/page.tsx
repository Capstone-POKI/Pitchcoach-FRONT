"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BottomChooseBar from "@/components/common/BottomNextBar";
import { Icon } from "@iconify/react";
import { GetNoticeResponse } from "@/types/PitchType";
import { GetNoticeDetail, PatchNotice } from "@/apis/PitchApi";

interface BaseInfo {
  notice_name: string;
  host_organization: string;
  recruitment_type: string;
  target_audience: string;
  application_period: string;
}

type Criterion = NonNullable<GetNoticeResponse["evaluation_criteria"]>[number];

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noticeId = searchParams.get("notice_id");

  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<GetNoticeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [baseInfoState, setBaseInfoState] = useState<BaseInfo>({
    notice_name: "",
    host_organization: "",
    recruitment_type: "",
    target_audience: "",
    application_period: "",
  });
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [extraCriterion, setExtraCriterion] = useState("");

  const isInitialized = useRef(false);
  const isFetching = useRef(false);

  const fetchData = useCallback(async () => {
    if (!noticeId || isFetching.current) return;
    try {
      isFetching.current = true;
      const res = await GetNoticeDetail(noticeId);

      setData((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(res)) return prev;
        return res;
      });

      if (res.analysis_status !== "IN_PROGRESS") {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    } finally {
      isFetching.current = false;
    }
  }, [noticeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (data?.analysis_status === "COMPLETED" && !isInitialized.current) {
      setBaseInfoState({
        notice_name: data.notice_name || "",
        host_organization: data.host_organization || "",
        recruitment_type: data.recruitment_type || "",
        target_audience: data.target_audience || "",
        application_period: data.application_period || "",
      });
      setCriteria(data.evaluation_criteria || []);
      const extraValue =
        typeof data.additional_criteria === "string"
          ? data.additional_criteria
          : "";
      setExtraCriterion(extraValue);
      isInitialized.current = true;
    }
  }, [data]);

  useEffect(() => {
    if (data?.analysis_status !== "IN_PROGRESS" || !noticeId) return;

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, [data?.analysis_status, noticeId, fetchData]);

  const handleToggleEdit = async () => {
    if (isEditing && noticeId) {
      try {
        const sum = criteria.reduce(
          (acc, cur) => acc + (Number(cur.points) || 0),
          0,
        );
        if (sum !== 100) {
          alert("배점 합계는 100이어야 합니다.");
          return;
        }
        await PatchNotice(noticeId, {
          ...baseInfoState,
          evaluation_criteria: criteria.map((c) => ({
            criteria_name: c.criteria_name,
            points: Number(c.points),
          })),
          additional_criteria: extraCriterion,
        });
        isInitialized.current = false;
        setLoading(true);
        await fetchData();
      } catch {
        alert("수정 중 오류가 발생했습니다.");
        return;
      }
    }
    setIsEditing(!isEditing);
  };

  const handleNext = () => {
    if (data?.pitch_id) {
      router.push(`/new/deck/upload?pitch_id=${data.pitch_id}`);
    }
  };

  if (loading || data?.analysis_status === "IN_PROGRESS") {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Icon
          icon="mdi:loading"
          className="h-12 w-12 animate-spin text-blue-600"
        />
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">
            공고문을 분석하고 있습니다
          </p>
          <p className="mt-1 text-sm text-slate-500">
            잠시만 기다려 주세요 (약 20~30초 소요)
          </p>
        </div>
      </div>
    );
  }

  if (data?.analysis_status === "FAILED") {
    const isPageLimitError =
      data.error_message?.includes("PAGE_LIMIT_EXCEEDED") ||
      data.error_message?.includes("exceed the limit");
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Icon
          icon="mdi:alert-circle-outline"
          className="h-12 w-12 text-red-500"
        />
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">
            분석에 실패했습니다
          </p>
          <div className="mt-2 text-sm text-slate-500 break-keep px-6">
            {isPageLimitError
              ? "공고문 파일의 페이지 수가 너무 많습니다. 15페이지 이내의 PDF 파일로 다시 시도해 주세요."
              : "파일 분석 중 오류가 발생했습니다. 파일 형식을 확인하거나 잠시 후 다시 시도해 주세요."}
          </div>
          <button
            onClick={() => router.back()}
            className="mt-6 rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white"
          >
            이전으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const infoConfig = [
    { key: "notice_name" as keyof BaseInfo, label: "공고/행사명" },
    { key: "host_organization" as keyof BaseInfo, label: "주관 기관" },
    { key: "recruitment_type" as keyof BaseInfo, label: "모집 유형" },
    { key: "target_audience" as keyof BaseInfo, label: "지원 자격" },
    { key: "application_period" as keyof BaseInfo, label: "주요 일정" },
  ];

  return (
    <div className="mx-auto max-w-screen-lg space-y-8 pb-24">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">공고문 분석 결과</h1>
          <p className="mt-1 text-sm text-slate-500">
            업로드한 공고문에 대한 분석 결과입니다.
          </p>
        </div>
        <button
          onClick={handleToggleEdit}
          className={`rounded-md px-4 py-2 text-sm font-medium ${isEditing ? "bg-blue-600 text-white" : "border border-blue-600 text-blue-600"}`}
        >
          {isEditing ? "수정 완료" : "수정하기"}
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">기본 정보</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {infoConfig.map((info) => (
            <div key={info.key}>
              <p className="mb-1 text-xs font-medium text-slate-500">
                {info.label}
              </p>
              {isEditing ? (
                <input
                  className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-slate-800 outline-none"
                  value={baseInfoState[info.key]}
                  onChange={(e) =>
                    setBaseInfoState({
                      ...baseInfoState,
                      [info.key]: e.target.value,
                    })
                  }
                />
              ) : (
                <div className="rounded-md bg-gray-100 px-3 py-2 text-sm text-slate-800">
                  {baseInfoState[info.key] || "-"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              공고문 심사 기준
            </h3>
            <div className="space-y-6">
              {criteria.map((item, idx) => (
                <div key={idx}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    {isEditing ? (
                      <input
                        className="font-medium text-slate-800 border-b outline-none bg-transparent"
                        value={item.criteria_name}
                        onChange={(e) => {
                          const next = [...criteria];
                          next[idx] = {
                            ...next[idx],
                            criteria_name: e.target.value,
                          };
                          setCriteria(next);
                        }}
                      />
                    ) : (
                      <span className="font-medium text-slate-800">
                        {item.criteria_name}
                      </span>
                    )}
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-16 rounded-md border px-2 py-1 text-right text-sm"
                        value={item.points}
                        onChange={(e) => {
                          const next = [...criteria];
                          next[idx] = {
                            ...next[idx],
                            points: Number(e.target.value),
                          };
                          setCriteria(next);
                        }}
                      />
                    ) : (
                      <span className="font-semibold text-blue-600">
                        {item.points}%
                      </span>
                    )}
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all"
                      style={{ width: `${item.points}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-slate-800">
                추가 심사 기준
              </p>
              {isEditing ? (
                <textarea
                  className="w-full rounded-md bg-gray-100 p-3 text-sm outline-none min-h-[80px]"
                  value={extraCriterion}
                  onChange={(e) => setExtraCriterion(e.target.value)}
                />
              ) : (
                <div className="rounded-md bg-gray-100 p-3 text-sm text-slate-600 min-h-[44px]">
                  {extraCriterion || "추가 심사 기준이 없습니다."}
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              PitchCoach 해석 기준
            </h3>
            {!isEditing ? (
              <div className="space-y-4">
                {criteria.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <p className="text-xs font-bold text-slate-500 mb-1">
                      {item.criteria_name}
                    </p>
                    <p className="text-sm text-slate-700">
                      {item.pitchcoach_interpretation}
                    </p>
                    <p className="mt-1 text-sm font-medium text-blue-600">
                      → {item.ir_guide}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-slate-600">
                심사 기준 비율이 변경되면 AI가 해석 기준을 자동으로
                재계산합니다.
                <br />
                <span className="font-medium text-blue-600">
                  ※ 해석 기준은 직접 수정할 수 없습니다.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          IR Deck 가이드
        </h3>
        <div className="rounded-md bg-gray-100 p-4 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
          {data.ir_deck_guide}
        </div>
      </div>

      <BottomChooseBar onClick={handleNext} />
    </div>
  );
}
