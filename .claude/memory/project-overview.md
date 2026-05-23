---
name: project-overview
description: GigMate 兼职平台项目概览和当前进度 (后端已接入)
metadata:
  type: project
---

## GigMate 项目概览

兼职平台，连接雇主 (EMPLOYER) 与自由职业者 (FREELANCER)。

**技术栈**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui | Prisma 7 + PostgreSQL (Neon) | Auth.js v5

### 当前进度 (2026-05-23)

#### 已完成 (后端接入)
- ✅ **Auth.js v5 认证**: Credentials 登录/注册，JWT session，路由保护中间件
- ✅ **Prisma 7 + Neon PostgreSQL**: 数据库已连接，schema 已推送
- ✅ **User 模型双角色**: `roles String[]` 支持一个账号同时拥有雇主和自由职业者身份
- ✅ **种子数据**: 5 用户、8 任务、6 申请、4 评价
- ✅ **Server Actions**: tasks、applications、dashboard 数据操作全部从 mock 迁移到数据库
- ✅ **前端页面**: 任务列表、任务详情、发布任务、控制台、我的任务、申请管理全部使用真实数据
- ✅ **登录/注册**: 邮箱密码登录、注册自动创建用户

#### 尚未完成
- ❌ 实时聊天/消息 (计划单独规划，需要 WebSocket)
- ❌ 文件上传
- ❌ 生产部署

### 路由表

| 路由 | 页面 | 数据源 |
|------|------|--------|
| `/` | 首页 Landing | 静态 |
| `/login` | 登录 (邮箱密码 + 角色选择) | Auth.js signIn |
| `/register` | 注册 | API + Auth.js |
| `/dashboard` | 控制台 (角色感知) | getDashboardData() |
| `/dashboard/my-tasks` | 雇主我的任务 | getEmployerTasks() |
| `/tasks` | 任务浏览 | getTasks() |
| `/tasks/[id]` | 任务详情 | getTaskById() |
| `/tasks/new` | 发布新任务 | createTask() |
| `/messages` | 消息页 (mock) | Mock 数据 |
| `/applications/[id]` | 管理申请 | getApplicationsForTask() |

### 测试账号

所有账号密码均为 `password123`:
- `employer@test.com` — 张三 (双角色)
- `employer2@test.com` — 李四 (雇主)
- `freelancer@test.com` — 李明 (自由职业者)
- `freelancer2@test.com` — 王小红 (自由职业者)
- `freelancer3@test.com` — 赵六 (自由职业者)
