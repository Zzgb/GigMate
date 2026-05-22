import DashboardStats from "@/components/DashboardStats";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">欢迎回来，张三</h1>
      <div className="flex gap-2 mb-6">
        <span className="bg-black text-white px-4 py-1.5 rounded-full text-sm">概览</span>
        <span className="bg-white px-4 py-1.5 rounded-full text-sm text-[#86868b] border border-[rgba(0,0,0,0.06)]">我的任务</span>
        <span className="bg-white px-4 py-1.5 rounded-full text-sm text-[#86868b] border border-[rgba(0,0,0,0.06)]">发布任务</span>
      </div>
      <DashboardStats />
      <div className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold mb-4">最近任务</h3>
        {["UI 设计稿更新", "文案翻译", "活动摄影跟拍"].map((t) => (
          <div key={t} className="flex justify-between items-center py-3 border-b border-[rgba(0,0,0,0.04)] last:border-0">
            <span className="text-sm">{t}</span>
            <span className="text-xs bg-[#30d1581a] text-[#30d158] px-2.5 py-0.5 rounded-full font-medium">招募中</span>
          </div>
        ))}
      </div>
    </div>
  );
}
