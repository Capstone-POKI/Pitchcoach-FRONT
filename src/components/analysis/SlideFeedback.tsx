"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { GetIrDeckSlides, GetVoiceAnalysisSlides } from "@/apis/PitchApi";
import { Slide } from "@/types/IRAnalysisType";
import Image from "next/image";

type SlideFeedbackProps = {
  type: "deck" | "voice";
};

const ExpandableSection = ({
  title,
  content,
  icon,
  bgColor,
  iconColor,
  isList = false,
  maxHeight = 90,
}: {
  title: string;
  content: string | string[];
  icon: string;
  bgColor: string;
  iconColor: string;
  isList?: boolean;
  maxHeight?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const isOverflowing = contentRef.current.scrollHeight > maxHeight;
      setHasMore(isOverflowing);
    }
  }, [content, maxHeight]);

  return (
    <div
      className={`rounded-[16px] ${bgColor} px-4 py-4 transition-all duration-300 shadow-sm border border-transparent`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[15px] font-semibold text-[#111827]">
          <Icon icon={icon} className={`h-5 w-5 ${iconColor}`} />
          {title}
        </div>
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[12px] font-medium text-gray-500 flex items-center gap-0.5 hover:text-gray-800 transition-colors"
          >
            {isExpanded ? "접기" : "더보기"}
            <Icon icon={isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"} />
          </button>
        )}
      </div>

      <div
        ref={contentRef}
        style={{ maxHeight: isExpanded ? "2000px" : `${maxHeight}px` }}
        className="transition-all duration-500 ease-in-out overflow-hidden"
      >
        {isList && Array.isArray(content) ? (
          <ul className="space-y-3">
            {content.map((item, i) => (
              <li
                key={i}
                className="text-[14px] leading-relaxed text-[#4B5563] flex gap-2"
              >
                <span className="shrink-0 text-gray-400">•</span>
                <span className="break-keep">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] leading-relaxed text-[#4B5563] whitespace-pre-wrap break-keep">
            {content as string}
          </p>
        )}
      </div>
    </div>
  );
};

export default function SlideFeedback({ type }: SlideFeedbackProps) {
  const searchParams = useSearchParams();
  const deckId = searchParams.get("ir_deck_id");
  const voiceId = searchParams.get("voice_id");

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  const isFetching = useRef(false);

  const fetchData = useCallback(async () => {
    const targetId = type === "deck" ? deckId : voiceId;
    if (!targetId || isFetching.current) return;

    try {
      isFetching.current = true;

      let res;
      if (type === "deck") {
        res = await GetIrDeckSlides(targetId);
      } else {
        res = await GetVoiceAnalysisSlides(targetId);
      }

      if (res?.slides) {
        const newSlides = res.slides;
        setSlides((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(newSlides)) return prev;
          return newSlides;
        });

        const slideUrls = newSlides.map((s: Slide) => ({
          url: s.thumbnail_url,
          number: s.slide_number,
        }));
        sessionStorage.setItem("pitch_slides", JSON.stringify(slideUrls));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [type, deckId, voiceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Icon
          icon="mdi:loading"
          className="h-8 w-8 animate-spin text-blue-600"
        />
      </div>
    );
  }

  if (slides.length === 0) return null;

  const selected = slides[selectedIndex];
  const maxVisible = Math.min(3, slides.length);
  const start = Math.max(
    0,
    Math.min(selectedIndex - 1, slides.length - maxVisible),
  );
  const visibleSlides = slides.slice(start, start + maxVisible);

  return (
    <div className="w-full max-w-[1100px] flex flex-col">
      <div className="pb-3 border-b border-[#E5E7EB]">
        <h2 className="text-[20px] font-bold text-[#111827]">
          슬라이드별 상세 분석
        </h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          각 슬라이드를 선택하여 상세 피드백을 확인하세요
        </p>
      </div>

      <div className="relative mt-5 flex items-center justify-center">
        <button
          onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
          disabled={selectedIndex === 0}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border shadow disabled:opacity-30 hover:bg-gray-50 transition-all"
        >
          <Icon icon="mdi:chevron-left" width="18" />
        </button>

        <div className="flex gap-4 mx-4">
          {visibleSlides.map((slide, idx) => {
            const realIndex = start + idx;
            return (
              <div
                key={realIndex}
                onClick={() => setSelectedIndex(realIndex)}
                className={`w-[180px] rounded-xl border p-3 cursor-pointer transition-all duration-200 ${
                  selectedIndex === realIndex
                    ? "border-blue-500 shadow-md ring-1 ring-blue-500 bg-blue-50/10"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="h-[100px] bg-gray-100 rounded-md mb-3 relative overflow-hidden">
                  {slide.thumbnail_url ? (
                    <Image
                      src={slide.thumbnail_url}
                      alt={`Slide ${slide.slide_number} thumbnail`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Icon
                        icon="mdi:image-outline"
                        className="text-gray-300 w-8 h-8"
                      />
                    </div>
                  )}
                  {type === "deck" && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {slide.score}점
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mb-1">
                  슬라이드 {slide.slide_number}
                </div>
                <div className="flex justify-between items-center gap-1">
                  <div className="font-semibold text-xs truncate">
                    {slide.category}
                  </div>
                  <div className="text-blue-500 text-[11px] font-bold">
                    {type === "deck"
                      ? `${slide.score}점`
                      : slide.duration_display}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() =>
            setSelectedIndex((prev) => Math.min(slides.length - 1, prev + 1))
          }
          disabled={selectedIndex === slides.length - 1}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border shadow disabled:opacity-30 hover:bg-gray-50 transition-all"
        >
          <Icon icon="mdi:chevron-right" width="18" />
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-10 items-start">
        <div className="flex flex-col w-full">
          <div className="aspect-video w-full rounded-[16px] bg-black overflow-hidden shadow-lg border border-gray-100">
            {selected.thumbnail_url ? (
              <Image
                src={selected.thumbnail_url}
                alt={`Slide ${selected.slide_number} main`}
                fill
                priority
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon
                  icon="mdi:image-off-outline"
                  className="text-gray-600 w-12 h-12"
                />
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between px-1">
            <h3 className="text-[20px] font-bold text-[#111827]">
              {selected.slide_number}. {selected.category}
            </h3>
            <span className="text-[18px] font-bold text-[#2563EB]">
              {type === "deck"
                ? `${selected.score}점`
                : selected.duration_display}
            </span>
          </div>

          <div className="mt-4">
            <ExpandableSection
              title="슬라이드 요약"
              content={selected.content_summary}
              icon="mdi:text-box-search-outline"
              bgColor="bg-white border border-gray-100"
              iconColor="text-blue-500"
              maxHeight={75}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              disabled={selectedIndex === 0}
              onClick={() => setSelectedIndex((prev) => prev - 1)}
              className="flex h-[48px] items-center justify-center gap-2 rounded-[12px] border border-gray-200 bg-white text-[15px] font-medium text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              <Icon icon="mdi:chevron-left" className="h-5 w-5" />
              이전 슬라이드
            </button>
            <button
              disabled={selectedIndex === slides.length - 1}
              onClick={() => setSelectedIndex((prev) => prev + 1)}
              className="flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-[#2563EB] text-[15px] font-semibold text-white disabled:opacity-30 hover:bg-[#1D4ED8] transition-all shadow-md active:scale-95"
            >
              다음 슬라이드
              <Icon icon="mdi:chevron-right" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <ExpandableSection
            title="상세 피드백"
            content={selected.detailed_feedback}
            icon="mdi:comment-text-outline"
            bgColor="bg-[#F3F4F6]"
            iconColor="text-gray-600"
          />

          <ExpandableSection
            title="잘한 점"
            content={selected.strengths}
            icon="mdi:check-circle-outline"
            bgColor="bg-[#ECFDF5]"
            iconColor="text-[#16A34A]"
            isList
          />

          <ExpandableSection
            title="개선할 점"
            content={selected.improvements}
            icon="mdi:alert-circle-outline"
            bgColor="bg-[#FEF3C7]"
            iconColor="text-[#F59E0B]"
            isList
          />
        </div>
      </div>
    </div>
  );
}
