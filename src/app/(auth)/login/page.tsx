"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostLogin } from "@/apis/SignupApi";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const result = await PostLogin({ email, password });
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);
      if (result.is_profile_complete === false) {
        router.push("/onboard");
      } else {
        router.push("/home");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "로그인에 실패했습니다.";
      alert(msg);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-2 text-3xl font-bold">
        <span className="block h-7 w-7 bg-yellow-300 rounded-[50%_50%_0_50%]" />
        <span>
          PITCH<span className="text-blue-600 font-semibold">COACH</span>
        </span>
      </div>

      <section className="w-105 max-w-sm rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-lg font-semibold">로그인</h1>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm outline-none"
          />
        </div>

        <button
          onClick={handleLogin}
          className="mb-4 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          로그인
        </button>

        <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          또는
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button className="flex w-full max-w-sm items-center justify-center gap-1 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium hover:bg-gray-50">
          <Icon icon="material-icon-theme:google" className="h-4 w-4" />
          Google로 계속하기
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          아직 계정이 없으신가요?
          <Link
            href="/signup"
            className="ml-2 cursor-pointer font-medium text-blue-600"
          >
            회원가입
          </Link>
        </p>
      </section>
    </div>
  );
}
