# GigMate Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete frontend UI for GigMate freelance platform (6 pages + shared nav)

**Architecture:** Next.js 16 App Router with Tailwind CSS 4 + shadcn/ui (base-nova preset). Each page is a server component; interactive elements use client components. Navigation shares a single component with different variants for logged-in/logged-out states.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui (base-nova), Lucide icons

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (modify)
│   ├── page.tsx                      # Landing page (rewrite)
│   ├── globals.css                   # Design tokens (modify)
│   ├── (landing)/
│   │   └── page.tsx                  # (alias for /, already exists)
│   ├── (auth)/
│   │   ├── login/page.tsx            # Login page (placeholder)
│   │   └── register/page.tsx         # Register page (placeholder)
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Dashboard layout → Nav/Shell
│   │   ├── page.tsx                  # Dashboard overview
│   │   ├── my-tasks/page.tsx         # Employer's tasks list
│   │   └── tasks/
│   │       └── new/page.tsx          # Post task form
│   ├── tasks/
│   │   ├── page.tsx                  # Browse tasks (freelancer)
│   │   └── [id]/
│   │       └── page.tsx              # Task detail + apply
│   ├── applications/
│   │   └── [id]/page.tsx             # Manage applications (employer)
│   └── messages/
│       └── page.tsx                  # Messaging page
├── components/
│   ├── Nav.tsx                       # Main navigation (all variants)
│   ├── LandingHero.tsx               # Hero section
│   ├── FeatureCards.tsx              # 3-column feature cards
│   ├── FooterSection.tsx             # Landing footer
│   ├── DashboardStats.tsx            # 3 stat cards
│   ├── WorkerList.tsx               # In-progress worker cards
│   ├── ConfirmModal.tsx              # Reusable confirmation modal
│   ├── TaskCard.tsx                  # Task card (list + grid)
│   ├── FilterBar.tsx                 # Search + filter pills
│   ├── TaskDetailSidebar.tsx         # Detail page sidebar
│   ├── ApplicantCard.tsx             # Applicant card
│   ├── ConversationList.tsx          # Message list (left panel)
│   ├── ChatWindow.tsx               # Chat (right panel)
│   ├── AvatarMenu.tsx               # Avatar dropdown menu
│   └── ui/                          # shadcn components (via CLI)
└── lib/
    └── utils.ts                      # cn() helper (from shadcn init)
```

---

### Task 1: Project Setup — Initialize shadcn/ui + Design Tokens

**Files:**
- Create: `src/lib/utils.ts`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Initialize shadcn/ui base components**

Run: `cd /path/to/gigmate && npx shadcn@latest init` (already initialized via components.json, skip init)

Install needed components:
```bash
cd /Users/zzzzk/Documents/Zzzzk/node.js_projects/gigmate
npx shadcn@latest add button card avatar badge input textarea select dialog tabs navigation-menu dropdown-menu
```
Expected: components created in `src/components/ui/`

- [ ] **Step 2: Update globals.css with design tokens**

Write `src/app/globals.css`:
```css
@import "tailwindcss";

@theme inline {
  --color-background: #f5f5f7;
  --color-foreground: #1d1d1f;
  --color-secondary-text: #86868b;
  --color-accent-blue: #007aff;
  --color-success: #30d158;
  --color-error: #ff3b30;
  --color-warning: #f59e0b;
  --color-card: #ffffff;
  --color-card-border: rgba(0, 0, 0, 0.05);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

- [ ] **Step 3: Update root layout metadata**

Edit `src/app/layout.tsx` — change title to "GigMate" and description:
```tsx
export const metadata: Metadata = {
  title: "GigMate - 兼职就该这么简单",
  description: "雇主发布任务，自由职业者接单，安全快捷，双向评价",
};
```

Keep Geist fonts, keep `h-full` and `flex flex-col` on body. Change `lang` to `"zh-CN"`.

- [ ] **Step 4: Create utils.ts**

Write `src/lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Build check**

Run: `cd /Users/zzzzk/Documents/Zzzzk/node.js_projects/gigmate && pnpm build`
Expected: Build succeeds (ignore any lint warnings on unused imports from unused pages yet)

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/lib/utils.ts src/components/ui/
git commit -m "feat: initialize shadcn/ui and design tokens"
```

---

### Task 2: Navigation Component

**Files:**
- Create: `src/components/Nav.tsx`
- Create: `src/components/AvatarMenu.tsx`

- [ ] **Step 1: Create AvatarMenu client component**

Write `src/components/AvatarMenu.tsx`:
```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AvatarMenuProps {
  currentRole: "employer" | "freelancer";
}

export default function AvatarMenu({ currentRole }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const switchLabel = currentRole === "employer" ? "切换为自由职业者" : "切换为雇主";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] border-2 border-transparent hover:border-[#007aff] transition-colors"
      />
      {open && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] min-w-[200px] py-1.5 z-50">
          <button className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-[#f5f5f7] mx-1.5">
            {switchLabel}
          </button>
          <div className="h-px bg-[rgba(0,0,0,0.05)] mx-3 my-1" />
          <button className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-[#f5f5f7] text-[#ff3b30] mx-1.5">
            退出账号
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create Nav component**

Write `src/components/Nav.tsx`:
```tsx
import AvatarMenu from "./AvatarMenu";

interface NavProps {
  variant?: "landing" | "dashboard";
  currentRole?: "employer" | "freelancer";
}

export default function Nav({ variant = "landing", currentRole = "employer" }: NavProps) {
  const navLinks = variant === "dashboard" ? (
    <div className="flex gap-6 text-sm">
      <a href="/" className="text-[#86868b] hover:text-[#1d1d1f]">首页</a>
      <a href="/tasks" className="text-[#86868b] hover:text-[#1d1d1f]">任务</a>
      <a href="/dashboard" className="font-semibold text-[#1d1d1f]">控制台</a>
    </div>
  ) : null;

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-8">
        <a href="/" className="font-bold text-lg tracking-tight bg-gradient-to-r from-[#1a1a1a] to-[#4a4a4a] bg-clip-text text-transparent">
          GigMate
        </a>
        {navLinks}
      </div>
      <div className="flex items-center gap-4">
        {variant === "landing" ? (
          <>
            <a href="/login" className="text-sm text-[#1d1d1f]">登录</a>
            <a href="/register" className="text-sm font-medium bg-black text-white px-4 py-1.5 rounded-full">注册</a>
          </>
        ) : (
          <>
            {/* D-bell icon */}
            <a href="/messages" className="relative w-8 h-8 flex items-center justify-center">
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6V9.5C3.5 9.9 3.3 10.2 3.1 10.4L2 11.7C1.4 12.5 1 13.5 1 14.6C1 16 2.2 16.5 3.5 16.5H12.5C13.8 16.5 15 16 15 14.6C15 13.5 14.6 12.5 14 11.7L12.9 10.4C12.7 10.2 12.5 9.9 12.5 9.5V6C12.5 3.5 10.5 1.5 8 1.5Z" />
                <path d="M10 16.5C10 17.1 9.5 17.5 9 17.5H7C6.5 17.5 6 17.1 6 16.5" strokeWidth="1.2" />
              </svg>
              <span className="absolute top-1 right-1 w-[7px] h-[7px] bg-[#ff3b30] rounded-full" />
            </a>
            <span className="text-xs text-[#86868b]">{currentRole === "employer" ? "雇主" : "自由职业者"}</span>
            <AvatarMenu currentRole={currentRole} />
          </>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Build check**

Run: `cd /Users/zzzzk/Documents/Zzzzk/node.js_projects/gigmate && pnpm build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.tsx src/components/AvatarMenu.tsx
git commit -m "feat: add Nav and AvatarMenu components"
```

---

### Task 3: Landing Page

**Files:**
- Create: `src/components/LandingHero.tsx`
- Create: `src/components/FeatureCards.tsx`
- Create: `src/components/FooterSection.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create LandingHero**

Write `src/components/LandingHero.tsx`:
```tsx
export default function LandingHero() {
  return (
    <section className="relative text-center py-20 px-10 bg-gradient-to-br from-[rgba(0,0,0,0.45)] to-[rgba(0,0,0,0.55)] bg-cover bg-center min-h-[420px] flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/hero-bg.jpg')" }}>
      <h2 className="text-[2.8rem] font-bold tracking-tight leading-tight text-white mb-4">
        兼职就该这么简单
      </h2>
      <p className="text-lg text-white/75 max-w-[480px] mx-auto mb-8 leading-relaxed">
        雇主发布任务，自由职业者接单<br />安全快捷，双向评价
      </p>
      <div className="flex gap-3 justify-center">
        <a href="/register" className="bg-white text-[#1d1d1f] px-6 py-2.5 rounded-xl text-sm font-semibold">
          我要雇佣
        </a>
        <a href="/tasks" className="bg-white/15 text-white px-6 py-2.5 rounded-xl text-sm font-medium border border-white/25 backdrop-blur-sm">
          找工作
        </a>
      </div>
      {/* Carousel dots */}
      <div className="flex gap-1.5 justify-center mt-10">
        <span className="w-6 h-1 bg-white rounded-full" />
        <span className="w-2 h-1 bg-white/40 rounded-full" />
        <span className="w-2 h-1 bg-white/40 rounded-full" />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create FeatureCards**

Write `src/components/FeatureCards.tsx`:
```tsx
const features = [
  { icon: "📋", title: "发布招聘", desc: "免费发布任务，快速找到合适人选" },
  { icon: "🔍", title: "浏览任务", desc: "按类别筛选合适的兼职机会" },
  { icon: "⭐", title: "互相评价", desc: "真实评价体系，建立双向信任" },
];

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-3 gap-5 px-10 py-10">
      {features.map((f) => (
        <div key={f.title} className="bg-white rounded-2xl p-8 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="bg-[#f0f0f0] w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4">{f.icon}</div>
          <h4 className="text-base font-semibold mb-1">{f.title}</h4>
          <p className="text-sm text-[#86868b] leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create FooterSection**

Write `src/components/FooterSection.tsx`:
```tsx
export default function FooterSection() {
  return (
    <footer className="flex justify-center gap-8 py-6 px-10 text-xs text-[#86868b] border-t border-[rgba(0,0,0,0.04)]">
      <span>© 2026 GigMate</span>
      <span>关于</span>
      <span>联系</span>
    </footer>
  );
}
```

- [ ] **Step 4: Rewrite homepage**

Write `src/app/page.tsx`:
```tsx
import Nav from "@/components/Nav";
import LandingHero from "@/components/LandingHero";
import FeatureCards from "@/components/FeatureCards";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="landing" />
      <LandingHero />
      <FeatureCards />
      <FooterSection />
    </div>
  );
}
```

- [ ] **Step 5: Build check**

Run: `cd /Users/zzzzk/Documents/Zzzzk/node.js_projects/gigmate && pnpm build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/components/LandingHero.tsx src/components/FeatureCards.tsx src/components/FooterSection.tsx
git commit -m "feat: implement landing page with hero and feature cards"
```

---

### Task 4: Dashboard Layout + Overview Page

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/page.tsx`
- Create: `src/components/DashboardStats.tsx`

- [ ] **Step 1: Create dashboard layout**

Write `src/app/(dashboard)/layout.tsx`:
```tsx
import Nav from "@/components/Nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="employer" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create DashboardStats**

Write `src/components/DashboardStats.tsx`:
```tsx
const stats = [
  { label: "进行中", value: "3", color: "#007aff" },
  { label: "已完成", value: "12", color: "#30d158" },
  { label: "总申请", value: "28", color: "#1d1d1f" },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
          <div className="text-sm text-[#86868b]">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create dashboard page**

Write `src/app/(dashboard)/page.tsx`:
```tsx
import DashboardStats from "@/components/DashboardStats";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">欢迎回来，张三</h1>
      <div className="flex gap-2 mb-6">
        <span className="bg-black text-white px-4 py-1.5 rounded-full text-sm">概览</span>
        <span className="bg-white px-4 py-1.5 rounded-full text-sm text-[#86868b] border border-[rgba(0,0,0,0.06)]">我的任务</span>
        <span className="bg-white px-4 py-1.5 rounded-full text-sm text-[#86868b] border border-[rgba(0,0,0,0.06)]">发布任务</span>
      </div>
      <DashboardStats />
      <div className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold mb-4">最近任务</h3>
        {["UI 设计稿更新", "文案翻译", "活动摄影跟拍"].map((t) => (
          <div key={t} className="flex justify-between items-center py-3 border-b border-[rgba(0,0,0,0.04)] last:border-0">
            <span className="text-sm">{t}</span>
            <span className="text-xs bg-[#30d1581a] text-[#30d158] px-2.5 py-0.5 rounded-full font-medium">招募中</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build check**

Run: `cd /Users/zzzzk/Documents/Zzzzk/node.js_projects/gigmate && pnpm build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/ src/components/DashboardStats.tsx
git commit -m "feat: add dashboard layout and overview page"
```

---

### Task 5: In-Progress Worker List + Confirmation Modals

**Files:**
- Create: `src/components/WorkerList.tsx`
- Create: `src/components/ConfirmModal.tsx`
- Modify: `src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Create ConfirmModal client component**

Write `src/components/ConfirmModal.tsx`:
```tsx
"use client";

import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmColor?: "black" | "blue" | "red";
  secondStep?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open, title, description, confirmLabel = "确定",
  confirmColor = "black", secondStep, onConfirm, onCancel
}: ConfirmModalProps) {
  if (!open) return null;

  const confirmClass = confirmColor === "blue" ? "bg-[#007aff]" : confirmColor === "red" ? "bg-[#ff3b30]" : "bg-[#1d1d1f]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] w-[360px] p-6 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-[#86868b] mb-6 leading-relaxed">{description}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-[#ff3b30] bg-transparent rounded-xl hover:bg-[#f5f5f7] transition-colors">
            取消
          </button>
          <button onClick={onConfirm} className={`px-5 py-2 text-sm font-medium text-white rounded-xl ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create WorkerList client component**

Write `src/components/WorkerList.tsx`:
```tsx
"use client";

import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

const workers = [
  { name: "李明", task: "UI 设计稿更新", status: "进行中", unread: true },
  { name: "王小红", task: "文案翻译", status: "进行中", unread: false },
  { name: "赵六", task: "活动摄影跟拍", status: "进行中", unread: true },
];

export default function WorkerList({ onBack }: { onBack: () => void }) {
  const [completeOpen, setCompleteOpen] = useState(false);
  const [endStep1, setEndStep1] = useState(false);
  const [endStep2, setEndStep2] = useState(false);

  return (
    <div>
      <button onClick={onBack} className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f]">← 返回概览</button>
      <h2 className="text-lg font-semibold mb-4">进行中的任务</h2>
      <div className="flex flex-col gap-3">
        {workers.map((w) => (
          <div key={w.name} className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm">{w.name}</span>
                  <span className="text-xs text-[#86868b]">{w.task}</span>
                </div>
                <span className="text-xs bg-[#007aff1a] text-[#007aff] px-2 py-0.5 rounded-full font-medium">{w.status}</span>
              </div>
              <button className="w-8 h-8 flex items-center justify-center relative">
                <svg width="14" height="18" viewBox="0 0 16 20" fill="none" stroke="#86868b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6V9.5C3.5 9.9 3.3 10.2 3.1 10.4L2 11.7C1.4 12.5 1 13.5 1 14.6C1 16 2.2 16.5 3.5 16.5H12.5C13.8 16.5 15 16 15 14.6C15 13.5 14.6 12.5 14 11.7L12.9 10.4C12.7 10.2 12.5 9.9 12.5 9.5V6C12.5 3.5 10.5 1.5 8 1.5Z" />
                  <path d="M10 16.5C10 17.1 9.5 17.5 9 17.5H7C6.5 17.5 6 17.1 6 16.5" strokeWidth="1.2" />
                </svg>
                {w.unread && <span className="absolute top-1 right-1 w-[6px] h-[6px] bg-[#ff3b30] rounded-full" />}
              </button>
              <div className="flex gap-2">
                <button onClick={() => setCompleteOpen(true)} className="bg-[#30d158] text-white px-3.5 py-1.5 rounded-full text-xs font-medium">
                  完成任务
                </button>
                <button onClick={() => setEndStep1(true)} className="bg-[#ff3b30] text-white px-3.5 py-1.5 rounded-full text-xs font-medium">
                  结束任务
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal open={completeOpen} title="确认操作？" description="确定完成该任务并付款？"
        confirmLabel="确定" onConfirm={() => setCompleteOpen(false)} onCancel={() => setCompleteOpen(false)} />
      <ConfirmModal open={endStep1} title="确认操作？" description="确定要结束该任务？"
        confirmLabel="确定" onConfirm={() => { setEndStep1(false); setEndStep2(true); }} onCancel={() => setEndStep1(false)} />
      <ConfirmModal open={endStep2} title="是否重新发布此任务？" description="可将当前任务信息自动填入发布页面，方便快速重新发布。"
        confirmLabel="重新发布" confirmColor="blue" secondStep
        onConfirm={() => { setEndStep2(false); /* TODO: navigate to /dashboard/tasks/new with prefill */ }}
        onCancel={() => setEndStep2(false)} />
    </div>
  );
}
```

- [ ] **Step 3: Update dashboard page with worker list toggle**

Edit `src/app/(dashboard)/page.tsx` — add the in-progress expandable view:

```tsx
"use client";

import { useState } from "react";
import DashboardStats from "@/components/DashboardStats";
import WorkerList from "@/components/WorkerList";

export default function DashboardPage() {
  const [showWorkers, setShowWorkers] = useState(false);

  if (showWorkers) return <WorkerList onBack={() => setShowWorkers(false)} />;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">欢迎回来，张三</h1>
      <div className="flex gap-2 mb-6">
        <span className="bg-black text-white px-4 py-1.5 rounded-full text-sm">概览</span>
        <span className="bg-white px-4 py-1.5 rounded-full text-sm text-[#86868b] border border-[rgba(0,0,0,0.06)]">我的任务</span>
        <span className="bg-white px-4 py-1.5 rounded-full text-sm text-[#86868b] border border-[rgba(0,0,0,0.06)]">发布任务</span>
      </div>
      <div onClick={() => setShowWorkers(true)}><DashboardStats /></div>
      <div className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold mb-4">最近任务</h3>
        {["UI 设计稿更新", "文案翻译", "活动摄影跟拍"].map((t) => (
          <div key={t} className="flex justify-between items-center py-3 border-b border-[rgba(0,0,0,0.04)] last:border-0">
            <span className="text-sm">{t}</span>
            <span className="text-xs bg-[#30d1581a] text-[#30d158] px-2.5 py-0.5 rounded-full font-medium">招募中</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Note: The page becomes `"use client"` because of the `useState` toggle, so import from Nav and others will be unaffected since they're already used as components.

- [ ] **Step 4: Build check**

Run: `cd /Users/zzzzk/Documents/Zzzzk/node.js_projects/gigmate && pnpm build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/components/WorkerList.tsx src/components/ConfirmModal.tsx src/app/\(dashboard\)/page.tsx
git commit -m "feat: add worker list with action buttons and confirmation modals"
```

---

### Task 6: Task Browsing Page (Freelancer)

**Files:**
- Create: `src/app/tasks/page.tsx`
- Create: `src/app/tasks/[id]/page.tsx`
- Create: `src/components/TaskCard.tsx`
- Create: `src/components/FilterBar.tsx`
- Create: `src/components/TaskDetailSidebar.tsx`

- [ ] **Step 1: Create FilterBar**

Write `src/components/FilterBar.tsx`:
```tsx
const filters = ["全部", "任务类型", "专业领域", "工作地点", "预算范围", "排序"];

export default function FilterBar() {
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {filters.map((f, i) => (
        <span key={f} className={`px-4 py-1.5 rounded-full text-sm cursor-pointer ${i === 0 ? "bg-black text-white" : "bg-white text-[#86868b] border border-[rgba(0,0,0,0.06)]"}`}>
          {f} <span className="text-xs ml-0.5">▼</span>
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create TaskCard**

Write `src/components/TaskCard.tsx`:
```tsx
interface TaskCardProps {
  title: string;
  category: string;
  location: string;
  time: string;
  description: string;
  tags: string[];
  price: string;
}

export default function TaskCard({ title, category, location, time, description, tags, price }: TaskCardProps) {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-base font-semibold mb-0.5">{title}</div>
          <div className="text-xs text-[#86868b]">{category} · {location} · {time}</div>
        </div>
        <span className="text-xs bg-[#30d1581a] text-[#30d158] px-2 py-0.5 rounded-full font-medium">招募中</span>
      </div>
      <p className="text-xs text-[#86868b] mb-3 leading-relaxed line-clamp-2">{description}</p>
      <div className="flex gap-1.5 mb-3">
        {tags.map((t) => (
          <span key={t} className="text-xs bg-[#f5f5f7] px-2 py-1 rounded-md text-[#86868b]">{t}</span>
        ))}
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-[rgba(0,0,0,0.05)]">
        <span className="text-lg font-bold">{price}</span>
        <span className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-medium">立即申请</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create tasks browse page**

Write `src/app/tasks/page.tsx`:
```tsx
import Nav from "@/components/Nav";
import FilterBar from "@/components/FilterBar";
import TaskCard from "@/components/TaskCard";

const tasks = [
  { title: "UI 设计稿更新", category: "设计", location: "线上", time: "3天前", desc: "需要更新现有产品的 UI 设计稿，包含 3 个主要页面的改版设计，预计 2 周内完成", tags: ["Figma", "UI/UX"], price: "¥200-500" },
  { title: "文案翻译 (中→英)", category: "翻译", location: "线上", time: "1周前", desc: "5000 字产品文档中译英，需要技术文档翻译经验，可长期合作", tags: ["翻译", "英文"], price: "¥50-100" },
  { title: "活动摄影跟拍", category: "摄影", location: "深圳", time: "2天前", desc: "周六下午公司年会跟拍，需要自带设备，约 3 小时", tags: ["摄影", "线下"], price: "¥300-500" },
  { title: "周末咖啡师", category: "服务", location: "北京朝阳", time: "1天前", desc: "周末兼职咖啡师，有经验者优先，每周六日 10:00-18:00", tags: ["咖啡", "线下"], price: "¥150/天" },
];

export default function TasksPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="freelancer" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="flex gap-3 items-center mb-4">
          <div className="flex-1 bg-white rounded-xl px-4 py-2.5 border border-[rgba(0,0,0,0.06)] text-sm text-[#86868b]">
            搜索任务名称、关键词...
          </div>
          <button className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium">搜索</button>
          <div className="flex bg-white rounded-xl p-1 border border-[rgba(0,0,0,0.06)]">
            <span className="bg-black text-white px-2 py-1 rounded-lg text-xs">☰</span>
            <span className="text-[#86868b] px-2 py-1 rounded-lg text-xs">▦</span>
          </div>
        </div>
        <FilterBar />
        <div className="grid grid-cols-2 gap-4">
          {tasks.map((t) => (
            <TaskCard key={t.title} {...t} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Create TaskDetailSidebar**

Write `src/components/TaskDetailSidebar.tsx`:
```tsx
export default function TaskDetailSidebar() {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
      <div className="text-center pb-4 border-b border-[rgba(0,0,0,0.05)] mb-4">
        <div className="text-xs text-[#86868b] mb-1">预算</div>
        <div className="text-3xl font-bold">¥200-500</div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[{ label: "预计时长", value: "2 周" }, { label: "工作方式", value: "远程/线上" }, { label: "申请人数", value: "8 人" }, { label: "截止日期", value: "2026-06-05" }].map((i) => (
          <div key={i.label}>
            <div className="text-xs text-[#86868b]">{i.label}</div>
            <div className="text-sm font-medium">{i.value}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 py-3 border-t border-[rgba(0,0,0,0.05)] mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" />
        <div>
          <div className="text-sm font-medium">张三</div>
          <div className="text-xs text-[#86868b]">雇主 · 15 个任务发布</div>
          <div className="text-[10px] text-[#a1a1a6]">最近登录：3 小时前</div>
        </div>
      </div>
      <button className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold">立即申请</button>
      <div className="text-center mt-2 text-[10px] text-[#86868b]">申请后等待雇主审核</div>
    </div>
  );
}
```

- [ ] **Step 5: Create task detail page**

Write `src/app/tasks/[id]/page.tsx`:
```tsx
import Nav from "@/components/Nav";
import TaskDetailSidebar from "@/components/TaskDetailSidebar";

export default function TaskDetailPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="freelancer" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <a href="/tasks" className="text-sm text-[#86868b] hover:text-[#1d1d1f]">← 返回任务列表</a>
        <div className="grid grid-cols-[2fr_1fr] gap-6 mt-4">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-1">UI 设计稿更新</h3>
                <div className="flex gap-3 text-xs text-[#86868b]">
                  <span>设计</span><span>·</span><span>线上</span><span>·</span><span>2026-05-19 发布</span>
                </div>
              </div>
              <span className="text-xs bg-[#30d1581a] text-[#30d158] px-2.5 py-1 rounded-full font-medium">招募中</span>
            </div>
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] mb-4">
              <h4 className="text-sm font-semibold mb-3">任务详情</h4>
              <p className="text-xs text-[#86868b] leading-relaxed">需要更新现有产品的 UI 设计稿，包含 3 个主要页面的改版设计：首页、产品列表页和个人中心页。要求使用 Figma 进行设计，并提供完整的组件库和设计规范文档。预计工作周期 2 周，可远程协作。</p>
            </div>
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] mb-4">
              <h4 className="text-sm font-semibold mb-3">任职要求</h4>
              <ul className="text-xs text-[#86868b] leading-relaxed list-disc pl-4 space-y-1">
                <li>2 年以上 UI/UX 设计经验</li>
                <li>熟练使用 Figma 和设计系统搭建</li>
                <li>有移动端和 Web 端设计经验</li>
                <li>投递请附作品集链接</li>
              </ul>
            </div>
            <div className="flex gap-1.5 flex-wrap mb-4">
              {["Figma", "UI/UX", "设计系统", "移动端"].map((t) => (
                <span key={t} className="text-xs bg-white px-2.5 py-1.5 rounded-lg text-[#86868b] border border-[rgba(0,0,0,0.06)]">{t}</span>
              ))}
            </div>
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <h4 className="text-sm font-semibold mb-4">发布者近期评价</h4>
              <div className="pb-3 border-b border-[rgba(0,0,0,0.05)] mb-3">
                <div className="flex justify-between mb-1"><span className="text-xs font-medium">王**</span><span className="text-xs text-[#f59e0b]">★★★★★</span></div>
                <p className="text-xs text-[#86868b]">沟通顺畅，结款及时，非常好的合作经历</p>
                <div className="text-[10px] text-[#86868b] mt-1">2 个月前 · 数据录入任务</div>
              </div>
              <div>
                <div className="flex justify-between mb-1"><span className="text-xs font-medium">李**</span><span className="text-xs text-[#f59e0b]">★★★★☆</span></div>
                <p className="text-xs text-[#86868b]">需求明确，验收标准清晰，推荐合作</p>
                <div className="text-[10px] text-[#86868b] mt-1">1 个月前 · 文案翻译任务</div>
              </div>
            </div>
          </div>
          <TaskDetailSidebar />
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 6: Build check**

Run: `cd /Users/zzzzk/Documents/Zzzzk/node.js_projects/gigmate && pnpm build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add src/app/tasks/ src/components/TaskCard.tsx src/components/FilterBar.tsx src/components/TaskDetailSidebar.tsx
git commit -m "feat: add freelancer task browsing and detail pages"
```

---

### Task 7: Post Task Page (Employer)

**Files:**
- Create: `src/app/(dashboard)/tasks/new/page.tsx`

- [ ] **Step 1: Create post task page**

Write `src/app/(dashboard)/tasks/new/page.tsx`:
```tsx
import Nav from "@/components/Nav";

export default function PostTaskPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="employer" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <h4 className="text-lg font-semibold mb-6">发布新任务</h4>
        <div className="grid grid-cols-[3fr_2fr] gap-6">
          {/* LEFT */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">任务名称</div>
              <div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">请输入任务名称</div>
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">任务详情</div>
              <div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]" style={{ minHeight: "100px" }}>请详细描述任务内容、交付物、验收标准等...</div>
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-2">任职要求</div>
              <div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]" style={{ minHeight: "80px" }}>请描述对申请者的要求...</div>
            </div>
          </div>
          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-3">预算 (¥)</div>
              <div className="flex gap-3 items-center">
                <div className="flex-1 bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">最低</div>
                <span className="text-[#86868b]">—</span>
                <div className="flex-1 bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">最高</div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-medium mb-3">分类</div>
              <div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b] mb-3">选择任务分类 ▼</div>
              <div className="text-xs font-medium mb-2">技能标签</div>
              <div className="flex gap-1.5 flex-wrap">
                <span className="bg-[#f5f5f7] px-2 py-1 rounded-lg text-xs text-[#86868b] flex items-center gap-1">Figma ✕</span>
                <span className="bg-[#f5f5f7] px-2 py-1 rounded-lg text-xs text-[#86868b] flex items-center gap-1">UI/UX ✕</span>
                <span className="bg-white px-2 py-1 rounded-lg text-xs text-[#86868b] border border-dashed border-[rgba(0,0,0,0.15)]">+ 添加</span>
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div><div className="text-xs font-medium mb-1.5">预计时长</div><div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">选择...</div></div>
                <div><div className="text-xs font-medium mb-1.5">工作方式</div><div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">选择... ▼</div></div>
              </div>
              <div className="mb-3"><div className="text-xs font-medium mb-1.5">工作地点（线下）</div><div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">输入地址...</div></div>
              <div><div className="text-xs font-medium mb-1.5">截止日期</div><div className="bg-[#f5f5f7] rounded-xl px-4 py-2.5 text-sm text-[#86868b]">选择日期 ▼</div></div>
            </div>
            <button className="w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold">发布任务</button>
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

Run: `cd /Users/zzzzk/Documents/Zzzzk/node.js_projects/gigmate && pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/tasks/new/page.tsx
git commit -m "feat: add post task form page"
```

---

### Task 8: Manage Applications Page (Employer)

**Files:**
- Create: `src/app/applications/[id]/page.tsx`
- Create: `src/components/ApplicantCard.tsx`

- [ ] **Step 1: Create ApplicantCard**

Write `src/components/ApplicantCard.tsx`:
```tsx
interface ApplicantCardProps {
  name: string;
  experience: string;
  message: string;
  tags: string[];
  rating: number;
  completed: number;
  responseRate: string;
  status: "pending" | "approved";
}

export default function ApplicantCard({ name, experience, message, tags, rating, completed, responseRate, status }: ApplicantCardProps) {
  const statusStyle = status === "pending"
    ? "bg-[#f59e0b1a] text-[#f59e0b]"
    : "bg-[#30d1581a] text-[#30d158]";
  const statusLabel = status === "pending" ? "待审核" : "已通过";

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
      <div className="flex gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-sm font-semibold">{name}</span>
              <span className="text-xs text-[#86868b] ml-3">{experience}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle}`}>{statusLabel}</span>
          </div>
          <p className="text-xs text-[#86868b] mb-2 leading-relaxed">{message}</p>
          <div className="flex gap-1.5 mb-2">
            {tags.map((t) => (
              <span key={t} className="text-[10px] bg-[#f5f5f7] px-1.5 py-1 rounded-md text-[#86868b]">{t}</span>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <span className="text-[10px] text-[#86868b]">⭐ {rating}</span>
              <span className="text-[10px] text-[#86868b]">已完成 {completed} 单</span>
              <span className="text-[10px] text-[#86868b]">回复率 {responseRate}</span>
            </div>
            {status === "pending" ? (
              <div className="flex gap-2">
                <button className="bg-[#30d158] text-white px-3.5 py-1.5 rounded-full text-xs font-medium">通过</button>
                <button className="bg-white px-3.5 py-1.5 rounded-full text-xs text-[#86868b] border border-[rgba(0,0,0,0.1)]">拒绝</button>
              </div>
            ) : (
              <span className="text-xs text-[#30d158]">已通过 · 等待对方确认</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create manage applications page**

Write `src/app/applications/[id]/page.tsx`:
```tsx
import Nav from "@/components/Nav";
import ApplicantCard from "@/components/ApplicantCard";

const applicants = [
  { name: "李明", experience: "3 年设计经验", message: "我有 3 年 UI 设计经验，熟练使用 Figma，参与过多个产品的设计系统搭建，附上作品集链接供参考。", tags: ["Figma", "Sketch", "设计系统"], rating: 4.8, completed: 12, responseRate: "95%", status: "pending" as const },
  { name: "王小红", experience: "5 年设计经验", message: "资深 UI/UX 设计师，曾为多家互联网公司提供设计服务，擅长从 0 到 1 搭建设计系统。", tags: ["Figma", "UI/UX", "用户研究"], rating: 5.0, completed: 28, responseRate: "98%", status: "approved" as const },
];

export default function ApplicationsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="employer" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <a href="/dashboard/my-tasks" className="text-sm text-[#86868b] hover:text-[#1d1d1f]">← 返回我的任务</a>
        <div className="flex justify-between items-center mb-6 mt-4">
          <div>
            <h4 className="text-base font-semibold mb-0.5">UI 设计稿更新 · 申请列表</h4>
            <div className="text-xs text-[#86868b]">共 8 人申请 | 招募中</div>
          </div>
          <div className="flex gap-1.5">
            <span className="bg-black text-white px-3.5 py-1 rounded-full text-xs">全部</span>
            <span className="bg-white px-3.5 py-1 rounded-full text-xs text-[#86868b] border border-[rgba(0,0,0,0.06)]">待审核</span>
            <span className="bg-white px-3.5 py-1 rounded-full text-xs text-[#86868b] border border-[rgba(0,0,0,0.06)]">已通过</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {applicants.map((a) => (
            <ApplicantCard key={a.name} {...a} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Build check**

Run: `cd /Users/zzzzk/Documents/Zzzzk/node.js_projects/gigmate && pnpm build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/app/applications/ src/components/ApplicantCard.tsx
git commit -m "feat: add manage applications page"
```

---

### Task 9: Messaging Page

**Files:**
- Create: `src/app/messages/page.tsx`
- Create: `src/components/ConversationList.tsx`
- Create: `src/components/ChatWindow.tsx`

- [ ] **Step 1: Create ConversationList**

Write `src/components/ConversationList.tsx`:
```tsx
const conversations = [
  { name: "李明", task: "UI 设计稿更新", time: "2分钟前", preview: "好的，我明天可以开始工作", unread: 2, active: true, taskColor: "text-[#007aff]" },
  { name: "王小红", task: "文案翻译 (中→英)", time: "1小时前", preview: "您好，我对这个项目很感兴趣", unread: 0, active: false, taskColor: "text-[#86868b]" },
  { name: "赵六", task: "活动摄影跟拍", time: "昨天", preview: "设计稿已更新，请查收", unread: 0, active: false, taskColor: "text-[#86868b]" },
];

export default function ConversationList() {
  return (
    <div className="w-[280px] min-w-[200px] bg-white border-r border-[rgba(0,0,0,0.06)] flex flex-col">
      <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.05)]">
        <span className="text-base font-semibold">对话记录</span>
      </div>
      {conversations.map((c) => (
        <div key={c.name} className={`px-5 py-3 border-b border-[rgba(0,0,0,0.04)] cursor-pointer ${c.active ? "bg-[#f5f5f7]" : ""}`}>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
            <span className="text-sm font-semibold flex-1">{c.name}</span>
            <span className="text-[10px] text-[#86868b]">{c.time}</span>
          </div>
          <div className={`text-xs mb-0.5 ml-9 truncate ${c.taskColor}`}>{c.task}</div>
          <div className="flex items-center ml-9">
            <span className="text-xs text-[#86868b] truncate flex-1">{c.preview}</span>
            {c.unread > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#ff3b30] text-white text-[8px] flex items-center justify-center flex-shrink-0 ml-1.5">{c.unread}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create ChatWindow**

Write `src/components/ChatWindow.tsx`:
```tsx
const messages = [
  { from: "other", text: "您好，我对这个 UI 设计项目很感兴趣。我有 3 年经验，附上作品集供参考。", time: "10:32" },
  { from: "me", text: "你好！看了你的作品集，风格很符合我们的需求。方便聊聊具体的时间安排吗？", time: "10:45" },
  { from: "other", text: "好的，我明天可以开始工作，预计 2 周内完成。", time: "10:48" },
];

export default function ChatWindow() {
  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">
      <div className="px-6 py-3 border-b border-[rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">李明</div>
            <div className="text-[10px] text-[#007aff] truncate cursor-pointer">关于 · UI 设计稿更新 →</div>
          </div>
        </div>
      </div>
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 mb-3 items-start ${m.from === "me" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-lg flex-shrink-0 ${m.from === "other" ? "bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" : "bg-[#1d1d1f] flex items-center justify-center text-white text-[10px]"}`}>
              {m.from === "me" ? "张" : ""}
            </div>
            <div>
              <div className={`rounded-2xl px-4 py-2.5 max-w-[400px] ${m.from === "other" ? "bg-[#f5f5f7] rounded-bl-md" : "bg-[#1d1d1f] rounded-br-md text-white"}`}>
                <p className="text-xs leading-relaxed">{m.text}</p>
              </div>
              <div className={`text-[10px] text-[#86868b] mt-1 ${m.from === "me" ? "text-right" : ""}`}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-3 border-t border-[rgba(0,0,0,0.05)] flex gap-3 items-center">
        <div className="flex-1 bg-[#f5f5f7] rounded-xl px-4 py-2 text-xs text-[#86868b]">输入消息...</div>
        <button className="bg-black text-white px-5 py-2 rounded-xl text-xs font-medium">发送</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create messaging page**

Write `src/app/messages/page.tsx`:
```tsx
import Nav from "@/components/Nav";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";

export default function MessagesPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="employer" />
      <div className="flex flex-1 min-h-0">
        <ConversationList />
        <div className="w-[4px] bg-transparent cursor-col-resize flex-shrink-0" />
        <ChatWindow />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build check**

Run: `cd /Users/zzzzk/Documents/Zzzzk/node.js_projects/gigmate && pnpm build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/messages/ src/components/ConversationList.tsx src/components/ChatWindow.tsx
git commit -m "feat: add messaging page with conversation list and chat"
```

---

### Task 10: Auth Pages (Placeholder) + My Tasks

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(dashboard)/my-tasks/page.tsx`

- [ ] **Step 1: Create login placeholder**

Write `src/app/(auth)/login/page.tsx`:
```tsx
import Nav from "@/components/Nav";

export default function LoginPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="landing" />
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-[20px] p-8 w-[380px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-center">
          <h2 className="text-xl font-semibold mb-6">登录</h2>
          <p className="text-sm text-[#86868b]">登录功能待实现</p>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create register placeholder**

Write `src/app/(auth)/register/page.tsx`:
```tsx
import Nav from "@/components/Nav";

export default function RegisterPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="landing" />
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-[20px] p-8 w-[380px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-center">
          <h2 className="text-xl font-semibold mb-6">注册</h2>
          <p className="text-sm text-[#86868b]">注册功能待实现</p>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create my-tasks placeholder**

Write `src/app/(dashboard)/my-tasks/page.tsx`:
```tsx
import Nav from "@/components/Nav";

export default function MyTasksPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="employer" />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <h2 className="text-lg font-semibold mb-4">我的任务</h2>
        <p className="text-sm text-[#86868b]">我的任务列表待实现</p>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Build check**

Run: `cd /Users/zzzzk/Documents/Zzzzk/node.js_projects/gigmate && pnpm build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/ src/app/\(dashboard\)/my-tasks/
git commit -m "feat: add auth and my-tasks placeholder pages"
```
