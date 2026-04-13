"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostSignup } from "@/apis/SignupApi";

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const result = await PostSignup({ name, email, phone, password });
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);
      alert(result.message);

      if (!result.is_profile_complete) {
        router.push("/onboard");
      } else {
        router.push("/home");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "회원가입 실패";
      alert(msg);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-2 text-3xl font-bold">
        <span className="block h-6 w-6 bg-yellow-300 rounded-[50%_50%_0_50%]" />
        <span>
          PITCH<span className="text-blue-600 font-semibold">COACH</span>
        </span>
      </div>

      <section className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-xl font-bold text-slate-900">회원가입</h1>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@example.com"
            className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            전화번호
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            비밀번호
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="영어, 숫자, 특수문자 포함 8-16자"
              className="w-full rounded-md bg-gray-100 px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Icon
              icon="mdi:eye-outline"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            />
          </div>
        </div>

        <p className="mb-6 text-xs text-gray-400">
          영어, 숫자, 특수문자를 포함하여 8-16자로 입력하세요
        </p>

        <button
          onClick={handleSignup}
          className="mb-4 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          다음
        </button>

        <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          또는
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium hover:bg-gray-50">
          <Icon icon="material-icon-theme:google" className="h-5 w-5" />
          Google로 계속하기
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="cursor-pointer font-medium text-blue-600"
          >
            로그인
          </Link>
        </p>
      </section>
    </div>
  );
}
