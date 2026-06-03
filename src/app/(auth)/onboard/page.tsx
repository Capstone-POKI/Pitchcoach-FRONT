"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
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
import { PatchUserProfile } from "@/apis/SignupApi";

type Option = { value: string; label: string };

function Combobox({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md bg-gray-100 px-3 py-2 text-sm"
        >
          <span className={selected ? "text-slate-900" : "text-gray-400"}>
            {selected ? selected.label : placeholder}
          </span>
          <Icon icon="mdi:chevron-up-down" className="h-4 w-4 text-gray-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white rounded-md shadow-md">
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
              >
                <Icon
                  icon="mdi:check"
                  className={`mr-2 h-4 w-4 ${value === option.value ? "opacity-100" : "opacity-0"}`}
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

export default function Page() {
  const router = useRouter();

  const [formData, setFormData] = React.useState({
    gender: "MALE",
    education: "",
    field: "",
    fieldCustom: "",
    period: "",
    periodCustom: "",
  });

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const finalField = formData.fieldCustom || formData.field;
  const finalPeriod = formData.periodCustom || formData.period;
  const isFormValid =
    formData.gender && formData.education && finalField && finalPeriod;

  const handleStart = async () => {
    try {
      const result = await PatchUserProfile({
        gender: formData.gender,
        education: formData.education,
        business_field: finalField,
        business_duration: finalPeriod,
      });

      if (result.is_profile_complete) router.push("/list");
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "정보 저장 실패";
      alert(msg);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 bg-[#F8FAFC]">
      <div className="flex items-center gap-2 text-3xl font-bold">
        <span className="block h-7 w-7 bg-yellow-300 rounded-[50%_50%_0_50%]" />
        <span>
          PITCH<span className="font-semibold text-blue-600">COACH</span>
        </span>
      </div>

      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-xl font-bold">추가 정보 입력</h1>
        <p className="mb-6 text-sm text-slate-500">
          PitchCoach는 창업 단계와 경험에 맞춰 피칭 코치를 제공합니다. <br />
          맞춤 코칭을 위해 간단한 정보를 입력해주세요.
        </p>

        {/* 성별 */}
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium">성별</label>
          <Tabs
            value={formData.gender}
            onValueChange={(v) => updateForm("gender", v)}
          >
            <TabsList>
              <TabsTrigger value="MALE">남</TabsTrigger>
              <TabsTrigger value="FEMALE">여</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 최종 학력 */}
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium">최종 학력</label>
          <Combobox
            placeholder="학력을 선택하세요"
            value={formData.education}
            onChange={(v) => updateForm("education", v)}
            options={[
              { value: "고등학교 졸업", label: "고등학교 졸업" },
              { value: "대학교 재학 / 졸업", label: "대학교 재학 / 졸업" },
              { value: "석사", label: "석사" },
              { value: "박사", label: "박사" },
            ]}
          />
        </div>

        {/* 창업 분야 */}
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium">창업 분야</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Combobox
                placeholder="분야를 선택하세요"
                value={formData.field}
                onChange={(v) => updateForm("field", v)}
                options={[
                  { value: "IT / 플랫폼", label: "IT / 플랫폼" },
                  { value: "콘텐츠 / 미디어", label: "콘텐츠 / 미디어" },
                  { value: "헬스케어", label: "헬스케어" },
                  { value: "커머스", label: "커머스" },
                  { value: "교육", label: "교육" },
                ]}
              />
            </div>
            <input
              className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm outline-none"
              placeholder="직접 입력"
              value={formData.fieldCustom}
              onChange={(e) => updateForm("fieldCustom", e.target.value)}
            />
          </div>
        </div>

        {/* 창업 기간 */}
        <div className="mb-8">
          <label className="mb-1 block text-sm font-medium">창업 기간</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Combobox
                placeholder="기간을 선택하세요"
                value={formData.period}
                onChange={(v) => updateForm("period", v)}
                options={[
                  { value: "예비 창업", label: "예비 창업" },
                  { value: "1년 미만", label: "1년 미만" },
                  { value: "1~3년", label: "1~3년" },
                  { value: "3~5년", label: "3~5년" },
                  { value: "5년 이상", label: "5년 이상" },
                ]}
              />
            </div>
            <input
              className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm outline-none"
              placeholder="직접 입력"
              value={formData.periodCustom}
              onChange={(e) => updateForm("periodCustom", e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={!isFormValid}
          className={`w-full rounded-md py-3 text-sm font-medium text-white transition-colors ${
            isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          시작하기
        </button>
      </section>
    </div>
  );
}
