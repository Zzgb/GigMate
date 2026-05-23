"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import TaskDetailSidebar from "@/components/TaskDetailSidebar";
import { useAuth } from "@/lib/auth-context";
import { getTaskById } from "@/actions/task-actions";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
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

  const requirements = task.description
    ? task.description.split("。").filter((s: string) => s.trim().length > 10).map((s: string) => s.trim() + "。")
    : [];

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <a href="/tasks" className="text-sm text-[#86868b] hover:text-[#1d1d1f]">← 返回任务列表</a>
        <div className="grid grid-cols-[2fr_1fr] gap-6 mt-4">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-1">{task.title}</h3>
                <div className="flex gap-3 text-xs text-[#86868b]">
                  <span>{task.category || "未分类"}</span>
                  <span>·</span>
                  <span>{task.employer?.name || "未知雇主"}</span>
                  <span>·</span>
                  <span>{new Date(task.createdAt).toLocaleDateString("zh-CN")} 发布</span>
                </div>
              </div>
              <span className="text-xs bg-[#30d1581a] text-[#30d158] px-2.5 py-1 rounded-full font-medium">
                {task.status === "OPEN" ? "招募中" : task.status === "IN_PROGRESS" ? "进行中" : "已完成"}
              </span>
            </div>
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] mb-4">
              <h4 className="text-sm font-semibold mb-3">任务详情</h4>
              <p className="text-xs text-[#86868b] leading-relaxed">{task.description}</p>
            </div>
            {requirements.length > 0 && (
              <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] mb-4">
                <h4 className="text-sm font-semibold mb-3">任务要求</h4>
                <ul className="text-xs text-[#86868b] leading-relaxed list-disc pl-4 space-y-1">
                  {requirements.map((req: string, i: number) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-1.5 flex-wrap mb-4">
              {(task.skills || []).map((s: string) => (
                <span key={s} className="text-xs bg-white px-2.5 py-1.5 rounded-lg text-[#86868b] border border-[rgba(0,0,0,0.06)]">{s}</span>
              ))}
            </div>
          </div>
          <TaskDetailSidebar
            taskId={task.id}
            price={`¥${task.budget}`}
            employerName={task.employer?.name || ""}
          />
        </div>
      </main>
    </div>
  );
}
