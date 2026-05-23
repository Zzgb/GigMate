/**
 * TaskCard.tsx
 * 任务卡片组件 - 显示任务标题/分类/地点/时间/描述/标签/价格，点击跳转详情
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

interface TaskCardProps {
 id: string;
 title: string;
 category: string;
 location: string;
 time: string;
 description: string;
 tags: string[];
 price: string;
}

export default function TaskCard({ id, title, category, location, time, description, tags, price }: TaskCardProps) {
 return (
  <a href={`/tasks/${id}`} className="block bg-[var(--g-card)] rounded-[20px] p-6 shadow-[0_2px_20px_var(--g-shadow)]">
   <div className="flex justify-between items-start mb-3">
    <div>
     <div className="text-base font-semibold mb-0.5">{title}</div>
     <div className="text-xs text-[var(--g-text2)] dark:text-[#98989d]">{category} · {location} · {time}</div>
    </div>
    <span className="text-xs bg-[#30d1581a] text-[#30d158] px-2 py-0.5 rounded-full font-medium">招募中</span>
   </div>
   <p className="text-xs text-[var(--g-text2)] mb-3 leading-relaxed line-clamp-2">{description}</p>
   <div className="flex gap-1.5 mb-3">
    {tags.map((t) => (
     <span key={t} className="text-xs bg-[var(--g-input)] px-2 py-1 rounded-md text-[var(--g-text2)] dark:text-[#98989d]">{t}</span>
    ))}
   </div>
   <div className="flex justify-between items-center pt-3 border-t border-[var(--g-border2)]">
    <span className="text-lg font-bold">{price}</span>
    <span className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-medium">立即申请</span>
   </div>
  </a>
 );
}
