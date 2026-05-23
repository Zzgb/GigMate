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
          className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left w-full"
        >
          <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
          <div className="text-sm text-[#86868b]">{s.label}</div>
        </button>
      ))}
    </div>
  );
}
