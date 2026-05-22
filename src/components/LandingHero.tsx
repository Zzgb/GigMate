export default function LandingHero() {
  return (
    <section className="relative text-center py-20 px-10 bg-gradient-to-br from-[rgba(0,0,0,0.45)] to-[rgba(0,0,0,0.55)] bg-cover bg-center min-h-[420px] flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/hero-bg.jpg')" }}>
      <h2 className="text-[2.8rem] font-bold tracking-tight leading-tight text-white mb-4">
        兼职就该这么简单
      </h2>
      <p className="text-lg text-white/75 max-w-[480px] mx-auto mb-8 leading-relaxed">
        雇主发布任务，自由职业者接单<br />安全快捷，双向评价
      </p>
      <div className="flex gap-3 justify-center">
        <a href="/register" className="bg-white text-[#1d1d1f] px-6 py-2.5 rounded-xl text-sm font-semibold">
          我要雇佣
        </a>
        <a href="/tasks" className="bg-white/15 text-white px-6 py-2.5 rounded-xl text-sm font-medium border border-white/25 backdrop-blur-sm">
          找工作
        </a>
      </div>
      {/* Carousel dots */}
      <div className="flex gap-1.5 justify-center mt-10">
        <span className="w-6 h-1 bg-white rounded-full" />
        <span className="w-2 h-1 bg-white/40 rounded-full" />
        <span className="w-2 h-1 bg-white/40 rounded-full" />
      </div>
    </section>
  );
}
