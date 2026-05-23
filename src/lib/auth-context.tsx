/**
 * auth-context.tsx
 * 认证上下文 - 封装 Auth.js useSession()，提供 useAuth() hook（isLoggedIn/role/name/userId/roles/login/logout/switchRole）
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

export type UserRole = "employer" | "freelancer";

interface AuthContextType {
 isLoggedIn: boolean;
 role: UserRole;
 name: string;
 userId: string;
 roles: string[];
  avatarUrl: string | null;
 mounted: boolean;
 login: (role: UserRole, email?: string, password?: string) => Promise<void>;
 logout: () => void;
 switchRole: () => Promise<void>;
  refreshSession: (data?: Record<string, any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function AuthInner({ children }: { children: ReactNode }) {
 const { data: session, status, update } = useSession();
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
  if (status !== "loading") setMounted(true);
 }, [status]);

 const isLoggedIn = status === "authenticated";
 const role = ((session?.user as any)?.role || "employer") as UserRole;
 const name = session?.user?.name || "用户";
 const userId = session?.user?.id || "";
 const avatarUrl = ((session?.user as any)?.avatarUrl || null) as string | null;
  const roles = ((session?.user as any)?.roles || ["FREELANCER"]) as string[];

 const login = useCallback(
  async (loginRole: UserRole, email = "employer@test.com", password = "password123") => {
   const result = await signIn("credentials", { email, password, redirect: false });
   if (result?.error) {
    console.error("Login failed:", result.error);
    return;
   }
   await update({ role: loginRole });
  },
  [update],
 );

 const logout = useCallback(() => {
  signOut({ redirect: false });
 }, []);

 const refreshSession = useCallback(async (data?: Record<string, any>) => {
    await update(data || {});
  }, [update]);

  const switchRole = useCallback(async () => {
  const newRole = role === "employer" ? "freelancer" : "employer";
  await update({ role: newRole });
 }, [role, update]);

 return (
  <AuthContext.Provider value={{ isLoggedIn, role, name, userId, roles, avatarUrl, mounted, login, logout, switchRole, refreshSession }}>
   {children}
  </AuthContext.Provider>
 );
}

export function AuthProvider({ children }: { children: ReactNode }) {
 return (
  <SessionProvider>
   <AuthInner>{children}</AuthInner>
  </SessionProvider>
 );
}

export function useAuth() {
 const ctx = useContext(AuthContext);
 if (!ctx) throw new Error("useAuth must be used within AuthProvider");
 return ctx;
}
