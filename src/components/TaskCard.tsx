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
    <a href={`/tasks/${id}`} className="block bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-base font-semibold mb-0.5">{title}</div>
          <div className="text-xs text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]">{category} · {location} · {time}</div>
        </div>
        <span className="text-xs bg-[#30d1581a] text-[#30d158] px-2 py-0.5 rounded-full font-medium">招募中</span>
      </div>
      <p className="text-xs text-[#86868b] dark:text-[#98989d] mb-3 leading-relaxed line-clamp-2">{description}</p>
      <div className="flex gap-1.5 mb-3">
        {tags.map((t) => (
          <span key={t} className="text-xs bg-[#f5f5f7] px-2 py-1 rounded-md text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]">{t}</span>
        ))}
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.08)]">
        <span className="text-lg font-bold">{price}</span>
        <span className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-medium">立即申请</span>
      </div>
    </a>
  );
}
