/**
 * MilestoneProgressBar.tsx
 * 里程碑进度条 - 圆点状态显示 + 悬浮 tooltip
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

interface MilestoneDot {
  name: string;
  ratio: number;
  status: string; // PENDING | SUBMITTED | APPROVED | REJECTED
}

interface MilestoneProgressBarProps {
  milestones: MilestoneDot[];
  taskStatus?: string; // COMPLETED tasks show all green
}

const statusColors: Record<string, string> = {
  PENDING: "bg-[#86868b]",
  SUBMITTED: "bg-[#f59e0b]",
  APPROVED: "bg-[#30d158]",
  REJECTED: "bg-[#ff3b30]",
};

const statusLabels: Record<string, string> = {
  PENDING: "待验收",
  SUBMITTED: "已提交",
  APPROVED: "已通过",
  REJECTED: "已驳回",
};

export default function MilestoneProgressBar({
  milestones,
  taskStatus,
}: MilestoneProgressBarProps) {
  if (!milestones || milestones.length === 0) return null;

  const completed = taskStatus === "COMPLETED";

  return (
    <div className="flex items-center gap-1.5">
      {milestones.map((m, i) => {
        const color = completed ? "bg-[#30d158]" : (statusColors[m.status] || statusColors.PENDING);
        return (
          <div key={i} className="relative group">
            <div
              className={`w-3 h-3 rounded-full ${color} cursor-default`}
              title={`${m.name} (${m.ratio}%) — ${statusLabels[m.status] || m.status}`}
            />
            {/* tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[#1d1d1f] dark:bg-[#e5e5ea] text-white dark:text-[#1d1d1f] text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {m.name} ({m.ratio}%) — {statusLabels[m.status] || m.status}
            </div>
          </div>
        );
      })}
      <span className="text-[10px] text-[var(--g-text2)] ml-1">
        {milestones.filter((m) => m.status === "APPROVED").length}/{milestones.length}
      </span>
    </div>
  );
}
