/**
 * AvatarMenu.tsx
 * 头像下拉菜单 - 账号信息显示、主题切换（浅色/深色/跟随系统 pill 按钮）、角色切换（雇主端/自由职业者端 pill 按钮）、退出登录
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

export default function AvatarMenu() {
 const { role, isLoggedIn, name, avatarUrl, roles, switchRole, logout, mounted } = useAuth();
 const { theme, setTheme } = useTheme();
 const router = useRouter();
 const [open, setOpen] = useState(false);

 if (!mounted || !isLoggedIn) return null;

 const hasBoth = roles.includes("EMPLOYER") && roles.includes("FREELANCER");
 const roleLabel = role === "employer" ? "雇主端" : "自由职业者端";

 const handleSwitch = async () => {
  if (!hasBoth) return;
  setOpen(false);
  await switchRole();
  router.push("/dashboard");
 };

 const handleLogout = () => {
  setOpen(false);
  logout();
  router.push("/");
 };

 const themeLabels: Record<string, string> = { light: "浅色", dark: "深色", system: "跟随系统" };

 return (
  <div className="relative">
   <button
    onClick={() => setOpen((p) => !p)}
    type="button"
    className="w-8 h-8 rounded-full border-2 border-transparent hover:border-[#007aff] transition-colors cursor-pointer overflow-hidden"
    aria-label="用户菜单"
   >
    {avatarUrl ? (
     <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
    ) : (
     <div className="w-full h-full bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" />
    )}
   </button>
   {open && (
    <>
     <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
     <div className="absolute top-full right-0 mt-2 bg-[var(--g-card)] rounded-2xl shadow-[0_8px_40px_var(--g-shadow-lg)] min-w-[220px] py-1.5 z-50"
      onMouseLeave={() => setOpen(false)}>
      {/* 账号信息 */}
      <div className="px-4 py-2 border-b border-[var(--g-border2)] dark:border-[rgba(255,255,255,0.08)]">
       <div className="text-sm font-medium text-[var(--g-text)]">{name}</div>
       <div className="text-xs text-[var(--g-text2)]">{roleLabel}</div>
      </div>

      {/* 主题切换 */}
      <div className="px-4 py-2 border-b border-[var(--g-border2)] dark:border-[rgba(255,255,255,0.08)]">
       <div className="text-xs text-[var(--g-text2)] mb-1.5">外观</div>
       <div className="flex gap-1">
        {(["light", "dark", "system"] as const).map((t) => (
         <button
          key={t}
          onClick={() => setTheme(t)}
          className={`flex-1 text-[11px] py-1 rounded-lg cursor-pointer transition-colors ${
           theme === t
            ? "bg-[#007aff] text-white"
            : "bg-[var(--g-input)] text-[var(--g-text2)] hover:bg-[var(--g-hover)]"
          }`}
         >
          {themeLabels[t]}
         </button>
        ))}
       </div>
      </div>

      {/* 角色切换 */}
      <div className="px-4 py-2 border-b border-[var(--g-border2)]">
       <div className="text-xs text-[var(--g-text2)] mb-1.5">用户端</div>
       <div className="flex gap-1">
        <button
         onClick={() => { if (roles.includes("EMPLOYER") && role !== "employer") handleSwitch(); }}
         className={`flex-1 text-[11px] py-1 rounded-lg cursor-pointer transition-colors ${
          role === "employer"
           ? "bg-[#007aff] text-white"
           : roles.includes("EMPLOYER")
           ? "bg-[var(--g-input)] text-[var(--g-text2)] hover:bg-[var(--g-hover)]"
           : "bg-[var(--g-input)] text-[#ccc] cursor-not-allowed"
         }`}
        >
         雇主端
        </button>
        <button
         onClick={() => { if (roles.includes("FREELANCER") && role !== "freelancer") handleSwitch(); }}
         className={`flex-1 text-[11px] py-1 rounded-lg cursor-pointer transition-colors ${
          role === "freelancer"
           ? "bg-[#007aff] text-white"
           : roles.includes("FREELANCER")
           ? "bg-[var(--g-input)] text-[var(--g-text2)] hover:bg-[var(--g-hover)]"
           : "bg-[var(--g-input)] text-[#ccc] cursor-not-allowed"
         }`}
        >
         自由职业者端
        </button>
       </div>
      </div>
      <button onClick={() => { setOpen(false); router.push("/profile"); }} type="button"
        className="w-full text-left px-4 py-2 text-sm text-[var(--g-text)] hover:bg-[var(--g-hover)] cursor-pointer">
        个人资料
      </button>
      <div className="h-px bg-[var(--g-border)] mx-3 my-1" />
      <button
       onClick={handleLogout}
       type="button"
       className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--g-input)] text-[#ff3b30] cursor-pointer"
      >
       退出账号
      </button>
     </div>
    </>
   )}
  </div>
 );
}
