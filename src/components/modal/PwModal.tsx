"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";

interface PwModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PwModal({ isOpen, onClose }: PwModalProps) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  if (!isOpen) return null;

  const handleUpdatePassword = () => {
    console.log("비밀번호 변경 시도:", { currentPw, newPw, confirmPw });
    alert("비밀번호가 변경되었습니다.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900">비밀번호 변경</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon icon="mdi:close" className="text-2xl" />
          </button>
        </div>

        <div className="space-y-6">
          <InputUnit
            label="현재 비밀번호"
            placeholder="현재 비밀번호를 입력하세요"
            value={currentPw}
            onChange={setCurrentPw}
          />
          <InputUnit
            label="새 비밀번호"
            placeholder="새 비밀번호를 입력하세요"
            value={newPw}
            onChange={setNewPw}
          />
          <InputUnit
            label="새 비밀번호 확인"
            placeholder="새 비밀번호를 다시 입력하세요"
            value={confirmPw}
            onChange={setConfirmPw}
          />
        </div>

        <button
          onClick={handleUpdatePassword}
          className="mt-10 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          변경하기
        </button>
      </div>
    </div>
  );
}

function InputUnit({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-500">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-300"
      />
    </div>
  );
}
