/**
 * page.tsx
 * 发布任务页 - 表单 + 里程碑编辑器 + 付款弹窗
 * 支持重新发布自动填表与薪酬转移
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import MilestoneEditor, { type MilestoneRow } from "@/components/MilestoneEditor";
import PaymentModal from "@/components/PaymentModal";
import { createTask, getTaskById, republishTask } from "@/actions/task-actions";
import { useAuth } from "@/lib/auth-context";

function nextKey() {
  return `ms-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function PostTaskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const republishId = searchParams.get("republish");
  const isTransfer = searchParams.get("from") === "transfer";
  const { isLoggedIn, mounted, role } = useAuth();

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

  const [milestones, setMilestones] = useState<MilestoneRow[]>([
    { key: nextKey(), name: "", criteria: "", ratio: 100 },
  ]);

  const [parentTaskTitle, setParentTaskTitle] = useState("");
  const [remainingEscrow, setRemainingEscrow] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [budgetMode, setBudgetMode] = useState<"fixed" | "range">("fixed");

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const budget = budgetMode === "fixed"
    ? (parseInt(form.budgetMin) || 0)
    : (parseInt(form.budgetMax) || 0);
  const budgetMin = budgetMode === "range" ? (parseInt(form.budgetMin) || 0) : undefined;
  const isEmployer = role === "employer";

  useEffect(() => {
    if (mounted && !isLoggedIn) router.replace("/login");
  }, [mounted, isLoggedIn, router]);

  useEffect(() => {
    if (!republishId) return;
    getTaskById(republishId).then((t) => {
      if (!t) return;
      setForm({
        title: isTransfer ? `${t.title}-新` : t.title || "",
        detail: t.description || "",
        requirements: "",
        budgetMin: "",
        budgetMax: isTransfer && (t as any).escrow ? String(Math.round((t as any).escrow)) : String(t.budget || ""),
        category: t.category || "",
        duration: "",
        workMode: "",
        location: "",
        deadline: t.deadline ? new Date(t.deadline).toISOString().split("T")[0] : "",
      });
      setParentTaskTitle(t.title);
      if (isTransfer && (t as any).escrow) {
        setRemainingEscrow((t as any).escrow);
      }
      if ((t as any).milestones?.length > 0) {
        setMilestones(
          (t as any).milestones.map((m: any) => ({
            key: nextKey(),
            name: m.name,
            criteria: m.criteria,
            ratio: m.ratio,
          }))
        );
      }
    });
  }, [republishId, isTransfer]);

  const buildDescription = () => {
    const parts = [form.detail];
    if (form.requirements) parts.push("任职要求：" + form.requirements);
    if (form.duration) parts.push("预计时长：" + form.duration);
    if (form.workMode) parts.push("工作方式：" + form.workMode);
    if (form.location) parts.push("工作地点：" + form.location);
    return parts.join("\n\n");
  };

  const doCreateTask = async (paymentMethod: string) => {
    setShowPayment(false);
    setSubmitting(true);
    try {
      let task: any;
      if (republishId && isTransfer) {
        task = await republishTask({
          parentTaskId: republishId,
          title: form.title,
          description: buildDescription(),
          budget,
          category: form.category || undefined,
          deadline: form.deadline ? new Date(form.deadline) : undefined,
          skills: [],
          milestones: milestones.map((m) => ({
            name: m.name,
            criteria: m.criteria,
            ratio: m.ratio,
          })),
        });
      } else {
        task = await createTask({
          title: form.title,
          description: buildDescription(),
          budget,
          budgetMin,
          category: form.category,
          deadline: form.deadline ? new Date(form.deadline) : undefined,
          skills: [],
          paymentMethod,
          milestones: milestones.map((m) => ({
            name: m.name,
            criteria: m.criteria,
            ratio: m.ratio,
          })),
        });
      }
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "发布失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (!form.title) { alert("请填写任务名称"); return; }
    if (budgetMode === "fixed" && !form.budgetMin) { alert("请填写预算"); return; }
    if (budgetMode === "range" && (!form.budgetMin || !form.budgetMax)) { alert("请填写预算范围"); return; }
    if (budgetMode === "range" && parseInt(form.budgetMin) >= parseInt(form.budgetMax)) { alert("最低预算不能大于等于最高预算"); return; }

    const totalRatio = milestones.reduce((s, m) => s + (m.ratio || 0), 0);
    if (Math.abs(totalRatio - 100) > 0.01) {
      alert(`里程碑比例总和必须为 100%，当前为 ${totalRatio}%`);
      return;
    }

    const incomplete = milestones.find((m) => !m.name.trim() || !m.criteria.trim());
    if (incomplete) {
      alert("请完整填写所有里程碑的名称和验收条件");
      return;
    }

    // 重新发布+转移不需要再次付款
    if (republishId && isTransfer) {
      doCreateTask("transfer");
      return;
    }

    // 雇主创建新任务需要先付款
    if (isEmployer && budget > 0) {
      setShowPayment(true);
      return;
    }

    // 非雇主或0预算直接创建
    doCreateTask("free");
  };

  if (!mounted || !isLoggedIn) return null;

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-[var(--g-text2)] mb-4 hover:text-[var(--g-text)] cursor-pointer"
        >
          &larr; 返回控制台
        </button>
        <h4 className="text-lg font-semibold mb-6">
          {isTransfer ? "重新发布任务（薪酬转移）" : republishId ? "重新发布任务" : "发布新任务"}
        </h4>

        {isTransfer && remainingEscrow > 0 && (
          <div className="bg-[#007aff0d] border border-[#007aff33] rounded-xl px-4 py-3 mb-4 text-sm">
            将原任务 <strong>{parentTaskTitle}</strong> 的剩余托管金{' '}
            <strong>&yen;{remainingEscrow.toFixed(0)}</strong> 转移至新任务。
            {budget > remainingEscrow ? ' 新任务薪酬超出部分由您补足。' : budget < remainingEscrow ? ' 多余部分将退还给您。' : ' 金额恰好，无需补退。'}
          </div>
        )}

        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="bg-[var(--g-card)] rounded-[20px] p-5 shadow-[0_2px_20px_var(--g-shadow)]">
              <div className="text-xs font-medium mb-2">任务名称</div>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="请输入任务名称"
                className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="bg-[var(--g-card)] rounded-[20px] p-5 shadow-[0_2px_20px_var(--g-shadow)]">
              <div className="text-xs font-medium mb-2">任务详情</div>
              <textarea
                value={form.detail}
                onChange={(e) => update("detail", e.target.value)}
                placeholder="请详细描述任务内容、交付物、验收标准等..."
                className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                style={{ minHeight: "140px" }}
              />
            </div>
            <div className="bg-[var(--g-card)] rounded-[20px] p-5 shadow-[0_2px_20px_var(--g-shadow)]">
              <div className="text-xs font-medium mb-2">任职要求</div>
              <textarea
                value={form.requirements}
                onChange={(e) => update("requirements", e.target.value)}
                placeholder="请描述对申请者的要求，如经验、技能、证书等..."
                className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                style={{ minHeight: "100px" }}
              />
            </div>

            <MilestoneEditor
              milestones={milestones}
              onChange={setMilestones}
              budget={budget}
            />
          </div>

          <div className="w-[240px] flex-shrink-0 flex flex-col gap-3">
            <div className="bg-[var(--g-card)] rounded-[16px] p-4 shadow-[0_2px_20px_var(--g-shadow)]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium">预算 (&yen;)</div>
                <div className="flex gap-0.5 bg-[var(--g-input)] rounded-lg p-0.5">
                  <button
                    onClick={() => setBudgetMode("fixed")}
                    className={`text-[10px] px-2 py-1 rounded-md cursor-pointer ${budgetMode === "fixed" ? "bg-white dark:bg-[#636366] text-[var(--g-text)] font-medium shadow-sm" : "text-[var(--g-text2)]"}`}
                  >
                    固定预算
                  </button>
                  <button
                    onClick={() => setBudgetMode("range")}
                    className={`text-[10px] px-2 py-1 rounded-md cursor-pointer ${budgetMode === "range" ? "bg-white dark:bg-[#636366] text-[var(--g-text)] font-medium shadow-sm" : "text-[var(--g-text2)]"}`}
                  >
                    预算范围
                  </button>
                </div>
              </div>
              {budgetMode === "fixed" ? (
                <input type="text" value={form.budgetMin} onChange={(e) => update("budgetMin", e.target.value)} placeholder="输入预算金额"
                  className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-lg px-2 py-2 text-xs outline-none" />
              ) : (
                <div className="flex gap-1.5 items-center">
                  <input type="text" value={form.budgetMin} onChange={(e) => update("budgetMin", e.target.value)} placeholder="最低"
                    className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-lg px-2 py-2 text-xs outline-none" />
                  <span className="text-[var(--g-text2)] text-xs">&mdash;</span>
                  <input type="text" value={form.budgetMax} onChange={(e) => update("budgetMax", e.target.value)} placeholder="最高"
                    className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-lg px-2 py-2 text-xs outline-none" />
                </div>
              )}
            </div>
            <div className="bg-[var(--g-card)] rounded-[16px] p-4 shadow-[0_2px_20px_var(--g-shadow)]">
              <div className="text-xs font-medium mb-2">分类</div>
              <input type="text" value={form.category} onChange={(e) => update("category", e.target.value)}
                placeholder="如 设计、翻译、技术" className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-lg px-3 py-2 text-xs outline-none" />
            </div>
            <div className="bg-[var(--g-card)] rounded-[16px] p-4 shadow-[0_2px_20px_var(--g-shadow)]">
              <div className="text-xs font-medium mb-2">预计时长</div>
              <input type="text" value={form.duration} onChange={(e) => update("duration", e.target.value)}
                placeholder="如 2 周" className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-lg px-3 py-2 text-xs outline-none" />
              <div className="text-xs font-medium mb-2 mt-3">工作方式</div>
              <input type="text" value={form.workMode} onChange={(e) => update("workMode", e.target.value)}
                placeholder="远程/线下/混合" className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-lg px-3 py-2 text-xs outline-none" />
              <div className="text-xs font-medium mb-2 mt-3">工作地点</div>
              <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)}
                placeholder="城市或具体地址" className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-lg px-3 py-2 text-xs outline-none" />
              <div className="text-xs font-medium mb-2 mt-3">截止日期</div>
              <input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)}
                className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-lg px-3 py-2 text-xs outline-none" />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-black text-white text-center py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              {submitting ? "发布中..." : "发布任务"}
            </button>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        open={showPayment}
        amount={budget}
        onPay={(method) => doCreateTask(method)}
        onCancel={() => setShowPayment(false)}
      />
    </div>
  );
}

export default function PostTaskPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1">
        <Nav variant="dashboard" />
        <div className="flex-1 flex items-center justify-center text-sm text-[var(--g-text2)] dark:text-[#98989d]">加载中...</div>
      </div>
    }>
      <PostTaskForm />
    </Suspense>
  );
}
