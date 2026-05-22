import Nav from "@/components/Nav";
import FilterBar from "@/components/FilterBar";
import TaskCard from "@/components/TaskCard";

const tasks = [
  { id: "1", title: "UI 设计稿更新", category: "设计", location: "线上", time: "3天前", desc: "需要更新现有产品的 UI 设计稿，包含 3 个主要页面的改版设计，预计 2 周内完成", tags: ["Figma", "UI/UX"], price: "¥200-500" },
  { id: "2", title: "文案翻译 (中→英)", category: "翻译", location: "线上", time: "1周前", desc: "5000 字产品文档中译英，需要技术文档翻译经验，可长期合作", tags: ["翻译", "英文"], price: "¥50-100" },
  { id: "3", title: "活动摄影跟拍", category: "摄影", location: "深圳", time: "2天前", desc: "周六下午公司年会跟拍，需要自带设备，约 3 小时", tags: ["摄影", "线下"], price: "¥300-500" },
  { id: "4", title: "周末咖啡师", category: "服务", location: "北京朝阳", time: "1天前", desc: "周末兼职咖啡师，有经验者优先，每周六日 10:00-18:00", tags: ["咖啡", "线下"], price: "¥150/天" },
];

export default function TasksPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="freelancer" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="flex gap-3 items-center mb-4">
          <div className="flex-1 bg-white rounded-xl px-4 py-2.5 border border-[rgba(0,0,0,0.06)] text-sm text-[#86868b]">
            搜索任务名称、关键词...
          </div>
          <button className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium">搜索</button>
          <div className="flex bg-white rounded-xl p-1 border border-[rgba(0,0,0,0.06)]">
            <span className="bg-black text-white px-2 py-1 rounded-lg text-xs">☰</span>
            <span className="text-[#86868b] px-2 py-1 rounded-lg text-xs">▦</span>
          </div>
        </div>
        <FilterBar />
        <div className="grid grid-cols-2 gap-4">
          {tasks.map((t) => (
            <TaskCard key={t.id} id={t.id} title={t.title} category={t.category} location={t.location} time={t.time} description={t.desc} tags={t.tags} price={t.price} />
          ))}
        </div>
      </main>
    </div>
  );
}
