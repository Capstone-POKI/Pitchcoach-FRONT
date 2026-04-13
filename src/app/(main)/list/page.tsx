"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import PitchCard, { Pitch } from "@/components/pitch/PitchCard";
import { useRouter } from "next/navigation";
import { GetPitches } from "@/apis/PitchApi";

type PitchStatus = "IN_PROGRESS" | "COMPLETED" | undefined;

export default function PitchListPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<PitchStatus>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPitches = async () => {
    try {
      setLoading(true);
      const data = await GetPitches({
        status: statusFilter,
        search: searchQuery,
      });
      setPitches(data.pitches);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPitches();
    }, 300);

    return () => clearTimeout(timer);
  }, [statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Pitch 목록</h1>
          <p className="text-base text-gray-500 mt-1">
            진행 중인 Pitch와 완료된 Pitch를 관리하세요.
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-2">
            {[
              { label: "전체", value: undefined },
              { label: "진행중", value: "IN_PROGRESS" },
              { label: "완료", value: "COMPLETED" },
            ].map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.label}
                  onClick={() => setStatusFilter(tab.value as PitchStatus)}
                  className={`px-4 py-2 text-base font-bold rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-[#3B6CF0] text-white "
                      : "bg-white text-slate-600 border border-gray-300 hover:bg-gray-50 "
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full max-w-sm">
            <Icon
              icon="mdi:magnify"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
            />
            <input
              type="text"
              placeholder="피치 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-8 w-full">
          <button
            onClick={() => router.push("/notice/basic")}
            className="flex flex-col items-center justify-center h-64 bg-white border-2 border-dashed border-gray-200 rounded-[32px] text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all group shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <Icon icon="mdi:plus" className="text-2xl" />
            </div>
            <span className="text-base font-semibold">새 Pitch 추가</span>
          </button>

          {!loading &&
            pitches.map((pitch) => (
              <PitchCard key={pitch.pitch_id} pitch={pitch} />
            ))}
        </div>
      </div>
    </div>
  );
}
