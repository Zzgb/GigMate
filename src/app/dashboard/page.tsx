"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getDashboardData,
  completeTask,
  createReview,
} from "@/actions/dashboard-actions";
import {
  acceptApplication as acceptApp,
  rejectApplication as rejectApp,
} from "@/actions/application-actions";
import ConfirmModal from "@/components/ConfirmModal";
import InlineChat from "@/components/InlineChat";

function formatPrice(budget: number): string {
  return `¥${budget}`;
}

function StarsInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2 justify-center mb-4 text-2xl text-[#f59e0b]">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="cursor-pointer transition-transform hover:scale-110"
        >
          {n <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

// ========== 雇主端子视图 ==========

function EmployerActiveView({
  tasks,
  onBack,
  refresh,
}: {
  tasks: any[];
  onBack: () => void;
  refresh: () => void;
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
        className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer"
      >
        ← 返回概览
      </button>
      <h2 className="text-lg font-semibold mb-4">
        进行中的任务（{tasks.length}）
      </h2>
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#86868b]">
          暂无进行中的任务
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((t: any) => {
            const worker = t.applications?.[0]?.freelancer;
            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden"
              >
                <div className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm">{t.title}</span>
                      {worker && (
                        <span className="text-xs text-[#86868b]">
                          {worker.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-[#007aff1a] text-[#007aff] px-2 py-0.5 rounded-full font-medium">
                        进行中
                      </span>
                      <span className="text-xs text-[#86868b]">
                        预算: {formatPrice(t.budget)}
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
                />
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal open={endStep1} title="确认操作？" description="确定要结束该任务？任务会被标记为已完成。"
        confirmLabel="确定" onConfirm={() => { setEndStep1(false); setEndStep2(true); }} onCancel={() => setEndStep1(false)} />
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
  } | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const handleSubmitReview = async () => {
    if (!reviewing) return;
    await createReview({
      taskId: reviewing.taskId,
      revieweeId: reviewing.revieweeId,
      rating: reviewRating,
      comment: reviewText.trim() || null,
    });
    setReviewing(null);
    setReviewText("");
    setReviewRating(5);
    refresh();
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer"
      >
        ← 返回概览
      </button>
      <h2 className="text-lg font-semibold mb-4">
        已完成的任务（{tasks.length}）
      </h2>
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#86868b]">
          暂无已完成的任务
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((t: any) => {
            const worker = t.applications?.[0]?.freelancer;
            const review = t.reviews?.[0];
            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-sm">{t.title}</span>
                    {worker && (
                      <div className="text-xs text-[#86868b] mt-1">
                        完成者: {worker.name}
                      </div>
                    )}
                    <div className="text-xs text-[#86868b] mt-0.5">
                      {formatPrice(t.budget)}
                    </div>
                    {review && (
                      <div className="mt-2 pt-2 border-t border-[rgba(0,0,0,0.04)]">
                        <div className="text-xs text-[#f59e0b]">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                        {review.comment && (
                          <div className="text-[10px] text-[#86868b] mt-0.5">{review.comment}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#30d158] font-medium">
                      已完成
                    </span>
                    {worker && !review && (
                      <button
                        onClick={() =>
                          setReviewing({
                            taskId: t.id,
                            revieweeId: worker.id,
                          })
                        }
                        className="block ml-auto mt-1 bg-[#007aff] text-white px-3 py-1 rounded-full text-xs font-medium cursor-pointer"
                      >
                        评价
                      </button>
                    )}
                    {review && (
                      <div className="text-xs text-[#30d158] mt-1">已评价</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewing && (
        <div
          className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setReviewing(null)}
        >
          <div
            className="bg-white rounded-[20px] p-6 w-[360px] shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold mb-4">评价完成者</h3>
            <div className="text-xs text-[#86868b] mb-3 text-center">
              为完成者{ " " }
              {tasks
                .find((t: any) => t.id === reviewing.taskId)
                ?.applications?.[0]?.freelancer?.name || ""}
              {" "}的工作表现打分
            </div>
            <StarsInput
              value={reviewRating}
              onChange={setReviewRating}
            />
            <input
              type="text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="请填写评价内容..."
              className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setReviewing(null)}
                className="flex-1 bg-[#f5f5f7] text-[#1d1d1f] py-2.5 rounded-xl text-sm font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
              >
                提交评价
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployerApplicationsListView({
  apps,
  onBack,
  refresh,
}: {
  apps: any[];
  onBack: () => void;
  refresh: () => void;
}) {
  const [loadingApp, setLoadingApp] = useState<string | null>(null);

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
        className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer"
      >
        ← 返回概览
      </button>
      <h2 className="text-lg font-semibold mb-4">
        待处理的申请（{apps.length}）
      </h2>
      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#86868b]">
          暂无待处理的申请
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {apps.map((a: any) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">
                      {a.freelancer?.name}
                    </span>
                    <span className="text-xs text-[#86868b]">
                      {a.task?.title}
                    </span>
                  </div>
                  <p className="text-xs text-[#86868b] line-clamp-1">
                    {a.message}
                  </p>
                </div>
                <span className="text-xs bg-[#f59e0b1a] text-[#f59e0b] px-2.5 py-1 rounded-full font-medium">
                  待审核
                </span>
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
        className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer"
      >
        ← 返回概览
      </button>
      <h2 className="text-lg font-semibold mb-4">
        正在进行的任务（{tasks.length}）
      </h2>
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#86868b]">
          暂无进行中的任务
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((t: any) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
            >
              <div className="flex justify-between items-center">
                <div>
                  <button
                    onClick={() => router.push(`/tasks/${t.id}?from=dashboard`)}
                    className="font-semibold text-sm hover:text-[#007aff] cursor-pointer text-left"
                  >
                    {t.title}
                  </button>
                  <div className="text-xs text-[#86868b] mt-1">
                    {t.employer?.name}
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="text-sm font-bold">
                    {formatPrice(t.budget)}
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
}: {
  tasks: any[];
  onBack: () => void;
}) {
  const router = useRouter();
  const { userId } = useAuth();
  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer"
      >
        ← 返回概览
      </button>
      <h2 className="text-lg font-semibold mb-4">
        已完成的任务（{tasks.length}）
      </h2>
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#86868b]">
          暂无已完成的任务
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((t: any) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
            >
              <div className="flex justify-between items-center">
                <div>
                  <button
                    onClick={() => router.push(`/tasks/${t.id}?from=dashboard`)}
                    className="font-semibold text-sm hover:text-[#007aff] cursor-pointer text-left"
                  >
                    {t.title}
                  </button>
                  <div className="text-xs text-[#86868b] mt-1">
                    {t.employer?.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-sm font-bold">
                      {formatPrice(t.budget)}
                    </span>
                    {(() => {
                      const myReview = t.reviews?.find((r: any) => r.revieweeId === userId);
                      return myReview ? (
                        <span className="text-xs text-[#f59e0b]">
                          {"★".repeat(myReview.rating)}{"☆".repeat(5 - myReview.rating)}
                        </span>
                      ) : (
                        <span className="text-xs text-[#86868b]">待评价</span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
        className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer"
      >
        ← 返回概览
      </button>
      <h2 className="text-lg font-semibold mb-4">
        待处理的申请（{apps.length}）
      </h2>
      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#86868b]">
          暂无待处理的申请
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {apps.map((a: any, i: number) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-sm">
                    {a.task?.title}
                  </span>
                  <div className="text-xs text-[#86868b] mt-1">申请中</div>
                </div>
                <div className="flex items-center gap-3">
                  {a.task?.budget && (
                    <span className="text-sm font-bold">
                      {formatPrice(a.task.budget)}
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
  const { name, role } = useAuth();
  const [data, setData] = useState<any>(null);
  const [view, setView] = useState<string>("overview");
  const [refreshKey, setRefreshKey] = useState(0);

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
            className="bg-white px-4 py-1.5 rounded-full text-sm text-[#86868b] border border-[rgba(0,0,0,0.06)] cursor-pointer"
          >
            浏览任务
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setView("active")}
            className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full cursor-pointer"
          >
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: "#007aff" }}
            >
              {data.stats.active}
            </div>
            <div className="text-sm text-[#86868b]">进行中</div>
          </button>
          <button
            onClick={() => setView("completed")}
            className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full cursor-pointer"
          >
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: "#30d158" }}
            >
              {data.stats.completed}
            </div>
            <div className="text-sm text-[#86868b]">已完成</div>
          </button>
          <button
            onClick={() => setView("pending")}
            className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full cursor-pointer"
          >
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: "#1d1d1f" }}
            >
              {data.stats.pending}
            </div>
            <div className="text-sm text-[#86868b]">待处理申请</div>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-4">
          <h3 className="text-base font-semibold mb-4">正在进行的任务</h3>
          {data.activeTasks.length === 0 ? (
            <p className="text-sm text-[#86868b]">暂无进行中的任务</p>
          ) : (
            data.activeTasks.map((t: any) => (
              <div
                key={t.id}
                className="flex justify-between items-center py-3 border-b border-[rgba(0,0,0,0.04)] last:border-0"
              >
                <div>
                  <button
                    onClick={() => router.push(`/tasks/${t.id}?from=dashboard`)}
                    className="text-sm font-medium hover:text-[#007aff] cursor-pointer text-left"
                  >
                    {t.title}
                  </button>
                  <div className="text-xs text-[#86868b]">
                    {t.employer?.name}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">
                    {formatPrice(t.budget)}
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

        <div className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <h3 className="text-base font-semibold mb-4">我的申请</h3>
          {data.pendingApps.length === 0 ? (
            <p className="text-sm text-[#86868b]">暂无申请记录</p>
          ) : (
            data.pendingApps.map((a: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center py-3 border-b border-[rgba(0,0,0,0.04)] last:border-0"
              >
                <div>
                  <span className="text-sm font-medium">
                    {a.task?.title}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {a.task?.budget && (
                    <span className="text-sm font-bold">
                      {formatPrice(a.task.budget)}
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
          className="bg-white px-4 py-1.5 rounded-full text-sm text-[#86868b] border border-[rgba(0,0,0,0.06)] cursor-pointer"
        >
          我的任务
        </button>
        <button
          onClick={() => router.push("/tasks/new")}
          className="bg-white px-4 py-1.5 rounded-full text-sm text-[#86868b] border border-[rgba(0,0,0,0.06)] cursor-pointer"
        >
          发布任务
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setView("workers")}
          className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full cursor-pointer"
        >
          <div
            className="text-3xl font-bold mb-1"
            style={{ color: "#007aff" }}
          >
            {data.stats.active}
          </div>
          <div className="text-sm text-[#86868b]">进行中</div>
        </button>
        <button
          onClick={() => setView("completed")}
          className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full cursor-pointer"
        >
          <div
            className="text-3xl font-bold mb-1"
            style={{ color: "#30d158" }}
          >
            {data.stats.completed}
          </div>
          <div className="text-sm text-[#86868b]">已完成</div>
        </button>
        <button
          onClick={() => setView("applications")}
          className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full cursor-pointer"
        >
          <div
            className="text-3xl font-bold mb-1"
            style={{ color: "#1d1d1f" }}
          >
            {data.stats.applications}
          </div>
          <div className="text-sm text-[#86868b]">总申请</div>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold mb-4">最近任务</h3>
        {[...(data.openTasks || []), ...data.activeTasks, ...data.completedTasks]
          .slice(0, 8)
          .map((t: any) => (
            <div
              key={t.id}
              className="flex justify-between items-center py-3 border-b border-[rgba(0,0,0,0.04)] last:border-0"
            >
              <span className="text-sm">{t.title}</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  t.status === "IN_PROGRESS"
                    ? "bg-[#007aff1a] text-[#007aff]"
                    : t.status === "COMPLETED"
                    ? "bg-[#30d1581a] text-[#30d158]"
                    : "bg-[#f59e0b1a] text-[#f59e0b]"
                }`}
              >
                {t.status === "IN_PROGRESS" ? "进行中" : t.status === "COMPLETED" ? "已完成" : "招募中"}
              </span>
            </div>
          ))}
        {(data.openTasks || []).length + data.activeTasks.length + data.completedTasks.length === 0 && (
          <p className="text-sm text-[#86868b] text-center py-4">
            暂无任务
          </p>
        )}
      </div>
    </div>
  );
}
