/**
 * LandingHero.tsx
 * 首页 Hero 区域 - 满屏轮播背景 + Apple 风按钮
 * 修改日期: 2026-05-26
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface Slide {
  bg: string;
  title: string;
  subtitle: string;
}

const slides: Slide[] = [
  {
    bg: "from-[#1d1d1f] to-[#2d2d2f]",
    title: "才华与理想\n不该困在格子间",
    subtitle: "雇主发布任务→里程碑式交付",
  },
  {
    bg: "from-[#0f1b2d] to-[#1a2a4a]",
    title: "找到对的人\n比想象中简单",
    subtitle: "精确筛选·安全交易·高效交付",
  },
  {
    bg: "from-[#1a0a2e] to-[#2d1b4e]",
    title: "每一份付出\n都值得被认真对待",
    subtitle: "里程碑验收·资金托管·双向评价",
  },
];

function isImageUrl(s: string) {
  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/");
}

export default function LandingHero() {
  const router = useRouter();
  const { isLoggedIn, role, switchRole } = useAuth();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleEmployer = () => {
    if (!isLoggedIn) {
      router.push("/login?role=employer");
    } else {
      if (role !== "employer") switchRole();
      router.push("/dashboard");
    }
  };

  const handleFreelancer = () => {
    if (!isLoggedIn) {
      router.push("/login?role=freelancer");
    } else {
      if (role !== "freelancer") switchRole();
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative flex flex-col flex-1">
      <div className="fixed inset-0 -z-10">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              i === current ? "opacity-100 scale-100" : "opacity-0 scale-[1.06]"
            }`}
          >
            {isImageUrl(slide.bg) ? (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.bg})` }}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${slide.bg}`} />
            )}
          </div>
        ))}
      </div>

      <section className="relative min-h-[calc(100vh-56px)] flex flex-col items-center justify-center">
        <div className="relative z-10 text-center px-10">
          <h2 className="text-[3.2rem] font-black tracking-tighter leading-none text-white mb-4 whitespace-pre-line">
            {slides[current].title}
          </h2>
          <p className="text-lg text-white/75 max-w-[480px] mx-auto mb-8 leading-relaxed">
            {slides[current].subtitle}
          </p>
          <div className="flex gap-6 justify-center">
            <button
              onClick={handleEmployer}
              className="bg-white text-black px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer hover:bg-white/90 transition-colors"
              type="button"
            >
              发布需求
            </button>
            <button
              onClick={handleFreelancer}
              className="border border-white/40 text-white px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer hover:bg-white/10 transition-colors"
              type="button"
            >
              寻找机会
            </button>
          </div>
          <div className="flex gap-1.5 justify-center mt-10">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`rounded-full transition-all cursor-pointer ${
                  i === current ? "w-6 h-1 bg-white" : "w-2 h-1 bg-white/40"
                }`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
