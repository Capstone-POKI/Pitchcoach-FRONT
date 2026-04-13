"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useState } from "react";

interface BottomActionBarProps {
  disabled?: boolean;
  nextHref?: string;
  onClick?: () => Promise<void>; // onClick 속성 추가
}

export default function BottomNextBar({
  disabled,
  nextHref,
  onClick,
}: BottomActionBarProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);

      // 1. 전달받은 onClick(API 호출 등)이 있다면 실행
      if (onClick) {
        await onClick();
      }

      // 2. 작업 완료 후 페이지 이동
      if (nextHref) {
        router.push(nextHref);
      }
    } catch (error) {
      console.error("Next step failed:", error);
      // 필요 시 에러 알림 처리
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-3 z-50">
      <div className="mx-auto flex max-w-screen-lg justify-end">
        <button
          disabled={disabled || isLoading}
          onClick={handleNext}
          className={`flex items-center gap-1 rounded-md px-5 py-2 text-sm font-medium transition
            ${
              disabled || isLoading
                ? "cursor-not-allowed bg-gray-300 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }
          `}
        >
          {isLoading ? "처리 중..." : "다음"}
          {!isLoading && <Icon icon="mdi:chevron-right" className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
