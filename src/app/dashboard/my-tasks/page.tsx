/**
 * page.tsx
 * 雇主我的任务列表 - 显示当前雇主的所有任务（招募中/进行中/已完成/已取消）
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getEmployerTasks } from "@/actions/task-actions";

const statusConfig: Record<string, { label: string; colors: string }> = {
 OPEN: { label: "招募中", colors: "text-[#30d158] bg-[#30d1581a]" },
 IN_PROGRESS: { label: "进行中", colors: "text-[#007aff] bg-[#007aff1a]" },
 COMPLETED: { label: "已完成", colors: "text-[#30d158] bg-[#30d1581a]" },
 CANCELLED: { label: "已取消", colors: "text-[var(--g-text2)] bg-[var(--g-input)]" },
};

export default function MyTasksPage() {
 const router = useRouter();
 const { isLoggedIn, mounted } = useAuth();
 const [tasks, setTasks] = useState<any[]>([]);

 useEffect(() => {
  if (mounted && !isLoggedIn) router.replace("/login");
 }, [mounted, isLoggedIn, router]);

 useEffect(() => {
  // Server Action reads auth() internally to get current user
  getEmployerTasks().then(setTasks);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 if (!mounted || !isLoggedIn) return null;

 return (
  <div>
   <button onClick={() => router.push("/dashboard")} className="text-sm text-[var(--g-text2)] mb-4 hover:text-[var(--g-text)] cursor-pointer">← 返回控制台</button>
   <div className="flex justify-between items-center mb-6">
    <h2 className="text-lg font-semibold">我的任务</h2>
    <button
     onClick={() => router.push("/tasks/new")}
     className="bg-black text-white px-5 py-2 rounded-xl text-sm font-medium cursor-pointer"
    >
     发布新任务
    </button>
   </div>
   <div className="flex flex-col gap-3">
    {tasks.length === 0 ? (
     <div className="bg-[var(--g-card)] rounded-2xl p-8 text-center text-sm text-[var(--g-text2)] dark:text-[#98989d]">暂无任务</div>
    ) : (
     tasks.map((t: any) => {
      const cfg = statusConfig[t.status] || { label: t.status, colors: "text-[var(--g-text2)] bg-[var(--g-input)]" };
      return (
       <div
        key={t.id}
        className="bg-[var(--g-card)] rounded-2xl p-5 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)]"
       >
        <div className="flex justify-between items-center">
         <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
           <span className="font-semibold text-sm">{t.title}</span>
           <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.colors}`}>{cfg.label}</span>
          </div>
          <div className="text-xs text-[var(--g-text2)] dark:text-[#98989d]">
           {t.category || "未分类"} · {t._count?.applications || 0} 人申请 · {new Date(t.createdAt).toLocaleDateString("zh-CN")} 发布
          </div>
         </div>
         {t.status === "OPEN" && (
          <button
           onClick={() => router.push(`/applications/${t.id}`)}
           className="bg-[var(--g-input)] text-[var(--g-text)] px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[var(--g-hover)] cursor-pointer"
          >
           查看申请
          </button>
         )}
        </div>
       </div>
      );
     })
    )}
   </div>
  </div>
 );
}
