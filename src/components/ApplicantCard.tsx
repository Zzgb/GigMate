"use client";

interface ApplicantCardProps {
  name: string;
  experience: string;
  message: string;
  tags: string[];
  rating: number;
  completed: number;
  responseRate: string;
  status: "pending" | "approved";
}

export default function ApplicantCard({ name, experience, message, tags, rating, completed, responseRate, status }: ApplicantCardProps) {
  const statusStyle = status === "pending"
    ? "bg-[#f59e0b1a] text-[#f59e0b]"
    : "bg-[#30d1581a] text-[#30d158]";
  const statusLabel = status === "pending" ? "待审核" : "已通过";

  return (
    <div className="bg-white dark:bg-[#2c2c2e] rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
      <div className="flex gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-sm font-semibold">{name}</span>
              <span className="text-xs text-[#86868b] dark:text-[#98989d] ml-3">{experience}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle}`}>{statusLabel}</span>
          </div>
          <p className="text-xs text-[#86868b] dark:text-[#98989d] mb-2 leading-relaxed">{message}</p>
          <div className="flex gap-1.5 mb-2">
            {tags.map((t) => (
              <span key={t} className="text-[10px] bg-[#f5f5f7] px-1.5 py-1 rounded-md text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]">{t}</span>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <span className="text-[10px] text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]">⭐ {rating}</span>
              <span className="text-[10px] text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]">已完成 {completed} 单</span>
              <span className="text-[10px] text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]">回复率 {responseRate}</span>
            </div>
            {status === "pending" ? (
              <div className="flex gap-2">
                <button onClick={() => {}} className="bg-[#30d158] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer">通过</button>
                <button onClick={() => {}} className="bg-white px-3.5 py-1.5 rounded-full text-xs text-[#86868b] dark:text-[#98989d] border border-[rgba(0,0,0,0.1)] cursor-pointer">拒绝</button>
              </div>
            ) : (
              <span className="text-xs text-[#30d158]">已通过 · 等待对方确认</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
