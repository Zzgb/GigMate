"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { useAuth, UserRole } from "@/lib/auth-context";

export default function RegisterPage() {
 const router = useRouter();
 const [selectedRole, setSelectedRole] = useState<UserRole>("employer");
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);
 const { login } = useAuth();

 const handleRegister = async () => {
  if (!name || !email || !password) {
   setError("请填写所有字段");
   return;
  }
  setError("");
  setLoading(true);
  try {
   const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
   });
   if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "注册失败");
   }
   await login(selectedRole, email, password);
   router.push("/dashboard");
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
     <h2 className="text-xl font-semibold mb-6 text-center">注册</h2>
     <p className="text-xs text-[var(--g-text2)] text-center mb-4">注册后将同时拥有雇主和自由职业者身份，随时切换</p>

     <div className="mb-3">
      <div className="text-xs font-medium mb-1.5 text-[var(--g-text2)] dark:text-[#98989d]">昵称</div>
      <input
       type="text"
       value={name}
       onChange={(e) => setName(e.target.value)}
       placeholder="请输入昵称"
       className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none"
      />
     </div>
     <div className="mb-3">
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

     <div className="text-xs text-[var(--g-text2)] mb-2">首次登录身份</div>
     <div className="flex flex-col gap-2 mb-4">
      <button
       onClick={() => setSelectedRole("employer")}
       className={`w-full text-center py-3 rounded-xl text-sm font-medium cursor-pointer ${
        selectedRole === "employer"
         ? "bg-black text-white"
         : "bg-[var(--g-input)] text-[var(--g-text2)] hover:bg-[var(--g-hover)]"
       }`}
      >
       注册为雇主
      </button>
      <button
       onClick={() => setSelectedRole("freelancer")}
       className={`w-full text-center py-3 rounded-xl text-sm font-medium cursor-pointer ${
        selectedRole === "freelancer"
         ? "bg-black text-white"
         : "bg-[var(--g-input)] text-[var(--g-text2)] hover:bg-[var(--g-hover)]"
       }`}
      >
       注册为自由职业者
      </button>
     </div>

     {error && <p className="text-xs text-[#ff3b30] text-center mb-3">{error}</p>}

     <button
      onClick={handleRegister}
      disabled={loading}
      className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
     >
      {loading ? "注册中..." : "注册并进入平台"}
     </button>

     <p className="text-xs text-[var(--g-text2)] text-center mt-4">
      已有账号？<a href="/login" className="text-[#007aff]">去登录</a>
     </p>
    </div>
   </main>
  </div>
 );
}
