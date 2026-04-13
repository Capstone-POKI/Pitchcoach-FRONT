"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface BottomChooseBarProps {
  disabled?: boolean;
  type: "deck" | "voice";
  onClick?: () => void;
  pitchId?: string;
}

export default function BottomChooseBar({
  disabled,
  type,
  onClick,
  pitchId,
}: BottomChooseBarProps) {
  const router = useRouter();

  const config = {
    deck: {
      label: "IR Deck 분석하기",
      path: "/new/deck/upload",
    },
    voice: {
      label: "피칭 분석하기",
      path: "/new/voice/recording",
    },
  };

  const currentConfig = config[type];

  const handleNextClick = () => {
    if (onClick) {
      onClick();
    } else {
      const targetPath = pitchId
        ? `${currentConfig.path}?pitch_id=${pitchId}`
        : currentConfig.path;
      router.push(targetPath);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-4 z-50">
      <div className="mx-auto flex max-w-7xl justify-end gap-3">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center justify-center px-4 py-2.5 text-sm font-bold text-[#3B6CF0] bg-white border border-[#3B6CF0] rounded-xl hover:bg-blue-50 transition-all"
        >
          대시보드로 이동하기
        </button>

        <button
          disabled={disabled}
          onClick={handleNextClick}
          className={`flex items-center justify-center gap-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all
            ${
              disabled
                ? "cursor-not-allowed bg-gray-300 text-white border border-gray-300"
                : "bg-[#3B6CF0] text-white border border-[#3B6CF0] hover:bg-[#2F56C4] shadow-sm"
            }
          `}
        >
          {currentConfig.label}
        </button>
      </div>
    </div>
  );
}
