/**
 * TaskDetailSidebar.tsx
 * 任务详情侧边栏 - 预算显示、任务信息、状态感知按钮（立即申请/已申请/进行中/已完成/已取消/雇主不可申请）
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { applyForTask } from "@/actions/application-actions";
import { useAuth } from "@/lib/auth-context";

interface TaskDetailSidebarProps {
  taskId?: string;
  status?: string;
  price?: string;
  employerName?: string;
  deadline?: string;
  applicantCount?: number;
}

export default function TaskDetailSidebar({
  taskId,
  status = "OPEN",
  price = "¥200-500",
  employerName = "张三",
  deadline,
  applicantCount,
}: TaskDetailSidebarProps) {
 const router = useRouter();
 const { role } = useAuth();
 const isEmployer = role === "employer";
 const [applying, setApplying] = useState(false);
 const [applied, setApplied] = useState(false);

 const handleApply = async () => {
  if (!taskId || applying) return;
  setApplying(true);
  try {
   await applyForTask(taskId, "我对这个任务很感兴趣，希望可以合作！");
   setApplied(true);
  } catch {
   setApplying(false);
  }
 };

 return (
  <div className="bg-[var(--g-card)] rounded-[20px] p-6 shadow-[0_2px_20px_var(--g-shadow)]">
   <div className="text-center pb-4 border-b border-[var(--g-border2)] mb-4">
    <div className="text-xs text-[var(--g-text2)] mb-1">预算</div>
    <div className="text-3xl font-bold">{price}</div>
   </div>
   <div className="grid grid-cols-2 gap-3 mb-5">
    {[
     { label: "工作方式", value: "远程/线上" },
     { label: "申请人数", value: `${applicantCount || 0} 人` },
     { label: "截止日期", value: deadline || "未设置" },
    ].map((i) => (
     <div key={i.label}>
      <div className="text-xs text-[var(--g-text2)] dark:text-[#98989d]">{i.label}</div>
      <div className="text-sm font-medium">{i.value}</div>
     </div>
    ))}
   </div>
   <div className="flex items-center gap-3 py-3 border-t border-[var(--g-border2)] mb-5">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" />
    <div>
     <div className="text-sm font-medium">{employerName}</div>
     <div className="text-xs text-[var(--g-text2)] dark:text-[#98989d]">雇主</div>
    </div>
   </div>
   {status === "CANCELLED" ? (
    <div className="w-full bg-[#86868b] text-white text-center py-3 rounded-xl text-sm font-semibold">已取消</div>
   ) : status === "COMPLETED" ? (
    <div className="w-full bg-[#30d158] text-white text-center py-3 rounded-xl text-sm font-semibold">已完成</div>
   ) : status === "IN_PROGRESS" ? (
    <div className="text-center">
     <div className="w-full bg-[#007aff] text-white text-center py-3 rounded-xl text-sm font-semibold">进行中</div>
     <button
      onClick={() => router.push("/messages")}
      className="mt-2 w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold cursor-pointer"
     >
      联系雇主
     </button>
    </div>
   ) : isEmployer ? (
    <div className="w-full bg-[var(--g-input)] text-[var(--g-text2)] text-center py-3 rounded-xl text-sm">雇主无法申请任务</div>
   ) : applied ? (
    <div className="text-center">
     <div className="w-full bg-[#30d158] text-white text-center py-3 rounded-xl text-sm font-semibold">已申请</div>
     <button
      onClick={() => router.push("/messages")}
      className="mt-2 w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold cursor-pointer"
     >
      联系雇主
     </button>
    </div>
   ) : (
    <button
     onClick={handleApply}
     disabled={applying}
     className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
    >
     {applying ? "申请中..." : "立即申请"}
    </button>
   )}
   <div className="text-center mt-2 text-[10px] text-[var(--g-text2)] dark:text-[#98989d]">
    {applied ? "申请已提交，等待雇主审核" : "申请后等待雇主审核"}
   </div>
  </div>
 );
}
