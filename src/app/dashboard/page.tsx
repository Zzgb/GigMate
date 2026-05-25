/**
 * page.tsx
 * 控制台主页 - 角色感知双视图（雇主/自由职业者），含统计卡片、任务列表、评价弹窗、结束任务确认
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
 getDashboardData,
 completeTask, cancelTask,
 createReview,
} from "@/actions/dashboard-actions";
import {
 acceptApplication as acceptApp,
 rejectApplication as rejectApp,
} from "@/actions/application-actions";
import ConfirmModal from "@/components/ConfirmModal";
import InlineChat from "@/components/InlineChat";
import MilestoneProgressBar from "@/components/MilestoneProgressBar";
import { formatBudget } from "@/lib/utils";
import { ReviewPair, ReviewModal } from "@/components/ReviewSection";

// ========== 雇主端子视图 ==========

function EmployerActiveView({
 tasks,
 onBack,
 refresh,
 myAvatarUrl,
}: {
 tasks: any[];
 onBack: () => void;
 refresh: () => void;
 myAvatarUrl?: string | null;
}) {
 const router = useRouter();
 const [chatOpen, setChatOpen] = useState<string | null>(null);
 const [endStep1, setEndStep1] = useState(false);
 const [endStep2, setEndStep2] = useState(false);
 const [endingTaskId, setEndingTaskId] = useState<string | null>(null);

 return (
  <div>
   <button
    onClick={onBack}
    className="text-sm text-[var(--g-text2)] mb-4 hover:text-[var(--g-text)] cursor-pointer"
   >
    ← 返回概览
   </button>
   <h2 className="text-lg font-semibold mb-4">
    进行中的任务（{tasks.length}）
   </h2>
   {tasks.length === 0 ? (
    <div className="bg-[var(--g-card)] rounded-2xl p-8 text-center text-sm text-[var(--g-text2)] dark:text-[#98989d]">
     暂无进行中的任务
    </div>
   ) : (
    <div className="flex flex-col gap-3">
     {tasks.map((t: any) => {
      const worker = t.applications?.[0]?.freelancer;
      return (
       <div
        key={t.id}
        className="bg-[var(--g-card)] rounded-2xl border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)] overflow-hidden"
       >
        <div className="p-5 flex items-center gap-4">
         {worker?.avatarUrl ? <img src={worker.avatarUrl} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" alt="" /> : <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />}
         <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
           <span className="font-semibold text-sm">{t.title}</span>
           {worker && (
            <span className="text-xs text-[var(--g-text2)] dark:text-[#98989d]">
             {worker.name}
            </span>
           )}
          </div>
          <div className="flex items-center gap-2">
           <span className="text-xs bg-[#007aff1a] text-[#007aff] px-2 py-0.5 rounded-full font-medium">
            进行中
           </span>
           <span className="text-xs text-[var(--g-text2)] dark:text-[#98989d]">
            预算: {formatBudget(t.budget, t.budgetMin)}
           </span>
          </div>
         </div>

         {/* 铃铛 */}
         <button
          onClick={() =>
           setChatOpen(chatOpen === t.id ? null : t.id)
          }
          className="w-8 h-8 flex items-center justify-center relative cursor-pointer"
          type="button"
         >
          <svg
           width="16"
           height="20"
           viewBox="0 0 16 20"
           fill="none"
           stroke={chatOpen === t.id ? "#007aff" : "#86868b"}
           strokeWidth="1.5"
           strokeLinecap="round"
           strokeLinejoin="round"
          >
           <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6V9.5C3.5 9.9 3.3 10.2 3.1 10.4L2 11.7C1.4 12.5 1 13.5 1 14.6C1 16 2.2 16.5 3.5 16.5H12.5C13.8 16.5 15 16 15 14.6C15 13.5 14.6 12.5 14 11.7L12.9 10.4C12.7 10.2 12.5 9.9 12.5 9.5V6C12.5 3.5 10.5 1.5 8 1.5Z" />
           <path d="M10 16.5C10 17.1 9.5 17.5 9 17.5H7C6.5 17.5 6 17.1 6 16.5" strokeWidth="1.2" />
          </svg>
         </button>

         <div className="flex gap-2">
          <button
           onClick={async () => {
            await completeTask(t.id);
            refresh();
           }}
           className="bg-[#30d158] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer"
          >
           完成任务
          </button>
          <button
           onClick={() => { setEndingTaskId(t.id); setEndStep1(true); }}
           className="bg-[#ff3b30] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer"
          >
           结束任务
          </button>
         </div>
        </div>

        {/* 内联聊天 */}
        <InlineChat
         otherUserId={worker?.id || ""}
         otherUserName={worker?.name || ""}
         taskTitle={t.title}
         taskId={t.id}
         open={chatOpen === t.id}
         onClose={() => setChatOpen(null)}
         from="dashboard-workers"
         otherAvatarUrl={worker?.avatarUrl || undefined}
         myAvatarUrl={myAvatarUrl}
        />
       </div>
      );
     })}
    </div>
   )}

   <ConfirmModal open={endStep1} title="确认操作？" description="确定要结束该任务？任务会被标记为已取消。"
    confirmLabel="确定" onConfirm={async () => { if (endingTaskId) await cancelTask(endingTaskId); setEndStep1(false); setEndStep2(true); }} onCancel={() => setEndStep1(false)} />
   <ConfirmModal open={endStep2} title="是否重新发布此任务？" description="可将当前任务信息自动填入发布页面，方便快速重新发布。"
    confirmLabel="重新发布" confirmColor="blue" secondStep
    onConfirm={() => { setEndStep2(false); router.push(`/tasks/new?republish=${endingTaskId}`); }} onCancel={() => setEndStep2(false)} />
  </div>
 );
}

function EmployerCompletedView({
 tasks,
 onBack,
 refresh,
}: {
 tasks: any[];
 onBack: () => void;
 refresh: () => void;
}) {
 const [reviewing, setReviewing] = useState<{
  taskId: string;
  revieweeId: string;
  revieweeName: string;
 } | null>(null);
 const { userId } = useAuth();

 const handleSubmitReview = async (rating: number, comment: string) => {
  if (!reviewing) return;
  await createReview({
   taskId: reviewing.taskId,
   revieweeId: reviewing.revieweeId,
   rating,
   comment: comment || null,
  });
  setReviewing(null);
  refresh();
 };

 return (
  <div>
   <button
    onClick={onBack}
    className="text-sm text-[var(--g-text2)] mb-4 hover:text-[var(--g-text)] cursor-pointer"
   >
    ← 返回概览
   </button>
   <h2 className="text-lg font-semibold mb-4">
    已完成的任务（{tasks.length}）
   </h2>
   {tasks.length === 0 ? (
    <div className="bg-[var(--g-card)] rounded-2xl p-8 text-center text-sm text-[var(--g-text2)] dark:text-[#98989d]">
     暂无已完成的任务
    </div>
   ) : (
    <div className="flex flex-col gap-3">
     {tasks.map((t: any) => {
      const worker = t.applications?.[0]?.freelancer;
      return (
       <div
        key={t.id}
        className="bg-[var(--g-card)] rounded-2xl p-5 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)]"
       >
        <div className="flex justify-between items-center">
         <div>
          <span className="font-semibold text-sm">{t.title}</span>
          {worker && (
           <div className="text-xs text-[var(--g-text2)] mt-1">
            完成者: {worker.name}
           </div>
          )}
          <div className="text-xs text-[var(--g-text2)] mt-0.5">
           {formatBudget(t.budget, t.budgetMin)}
          </div>
          {worker && userId && (
           <ReviewPair
            employerName={t.employer?.name || '雇主'}
            freelancerName={worker.name || '自由职业者'}
            employerId={t.employerId}
            freelancerId={worker.id}
            reviews={t.reviews || []}
            currentUserId={userId}
            isEmployer
            taskId={t.id}
            onCreateReview={(revieweeId) => setReviewing({ taskId: t.id, revieweeId, revieweeName: revieweeId === worker.id ? worker.name : (t.employer?.name || '雇主') })}
           />
          )}
          {t.milestones?.length > 0 && (
           <div className="mt-2">
            <MilestoneProgressBar milestones={t.milestones} taskStatus="COMPLETED" />
           </div>
          )}
         </div>
         <div className="text-right">
          <span className="text-xs text-[#30d158] font-medium">已完成</span>
         </div>
        </div>
       </div>
      );
     })}
    </div>
   )}

{reviewing && (
    <ReviewModal
     open={!!reviewing}
     revieweeName={reviewing.revieweeName}
     onClose={() => setReviewing(null)}
     onSubmit={handleSubmitReview}
    />
   )}
  </div>
 );
}

function EmployerApplicationsListView({
 apps,
 onBack,
 refresh,
 myAvatarUrl,
}: {
 apps: any[];
 onBack: () => void;
 refresh: () => void;
 myAvatarUrl?: string | null;
}) {
 const [loadingApp, setLoadingApp] = useState<string | null>(null);
 const [chatOpen, setChatOpen] = useState<string | null>(null);

 const handleAccept = async (appId: string) => {
  setLoadingApp(appId);
  await acceptApp(appId);
  setLoadingApp(null);
  refresh();
 };

 const handleReject = async (appId: string) => {
  setLoadingApp(appId);
  await rejectApp(appId);
  setLoadingApp(null);
  refresh();
 };

 return (
  <div>
   <button
    onClick={onBack}
    className="text-sm text-[var(--g-text2)] mb-4 hover:text-[var(--g-text)] cursor-pointer"
   >
    ← 返回概览
   </button>
   <h2 className="text-lg font-semibold mb-4">
    待处理的申请（{apps.length}）
   </h2>
   {apps.length === 0 ? (
    <div className="bg-[var(--g-card)] rounded-2xl p-8 text-center text-sm text-[var(--g-text2)] dark:text-[#98989d]">
     暂无待处理的申请
    </div>
   ) : (
    <div className="flex flex-col gap-3">
     {apps.map((a: any) => (
      <div
       key={a.id}
       className="bg-[var(--g-card)] rounded-2xl border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)] overflow-hidden"
      >
       <div className="p-5 flex items-center gap-4">
        {a.freelancer?.avatarUrl ? <img src={a.freelancer.avatarUrl} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" alt="" /> : <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />}
        <div className="flex-1 min-w-0">
         <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm">
           {a.freelancer?.name}
          </span>
          <span className="text-xs text-[var(--g-text2)] dark:text-[#98989d]">
           {a.task?.title}
          </span>
         </div>
         <p className="text-xs text-[var(--g-text2)] line-clamp-1">
          {a.message}
         </p>
        </div>
        <span className="text-xs bg-[#f59e0b1a] text-[#f59e0b] px-2.5 py-1 rounded-full font-medium">
         待审核
        </span>

        {/* 铃铛 */}
        <button
         onClick={() => setChatOpen(chatOpen === a.id ? null : a.id)}
         className="w-8 h-8 flex items-center justify-center relative cursor-pointer"
         type="button"
        >
         <svg
          width="16"
          height="20"
          viewBox="0 0 16 20"
          fill="none"
          stroke={chatOpen === a.id ? "#007aff" : "#86868b"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
         >
          <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6V9.5C3.5 9.9 3.3 10.2 3.1 10.4L2 11.7C1.4 12.5 1 13.5 1 14.6C1 16 2.2 16.5 3.5 16.5H12.5C13.8 16.5 15 16 15 14.6C15 13.5 14.6 12.5 14 11.7L12.9 10.4C12.7 10.2 12.5 9.9 12.5 9.5V6C12.5 3.5 10.5 1.5 8 1.5Z" />
          <path d="M10 16.5C10 17.1 9.5 17.5 9 17.5H7C6.5 17.5 6 17.1 6 16.5" strokeWidth="1.2" />
         </svg>
        </button>

        <div className="flex gap-2">
         <button
          onClick={() => handleAccept(a.id)}
          disabled={loadingApp === a.id}
          className="bg-[#007aff] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer disabled:opacity-50"
         >
          通过
         </button>
         <button
          onClick={() => handleReject(a.id)}
          disabled={loadingApp === a.id}
          className="bg-[#ff3b30] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer disabled:opacity-50"
         >
          拒绝
         </button>
        </div>
       </div>

       {/* 内联聊天 */}
       <InlineChat
        otherUserId={a.freelancer?.id || ""}
        otherUserName={a.freelancer?.name || ""}
        taskTitle={a.task?.title || ""}
        taskId={a.task?.id}
        open={chatOpen === a.id}
        onClose={() => setChatOpen(null)}
        from="dashboard-applications"
        otherAvatarUrl={a.freelancer?.avatarUrl || undefined}
        myAvatarUrl={myAvatarUrl}
       />
      </div>
     ))}
    </div>
   )}
  </div>
 );
}

// ========== 自由职业端子视图 ==========

function FreelancerActiveTasks({
 tasks,
 onBack,
}: {
 tasks: any[];
 onBack: () => void;
}) {
 const router = useRouter();

 return (
  <div>
   <button
    onClick={onBack}
    className="text-sm text-[var(--g-text2)] mb-4 hover:text-[var(--g-text)] cursor-pointer"
   >
    ← 返回概览
   </button>
   <h2 className="text-lg font-semibold mb-4">
    正在进行的任务（{tasks.length}）
   </h2>
   {tasks.length === 0 ? (
    <div className="bg-[var(--g-card)] rounded-2xl p-8 text-center text-sm text-[var(--g-text2)] dark:text-[#98989d]">
     暂无进行中的任务
    </div>
   ) : (
    <div className="flex flex-col gap-3">
     {tasks.map((t: any) => (
      <div
       key={t.id}
       className="bg-[var(--g-card)] rounded-2xl p-5 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)]"
      >
       <div className="flex justify-between items-center">
        <div>
         <button
          onClick={() => router.push(`/tasks/${t.id}?from=dashboard-active`)}
          className="font-semibold text-sm hover:text-[#007aff] cursor-pointer text-left"
         >
          {t.title}
         </button>
         <div className="text-xs text-[var(--g-text2)] mt-1">
          {t.employer?.name}
         </div>
        </div>
        <div className="text-right flex items-center gap-3">
         <span className="text-sm font-bold">
          {formatBudget(t.budget, t.budgetMin)}
         </span>
         <button
          onClick={() =>
           router.push(
            `/messages?with=${encodeURIComponent(
             t.employer?.name || ""
            )}`
           )
          }
          className="bg-[#007aff] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer"
         >
          联系雇主
         </button>
        </div>
       </div>
      </div>
     ))}
    </div>
   )}
  </div>
 );
}

function FreelancerCompletedTasks({
 tasks,
 onBack,
 refresh,
}: {
 tasks: any[];
 onBack: () => void;
 refresh: () => void;
}) {
 const router = useRouter();
 const { userId } = useAuth();
 const [reviewing, setReviewing] = useState<{ taskId: string; revieweeId: string; revieweeName: string } | null>(null);

 const handleSubmitReview = async (rating: number, comment: string) => {
  if (!reviewing) return;
  await createReview({ taskId: reviewing.taskId, revieweeId: reviewing.revieweeId, rating, comment: comment || null });
  setReviewing(null);
  refresh();
 };

 return (
  <div>
   <button onClick={onBack} className="text-sm text-[var(--g-text2)] mb-4 hover:text-[var(--g-text)] cursor-pointer">← 返回概览</button>
   <h2 className="text-lg font-semibold mb-4">已完成的任务（{tasks.length}）</h2>
   {tasks.length === 0 ? (
    <div className="bg-[var(--g-card)] rounded-2xl p-8 text-center text-sm text-[var(--g-text2)] dark:text-[#98989d]">暂无已完成的任务</div>
   ) : (
    <div className="flex flex-col gap-3">
     {tasks.map((t: any) => {
      const worker = t.applications?.[0]?.freelancer;
      return (
       <div key={t.id} className="bg-[var(--g-card)] rounded-2xl p-5 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)]">
        <div>
         <button onClick={() => router.push(`/tasks/${t.id}?from=dashboard-completed`)}
          className="font-semibold text-sm hover:text-[#007aff] cursor-pointer text-left">{t.title}</button>
         <div className="text-xs text-[var(--g-text2)] mt-1">{t.employer?.name}</div>
        </div>
        <div className="flex items-center justify-between mt-1">
         <span className="text-sm font-bold">{formatBudget(t.budget, t.budgetMin)}</span>
        </div>
        {worker && userId && (
         <ReviewPair
          employerName={t.employer?.name || '雇主'}
          freelancerName={worker.name || '自由职业者'}
          employerId={t.employerId}
          freelancerId={worker.id}
          reviews={t.reviews || []}
          currentUserId={userId}
          isEmployer={false}
          taskId={t.id}
          onCreateReview={(revieweeId) => setReviewing({ taskId: t.id, revieweeId, revieweeName: t.employer?.name || '雇主' })}
         />
        )}
        {t.milestones?.length > 0 && (
         <div className="mt-2"><MilestoneProgressBar milestones={t.milestones} taskStatus="COMPLETED" /></div>
        )}
       </div>
      );
     })}
    </div>
   )}
   {reviewing && (
    <ReviewModal open={!!reviewing} revieweeName={reviewing.revieweeName}
     onClose={() => setReviewing(null)} onSubmit={handleSubmitReview} />
   )}
  </div>
 );
}
function FreelancerPendingApps({
 apps,
 onBack,
}: {
 apps: any[];
 onBack: () => void;
}) {
 return (
  <div>
   <button
    onClick={onBack}
    className="text-sm text-[var(--g-text2)] mb-4 hover:text-[var(--g-text)] cursor-pointer"
   >
    ← 返回概览
   </button>
   <h2 className="text-lg font-semibold mb-4">
    待处理的申请（{apps.length}）
   </h2>
   {apps.length === 0 ? (
    <div className="bg-[var(--g-card)] rounded-2xl p-8 text-center text-sm text-[var(--g-text2)] dark:text-[#98989d]">
     暂无待处理的申请
    </div>
   ) : (
    <div className="flex flex-col gap-3">
     {apps.map((a: any, i: number) => (
      <div
       key={i}
       className="bg-[var(--g-card)] rounded-2xl p-5 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)]"
      >
       <div className="flex justify-between items-center">
        <div>
         <span className="font-semibold text-sm">
          {a.task?.title}
         </span>
         <div className="text-xs text-[var(--g-text2)] mt-1">申请中</div>
        </div>
        <div className="flex items-center gap-3">
         {a.task?.budget && (
          <span className="text-sm font-bold">
           {formatBudget(a.task.budget, a.task.budgetMin)}
          </span>
         )}
         <span
          className="text-xs px-2.5 py-0.5 rounded-full font-medium"
          style={{ color: "#f59e0b", backgroundColor: "#f59e0b1a" }}
         >
          待审核
         </span>
        </div>
       </div>
      </div>
     ))}
    </div>
   )}
  </div>
 );
}

// ========== 主页面 ==========

export default function DashboardPage() {
 const router = useRouter();
 const { name, role, avatarUrl: myAvatarUrl } = useAuth();
 const [data, setData] = useState<any>(null);
 const [view, setView] = useState<string>("overview");
 const [refreshKey, setRefreshKey] = useState(0);

 useEffect(() => {
  const p = new URLSearchParams(window.location.search);
  const v = p.get("view");
  if (v) setView(v);
 }, []);

 useEffect(() => {
  getDashboardData().then(setData);
 }, [refreshKey]);

 if (!data) return null;

 // 自由职业者端子视图
 if (role === "freelancer" && view === "active") {
  return (
   <div>
    <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
    <FreelancerActiveTasks
     tasks={data.activeTasks}
     onBack={() => setView("overview")}
    />
   </div>
  );
 }
 if (role === "freelancer" && view === "completed") {
  return (
   <div>
    <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
    <FreelancerCompletedTasks
     tasks={data.completedTasks}
     onBack={() => setView("overview")}
     refresh={() => setRefreshKey((k) => k + 1)}
    />
   </div>
  );
 }
 if (role === "freelancer" && view === "pending") {
  return (
   <div>
    <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
    <FreelancerPendingApps
     apps={data.pendingApps}
     onBack={() => setView("overview")}
    />
   </div>
  );
 }

 // 雇主端子视图
 if (role === "employer" && view === "workers") {
  return (
   <div>
    <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
    <EmployerActiveView
     tasks={data.activeTasks}
     onBack={() => setView("overview")}
     refresh={() => setRefreshKey((k) => k + 1)}
     myAvatarUrl={myAvatarUrl}
    />
   </div>
  );
 }
 if (role === "employer" && view === "completed") {
  return (
   <div>
    <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
    <EmployerCompletedView
     tasks={data.completedTasks}
     onBack={() => setView("overview")}
     refresh={() => setRefreshKey((k) => k + 1)}
    />
   </div>
  );
 }
 if (role === "employer" && view === "applications") {
  return (
   <div>
    <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
    <EmployerApplicationsListView
     apps={data.pendingApps}
     onBack={() => setView("overview")}
     refresh={() => setRefreshKey((k) => k + 1)}
     myAvatarUrl={myAvatarUrl}
    />
   </div>
  );
 }

 // 自由职业者概览
 if (role === "freelancer") {
  return (
   <div>
    <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
    <div className="flex gap-2 mb-6">
     <span className="bg-black text-white px-4 py-1.5 rounded-full text-sm">
      概览
     </span>
     <button
      onClick={() => router.push("/tasks")}
      className="bg-[var(--g-card)] px-4 py-1.5 rounded-full text-sm text-[var(--g-text2)] border border-[var(--g-border3)] cursor-pointer"
     >
      浏览任务
     </button>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-8">
     <button
      onClick={() => setView("active")}
      className="bg-[var(--g-card)] rounded-2xl p-6 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)] text-left w-full cursor-pointer"
     >
      <div
       className="text-3xl font-bold mb-1"
       style={{ color: "#007aff" }}
      >
       {data.stats.active}
      </div>
      <div className="text-sm text-[var(--g-text2)] dark:text-[#98989d]">进行中</div>
     </button>
     <button
      onClick={() => setView("completed")}
      className="bg-[var(--g-card)] rounded-2xl p-6 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)] text-left w-full cursor-pointer"
     >
      <div
       className="text-3xl font-bold mb-1"
       style={{ color: "#30d158" }}
      >
       {data.stats.completed}
      </div>
      <div className="text-sm text-[var(--g-text2)] dark:text-[#98989d]">已完成</div>
     </button>
     <button
      onClick={() => setView("pending")}
      className="bg-[var(--g-card)] rounded-2xl p-6 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)] text-left w-full cursor-pointer"
     >
      <div
       className="text-3xl font-bold mb-1"
       style={{ color: "#1d1d1f" }}
      >
       {data.stats.pending}
      </div>
      <div className="text-sm text-[var(--g-text2)] dark:text-[#98989d]">待处理申请</div>
     </button>
    </div>

    <div className="bg-[var(--g-card)] rounded-2xl p-6 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)] mb-4">
     <h3 className="text-base font-semibold mb-4">正在进行的任务</h3>
     {data.activeTasks.length === 0 ? (
      <p className="text-sm text-[var(--g-text2)] dark:text-[#98989d]">暂无进行中的任务</p>
     ) : (
      data.activeTasks.map((t: any) => (
       <div
        key={t.id}
        className="flex justify-between items-center py-3 border-b border-[var(--g-border)] last:border-0"
       >
        <div>
         <button
          onClick={() => router.push(`/tasks/${t.id}?from=dashboard`)}
          className="text-sm font-medium hover:text-[#007aff] cursor-pointer text-left"
         >
          {t.title}
         </button>
         <div className="text-xs text-[var(--g-text2)] dark:text-[#98989d]">
          {t.employer?.name}
         </div>
        </div>
        <div className="flex items-center gap-3">
         <span className="text-sm font-bold">
          {formatBudget(t.budget, t.budgetMin)}
         </span>
         <button
          onClick={() =>
           router.push(
            `/messages?with=${encodeURIComponent(
             t.employer?.name || ""
            )}`
           )
          }
          className="bg-[#007aff] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer"
         >
          联系雇主
         </button>
        </div>
       </div>
      ))
     )}
    </div>

    <div className="bg-[var(--g-card)] rounded-2xl p-6 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)]">
     <h3 className="text-base font-semibold mb-4">我的申请</h3>
     {data.pendingApps.length === 0 ? (
      <p className="text-sm text-[var(--g-text2)] dark:text-[#98989d]">暂无申请记录</p>
     ) : (
      data.pendingApps.map((a: any, i: number) => (
       <div
        key={i}
        className="flex justify-between items-center py-3 border-b border-[var(--g-border)] last:border-0"
       >
        <div>
         <span className="text-sm font-medium">
          {a.task?.title}
         </span>
        </div>
        <div className="flex items-center gap-3">
         {a.task?.budget && (
          <span className="text-sm font-bold">
           {formatBudget(a.task.budget, a.task.budgetMin)}
          </span>
         )}
         <span
          className="text-xs px-2.5 py-0.5 rounded-full font-medium"
          style={{
           color: "#f59e0b",
           backgroundColor: "#f59e0b1a",
          }}
         >
          待审核
         </span>
        </div>
       </div>
      ))
     )}
    </div>
   </div>
  );
 }

 // 雇主概览
 return (
  <div>
   <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
   <div className="flex gap-2 mb-6">
    <span className="bg-black text-white px-4 py-1.5 rounded-full text-sm">
     概览
    </span>
    <button
     onClick={() => router.push("/dashboard/my-tasks")}
     className="bg-[var(--g-card)] px-4 py-1.5 rounded-full text-sm text-[var(--g-text2)] border border-[var(--g-border3)] cursor-pointer"
    >
     我的任务
    </button>
    <button
     onClick={() => router.push("/tasks/new")}
     className="bg-[var(--g-card)] px-4 py-1.5 rounded-full text-sm text-[var(--g-text2)] border border-[var(--g-border3)] cursor-pointer"
    >
     发布任务
    </button>
   </div>

   <div className="grid grid-cols-3 gap-4 mb-8">
    <button
     onClick={() => setView("workers")}
     className="bg-[var(--g-card)] rounded-2xl p-6 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)] text-left w-full cursor-pointer"
    >
     <div
      className="text-3xl font-bold mb-1"
      style={{ color: "#007aff" }}
     >
      {data.stats.active}
     </div>
     <div className="text-sm text-[var(--g-text2)] dark:text-[#98989d]">进行中</div>
    </button>
    <button
     onClick={() => setView("completed")}
     className="bg-[var(--g-card)] rounded-2xl p-6 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)] text-left w-full cursor-pointer"
    >
     <div
      className="text-3xl font-bold mb-1"
      style={{ color: "#30d158" }}
     >
      {data.stats.completed}
     </div>
     <div className="text-sm text-[var(--g-text2)] dark:text-[#98989d]">已完成</div>
    </button>
    <button
     onClick={() => setView("applications")}
     className="bg-[var(--g-card)] rounded-2xl p-6 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)] text-left w-full cursor-pointer"
    >
     <div
      className="text-3xl font-bold mb-1"
      style={{ color: "#1d1d1f" }}
     >
      {data.stats.applications}
     </div>
     <div className="text-sm text-[var(--g-text2)] dark:text-[#98989d]">总申请</div>
    </button>
   </div>

   <div className="bg-[var(--g-card)] rounded-2xl p-6 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)]">
    <h3 className="text-base font-semibold mb-4">最近任务</h3>
    {[...(data.openTasks || []), ...data.activeTasks, ...data.completedTasks]
     .slice(0, 8)
     .map((t: any) => (
      <div
       key={t.id}
       className="flex justify-between items-center py-3 border-b border-[var(--g-border)] last:border-0"
      >
       <span className="text-sm">{t.title}</span>
       <span
        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
         t.status === "IN_PROGRESS"
          ? "bg-[#007aff1a] text-[#007aff]"
          : t.status === "COMPLETED" || t.status === "CANCELLED"
          ? "bg-[#30d1581a] text-[#30d158]"
          : "bg-[#f59e0b1a] text-[#f59e0b]"
        }`}
       >
        {t.status === "IN_PROGRESS" ? "进行中" : t.status === "COMPLETED" || t.status === "CANCELLED" ? "已完成" : "招募中"}
       </span>
      </div>
     ))}
    {(data.openTasks || []).length + data.activeTasks.length + data.completedTasks.length === 0 && (
     <p className="text-sm text-[var(--g-text2)] text-center py-4">
      暂无任务
     </p>
    )}
   </div>
  </div>
 );
}
