/**
 * page.tsx
 * 任务详情页 - 动态数据加载、状态感知标记、智能返回（来源感知）、角色感知操作按钮
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import TaskDetailSidebar from "@/components/TaskDetailSidebar";
import { useAuth } from "@/lib/auth-context";
import { getTaskById } from "@/actions/task-actions";

function TaskDetailContent() {
 const router = useRouter();
 const params = useParams();
 const searchParams = useSearchParams();
 const from = searchParams.get("from");
 const { isLoggedIn, mounted } = useAuth();
 const [task, setTask] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  if (mounted && !isLoggedIn) {
   router.replace("/login");
   return;
  }
  if (!mounted) return;

  getTaskById(params.id as string)
   .then((data) => {
    if (!data) router.replace("/tasks");
    else setTask(data);
   })
   .finally(() => setLoading(false));
 }, [mounted, isLoggedIn, params.id, router]);

 if (!mounted || !isLoggedIn || loading) return null;
 if (!task) return null;

 const backUrl =
  from === "dashboard" ? "/dashboard"
  : from === "messages" ? "/messages"
  : "/tasks";
 const backLabel =
  from === "dashboard" ? "返回控制台"
  : from === "messages" ? "返回消息"
  : "返回任务列表";

 const statusBadge =
  task.status === "IN_PROGRESS"
   ? "bg-[#007aff1a] text-[#007aff]"
   : task.status === "COMPLETED"
   ? "bg-[#30d1581a] text-[#30d158]"
   : task.status === "CANCELLED"
   ? "bg-[#86868b1a] text-[var(--g-text2)] dark:text-[#98989d]"
   : "bg-[#30d1581a] text-[#30d158]";
 const statusLabel =
  task.status === "IN_PROGRESS"
   ? "进行中"
   : task.status === "COMPLETED"
   ? "已完成"
   : task.status === "CANCELLED"
   ? "已取消"
   : "招募中";

 return (
  <div className="flex flex-col flex-1">
   <Nav variant="dashboard" />
   <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
    <a href={backUrl} className="text-sm text-[var(--g-text2)] hover:text-[var(--g-text)]">← {backLabel}</a>
    <div className="grid grid-cols-[2fr_1fr] gap-6 mt-4">
     <div>
      <div className="flex justify-between items-start mb-6">
       <div>
        <h3 className="text-xl font-semibold mb-1">{task.title}</h3>
        <div className="flex gap-3 text-xs text-[var(--g-text2)] dark:text-[#98989d]">
         <span>{task.category || "未分类"}</span>
         <span>·</span>
         <span>{task.employer?.name || "未知雇主"}</span>
         <span>·</span>
         <span>{new Date(task.createdAt).toLocaleDateString("zh-CN")} 发布</span>
        </div>
       </div>
       <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge}`}>
        {statusLabel}
       </span>
      </div>
      <div className="bg-[var(--g-card)] rounded-[20px] p-6 shadow-[0_2px_20px_var(--g-shadow)] mb-4">
       <h4 className="text-sm font-semibold mb-3">任务详情</h4>
       <p className="text-xs text-[var(--g-text2)] leading-relaxed">{task.description}</p>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-4">
       {(task.skills || []).map((s: string) => (
        <span key={s} className="text-xs bg-[var(--g-card)] px-2.5 py-1.5 rounded-lg text-[var(--g-text2)] border border-[var(--g-border3)]">{s}</span>
       ))}
      </div>
     </div>
     <TaskDetailSidebar
      taskId={task.id}
      status={task.status}
      price={`¥${task.budget}`}
      employerName={task.employer?.name || ""}
     />
    </div>
   </main>
  </div>
 );
}

export default function TaskDetailPage() {
 return (
  <Suspense fallback={
   <div className="flex flex-col flex-1">
    <Nav variant="dashboard" />
    <div className="flex-1 flex items-center justify-center text-sm text-[var(--g-text2)] dark:text-[#98989d]">加载中...</div>
   </div>
  }>
   <TaskDetailContent />
  </Suspense>
 );
}
