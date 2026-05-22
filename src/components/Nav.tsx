import AvatarMenu from "./AvatarMenu";

interface NavProps {
  variant?: "landing" | "dashboard";
  currentRole?: "employer" | "freelancer";
}

export default function Nav({ variant = "landing", currentRole = "employer" }: NavProps) {
  const navLinks = variant === "dashboard" ? (
    <div className="flex gap-6 text-sm">
      <a href="/" className="text-[#86868b] hover:text-[#1d1d1f]">首页</a>
      <a href="/tasks" className="text-[#86868b] hover:text-[#1d1d1f]">任务</a>
      <a href="/dashboard" className="font-semibold text-[#1d1d1f]">控制台</a>
    </div>
  ) : null;

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-8">
        <a href="/" className="font-bold text-lg tracking-tight bg-gradient-to-r from-[#1a1a1a] to-[#4a4a4a] bg-clip-text text-transparent">
          GigMate
        </a>
        {navLinks}
      </div>
      <div className="flex items-center gap-4">
        {variant === "landing" ? (
          <>
            <a href="/login" className="text-sm text-[#1d1d1f]">登录</a>
            <a href="/register" className="text-sm font-medium bg-black text-white px-4 py-1.5 rounded-full">注册</a>
          </>
        ) : (
          <>
            {/* D-bell icon */}
            <a href="/messages" className="relative w-8 h-8 flex items-center justify-center">
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6V9.5C3.5 9.9 3.3 10.2 3.1 10.4L2 11.7C1.4 12.5 1 13.5 1 14.6C1 16 2.2 16.5 3.5 16.5H12.5C13.8 16.5 15 16 15 14.6C15 13.5 14.6 12.5 14 11.7L12.9 10.4C12.7 10.2 12.5 9.9 12.5 9.5V6C12.5 3.5 10.5 1.5 8 1.5Z" />
                <path d="M10 16.5C10 17.1 9.5 17.5 9 17.5H7C6.5 17.5 6 17.1 6 16.5" strokeWidth="1.2" />
              </svg>
              <span className="absolute top-1 right-1 w-[7px] h-[7px] bg-[#ff3b30] rounded-full" />
            </a>
            <span className="text-xs text-[#86868b]">{currentRole === "employer" ? "雇主" : "自由职业者"}</span>
            <AvatarMenu currentRole={currentRole} />
          </>
        )}
      </div>
    </nav>
  );
}
