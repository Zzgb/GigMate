const filters = ["全部", "任务类型", "专业领域", "工作地点", "预算范围", "排序"];

export default function FilterBar() {
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {filters.map((f, i) => (
        <span key={f} className={`px-4 py-1.5 rounded-full text-sm cursor-pointer ${i === 0 ? "bg-black text-white" : "bg-white text-[#86868b] border border-[rgba(0,0,0,0.06)]"}`}>
          {f} <span className="text-xs ml-0.5">▼</span>
        </span>
      ))}
    </div>
  );
}
