"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AvatarMenu() {
  const { role, isLoggedIn, switchRole, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (!isLoggedIn) return null;

  const switchLabel = role === "employer" ? "切换为自由职业者" : "切换为雇主";

  const handleSwitch = () => {
    switchRole();
    setOpen(false);
    router.push("/dashboard");
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.push("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        type="button"
        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] border-2 border-transparent hover:border-[#007aff] transition-colors cursor-pointer"
        aria-label="用户菜单"
      />
      {open && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] min-w-[200px] py-1.5 z-50">
          <button
            onClick={handleSwitch}
            type="button"
            className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-[#f5f5f7] mx-1.5 cursor-pointer"
          >
            {switchLabel}
          </button>
          <div className="h-px bg-[rgba(0,0,0,0.05)] mx-3 my-1" />
          <button
            onClick={handleLogout}
            type="button"
            className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-[#f5f5f7] text-[#ff3b30] mx-1.5 cursor-pointer"
          >
            退出账号
          </button>
        </div>
      )}
    </div>
  );
}
