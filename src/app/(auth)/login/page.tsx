/**
 * page.tsx
 * 登录页面 - 邮箱密码登录 + 角色选择 + 测试账号快速填充按钮
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import { useAuth, UserRole } from "@/lib/auth-context";

const TEST_ACCOUNTS = [
 { email: "employer@test.com", role: "employer" as UserRole, label: "张三（雇主）" },
 { email: "employer2@test.com", role: "employer" as UserRole, label: "李四（雇主）" },
 { email: "freelancer@test.com", role: "freelancer" as UserRole, label: "李明（自由职业者）" },
 { email: "freelancer2@test.com", role: "freelancer" as UserRole, label: "王小红（自由职业者）" },
 { email: "freelancer3@test.com", role: "freelancer" as UserRole, label: "赵六（自由职业者）" },
];

function LoginForm() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const defaultRole = (searchParams.get("role") as UserRole) || "employer";
 const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState("");
 const { login } = useAuth();

 const handleLogin = async () => {
  if (!email || !password) {
   setError("请输入邮箱和密码");
   return;
  }
  setError("");
  try {
   await login(selectedRole, email, password);
   router.push("/dashboard");
  } catch {
   setError("登录失败，请检查邮箱和密码");
  }
 };

 return (
  <div className="bg-[var(--g-card)] rounded-[20px] p-8 w-[380px] shadow-[0_4px_24px_var(--g-shadow)]">
   <h2 className="text-xl font-semibold mb-6 text-center">登录</h2>
   <p className="text-xs text-[var(--g-text2)] text-center mb-4">一个账号可同时管理雇主和自由职业者身份</p>

   <div className="mb-4">
    <div className="text-xs font-medium mb-1.5 text-[var(--g-text2)] dark:text-[#98989d]">邮箱</div>
    <input
     type="email"
     value={email}
     onChange={(e) => setEmail(e.target.value)}
     placeholder="请输入邮箱"
     className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none"
    />
   </div>
   <div className="mb-4">
    <div className="text-xs font-medium mb-1.5 text-[var(--g-text2)] dark:text-[#98989d]">密码</div>
    <input
     type="password"
     value={password}
     onChange={(e) => setPassword(e.target.value)}
     placeholder="请输入密码"
     className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none"
    />
   </div>

   <div className="text-xs text-[var(--g-text2)] mb-2">选择身份进入</div>
   <div className="flex flex-col gap-2 mb-4">
    <button
     onClick={() => setSelectedRole("employer")}
     className={`w-full text-center py-3 rounded-xl text-sm font-medium cursor-pointer ${
      selectedRole === "employer"
       ? "bg-black text-white"
       : "bg-[var(--g-input)] text-[var(--g-text2)] hover:bg-[var(--g-hover)]"
     }`}
    >
     以雇主身份进入
    </button>
    <button
     onClick={() => setSelectedRole("freelancer")}
     className={`w-full text-center py-3 rounded-xl text-sm font-medium cursor-pointer ${
      selectedRole === "freelancer"
       ? "bg-black text-white"
       : "bg-[var(--g-input)] text-[var(--g-text2)] hover:bg-[var(--g-hover)]"
     }`}
    >
     以自由职业者身份进入
    </button>
   </div>

   {error && <p className="text-xs text-[#ff3b30] text-center mb-3">{error}</p>}

   <button
    onClick={handleLogin}
    className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold cursor-pointer"
   >
    进入平台
   </button>

   <div className="mt-4 pt-3 border-t border-[var(--g-border2)]">
    <p className="text-[10px] text-[var(--g-text2)] mb-2 text-center">测试账号（密码: password123）</p>
    <div className="flex flex-wrap gap-1.5 justify-center">
     {TEST_ACCOUNTS.map((a) => (
      <button
       key={a.email}
       onClick={() => { setEmail(a.email); setPassword("password123"); setSelectedRole(a.role); }}
       className="text-[10px] bg-[var(--g-input)] px-2 py-1 rounded-lg text-[var(--g-text2)] hover:bg-[var(--g-hover)] cursor-pointer"
      >
       {a.label}
      </button>
     ))}
    </div>
   </div>

   <p className="text-xs text-[var(--g-text2)] text-center mt-4">
    还没有账号？<a href="/register" className="text-[#007aff]">去注册</a>
   </p>
  </div>
 );
}

export default function LoginPage() {
 return (
  <div className="flex flex-col flex-1">
   <Nav variant="landing" />
   <main className="flex-1 flex items-center justify-center">
    <Suspense fallback={
     <div className="bg-[var(--g-card)] rounded-[20px] p-8 w-[380px] shadow-[0_4px_24px_var(--g-shadow)] text-center">
      <p className="text-sm text-[var(--g-text2)] dark:text-[#98989d]">加载中...</p>
     </div>
    }>
     <LoginForm />
    </Suspense>
   </main>
  </div>
 );
}
