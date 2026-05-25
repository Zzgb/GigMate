/**
 * page.tsx
 * 注册页 - 两步流程：Step1 邮箱密码角色 / Step2 昵称头像（仅首次）
 * 已有账号加角色跳过 Step2 直接登录
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import { useAuth, UserRole } from "@/lib/auth-context";
import { ArrowLeft } from "lucide-react";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthEmail = searchParams.get("email") || "";
  const oauthName = searchParams.get("name") || "";
  const oauthProvider = searchParams.get("provider") || "";
  const isOAuth = !!oauthProvider;
  const providerLabel = oauthProvider === "github" ? "GitHub" : oauthProvider === "google" ? "Google" : "";

  const [step, setStep] = useState(1);

  // Step 1
  const [selectedRole, setSelectedRole] = useState<UserRole>("employer");
  const [email, setEmail] = useState(oauthEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 2 (only for new users)
  const [nickname, setNickname] = useState(oauthName);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { login } = useAuth();

  useEffect(() => {
    if (isOAuth) {
      setEmail(oauthEmail);
      setNickname(oauthName);
    }
  }, [oauthEmail, oauthName, isOAuth]);

  // Step 1: 检查邮箱状态 → 新用户进 step2，已有账号加角色直接登录
  const handleStep1 = async () => {
    if (!email || !password) {
      setError("请填写邮箱和密码");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // 调注册 API（不带 name，测试是否为新用户）
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });
      const data = await res.json();

      if (res.ok) {
        // 已有账号 + 角色追加成功 → 直接登录
        await login(selectedRole, email, password);
        router.push("/dashboard");
      } else if (data.error === "请填写昵称") {
        // 新用户 → 进 Step 2
        setStep(2);
      } else {
        setError(data.error || "操作失败");
      }
    } catch (err: any) {
      setError(err.message || "网络错误");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: 首次注册，填昵称+头像后创建账号
  const handleStep2 = async () => {
    if (!nickname.trim()) {
      setError("请填写昵称");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: nickname.trim(),
          password,
          role: selectedRole,
          ...(avatarUrl ? { avatarUrl } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "注册失败");
        setLoading(false);
        return;
      }
      await login(selectedRole, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "网络错误");
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", f);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (d.url) setAvatarUrl(d.url);
    } catch {}
    setUploading(false);
  };

  const roleLabel = selectedRole === "employer" ? "雇主" : "自由职业者";

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="landing" />
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-[var(--g-card)] rounded-[20px] p-8 w-[380px] shadow-[0_4px_24px_var(--g-shadow)]">
          {step === 1 ? (
            <>
              <h2 className="text-xl font-semibold mb-2 text-center">
                {isOAuth ? `关联 ${providerLabel} 账号` : "注册"}
              </h2>
              <p className="text-xs text-[var(--g-text2)] text-center mb-4">
                {isOAuth
                  ? `${providerLabel} 首次登录，设置密码并选择身份`
                  : "输入邮箱密码，选择您的身份"}
              </p>

              {/* 邮箱 */}
              <div className="mb-3">
                <div className="text-xs font-medium mb-1.5 text-[var(--g-text2)]">邮箱</div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  disabled={isOAuth}
                  className={`w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none ${isOAuth ? "opacity-60" : ""}`}
                />
              </div>

              {/* 密码 */}
              <div className="mb-4">
                <div className="text-xs font-medium mb-1.5 text-[var(--g-text2)]">密码</div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请设置密码"
                  className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>

              {/* 角色选择 */}
              <div className="text-xs text-[var(--g-text2)] mb-2">选择身份</div>
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
                onClick={handleStep1}
                disabled={loading}
                className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
              >
                {loading ? "验证中..." : "下一步"}
              </button>

              {!isOAuth && (
                <p className="text-xs text-[var(--g-text2)] text-center mt-4">
                  已有账号？<a href="/login" className="text-[#007aff]">去登录</a>
                </p>
              )}
            </>
          ) : (
            <>
              {/* Step 2 返回按钮 */}
              <button
                onClick={() => { setStep(1); setError(""); }}
                className="flex items-center gap-1 text-sm text-[var(--g-text2)] mb-4 hover:text-[var(--g-text)] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </button>

              <h2 className="text-xl font-semibold mb-1 text-center">完善资料</h2>
              <p className="text-xs text-[var(--g-text2)] text-center mb-2">
                注册为{roleLabel}端
              </p>
              <p className="text-[10px] text-[var(--g-text2)] text-center mb-4">
                {email}
              </p>

              {/* 头像 */}
              <div className="flex flex-col items-center mb-4">
                <div
                  className="w-20 h-20 rounded-2xl mb-2 overflow-hidden cursor-pointer relative"
                  onClick={() => fileRef.current?.click()}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex items-center justify-center text-[10px] text-[var(--g-text2)]">
                      {uploading ? "上传中..." : "点击上传"}
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <span className="text-[10px] text-[var(--g-text2)]">上传头像（可选）</span>
              </div>

              {/* 昵称 */}
              <div className="mb-4">
                <div className="text-xs font-medium mb-1.5 text-[var(--g-text2)]">昵称</div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="请输入昵称"
                  className="w-full bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>

              {error && <p className="text-xs text-[#ff3b30] text-center mb-3">{error}</p>}

              <button
                onClick={handleStep2}
                disabled={loading}
                className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
              >
                {loading ? "注册中..." : "完成注册"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1">
        <Nav variant="landing" />
        <main className="flex-1 flex items-center justify-center text-sm text-[var(--g-text2)]">加载中...</main>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
