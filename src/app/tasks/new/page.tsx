"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import { createTask, getTaskById } from "@/actions/task-actions";

function PostTaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const republishId = searchParams.get("republish");

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

  useEffect(() => {
    if (!republishId) return;
    getTaskById(republishId).then((t) => {
      if (!t) return;
      setForm({
        title: t.title || "",
        detail: t.description || "",
        requirements: "",
        budgetMin: "",
        budgetMax: String(t.budget || ""),
        category: t.category || "",
        duration: "",
        workMode: "",
        location: "",
        deadline: t.deadline ? new Date(t.deadline).toISOString().split("T")[0] : "",
      });
    });
  }, [republishId]);

  const buildDescription = () => {
    const parts = [form.detail];
    if (form.requirements) parts.push("任职要求：" + form.requirements);
    if (form.duration) parts.push("预计时长：" + form.duration);
    if (form.workMode) parts.push("工作方式：" + form.workMode);
    if (form.location) parts.push("工作地点：" + form.location);
    return parts.join("\n\n");
  };

  const handleSubmit = async () => {
    if (!form.title || !form.budgetMax) return;
    await createTask({
      title: form.title,
      description: buildDescription(),
      budget: parseInt(form.budgetMax) || 0,
      category: form.category,
      deadline: form.deadline ? new Date(form.deadline) : undefined,
      skills: [],
    });
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <button onClick={() => router.push("/dashboard")} className="text-sm text-[#86868b] dark:text-[#98989d] mb-4 hover:text-[#1d1d1f] dark:text-white cursor-pointer">
          ← 返回控制台
        </button>
        <h4 className="text-lg font-semibold mb-6">
          {republishId ? "重新发布任务" : "发布新任务"}
        </h4>
        <div className="flex gap-6 items-start">
          {/* 左侧 — 主要内容 */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="bg-white dark:bg-[#2c2c2e] rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">任务名称</div>
              <input
                type="text" value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="请输入任务名称"
                className="w-full bg-[#f5f5f7] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="bg-white dark:bg-[#2c2c2e] rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">任务详情</div>
              <textarea
                value={form.detail}
                onChange={(e) => update("detail", e.target.value)}
                placeholder="请详细描述任务内容、交付物、验收标准等..."
                className="w-full bg-[#f5f5f7] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                style={{ minHeight: "140px" }}
              />
            </div>
            <div className="bg-white dark:bg-[#2c2c2e] rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">任职要求</div>
              <textarea
                value={form.requirements}
                onChange={(e) => update("requirements", e.target.value)}
                placeholder="请描述对申请者的要求，如经验、技能、证书等..."
                className="w-full bg-[#f5f5f7] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                style={{ minHeight: "100px" }}
              />
            </div>
          </div>

          {/* 右侧 — 参数设置 */}
          <div className="w-[240px] flex-shrink-0 flex flex-col gap-3">
            <div className="bg-white dark:bg-[#2c2c2e] rounded-[16px] p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">预算 (¥)</div>
              <div className="flex gap-1.5 items-center">
                <input type="text" value={form.budgetMin} onChange={(e) => update("budgetMin", e.target.value)} placeholder="最低"
                  className="w-full bg-[#f5f5f7] dark:bg-[#3a3a3c] rounded-lg px-2 py-2 text-xs outline-none" />
                <span className="text-[#86868b] dark:text-[#98989d] text-xs">—</span>
                <input type="text" value={form.budgetMax} onChange={(e) => update("budgetMax", e.target.value)} placeholder="最高"
                  className="w-full bg-[#f5f5f7] dark:bg-[#3a3a3c] rounded-lg px-2 py-2 text-xs outline-none" />
              </div>
            </div>
            <div className="bg-white dark:bg-[#2c2c2e] rounded-[16px] p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">分类</div>
              <input type="text" value={form.category} onChange={(e) => update("category", e.target.value)}
                placeholder="如 设计、翻译、技术" className="w-full bg-[#f5f5f7] dark:bg-[#3a3a3c] rounded-lg px-3 py-2 text-xs outline-none" />
            </div>
            <div className="bg-white dark:bg-[#2c2c2e] rounded-[16px] p-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">预计时长</div>
              <input type="text" value={form.duration} onChange={(e) => update("duration", e.target.value)}
                placeholder="如 2 周" className="w-full bg-[#f5f5f7] dark:bg-[#3a3a3c] rounded-lg px-3 py-2 text-xs outline-none" />
              <div className="text-xs font-medium mb-2 mt-3">工作方式</div>
              <input type="text" value={form.workMode} onChange={(e) => update("workMode", e.target.value)}
                placeholder="远程/线下/混合" className="w-full bg-[#f5f5f7] dark:bg-[#3a3a3c] rounded-lg px-3 py-2 text-xs outline-none" />
              <div className="text-xs font-medium mb-2 mt-3">工作地点</div>
              <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)}
                placeholder="城市或具体地址" className="w-full bg-[#f5f5f7] dark:bg-[#3a3a3c] rounded-lg px-3 py-2 text-xs outline-none" />
              <div className="text-xs font-medium mb-2 mt-3">截止日期</div>
              <input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)}
                className="w-full bg-[#f5f5f7] dark:bg-[#3a3a3c] rounded-lg px-3 py-2 text-xs outline-none" />
            </div>
            <button onClick={handleSubmit}
              className="w-full bg-black text-white text-center py-2.5 rounded-xl text-sm font-semibold cursor-pointer">
              发布任务
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PostTaskPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1">
        <Nav variant="dashboard" />
        <div className="flex-1 flex items-center justify-center text-sm text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]">加载中...</div>
      </div>
    }>
      <PostTaskForm />
    </Suspense>
  );
}
