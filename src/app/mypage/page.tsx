"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import PwModal from "@/components/modal/PwModal";

// --- 1. Combobox 컴포넌트 ---
type Option = {
  value: string;
  label: string;
};

function Combobox({
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: {
  placeholder: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={disabled ? false : open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm outline-none transition-colors ${
            disabled
              ? "bg-gray-50 cursor-not-allowed"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <span className={selected ? "text-slate-900" : "text-gray-400"}>
            {selected ? selected.label : placeholder}
          </span>
          <Icon icon="mdi:chevron-up-down" className="h-4 w-4 text-gray-400" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white rounded-md shadow-md border border-gray-100 z-50">
        <Command>
          <CommandEmpty>결과가 없습니다.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-blue-50"
              >
                <Icon
                  icon="mdi:check"
                  className={`mr-2 h-4 w-4 text-blue-600 ${
                    value === option.value ? "opacity-100" : "opacity-0"
                  }`}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// --- 2. 메인 ProfilePage 컴포넌트 ---
export default function ProfilePage() {
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  const [userData, setUserData] = useState({
    name: "김파운더",
    email: "founder@startup.com",
    phone: "010-1234-5678",
    joinedAt: "2024.01.15",
    gender: "남성",
    education: "college",
    field: "it",
    fieldCustom: "",
    period: "lt1",
    periodCustom: "",
  });

  const handleUpdate = (section: "profile" | "info") => {
    console.log(`${section} 저장 완료:`, userData);
    if (section === "profile") setIsEditingProfile(false);
    else setIsEditingInfo(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 md:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">프로필 설정</h1>

        <section className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">프로필 정보</h2>
            <button
              onClick={() =>
                isEditingProfile
                  ? handleUpdate("profile")
                  : setIsEditingProfile(true)
              }
              className="flex items-center gap-1 rounded-md border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Icon icon="mdi:pencil-outline" className="text-sm" />
              {isEditingProfile ? "저장하기" : "수정하기"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            <InputGroup label="이름" icon="mdi:account-outline">
              <input
                disabled={!isEditingProfile}
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-400"
              />
            </InputGroup>

            <InputGroup label="이메일" icon="mdi:email-outline">
              <div className="flex items-center gap-2">
                <input
                  disabled
                  value={userData.email}
                  className="w-full rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-400 outline-none"
                />
              </div>
            </InputGroup>

            <InputGroup label="전화번호" icon="mdi:phone-outline">
              <input
                disabled={!isEditingProfile}
                value={userData.phone}
                onChange={(e) =>
                  setUserData({ ...userData, phone: e.target.value })
                }
                className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-400"
              />
            </InputGroup>

            <InputGroup label="가입일" icon="mdi:calendar-blank-outline">
              <input
                disabled
                value={userData.joinedAt}
                className="w-full rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-400 outline-none"
              />
            </InputGroup>
          </div>
        </section>

        {/* 기본 정보 섹션 */}
        <section className="mb-10 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">기본 정보</h2>
            <button
              onClick={() =>
                isEditingInfo ? handleUpdate("info") : setIsEditingInfo(true)
              }
              className="flex items-center gap-1 rounded-md border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Icon icon="mdi:pencil-outline" className="text-sm" />
              {isEditingInfo ? "저장하기" : "수정하기"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            <InputGroup label="성별" icon="mdi:gender-male-female">
              <input
                disabled={!isEditingInfo}
                value={userData.gender}
                onChange={(e) =>
                  setUserData({ ...userData, gender: e.target.value })
                }
                className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-400"
              />
            </InputGroup>

            <InputGroup label="최종 학력" icon="mdi:school-outline">
              <Combobox
                disabled={!isEditingInfo}
                placeholder="학력을 선택하세요"
                value={userData.education}
                onChange={(val) => setUserData({ ...userData, education: val })}
                options={[
                  { value: "high", label: "고등학교 졸업" },
                  { value: "college", label: "대학교 재학 / 졸업" },
                  { value: "master", label: "석사" },
                  { value: "phd", label: "박사" },
                ]}
              />
            </InputGroup>

            <InputGroup label="창업 분야" icon="mdi:briefcase-outline">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Combobox
                    disabled={!isEditingInfo}
                    placeholder="분야를 선택하세요"
                    value={userData.field}
                    onChange={(val) => setUserData({ ...userData, field: val })}
                    options={[
                      { value: "it", label: "IT / 플랫폼" },
                      { value: "content", label: "콘텐츠 / 미디어" },
                      { value: "health", label: "헬스케어" },
                      { value: "commerce", label: "커머스" },
                      { value: "education", label: "교육" },
                    ]}
                  />
                </div>
                <input
                  disabled={!isEditingInfo}
                  className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="직접 입력"
                  value={userData.fieldCustom}
                  onChange={(e) =>
                    setUserData({ ...userData, fieldCustom: e.target.value })
                  }
                />
              </div>
            </InputGroup>

            <InputGroup label="창업 기간" icon="mdi:clock-outline">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Combobox
                    disabled={!isEditingInfo}
                    placeholder="기간을 선택하세요"
                    value={userData.period}
                    onChange={(val) =>
                      setUserData({ ...userData, period: val })
                    }
                    options={[
                      { value: "pre", label: "예비 창업" },
                      { value: "lt1", label: "1년 미만" },
                      { value: "1to3", label: "1~3년" },
                      { value: "3to5", label: "3~5년" },
                      { value: "gt5", label: "5년 이상" },
                    ]}
                  />
                </div>
                <input
                  disabled={!isEditingInfo}
                  className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="직접 입력"
                  value={userData.periodCustom}
                  onChange={(e) =>
                    setUserData({ ...userData, periodCustom: e.target.value })
                  }
                />
              </div>
            </InputGroup>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsPwModalOpen(true)}
            className="rounded-lg bg-blue-100 px-6 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200 transition-colors"
          >
            비밀번호 변경
          </button>
          <button className="rounded-lg bg-blue-600 px-8 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            로그아웃
          </button>
          <button className="rounded-lg bg-gray-100 px-6 py-2 text-sm font-medium text-gray-500 hover:bg-gray-200 transition-colors">
            탈퇴
          </button>
        </div>
      </div>
      <PwModal isOpen={isPwModalOpen} onClose={() => setIsPwModalOpen(false)} />
    </div>
  );
}

// 헬퍼 컴포넌트
function InputGroup({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
        <Icon icon={icon} className="text-lg" />
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}
