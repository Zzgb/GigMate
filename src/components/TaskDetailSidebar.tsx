export default function TaskDetailSidebar() {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
      <div className="text-center pb-4 border-b border-[rgba(0,0,0,0.05)] mb-4">
        <div className="text-xs text-[#86868b] mb-1">预算</div>
        <div className="text-3xl font-bold">¥200-500</div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[{ label: "预计时长", value: "2 周" }, { label: "工作方式", value: "远程/线上" }, { label: "申请人数", value: "8 人" }, { label: "截止日期", value: "2026-06-05" }].map((i) => (
          <div key={i.label}>
            <div className="text-xs text-[#86868b]">{i.label}</div>
            <div className="text-sm font-medium">{i.value}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 py-3 border-t border-[rgba(0,0,0,0.05)] mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" />
        <div>
          <div className="text-sm font-medium">张三</div>
          <div className="text-xs text-[#86868b]">雇主 · 15 个任务发布</div>
          <div className="text-[10px] text-[#a1a1a6]">最近登录：3 小时前</div>
        </div>
      </div>
      <button className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold">立即申请</button>
      <div className="text-center mt-2 text-[10px] text-[#86868b]">申请后等待雇主审核</div>
    </div>
  );
}
