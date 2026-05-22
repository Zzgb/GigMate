import Nav from "@/components/Nav";
import TaskDetailSidebar from "@/components/TaskDetailSidebar";

export default function TaskDetailPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="freelancer" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <a href="/tasks" className="text-sm text-[#86868b] hover:text-[#1d1d1f]">← 返回任务列表</a>
        <div className="grid grid-cols-[2fr_1fr] gap-6 mt-4">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-1">UI 设计稿更新</h3>
                <div className="flex gap-3 text-xs text-[#86868b]">
                  <span>设计</span><span>·</span><span>线上</span><span>·</span><span>2026-05-19 发布</span>
                </div>
              </div>
              <span className="text-xs bg-[#30d1581a] text-[#30d158] px-2.5 py-1 rounded-full font-medium">招募中</span>
            </div>
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] mb-4">
              <h4 className="text-sm font-semibold mb-3">任务详情</h4>
              <p className="text-xs text-[#86868b] leading-relaxed">需要更新现有产品的 UI 设计稿，包含 3 个主要页面的改版设计：首页、产品列表页和个人中心页。要求使用 Figma 进行设计，并提供完整的组件库和设计规范文档。预计工作周期 2 周，可远程协作。</p>
            </div>
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] mb-4">
              <h4 className="text-sm font-semibold mb-3">任职要求</h4>
              <ul className="text-xs text-[#86868b] leading-relaxed list-disc pl-4 space-y-1">
                <li>2 年以上 UI/UX 设计经验</li>
                <li>熟练使用 Figma 和设计系统搭建</li>
                <li>有移动端和 Web 端设计经验</li>
                <li>投递请附作品集链接</li>
              </ul>
            </div>
            <div className="flex gap-1.5 flex-wrap mb-4">
              {["Figma", "UI/UX", "设计系统", "移动端"].map((t) => (
                <span key={t} className="text-xs bg-white px-2.5 py-1.5 rounded-lg text-[#86868b] border border-[rgba(0,0,0,0.06)]">{t}</span>
              ))}
            </div>
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <h4 className="text-sm font-semibold mb-4">发布者近期评价</h4>
              <div className="pb-3 border-b border-[rgba(0,0,0,0.05)] mb-3">
                <div className="flex justify-between mb-1"><span className="text-xs font-medium">王**</span><span className="text-xs text-[#f59e0b]">★★★★★</span></div>
                <p className="text-xs text-[#86868b]">沟通顺畅，结款及时，非常好的合作经历</p>
                <div className="text-[10px] text-[#86868b] mt-1">2 个月前 · 数据录入任务</div>
              </div>
              <div>
                <div className="flex justify-between mb-1"><span className="text-xs font-medium">李**</span><span className="text-xs text-[#f59e0b]">★★★★☆</span></div>
                <p className="text-xs text-[#86868b]">需求明确，验收标准清晰，推荐合作</p>
                <div className="text-[10px] text-[#86868b] mt-1">1 个月前 · 文案翻译任务</div>
              </div>
            </div>
          </div>
          <TaskDetailSidebar />
        </div>
      </main>
    </div>
  );
}
