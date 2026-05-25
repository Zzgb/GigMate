/**
 * page.tsx
 * 重置密码页 - 邮箱 + 新密码
 * 修改日期: 2026-05-25
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email || !password) { setError("请填写所有字段"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "重置失败");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="landing" />
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-[var(--g-card)] rounded-[20px] p-8 w-[380px] shadow-[0_4px_24px_var(--g-shadow)]">
          {success ? (
            <>
              <h2 className="text-xl font-semibold mb-4 text-center">密码已重置</h2>
              <p className="text-xs text-[var(--g-text2)] text-center mb-4">请使用新密码登录</p>
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold cursor-pointer"
              >
                前往登录
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/login")}
                className="text-sm text-[var(--g-text2)] mb-4 hover:text-[var(--g-text)] cursor-pointer"
              >
                &larr; 返回登录
              </button>
              <h2 className="text-xl font-semibold mb-2 text-center">重置密码</h2>
              <p className="text-xs text-[var(--g-text2)] text-center mb-5">输入注册邮箱和新密码</p>

              <div className="mb-3">
                <div className="text-xs font-medium mb-1.5 text-[var(--g-text2)]">邮箱</div>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入注册邮箱"
                  className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div className="mb-4">
                <div className="text-xs font-medium mb-1.5 text-[var(--g-text2)]">新密码</div>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="请设置新密码"
                  className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>

              {error && <p className="text-xs text-[#ff3b30] text-center mb-3">{error}</p>}

              <button
                onClick={handleReset} disabled={loading}
                className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
              >
                {loading ? "重置中..." : "重置密码"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
