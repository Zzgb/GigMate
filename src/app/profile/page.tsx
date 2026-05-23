/**
 * page.tsx
 * 用户资料编辑页 - 昵称修改 + 头像上传
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { useAuth } from "@/lib/auth-context";
import { updateProfile } from "@/actions/task-actions";

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, mounted, name, refreshSession } = useAuth();
  const [nickname, setNickname] = useState(name || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mounted && !isLoggedIn) router.replace("/login");
  }, [mounted, isLoggedIn, router]);

  if (!mounted || !isLoggedIn) return null;

  const handleSave = async () => {
    if (!nickname.trim()) return;
    setSaving(true);
    await updateProfile({ name: nickname.trim() });
    setSaving(false);
    setMsg("保存成功");
    await refreshSession();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) {
      await updateProfile({ avatarUrl: data.url });
      setMsg("头像上传成功");
      await refreshSession();
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" />
      <main className="flex-1 p-8 max-w-2xl mx-auto w-full">
        <button onClick={() => router.push("/dashboard")} className="text-sm text-[var(--g-text2)] mb-4 hover:text-[var(--g-text)] cursor-pointer">
          ← 返回控制台
        </button>
        <h2 className="text-xl font-semibold mb-6">个人资料</h2>

        <div className="bg-[var(--g-card)] rounded-2xl p-6 shadow-[0_2px_20px_var(--g-shadow)]">
          {/* 头像 */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--g-border)]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex items-center justify-center text-white text-xl font-bold">
              {name?.[0] || "?"}
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()} className="text-sm text-[#007aff] cursor-pointer hover:underline">
                更换头像
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              <div className="text-xs text-[var(--g-text2)] mt-1">支持 JPG、PNG，最大 2MB</div>
            </div>
          </div>

          {/* 昵称 */}
          <div className="mb-6">
            <div className="text-xs font-medium mb-2 text-[var(--g-text2)]">昵称</div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-[var(--g-input)] rounded-xl px-4 py-2.5 text-sm outline-none text-[var(--g-text)]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存修改"}
            </button>
            {msg && <span className="text-sm text-[#30d158]">{msg}</span>}
          </div>
        </div>
      </main>
    </div>
  );
}
