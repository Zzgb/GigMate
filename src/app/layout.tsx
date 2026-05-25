/**
 * layout.tsx
 * 根布局 - 包裹 ThemeProvider 和 AuthProvider，设置全局字体和深色模式背景
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";

const geistSans = Geist({
 variable: "--font-geist-sans",
 subsets: ["latin"],
});

const geistMono = Geist_Mono({
 variable: "--font-geist-mono",
 subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "GigMate - 兼职就该这么简单",
 description: "雇主发布任务，自由职业者接单，安全快捷，双向评价",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <html
   lang="zh-CN"
   suppressHydrationWarning
   className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
  >
   <head>
    <script
     dangerouslySetInnerHTML={{
      __html: `
       (function() {
        try {
         var t = localStorage.getItem("gigmate_theme") || "system";
         var d = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
         if (d) document.documentElement.classList.add("dark");
        } catch(e) {}
       })();
      `,
     }}
    />
   </head>
   <body className="min-h-full flex flex-col bg-[var(--g-bg)] pt-14">
    <ThemeProvider>
     <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
   </body>
  </html>
 );
}
