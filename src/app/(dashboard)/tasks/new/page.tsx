import Nav from "@/components/Nav";

export default function PostTaskPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="employer" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <h4 className="text-lg font-semibold mb-6">发布新任务</h4>
        <div className="grid grid-cols-[3fr_2fr] gap-6">
          {/* LEFT */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">任务名称</div>
              <div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">请输入任务名称</div>
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">任务详情</div>
              <div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]" style={{ minHeight: "100px" }}>请详细描述任务内容、交付物、验收标准等...</div>
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">任职要求</div>
              <div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]" style={{ minHeight: "80px" }}>请描述对申请者的要求...</div>
            </div>
          </div>
          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-3">预算 (¥)</div>
              <div className="flex gap-3 items-center">
                <div className="flex-1 bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">最低</div>
                <span className="text-[#86868b]">—</span>
                <div className="flex-1 bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">最高</div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-3">分类</div>
              <div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b] mb-3">选择任务分类 ▼</div>
              <div className="text-xs font-medium mb-2">技能标签</div>
              <div className="flex gap-1.5 flex-wrap">
                <span className="bg-[#f5f5f7] px-2 py-1 rounded-lg text-xs text-[#86868b] flex items-center gap-1">Figma ✕</span>
                <span className="bg-[#f5f5f7] px-2 py-1 rounded-lg text-xs text-[#86868b] flex items-center gap-1">UI/UX ✕</span>
                <span className="bg-white px-2 py-1 rounded-lg text-xs text-[#86868b] border border-dashed border-[rgba(0,0,0,0.15)]">+ 添加</span>
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div><div className="text-xs font-medium mb-1.5">预计时长</div><div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">选择...</div></div>
                <div><div className="text-xs font-medium mb-1.5">工作方式</div><div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">选择... ▼</div></div>
              </div>
              <div className="mb-3"><div className="text-xs font-medium mb-1.5">工作地点（线下）</div><div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">输入地址...</div></div>
              <div><div className="text-xs font-medium mb-1.5">截止日期</div><div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">选择日期 ▼</div></div>
            </div>
            <button className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold">发布任务</button>
          </div>
        </div>
      </main>
    </div>
  );
}
