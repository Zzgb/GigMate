"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AvatarMenuProps {
  currentRole: "employer" | "freelancer";
}

export default function AvatarMenu({ currentRole }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const switchLabel = currentRole === "employer" ? "切换为自由职业者" : "切换为雇主";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] border-2 border-transparent hover:border-[#007aff] transition-colors"
      />
      {open && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] min-w-[200px] py-1.5 z-50">
          <button className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-[#f5f5f7] mx-1.5">
            {switchLabel}
          </button>
          <div className="h-px bg-[rgba(0,0,0,0.05)] mx-3 my-1" />
          <button className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-[#f5f5f7] text-[#ff3b30] mx-1.5">
            退出账号
          </button>
        </div>
      )}
    </div>
  );
}
