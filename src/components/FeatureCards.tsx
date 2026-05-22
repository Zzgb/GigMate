const features = [
  { icon: "📋", title: "发布招聘", desc: "免费发布任务，快速找到合适人选" },
  { icon: "🔍", title: "浏览任务", desc: "按类别筛选合适的兼职机会" },
  { icon: "⭐", title: "互相评价", desc: "真实评价体系，建立双向信任" },
];

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-3 gap-5 px-10 py-10">
      {features.map((f) => (
        <div key={f.title} className="bg-white rounded-2xl p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="bg-[#f0f0f0] w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4">{f.icon}</div>
          <h4 className="text-base font-semibold mb-1">{f.title}</h4>
          <p className="text-sm text-[#86868b] leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
