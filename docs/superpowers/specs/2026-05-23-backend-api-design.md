# GigMate 后端 API 设计

> **目的**: 为已有前端页面接入真实后端，替换 mock 数据
> **架构**: Next.js App Router + Server Actions + Prisma + Auth.js v5
> **技术栈**: Next.js 16, TypeScript, Tailwind CSS 4, Prisma 7, Auth.js v5, bcryptjs, Neon PostgreSQL

---

## 1. 认证方案 (Auth.js v5)

### 用户模型调整

prisma/schema.prisma — User 模型变更：
- 将 `role` 字段改为 `roles String[] @default(["FREELANCER"])`（数组，支持双角色）
- 新增 `passwordHash String?` 字段

### Session 设计

JWT session 包含：
- `id` — 用户 ID
- `email` — 邮箱
- `name` — 姓名
- `role` — **当前活跃角色**（前端切换时更新）

### 路由保护

```ts
// src/middleware.ts
export { auth as middleware } from "@/auth";
export const config = { matcher: ["/dashboard/:path*", "/tasks/:path*", "/messages/:path*"] }
```

### 前端改造

`auth-context.tsx` 保留对外接口，内部实现改用 Auth.js `useSession()` ：
- `isLoggedIn` → `session.status === "authenticated"`
- `role` → `session.data?.user?.role`
- `login(email, password)` → 调用 `signIn("credentials", {...})`
- `logout()` → 调用 `signOut()`
- `switchRole()` → 调用 API 切换当前活跃角色 → 更新 JWT
- `name` → `session.data?.user?.name`

未登录页面不需要 Auth.js session Provider，仅在 dashboard layout 中包裹 `<SessionProvider>`。

---

## 2. 数据层 (Prisma)

```ts
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Schema 验证

现有四个模型（User, Task, Application, Review）基础上调整：
- User: `role` → `roles String[]`，加 `passwordHash String?`
- 已有字段保持不动

---

## 3. Server Actions

### task-actions.ts

```ts
// src/actions/task-actions.ts
"use server";

export async function getTasks(filter: {
  search?: string; category?: string; location?: string;
  sort?: string; minBudget?: number; maxBudget?: number;
}): Promise<TaskWithEmployer[]>

export async function getTaskById(id: string): Promise<TaskWithDetails | null>

export async function createTask(data: CreateTaskInput): Promise<Task>

export async function updateTaskStatus(id: string, status: string): Promise<Task>

export async function getFreelancerActiveTasks(freelancerId: string): Promise<TaskWithEmployer[]>
```

### application-actions.ts

```ts
// src/actions/application-actions.ts
"use server";

export async function applyForTask(taskId: string, message: string): Promise<Application>

export async function getApplicationsForTask(taskId: string): Promise<ApplicationWithFreelancer[]>

export async function acceptApplication(applicationId: string): Promise<void>

export async function rejectApplication(applicationId: string): Promise<void>
```

### review-actions.ts

```ts
// src/actions/review-actions.ts
"use server";

export async function createReview(data: {
  taskId: string; revieweeId: string; rating: number; comment?: string;
}): Promise<Review>
```

### dashboard-actions.ts

```ts
// src/actions/dashboard-actions.ts
"use server";

export async function getDashboardData(role: string, userId: string): Promise<DashboardData>
```

---

## 4. 种子数据

`prisma/seed.ts`:

### 用户 (5 个)

| 姓名 | 邮箱 | 角色 | 密码 |
|------|------|------|------|
| 张三 (雇主) | employer@test.com | ["EMPLOYER", "FREELANCER"] | password123 |
| 李四 (雇主) | employer2@test.com | ["EMPLOYER"] | password123 |
| 李明 (自由) | freelancer@test.com | ["FREELANCER"] | password123 |
| 王小红 (自由) | freelancer2@test.com | ["FREELANCER"] | password123 |
| 赵六 (自由) | freelancer3@test.com | ["FREELANCER"] | password123 |

### 任务 (8 个)

- 3 个 OPEN（可申请）
- 3 个 IN_PROGRESS（进行中）
- 2 个 COMPLETED（已完成，含评价）

示例：
| 标题 | 雇主 | 状态 | 预算 |
|------|------|------|------|
| UI 设计稿更新 | 张三 | IN_PROGRESS | ¥3,000 |
| 文案翻译 (中→英) | 张三 | OPEN | ¥1,500 |
| 活动摄影跟拍 | 李四 | COMPLETED | ¥2,000 |
| ... | ... | ... | ... |

### 申请 (若干)

每个 IN_PROGRESS 任务有 1 个 ACCEPTED 申请 + 若干 PENDING 申请。
每个 COMPLETED 任务有 1 个 ACCEPTED 申请。
每个 OPEN 任务有 0-2 个 PENDING 申请。

### 评价 (若干)

每个 COMPLETED 任务有 2 条评价（雇主评自由职业者 + 自由职业者评雇主）。

---

## 5. 前端页面改造

| 页面 | 改动 |
|------|------|
| `/tasks` | 数据源从 mock-data 改为 `getTasks()` |
| `/tasks/[id]` | 数据源从 mock-data 改为 `getTaskById()` |
| `/tasks/new` | 表单提交从无操作改为 `createTask()` |
| `/dashboard` | 控制台数据从 mock 改为 `getDashboardData()` |
| `/dashboard/my-tasks` | 改为 `getMyTasks()`（根据当前用户查询） |
| `/applications/[id]` | 改为 `getApplicationsForTask()` |
| `/messages` | 暂保持 mock（消息/聊天功能需要 WebSocket 或轮询，单独规划） |
| `/login` | 改为调用 `signIn("credentials")` |
| `/register` | 改为调用 signUp API（创建用户 + 自动登录） |

---

## 6. 不包含在本期

- **实时消息/聊天** — 需要 WebSocket 或 SSE，单独规划
- **文件上传** — 需要存储服务
- **OAuth 登录** — Auth.js 支持，以后加 Google/GitHub 登录
- **分页** — 数据量小暂不实现，后续按需加 `cursor`/`skip`
- **API 限流** — 生产环境加
