"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { useAuth } from "@/lib/auth-context";
import { getApplicationsForTask, acceptApplication, rejectApplication } from "@/actions/application-actions";
import { getTaskById } from "@/actions/task-actions";

export default function ApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn, mounted } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [task, setTask] = useState<any>(null);
  const [filter, setFilter] = useState<"全部" | "待审核" | "已通过">("全部");

  useEffect(() => {
    if (mounted && !isLoggedIn) { router.replace("/login"); return; }
    if (!mounted) return;

    getTaskById(params.id as string).then(setTask);
    getApplicationsForTask(params.id as string).then(setApplications);
  }, [mounted, isLoggedIn, params.id, router]);

  if (!mounted || !isLoggedIn) return null;

  const filtered = filter === "全部"
    ? applications
    : applications.filter((a) =>
        filter === "待审核" ? a.status === "PENDING" : a.status === "ACCEPTED"
      );

  const handleAccept = async (appId: string) => {
    await acceptApplication(appId);
    const updated = await getApplicationsForTask(params.id as string);
    setApplications(updated);
  };

  const handleReject = async (appId: string) => {
    await rejectApplication(appId);
    const updated = await getApplicationsForTask(params.id as string);
    setApplications(updated);
  };

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <a href="/dashboard/my-tasks" className="text-sm text-[#86868b] dark:text-[#98989d] hover:text-[#1d1d1f] dark:text-white dark:text-white">← 返回我的任务</a>
        <div className="flex justify-between items-center mb-6 mt-4">
          <div>
            <h4 className="text-base font-semibold mb-0.5">{task?.title || "任务"} · 申请列表</h4>
            <div className="text-xs text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]">共 {filtered.length} 人申请 | {task?.status === "OPEN" ? "招募中" : task?.status === "IN_PROGRESS" ? "进行中" : "已完成"}</div>
          </div>
          <div className="flex gap-1.5">
            {(["全部", "待审核", "已通过"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1 rounded-full text-xs cursor-pointer ${filter === f ? "bg-black text-white" : "bg-white text-[#86868b] dark:text-[#98989d] border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {filtered.map((a: any) => (
            <div key={a.id} className="bg-white dark:bg-[#2c2c2e] rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">{a.freelancer?.name}</span>
                    <span className="text-xs text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]">申请中</span>
                  </div>
                  <p className="text-xs text-[#86868b] dark:text-[#98989d] line-clamp-2">{a.message}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  a.status === "PENDING"
                    ? "bg-[#f59e0b1a] text-[#f59e0b]"
                    : a.status === "ACCEPTED"
                    ? "bg-[#30d1581a] text-[#30d158]"
                    : "bg-[#ff3b301a] text-[#ff3b30]"
                }`}>
                  {a.status === "PENDING" ? "待审核" : a.status === "ACCEPTED" ? "已通过" : "已拒绝"}
                </span>
                {a.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(a.id)} className="bg-[#007aff] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer">通过</button>
                    <button onClick={() => handleReject(a.id)} className="bg-[#ff3b30] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer">拒绝</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-sm text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]">没有匹配的申请</div>
          )}
        </div>
      </main>
    </div>
  );
}
