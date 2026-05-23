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
    budgetMax: "",
    category: "",
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
        budgetMax: String(t.budget || ""),
        category: t.category || "",
        deadline: t.deadline ? new Date(t.deadline).toISOString().split("T")[0] : "",
      });
    });
  }, [republishId]);

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <button onClick={() => router.push("/dashboard")} className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer">
          ← 返回控制台
        </button>
        <h4 className="text-lg font-semibold mb-6">
          {republishId ? "重新发布任务" : "发布新任务"}
        </h4>
        <div className="grid grid-cols-[3fr_2fr] gap-6">
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
                style={{ minHeight: "120px" }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-3">预算 (¥)</div>
              <input
                type="text"
                value={form.budgetMax}
                onChange={(e) => update("budgetMax", e.target.value)}
                placeholder="金额"
                className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-3">分类</div>
              <input
                type="text"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="选择任务分类..."
                className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-1.5">截止日期</div>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none"
              />
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

export default function PostTaskPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1">
        <Nav variant="dashboard" />
        <div className="flex-1 flex items-center justify-center text-sm text-[#86868b]">加载中...</div>
      </div>
    }>
      <PostTaskForm />
    </Suspense>
  );
}
