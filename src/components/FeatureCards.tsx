const features = [
 {
  title: "发布招聘",
  desc: "免费发布任务，快速找到合适人选",
  icon: (
   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
   </svg>
  ),
 },
 {
  title: "浏览任务",
  desc: "按类别筛选合适的兼职机会",
  icon: (
   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
   </svg>
  ),
 },
 {
  title: "互相评价",
  desc: "真实评价体系，建立双向信任",
  icon: (
   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
   </svg>
  ),
 },
];

export default function FeatureCards() {
 return (
  <div className="grid grid-cols-3 gap-5 px-10 py-10">
   {features.map((f) => (
    <div key={f.title} className="bg-[var(--g-card)] rounded-2xl p-8 border border-[var(--g-border)] shadow-[0_4px_24px_var(--g-shadow)]">
     <div className="bg-[#f0f0f0] w-11 h-11 rounded-xl flex items-center justify-center mb-4">{f.icon}</div>
     <h4 className="text-base font-semibold mb-1">{f.title}</h4>
     <p className="text-sm text-[var(--g-text2)] leading-relaxed">{f.desc}</p>
    </div>
   ))}
  </div>
 );
}
