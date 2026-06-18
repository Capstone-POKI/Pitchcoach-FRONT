"use client";

import React, { useRef, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { DeletePitch } from "@/apis/PitchApi";

export interface Pitch {
  pitch_id: string;
  title: string;
  pitch_type: string;
  pitch_type_display: string;
  status: "IN_PROGRESS" | "COMPLETED";
  application_period: string;
  progress?: number;
}

interface PitchCardProps {
  pitch: Pitch;
  onDeleted?: (pitchId: string) => void;
}

export default function PitchCard({ pitch, onDeleted }: PitchCardProps) {
  const router = useRouter();
  const isProgress = pitch.status === "IN_PROGRESS";
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const theme = isProgress
    ? { bg: "bg-[#F0F5FF]", tag: "bg-[#3B6CF0]", text: "진행중", accent: "#3B6CF0" }
    : { bg: "bg-[#E9ECEF]", tag: "bg-[#8A94A6]", text: "완료", accent: "#8A94A6" };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleCardClick = () => {
    router.push(`/new/voice/upload?pitch_id=${pitch.pitch_id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`"${pitch.title}" 피치를 삭제하시겠습니까?`)) return;
    setDeleting(true);
    try {
      await DeletePitch(pitch.pitch_id);
      onDeleted?.(pitch.pitch_id);
    } catch {
      alert("삭제에 실패했습니다. 다시 시도해 주세요.");
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative flex flex-col w-full h-64 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
    >
      <div className={`${theme.bg} p-4`}>
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${theme.tag}`}>
            {theme.text}
          </span>
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              className="text-gray-400 hover:text-gray-600"
              disabled={deleting}
            >
              <Icon icon="mdi:dots-vertical" className="text-2xl" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-28 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Icon icon="mdi:trash-can-outline" className="text-base" />
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
          <Icon icon="mdi:calendar-blank-outline" className="text-xl" />
          <span>{pitch.application_period}</span>
        </div>
      </div>

      <div className="p-6 pt-4 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{pitch.title}</h3>
        <p className="text-sm text-gray-400 font-medium mb-auto">{pitch.pitch_type_display}</p>

        {isProgress && pitch.progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-xs text-gray-500 font-bold">진행률</span>
              <span className="text-lg font-bold" style={{ color: theme.accent }}>
                {pitch.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pitch.progress}%`, backgroundColor: theme.accent }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
