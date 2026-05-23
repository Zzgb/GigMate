/**
 * DashboardStats.tsx
 * 控制台统计卡片组件 - 可点击的三个统计卡片
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

const stats = [
 { label: "进行中", value: "3", color: "#007aff" },
 { label: "已完成", value: "12", color: "#30d158" },
 { label: "总申请", value: "28", color: "#1d1d1f" },
];

interface DashboardStatsProps {
 onStatClick?: (label: string) => void;
}

export default function DashboardStats({ onStatClick }: DashboardStatsProps) {
 return (
  <div className="grid grid-cols-3 gap-4 mb-8">
   {stats.map((s) => (
    <button
     key={s.label}
     onClick={() => onStatClick?.(s.label)}
     className="bg-[var(--g-card)] rounded-2xl p-6 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)] text-left w-full"
    >
     <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
     <div className="text-sm text-[var(--g-text2)] dark:text-[#98989d]">{s.label}</div>
    </button>
   ))}
  </div>
 );
}
