# GigMate 后端 API 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为现有前端页面接入后端逻辑（Auth.js 认证 + Prisma 数据库 + Server Actions）

**Architecture:** Auth.js v5 Credentials 认证 + JWT session + Server Actions 替代 API 路由 + Prisma ORM。前端 auth-context.tsx 保持接口不变，内部改用 useSession()。

**Tech Stack:** Next.js 16, Auth.js v5, bcryptjs, Prisma 7, PostgreSQL (Neon)

---

## File Structure

```
新文件:
  src/auth.ts                    — Auth.js v5 配置
  src/middleware.ts              — 路由保护（next-auth middleware）
  src/lib/prisma.ts              — Prisma 客户端单例
  src/actions/task-actions.ts    — 任务 CRUD Server Actions
  src/actions/application-actions.ts — 申请 CRUD Server Actions
  src/actions/dashboard-actions.ts   — 控制台数据 + 评价
  src/app/api/auth/[...nextauth]/route.ts  — Auth.js 路由处理器
  prisma/seed.ts                 — 开发种子数据

修改文件:
  prisma/schema.prisma           — User: role → roles[], 加 passwordHash
  src/lib/auth-context.tsx       — 改用 useSession() 替代 localStorage
  src/app/layout.tsx             — 加 SessionProvider 包裹
  src/app/(auth)/login/page.tsx  — 调用 signIn()
  src/app/(auth)/register/page.tsx — 调用注册 API + 自动登录
  src/app/tasks/page.tsx         — 导入 getTasks()
  src/app/tasks/[id]/page.tsx    — 导入 getTaskById()
  src/app/dashboard/page.tsx     — 导入 getDashboardData()
  src/app/dashboard/my-tasks/page.tsx — 导入 getMyTasks()
  src/app/applications/[id]/page.tsx — 导入 getApplicationsForTask()
```

---

### Task 1: Prisma Schema 更新 + 依赖安装

**Files:**
- Modify: `prisma/schema.prisma`
- Config: `package.json` (seed script)

- [ ] **Step 1: 修改 User 模型**

在 prisma/schema.prisma 中将 User 模型的 role 字段改为 roles 数组，添加 passwordHash：

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String?  // bcrypt 哈希，注册时写入
  roles        String[] @default(["FREELANCER"])  // 支持双角色
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tasks             Task[]        @relation("Employer")
  applications      Application[]
  reviewsReceived   Review[]      @relation("Reviewee")
  reviewsGiven      Review[]      @relation("Reviewer")
}
```

- [ ] **Step 2: 安装依赖**

```bash
pnpm add next-auth@beta bcryptjs
pnpm add -D @types/bcryptjs
```

- [ ] **Step 3: 初始化 Prisma 客户端**

```bash
npx prisma generate
```

验证：`node -e "require('@prisma/client')"` 不报错。

---

### Task 2: Prisma 客户端单例 + Seed 数据

**Files:**
- Create: `src/lib/prisma.ts`
- Create: `prisma/seed.ts`
- Modify: `package.json` (加 seed script)

- [ ] **Step 1: 创建 Prisma 单例**

```ts
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 2: 编写种子数据脚本**

```ts
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 清除旧数据（按外键顺序）
  await prisma.review.deleteMany();
  await prisma.application.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("password123", 10);

  // 创建用户（5个）
  const zhangSan = await prisma.user.create({
    data: { email: "employer@test.com", name: "张三", passwordHash: hash, roles: ["EMPLOYER", "FREELANCER"] },
  });
  const liSi = await prisma.user.create({
    data: { email: "employer2@test.com", name: "李四", passwordHash: hash, roles: ["EMPLOYER"] },
  });
  const liMing = await prisma.user.create({
    data: { email: "freelancer@test.com", name: "李明", passwordHash: hash, roles: ["FREELANCER"] },
  });
  const wangXiaohong = await prisma.user.create({
    data: { email: "freelancer2@test.com", name: "王小红", passwordHash: hash, roles: ["FREELANCER"] },
  });
  const zhaoLiu = await prisma.user.create({
    data: { email: "freelancer3@test.com", name: "赵六", passwordHash: hash, roles: ["FREELANCER"] },
  });

  // 创建任务（8个）
  // --- 3 OPEN ---
  await prisma.task.create({
    data: { title: "文案翻译 (中→英)", description: "5000 字产品文档中译英...", budget: 1500, status: "OPEN", category: "翻译", skills: ["翻译", "英文"], employerId: zhangSan.id },
  });
  await prisma.task.create({
    data: { title: "周末咖啡师", description: "周末兼职咖啡师...", budget: 150, deadline: new Date("2026-06-30"), status: "OPEN", category: "服务", skills: ["咖啡", "线下"], employerId: liSi.id },
  });
  await prisma.task.create({
    data: { title: "产品包装设计", description: "新款健康零食产品包装...", budget: 1200, deadline: new Date("2026-06-15"), status: "OPEN", category: "设计", skills: ["包装设计", "品牌"], employerId: liSi.id },
  });

  // --- 3 IN_PROGRESS ---
  await prisma.task.create({
    data: { title: "UI 设计稿更新", description: "需要更新现有产品的 UI 设计稿...", budget: 3000, deadline: new Date("2026-06-05"), status: "IN_PROGRESS", category: "设计", skills: ["Figma", "UI/UX"], employerId: zhangSan.id,
      applications: { create: [
        { message: "我有 3 年 UI 设计经验...", status: "ACCEPTED", freelancerId: liMing.id },
        { message: "资深 UI/UX 设计师...", status: "PENDING", freelancerId: wangXiaohong.id },
      ]},
    },
  });
  await prisma.task.create({
    data: { title: "活动摄影跟拍", description: "周六下午公司年会跟拍...", budget: 500, deadline: new Date("2026-05-24"), status: "IN_PROGRESS", category: "摄影", skills: ["摄影", "线下"], employerId: liSi.id,
      applications: { create: [
        { message: "我有 5 年摄影经验...", status: "ACCEPTED", freelancerId: zhaoLiu.id },
      ]},
    },
  });
  await prisma.task.create({
    data: { title: "Python 数据清洗", description: "清洗 10 万条销售数据...", budget: 800, deadline: new Date("2026-06-01"), status: "IN_PROGRESS", category: "技术", skills: ["Python", "数据分析"], employerId: zhangSan.id,
      applications: { create: [
        { message: "熟悉 pandas/numpy...", status: "ACCEPTED", freelancerId: wangXiaohong.id },
      ]},
    },
  });

  // --- 2 COMPLETED ---
  const logoTask = await prisma.task.create({
    data: { title: "Logo 设计", description: "设计公司 Logo...", budget: 2000, deadline: new Date("2026-05-10"), status: "COMPLETED", category: "设计", skills: ["Logo", "品牌"], employerId: zhangSan.id,
      applications: { create: [
        { message: "擅长品牌设计...", status: "ACCEPTED", freelancerId: liMing.id },
      ]},
    },
  });
  const translationTask = await prisma.task.create({
    data: { title: "文案翻译 (英→中)", description: "翻译英文产品文档...", budget: 1000, deadline: new Date("2026-05-08"), status: "COMPLETED", category: "翻译", skills: ["翻译", "英文"], employerId: liSi.id,
      applications: { create: [
        { message: "5 年翻译经验...", status: "ACCEPTED", freelancerId: wangXiaohong.id },
      ]},
    },
  });

  // 评价（已完成任务的双方互评）
  const app1 = await prisma.application.findFirst({ where: { taskId: logoTask.id, status: "ACCEPTED" } });
  const app2 = await prisma.application.findFirst({ where: { taskId: translationTask.id, status: "ACCEPTED" } });
  if (app1) {
    await prisma.review.createMany({
      data: [
        { rating: 5, comment: "设计精美，交付及时！", taskId: logoTask.id, reviewerId: zhangSan.id, revieweeId: liMing.id },
        { rating: 5, comment: "雇主需求明确，沟通顺畅", taskId: logoTask.id, reviewerId: liMing.id, revieweeId: zhangSan.id },
      ],
    });
  }
  if (app2) {
    await prisma.review.createMany({
      data: [
        { rating: 4, comment: "翻译质量高，准时交付", taskId: translationTask.id, reviewerId: liSi.id, revieweeId: wangXiaohong.id },
        { rating: 4, comment: "合作愉快，付款及时", taskId: translationTask.id, reviewerId: wangXiaohong.id, revieweeId: liSi.id },
      ],
    });
  }

  console.log("Seed data created successfully");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 3: package.json 加 seed 脚本**

```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

```bash
pnpm add -D tsx
pnpm prisma db seed
```

---

### Task 3: Auth.js v5 配置

**Files:**
- Create: `src/auth.ts`
- Create: `src/middleware.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: 创建 auth.ts**

```ts
// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
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
        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.roles = (user as any).roles;
      }
      // 角色切换时更新 JWT
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
});
```

注意：TypeScript 需要扩展 next-auth 类型。创建 `src/types/next-auth.d.ts`：

```ts
// src/types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    roles?: string[];
  }
  interface Session {
    user: {
      id: string;
      role: string;
      roles: string[];
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    roles: string[];
  }
}
```

- [ ] **Step 2: 创建 API 路由**

```ts
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 3: 创建 middleware.ts**

```ts
// src/middleware.ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/messages/:path*", "/applications/:path*"],
};
```

---

### Task 4: auth-context.tsx 重写

**Files:**
- Rewrite: `src/lib/auth-context.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: 重写 auth-context.tsx**

保持对外接口完全一致（`isLoggedIn`, `role`, `name`, `mounted`, `login`, `logout`, `switchRole`），内部改用 `useSession()`：

```tsx
// src/lib/auth-context.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

export type UserRole = "employer" | "freelancer";

interface AuthContextType {
  isLoggedIn: boolean;
  role: UserRole;
  name: string;
  mounted: boolean;
  login: (role: UserRole, email?: string, password?: string) => Promise<void>;
  logout: () => void;
  switchRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function AuthInner({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isLoggedIn = status === "authenticated";
  const role = ((session?.user as any)?.role || "employer") as UserRole;
  const name = session?.user?.name || "用户";

  const login = async (loginRole: UserRole, email = "employer@test.com", password = "password123") => {
    await signIn("credentials", { email, password, redirect: false });
    // 登录后根据所选角色，如果 roles 包含则设置
    await update({ role: loginRole });
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  const switchRole = async () => {
    const newRole = role === "employer" ? "freelancer" : "employer";
    await update({ role: newRole });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, name, mounted, login, logout, switchRole }}>
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
```

- [ ] **Step 2: 更新 layout.tsx**

`src/app/layout.tsx` 保持不变（AuthProvider 已在根布局包裹），因为 AuthProvider 现在内部包含 SessionProvider。

--- 

### Task 5: 登录/注册页面

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`

- [ ] **Step 1: 更新登录页面**

LoginForm 中 `handleLogin` 改为调用 `login(selectedRole)`（已接受 email/password 参数，在 auth-context 内部调用 signIn）。为简化开发，使用 seed 中的默认账号：

```tsx
const handleLogin = async () => {
  // 使用默认测试账号登录，selectRole 决定初始活跃角色
  await login(selectedRole);
  router.push("/dashboard");
};
```

- [ ] **Step 2: 更新注册页面**

RegisterPage 创建用户后自动登录。需要调用后端注册 action（简化处理——注册时创建用户 + 同步登录）：

在 `src/actions/task-actions.ts` 中添加 `registerUser` action，或在注册页面直接用 fetch 调用 prisma（因为是客户端组件，需要通过一个 API 端点）。最简单的做法：创建一个注册 API 端点。

创建 `src/app/api/register/route.ts`：

```ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, name, password } = await req.json();
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, passwordHash: hash, roles: ["FREELANCER", "EMPLOYER"] },
  });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
```

---

### Task 6: Task Server Actions

**Files:**
- Create: `src/actions/task-actions.ts`

- [ ] **Step 1: 创建任务 actions**

```ts
// src/actions/task-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getTasks(filters?: {
  search?: string; category?: string; sort?: string;
}) {
  const where: any = { status: "OPEN" };

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters?.category) {
    where.category = filters.category;
  }

  let orderBy: any = { createdAt: "desc" };
  if (filters?.sort === "budget_asc") orderBy = { budget: "asc" };
  if (filters?.sort === "budget_desc") orderBy = { budget: "desc" };

  return prisma.task.findMany({
    where,
    orderBy,
    include: { employer: { select: { name: true } } },
  });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      employer: { select: { id: true, name: true } },
      applications: { include: { freelancer: { select: { name: true } } } },
    },
  });
}

export async function createTask(data: {
  title: string; description: string; budget: number;
  category?: string; deadline?: Date; skills?: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      budget: data.budget,
      category: data.category,
      deadline: data.deadline,
      skills: data.skills || [],
      employerId: session.user.id,
      status: "OPEN",
    },
  });
}

export async function getEmployerTasks(employerId: string) {
  return prisma.task.findMany({
    where: { employerId },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });
}
```

---

### Task 7: Application + Dashboard Actions

**Files:**
- Create: `src/actions/application-actions.ts`
- Create: `src/actions/dashboard-actions.ts`

- [ ] **Step 1: 申请 actions**

```ts
// src/actions/application-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function applyForTask(taskId: string, message: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.application.create({
    data: {
      taskId,
      message,
      freelancerId: session.user.id,
      status: "PENDING",
    },
  });
}

export async function getApplicationsForTask(taskId: string) {
  return prisma.application.findMany({
    where: { taskId },
    include: { freelancer: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function acceptApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const app = await prisma.application.update({
    where: { id: applicationId },
    data: { status: "ACCEPTED" },
    include: { task: true },
  });

  // 接受申请 → 任务变为 IN_PROGRESS
  await prisma.task.update({
    where: { id: app.taskId },
    data: { status: "IN_PROGRESS" },
  });

  // 拒绝同一任务的其他 PENDING 申请
  await prisma.application.updateMany({
    where: { taskId: app.taskId, status: "PENDING" },
    data: { status: "REJECTED" },
  });

  return app;
}

export async function rejectApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.application.update({
    where: { id: applicationId },
    data: { status: "REJECTED" },
  });
}
```

- [ ] **Step 2: Dashboard actions**

```ts
// src/actions/dashboard-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const role = (session.user as any).role;

  if (role === "freelancer") {
    const activeTasks = await prisma.task.findMany({
      where: { status: "IN_PROGRESS", applications: { some: { freelancerId: userId, status: "ACCEPTED" } } },
      include: { employer: { select: { name: true } } },
    });
    const completedTasks = await prisma.task.findMany({
      where: { status: "COMPLETED", applications: { some: { freelancerId: userId, status: "ACCEPTED" } } },
      include: { employer: { select: { name: true } } },
    });
    const pendingApps = await prisma.application.findMany({
      where: { freelancerId: userId, status: "PENDING" },
      include: { task: { select: { title: true, budget: true } } },
    });
    return { role: "freelancer", activeTasks, completedTasks, pendingApps, stats: {
      active: activeTasks.length,
      completed: completedTasks.length,
      pending: pendingApps.length,
    }};
  }

  // 雇主端
  const activeTasks = await prisma.task.findMany({
    where: { employerId: userId, status: "IN_PROGRESS" },
  });
  const completedTasks = await prisma.task.findMany({
    where: { employerId: userId, status: "COMPLETED" },
  });
  const pendingApps = await prisma.application.findMany({
    where: { task: { employerId: userId }, status: "PENDING" },
    include: { task: { select: { title: true } }, freelancer: { select: { name: true } } },
  });
  return { role: "employer", activeTasks, completedTasks, pendingApps, stats: {
    active: activeTasks.length,
    completed: completedTasks.length,
    applications: pendingApps.length,
  }};
}

export async function completeTask(taskId: string) {
  return prisma.task.update({ where: { id: taskId }, data: { status: "COMPLETED" } });
}

export async function createReview(data: {
  taskId: string; revieweeId: string; rating: number; comment?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return prisma.review.create({
    data: { ...data, reviewerId: session.user.id },
  });
}
```

---

### Task 8: 前端页面改造

**Files:**
- Modify: `src/app/tasks/page.tsx`
- Modify: `src/app/tasks/[id]/page.tsx`
- Modify: `src/app/tasks/new/page.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/dashboard/my-tasks/page.tsx`
- Modify: `src/app/applications/[id]/page.tsx`

- [ ] **Step 1: 更新任务列表页面**

将 `import { allTasks } from "@/lib/mock-data"` 替换为 Server Action 调用：

```tsx
import { getTasks } from "@/actions/task-actions";
import { useState, useEffect } from "react";

// 在组件中
const [tasks, setTasks] = useState<any[]>([]);

useEffect(() => {
  getTasks().then(setTasks);
}, []);

// 搜索/筛选时重新调用
const handleSearch = async () => {
  const result = await getTasks({ search: searchQuery, category: activeFilters.category });
  setFilteredTasks(result);
};
```

适配 TaskCard 的 props：id, title, category, location, price, description（文本字段，不用 tags/time）。

- [ ] **Step 2: 更新任务详情页面**

```tsx
import { getTaskById } from "@/actions/task-actions";
import { useState, useEffect } from "react";

// 替换 import { allTasks } from "@/lib/mock-data"
// 替换 const task = allTasks.find(...) 为:
const [task, setTask] = useState<any>(null);
useEffect(() => {
  getTaskById(params.id as string).then(setTask);
}, [params.id]);
```

- [ ] **Step 3: 更新发布任务页面**

发布按钮改为调用 `createTask()`：

```tsx
import { createTask } from "@/actions/task-actions";

const handleSubmit = async () => {
  await createTask({
    title: form.title,
    description: form.detail,
    budget: parseInt(form.budgetMax) || 0,
    category: form.category,
    deadline: form.deadline ? new Date(form.deadline) : undefined,
  });
  router.push("/dashboard");
};
```

- [ ] **Step 4: 更新控制台页面**

替换所有 mock 数据为 `getDashboardData()` 调用。

- [ ] **Step 5: 更新我的任务页面**

替换 mock 数据为 `getEmployerTasks(session.user.id)`。

- [ ] **Step 6: 更新申请管理页面**

替换 mock 数据为 `getApplicationsForTask(taskId)`，通过/拒绝按钮接入 `acceptApplication` / `rejectApplication`。

---

## 验证方式

1. `pnpm build` — TypeScript + Next.js 构建通过，0 错误
2. `pnpm prisma db seed` — 种子数据写入成功
3. `pnpm dev` — 启动开发服务器
4. 浏览器中：
   - 用 `employer@test.com / password123` 登录
   - 控制台看到真实数据（统计数字、任务列表）
   - 任务列表页显示数据库中的任务
   - 创建新任务后刷新可见
   - 申请/通过/拒绝功能正常
   - 角色切换后控制台内容切换
5. 用 `freelancer@test.com / password123` 登录，看到自由职业者端控制台
