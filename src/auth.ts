/**
 * auth.ts
 * Auth.js v5 配置文件 - Credentials Provider（Prisma 查库验证）、JWT 回调（用户信息+角色切换）、Session 回调
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
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Auto-create user for OAuth providers
      if (account?.provider !== "credentials" && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split("@")[0],
              roles: ["FREELANCER"],
            },
          });
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
            token.role = dbUser.roles.includes("EMPLOYER") ? "employer" : "freelancer";
            token.roles = dbUser.roles;
            token.picture = user.image;
          }
        } else {
          token.id = user.id;
          token.role = (user as any).role || "freelancer";
          token.roles = (user as any).roles || ["FREELANCER"];
        }
      }
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).roles = token.roles;
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
