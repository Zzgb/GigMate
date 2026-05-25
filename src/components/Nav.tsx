/**
 * Nav.tsx
 * 导航栏组件 - Logo、导航链接（任务列表/控制台）、铃铛（未读消息红点 10s 轮询）、用户名、头像菜单
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { hasUnreadMessages } from "@/actions/message-actions";
import AvatarMenu from "./AvatarMenu";

interface NavProps {
 variant?: "landing" | "dashboard";
 currentRole?: "employer" | "freelancer";
}

export default function Nav({ variant = "landing" }: NavProps) {
 const pathname = usePathname();
 const { isLoggedIn, name, roles } = useAuth();
  const isAdmin = roles.includes("gigmateadmin");
 const [unread, setUnread] = useState(false);
 const pollRef = useRef<NodeJS.Timeout | null>(null);

 useEffect(() => {
  if (!isLoggedIn) return;
  hasUnreadMessages().then(setUnread).catch(() => {});
  pollRef.current = setInterval(() => {
   hasUnreadMessages().then(setUnread).catch(() => {});
  }, 10000);
  return () => { if (pollRef.current) clearInterval(pollRef.current); };
 }, [isLoggedIn]);

 const linkClass = (path: string) => {
  const isActive = path === "/" ? pathname === "/" : pathname.startsWith(path);
  return isActive ? "font-semibold text-[var(--g-text)]" : "text-[var(--g-text2)] hover:text-[var(--g-text)]";
 };

 const loggedInRight = isLoggedIn || variant === "dashboard";

 return (
  <nav className="flex justify-between items-center px-6 py-3 bg-[var(--g-nav)] backdrop-blur-xl border-b border-[var(--g-border3)] relative z-30">
   <div className="flex items-center gap-10">
    <a href="/" className="font-bold text-lg tracking-tight bg-gradient-to-r from-[#1a1a1a] to-[#4a4a4a] bg-clip-text text-transparent">
     GigMate
    </a>
   </div>

   <div className="flex items-center gap-4">
    {!loggedInRight ? (
     <>
      <a href="/login" className="text-sm text-[var(--g-text)]">登录</a>
      <a href="/register" className="text-sm font-medium bg-black text-white px-4 py-1.5 rounded-full">注册</a>
     </>
    ) : (
     <>
      <a href="/tasks" className={`text-sm ${linkClass("/tasks")}`}>任务列表</a>
     <a href="/dashboard" className={`text-sm ${linkClass("/dashboard")}`}>控制台</a>
      {isAdmin && (
       <a href="/admin/salary" className={`text-sm ${linkClass("/admin")}`}>任务管理</a>
      )}
      <a href="/messages" className="relative w-8 h-8 flex items-center justify-center">
       <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-white">
        <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6V9.5C3.5 9.9 3.3 10.2 3.1 10.4L2 11.7C1.4 12.5 1 13.5 1 14.6C1 16 2.2 16.5 3.5 16.5H12.5C13.8 16.5 15 16 15 14.6C15 13.5 14.6 12.5 14 11.7L12.9 10.4C12.7 10.2 12.5 9.9 12.5 9.5V6C12.5 3.5 10.5 1.5 8 1.5Z" />
        <path d="M10 16.5C10 17.1 9.5 17.5 9 17.5H7C6.5 17.5 6 17.1 6 16.5" strokeWidth="1.2" />
       </svg>
       {unread && (
        <span className="absolute top-1 right-1 w-[7px] h-[7px] bg-[#ff3b30] rounded-full" />
       )}
      </a>
            <span className="text-xs text-[var(--g-text2)]">{name}</span>
      <AvatarMenu />
     </>
    )}
   </div>
  </nav>
 );
}
