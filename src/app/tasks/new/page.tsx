"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { createTask } from "@/actions/task-actions";

export default function PostTaskPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    detail: "",
    requirements: "",
    budgetMin: "",
    budgetMax: "",
    category: "",
    duration: "",
    workMode: "",
    location: "",
    deadline: "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <button onClick={() => router.push("/dashboard")} className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer">← 返回控制台</button>
        <h4 className="text-lg font-semibold mb-6">发布新任务</h4>
        <div className="grid grid-cols-[3fr_2fr] gap-6">
          {/* 左侧 */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">任务名称</div>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="请输入任务名称"
                className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">任务详情</div>
              <textarea
                value={form.detail}
                onChange={(e) => update("detail", e.target.value)}
                placeholder="请详细描述任务内容、交付物、验收标准等..."
                className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                style={{ minHeight: "100px" }}
              />
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">任职要求</div>
              <textarea
                value={form.requirements}
                onChange={(e) => update("requirements", e.target.value)}
                placeholder="请描述对申请者的要求..."
                className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                style={{ minHeight: "80px" }}
              />
            </div>
          </div>
          {/* 右侧 */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-3">预算 (¥)</div>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={form.budgetMin}
                  onChange={(e) => update("budgetMin", e.target.value)}
                  placeholder="最低"
                  className="flex-1 bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none"
                />
                <span className="text-[#86868b]">—</span>
                <input
                  type="text"
                  value={form.budgetMax}
                  onChange={(e) => update("budgetMax", e.target.value)}
                  placeholder="最高"
                  className="flex-1 bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-3">分类</div>
              <input
                type="text"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="选择任务分类..."
                className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none mb-3"
              />
              <div className="text-xs font-medium mb-2">技能标签</div>
              <div className="flex gap-1.5 flex-wrap">
                <span className="bg-[#f5f5f7] px-2 py-1 rounded-lg text-xs text-[#86868b] flex items-center gap-1">Figma ✕</span>
                <span className="bg-[#f5f5f7] px-2 py-1 rounded-lg text-xs text-[#86868b] flex items-center gap-1">UI/UX ✕</span>
                <button className="bg-white px-2 py-1 rounded-lg text-xs text-[#86868b] border border-dashed border-[rgba(0,0,0,0.15)] cursor-pointer">+ 添加</button>
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs font-medium mb-1.5">预计时长</div>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => update("duration", e.target.value)}
                    placeholder="选择..."
                    className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium mb-1.5">工作方式</div>
                  <input
                    type="text"
                    value={form.workMode}
                    onChange={(e) => update("workMode", e.target.value)}
                    placeholder="选择..."
                    className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="mb-3">
                <div className="text-xs font-medium mb-1.5">工作地点（线下）</div>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="输入地址..."
                  className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <div className="text-xs font-medium mb-1.5">截止日期</div>
                <input
                  type="text"
                  value={form.deadline}
                  onChange={(e) => update("deadline", e.target.value)}
                  placeholder="选择日期..."
                  className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
            </div>
            <button
              onClick={async () => {
                if (!form.title || !form.budgetMax) return;
                await createTask({
                  title: form.title,
                  description: form.detail,
                  budget: parseInt(form.budgetMax) || 0,
                  category: form.category,
                  deadline: form.deadline ? new Date(form.deadline) : undefined,
                  skills: [],
                });
                router.push("/dashboard");
              }}
              className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold cursor-pointer"
            >
              发布任务
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
