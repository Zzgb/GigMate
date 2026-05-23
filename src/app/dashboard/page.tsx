"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getDashboardData, completeTask, createReview } from "@/actions/dashboard-actions";

function formatPrice(budget: number): string {
  return `¥${budget}`;
}

// ========== 雇主端子视图 ==========

function EmployerActiveView({ tasks, onBack }: { tasks: any[]; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer">← 返回概览</button>
      <h2 className="text-lg font-semibold mb-4">进行中的任务（{tasks.length}）</h2>
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#86868b]">暂无进行中的任务</div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((t: any) => {
            const worker = t.applications?.[0]?.freelancer;
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm">{t.title}</span>
                      {worker && <span className="text-xs text-[#86868b]">{worker.name}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-[#007aff1a] text-[#007aff] px-2 py-0.5 rounded-full font-medium">进行中</span>
                      <span className="text-xs text-[#86868b]">预算: {formatPrice(t.budget)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await completeTask(t.id);
                        onBack();
                      }}
                      className="bg-[#30d158] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer"
                    >
                      完成任务
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmployerCompletedView({ tasks, onBack }: { tasks: any[]; onBack: () => void }) {
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");

  const handleSubmitReview = async (taskId: string, revieweeId: string) => {
    await createReview({ taskId, revieweeId, rating: 5, comment: reviewText || "好评" });
    setReviewing(null);
    setReviewText("");
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer">← 返回概览</button>
      <h2 className="text-lg font-semibold mb-4">已完成的任务（{tasks.length}）</h2>
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#86868b]">暂无已完成的任务</div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((t: any) => {
            const worker = t.applications?.[0]?.freelancer;
            return (
              <div key={t.id} className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-sm">{t.title}</span>
                    {worker && <div className="text-xs text-[#86868b] mt-1">完成者: {worker.name}</div>}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#30d158] font-medium">已完成</span>
                    {worker && (
                      <button
                        onClick={() => setReviewing(t.id)}
                        className="block ml-auto mt-1 bg-[#007aff] text-white px-3 py-1 rounded-full text-xs font-medium cursor-pointer"
                      >
                        评价
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewing && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setReviewing(null)}>
          <div className="bg-white rounded-[20px] p-6 w-[360px] shadow-[0_8px_40px_rgba(0,0,0,0.12)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-4">评价完成者</h3>
            <input
              type="text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="请填写评价内容..."
              className="w-full bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm outline-none mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setReviewing(null)} className="flex-1 bg-[#f5f5f7] text-[#1d1d1f] py-2.5 rounded-xl text-sm font-medium cursor-pointer">取消</button>
              <button onClick={() => handleSubmitReview(reviewing, tasks.find((t: any) => t.id === reviewing)?.applications?.[0]?.freelancer?.id || "")} className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer">提交评价</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployerApplicationsListView({ apps, onBack }: { apps: any[]; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer">← 返回概览</button>
      <h2 className="text-lg font-semibold mb-4">待处理的申请（{apps.length}）</h2>
      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#86868b]">暂无待处理的申请</div>
      ) : (
        <div className="flex flex-col gap-3">
          {apps.map((a: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">{a.freelancer?.name}</span>
                    <span className="text-xs text-[#86868b]">{a.task?.title}</span>
                  </div>
                  <span className="text-xs text-[#86868b]">申请中</span>
                </div>
                <span className="text-xs bg-[#f59e0b1a] text-[#f59e0b] px-2.5 py-1 rounded-full font-medium">待审核</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== 自由职业端子视图 ==========

function FreelancerActiveTasks({ tasks, onBack }: { tasks: any[]; onBack: () => void }) {
  const router = useRouter();

  return (
    <div>
      <button onClick={onBack} className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer">← 返回概览</button>
      <h2 className="text-lg font-semibold mb-4">正在进行的任务（{tasks.length}）</h2>
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#86868b]">暂无进行中的任务</div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((t: any) => (
            <div key={t.id} className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-sm">{t.title}</span>
                  <div className="text-xs text-[#86868b] mt-1">{t.employer?.name}</div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="text-sm font-bold">{formatPrice(t.budget)}</span>
                  <button
                    onClick={() => router.push(`/messages?with=${encodeURIComponent(t.employer?.name || "")}`)}
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

function FreelancerCompletedTasks({ tasks, onBack }: { tasks: any[]; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer">← 返回概览</button>
      <h2 className="text-lg font-semibold mb-4">已完成的任务（{tasks.length}）</h2>
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#86868b]">暂无已完成的任务</div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((t: any) => (
            <div key={t.id} className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-sm">{t.title}</span>
                  <div className="text-xs text-[#86868b] mt-1">{t.employer?.name}</div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">{formatPrice(t.budget)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FreelancerPendingApps({ apps, onBack }: { apps: any[]; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer">← 返回概览</button>
      <h2 className="text-lg font-semibold mb-4">待处理的申请（{apps.length}）</h2>
      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-[#86868b]">暂无待处理的申请</div>
      ) : (
        <div className="flex flex-col gap-3">
          {apps.map((a: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-sm">{a.task?.title}</span>
                  <div className="text-xs text-[#86868b] mt-1">申请中</div>
                </div>
                <div className="flex items-center gap-3">
                  {a.task?.budget && <span className="text-sm font-bold">{formatPrice(a.task.budget)}</span>}
                  <span className="text-xs bg-[#f59e0b1a] text-[#f59e0b] px-2.5 py-0.5 rounded-full font-medium">待审核</span>
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

  useEffect(() => {
    getDashboardData().then(setData);
  }, []);

  if (!data) return null;

  // 自由职业者端子视图
  if (role === "freelancer" && view === "active") {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
        <FreelancerActiveTasks tasks={data.activeTasks} onBack={() => setView("overview")} />
      </div>
    );
  }
  if (role === "freelancer" && view === "completed") {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
        <FreelancerCompletedTasks tasks={data.completedTasks} onBack={() => setView("overview")} />
      </div>
    );
  }
  if (role === "freelancer" && view === "pending") {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
        <FreelancerPendingApps apps={data.pendingApps} onBack={() => setView("overview")} />
      </div>
    );
  }

  // 雇主端子视图
  if (role === "employer" && view === "workers") {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
        <EmployerActiveView tasks={data.activeTasks} onBack={() => setView("overview")} />
      </div>
    );
  }
  if (role === "employer" && view === "completed") {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
        <EmployerCompletedView tasks={data.completedTasks} onBack={() => setView("overview")} />
      </div>
    );
  }
  if (role === "employer" && view === "applications") {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
        <EmployerApplicationsListView apps={data.pendingApps} onBack={() => setView("overview")} />
      </div>
    );
  }

  // 自由职业者概览
  if (role === "freelancer") {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">欢迎回来，{name}</h1>
        <div className="flex gap-2 mb-6">
          <span className="bg-black text-white px-4 py-1.5 rounded-full text-sm">概览</span>
          <button
            onClick={() => router.push("/tasks")}
            className="bg-white px-4 py-1.5 rounded-full text-sm text-[#86868b] border border-[rgba(0,0,0,0.06)] cursor-pointer"
          >
            浏览任务
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button onClick={() => setView("active")} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full cursor-pointer">
            <div className="text-3xl font-bold mb-1" style={{ color: "#007aff" }}>{data.stats.active}</div>
            <div className="text-sm text-[#86868b]">进行中</div>
          </button>
          <button onClick={() => setView("completed")} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full cursor-pointer">
            <div className="text-3xl font-bold mb-1" style={{ color: "#30d158" }}>{data.stats.completed}</div>
            <div className="text-sm text-[#86868b]">已完成</div>
          </button>
          <button onClick={() => setView("pending")} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full cursor-pointer">
            <div className="text-3xl font-bold mb-1" style={{ color: "#1d1d1f" }}>{data.stats.pending}</div>
            <div className="text-sm text-[#86868b]">待处理申请</div>
          </button>
        </div>

        {/* 正在进行的任务 */}
        <div className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-4">
          <h3 className="text-base font-semibold mb-4">正在进行的任务</h3>
          {data.activeTasks.length === 0 ? (
            <p className="text-sm text-[#86868b]">暂无进行中的任务</p>
          ) : (
            data.activeTasks.map((t: any) => (
              <div key={t.id} className="flex justify-between items-center py-3 border-b border-[rgba(0,0,0,0.04)] last:border-0">
                <div>
                  <span className="text-sm font-medium">{t.title}</span>
                  <div className="text-xs text-[#86868b]">{t.employer?.name}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{formatPrice(t.budget)}</span>
                  <button
                    onClick={() => router.push(`/messages?with=${encodeURIComponent(t.employer?.name || "")}`)}
                    className="bg-[#007aff] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer"
                  >
                    联系雇主
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 我的申请 */}
        <div className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <h3 className="text-base font-semibold mb-4">我的申请</h3>
          {data.pendingApps.length === 0 ? (
            <p className="text-sm text-[#86868b]">暂无申请记录</p>
          ) : (
            data.pendingApps.map((a: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-[rgba(0,0,0,0.04)] last:border-0">
                <div>
                  <span className="text-sm font-medium">{a.task?.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  {a.task?.budget && <span className="text-sm font-bold">{formatPrice(a.task.budget)}</span>}
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ color: "#f59e0b", backgroundColor: "#f59e0b1a" }}>待审核</span>
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
        <span className="bg-black text-white px-4 py-1.5 rounded-full text-sm">概览</span>
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

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <button onClick={() => setView("workers")} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full cursor-pointer">
          <div className="text-3xl font-bold mb-1" style={{ color: "#007aff" }}>{data.stats.active}</div>
          <div className="text-sm text-[#86868b]">进行中</div>
        </button>
        <button onClick={() => setView("completed")} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full cursor-pointer">
          <div className="text-3xl font-bold mb-1" style={{ color: "#30d158" }}>{data.stats.completed}</div>
          <div className="text-sm text-[#86868b]">已完成</div>
        </button>
        <button onClick={() => setView("applications")} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full cursor-pointer">
          <div className="text-3xl font-bold mb-1" style={{ color: "#1d1d1f" }}>{data.stats.applications}</div>
          <div className="text-sm text-[#86868b]">总申请</div>
        </button>
      </div>

      {/* 最近任务 */}
      <div className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold mb-4">最近任务</h3>
        {[...data.activeTasks, ...data.completedTasks].slice(0, 5).map((t: any) => (
          <div key={t.id} className="flex justify-between items-center py-3 border-b border-[rgba(0,0,0,0.04)] last:border-0">
            <span className="text-sm">{t.title}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              t.status === "IN_PROGRESS" ? "bg-[#007aff1a] text-[#007aff]" : "bg-[#30d1581a] text-[#30d158]"
            }`}>
              {t.status === "IN_PROGRESS" ? "进行中" : "已完成"}
            </span>
          </div>
        ))}
        {data.activeTasks.length + data.completedTasks.length === 0 && (
          <p className="text-sm text-[#86868b] text-center py-4">暂无任务</p>
        )}
      </div>
    </div>
  );
}
