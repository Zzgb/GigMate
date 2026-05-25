/**
 * middleware.ts
 * Next.js 中间件 - 路由保护 + 管理员路由鉴权
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(url);
  }

  // Admin route protection
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const roles: string[] = (req.auth.user as any)?.roles || [];
    if (!roles.includes("gigmateadmin")) {
      return Response.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/messages/:path*", "/applications/:path*", "/admin/:path*"],
};
