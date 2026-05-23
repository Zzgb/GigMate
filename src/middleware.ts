/**
 * middleware.ts
 * Next.js 中间件 - 路由保护，拦截 /dashboard/* /tasks/* /messages/* /applications/* 未登录请求
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/messages/:path*", "/applications/:path*"],
};
