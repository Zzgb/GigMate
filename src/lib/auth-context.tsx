"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

export type UserRole = "employer" | "freelancer";

interface AuthContextType {
  isLoggedIn: boolean;
  role: UserRole;
  name: string;
  roles: string[];
  mounted: boolean;
  login: (role: UserRole, email?: string, password?: string) => Promise<void>;
  logout: () => void;
  switchRole: () => Promise<void>;
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

  const switchRole = useCallback(async () => {
    const newRole = role === "employer" ? "freelancer" : "employer";
    await update({ role: newRole });
  }, [role, update]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, name, roles, mounted, login, logout, switchRole }}>
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
