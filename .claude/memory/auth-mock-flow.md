---
name: auth-system
description: Auth.js v5 + Prisma 认证流程和角色切换机制
metadata:
  type: project
---

## 认证系统

基于 Auth.js v5 (next-auth@beta) + Prisma 7 + PostgreSQL (Neon)。

### 认证配置 (`src/auth.ts`)

- Provider: Credentials（邮箱+密码）
- JWT 策略（不启用 Prisma Adapter）
- JWT 存储: `id`, `role` (当前活跃角色), `roles` (所有角色)
- Session 映射: `session.user.id`, `session.user.role`, `session.user.roles`

### AuthContext (`src/lib/auth-context.tsx`)

- 内部改用 `useSession()`，对外接口不变
- `isLoggedIn` ← `status === "authenticated"`
- `login(role, email, password)` ← `signIn("credentials", {...})`
- `logout()` ← `signOut()`
- `switchRole()` ← `update({ role: newRole })` 触发 JWT callback
- `mounted` 保留用于 hydration 保护

### 登录流程

1. 首页按钮 → `/login?role=employer|freelancer`
2. 登录页输入邮箱密码 + 选择身份 → signIn → JWT 写入 → 跳转 `/dashboard`
3. 登录页提供测试账号快速填充按钮

### 注册流程

1. 注册页输入昵称/邮箱/密码 → POST `/api/register` → 创建用户 (roles: [FREELANCER, EMPLOYER])
2. 自动调用 signIn 登录 → 跳转 `/dashboard`

### 角色切换

- 头像菜单「切换为 X」→ `update({ role: newRole })` → JWT 更新 → 跳转 `/dashboard`
- DB 存储所有角色，JWT 存当前活跃角色，切换不写 DB

### 路由保护

- `src/middleware.ts`: `export { auth as middleware }` 保护 `/dashboard/*`、`/tasks/*`、`/messages/*`、`/applications/*`
- 各页面另有客户端保护: `mounted && !isLoggedIn` → `router.replace("/login")`

### 退出

- 头像菜单「退出账号」→ `signOut()` → 跳转 `/`
