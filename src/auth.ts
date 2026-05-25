/**
 * auth.ts
 * Auth.js v5 配置文件 - Credentials + Google/GitHub Provider、JWT 回调（角色切换 + DB 同步 name/avatarUrl）、Session 回调（DB 优先读取）
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "",
    }),
    Credentials({
      credentials: {
        email: { label: "邮箱" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.roles.includes("EMPLOYER") ? "employer" : "freelancer",
          roles: user.roles,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // OAuth 新用户 → 跳转注册页选择角色
      if (account?.provider !== "credentials" && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (!existing) {
          const params = new URLSearchParams({
            email: user.email,
            name: user.name || "",
            provider: account!.provider,
          });
          return `/register?${params.toString()}`;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      // Enrich JWT with DB user data for OAuth logins
      if (user) {
        if (account?.provider !== "credentials" && user.email) {
          const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
          if (dbUser) {
            token.id = dbUser.id;
            token.name = dbUser.name || user.name;
            token.email = dbUser.email || user.email;
            token.role = dbUser.roles.includes("EMPLOYER") ? "employer" : "freelancer";
            token.roles = dbUser.roles;
            token.picture = user.image;
            token.avatarUrl = dbUser.avatarUrl;
          }
        } else {
          token.id = user.id;
          token.name = user.name;
          token.email = user.email;
          token.picture = (user as any).image || null;
          token.role = (user as any).role || "freelancer";
          token.roles = (user as any).roles || ["FREELANCER"];
          token.avatarUrl = (user as any).avatarUrl || null;
        }
      }
      if (trigger === "update") {
        // 刷新 session 时重新读取数据库中的用户信息
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) {
          token.name = dbUser.name || token.name || (token.email as string)?.split("@")[0] || null;
          token.avatarUrl = dbUser.avatarUrl || token.avatarUrl;
          token.roles = dbUser.roles;
          if (session?.role) {
            const requestedRole = session.role === "employer" ? "EMPLOYER" : "FREELANCER";
            if (dbUser.roles.includes(requestedRole)) {
              token.role = session.role;
            }
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        (session.user as any).role = token.role;
        (session.user as any).roles = token.roles;
        // 每次都从数据库读取最新的 name、avatarUrl、roles（兼容旧 session）
        if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, avatarUrl: true, roles: true },
          });
          session.user.name = dbUser?.name || token.name || (token.email as string)?.split("@")[0] || null;
          (session.user as any).avatarUrl = token.avatarUrl || dbUser?.avatarUrl || null;
          (session.user as any).roles = dbUser?.roles || token.roles || ["FREELANCER"];
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
