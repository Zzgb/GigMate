/**
 * page.tsx
 * 登录页面 - 邮箱密码 + Google/GitHub OAuth + 紧凑角色选择 + 测试账号
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Nav from "@/components/Nav";
import { useAuth, UserRole } from "@/lib/auth-context";

const TEST_ACCOUNTS = [
  { email: "employer@test.com", role: "employer" as UserRole, label: "张三" },
  { email: "freelancer@test.com", role: "freelancer" as UserRole, label: "李明" },
  { email: "freelancer2@test.com", role: "freelancer" as UserRole, label: "王小红" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as UserRole) || "employer";
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) { setError("请输入邮箱和密码"); return; }
    setError(""); setLoading(true);
    try { await login(selectedRole, email, password); router.push("/dashboard"); }
    catch { setError("登录失败"); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-[var(--g-card)] rounded-[20px] p-8 w-[400px] shadow-[0_4px_24px_var(--g-shadow)]">
      <h2 className="text-xl font-semibold mb-2 text-center">登录 GigMate</h2>
      <p className="text-xs text-[var(--g-text2)] text-center mb-5">一个账号，双端通用</p>

      <div className="flex gap-3 mb-5">
        <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--g-border3)] text-sm cursor-pointer hover:bg-[var(--g-hover)] text-[var(--g-text)]">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
        <button onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--g-border3)] text-sm cursor-pointer hover:bg-[var(--g-hover)] text-[var(--g-text)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-[var(--g-border3)]" /><span className="text-xs text-[var(--g-text2)]">或</span><div className="flex-1 h-px bg-[var(--g-border3)]" />
      </div>

      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱"
        className="w-full bg-[var(--g-input)] rounded-xl px-4 py-2.5 text-sm outline-none text-[var(--g-text)] mb-3" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码"
        className="w-full bg-[var(--g-input)] rounded-xl px-4 py-2.5 text-sm outline-none text-[var(--g-text)] mb-3" />

      <div className="flex gap-2 mb-4">
        <button onClick={() => setSelectedRole("employer")}
          className={`flex-1 text-xs py-2 rounded-lg cursor-pointer ${selectedRole === "employer" ? "bg-black text-white" : "bg-[var(--g-input)] text-[var(--g-text2)] hover:bg-[var(--g-hover)]"}`}>雇主身份</button>
        <button onClick={() => setSelectedRole("freelancer")}
          className={`flex-1 text-xs py-2 rounded-lg cursor-pointer ${selectedRole === "freelancer" ? "bg-black text-white" : "bg-[var(--g-input)] text-[var(--g-text2)] hover:bg-[var(--g-hover)]"}`}>自由职业者身份</button>
      </div>

      {error && <p className="text-xs text-[#ff3b30] text-center mb-3">{error}</p>}

      <button onClick={handleLogin} disabled={loading}
        className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50">{loading ? "登录中..." : "登录"}</button>

      <p className="text-xs text-center mt-3">
        <a href="/reset-password" className="text-[var(--g-text2)] hover:text-[#007aff]">忘记密码？</a>
      </p>

      <div className="mt-4 pt-3 border-t border-[var(--g-border2)]">
        <p className="text-[10px] text-[var(--g-text2)] mb-2 text-center">测试账号（密码: password123）</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {TEST_ACCOUNTS.map((a) => (
            <button key={a.email} onClick={() => { setEmail(a.email); setPassword("password123"); setSelectedRole(a.role); }}
              className="text-[10px] bg-[var(--g-input)] px-2 py-1 rounded-lg text-[var(--g-text2)] hover:bg-[var(--g-hover)] cursor-pointer">{a.label}</button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[var(--g-text2)] text-center mt-4">还没有账号？<a href="/register" className="text-[#007aff]">去注册</a></p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="landing" />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="bg-[var(--g-card)] rounded-[20px] p-8 w-[400px] shadow-[0_4px_24px_var(--g-shadow)] text-center"><p className="text-sm text-[var(--g-text2)]">加载中...</p></div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
