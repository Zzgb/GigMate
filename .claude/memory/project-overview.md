---
name: project-overview
description: GigMate 兼职平台项目概览和当前进度 (全栈完整版)
metadata:
  type: project
---

## GigMate 项目概览

兼职平台，连接雇主 (EMPLOYER) 与自由职业者 (FREELANCER)。

**技术栈**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Prisma 7 + PostgreSQL (Neon) + Auth.js v5

### 当前进度 (2026-05-23)

#### 已完成的完整功能
- ✅ **Auth.js v5 认证**: Credentials 登录/注册/JWT session/路由中间件
- ✅ **Prisma 7 + Neon PostgreSQL**: 6 个数据模型 (User/Task/Application/Review/Conversation/Message)
- ✅ **双角色系统**: `roles String[]` 支持雇主/自由职业者双端随时切换
- ✅ **种子数据**: 5 用户/13 任务/9 申请/9 评价/4 对话
- ✅ **Server Actions**: 全部数据操作 (tasks/applications/dashboard/messages)
- ✅ **聊天系统**: Conversation + Message 模型, 3 秒轮询, 内联聊天, 未读红点
- ✅ **深色模式**: CSS 变量方案, 浅色/深色/跟随系统三模式
- ✅ **任务全生命周期**: OPEN → IN_PROGRESS → COMPLETED / CANCELLED
- ✅ **评价系统**: 星级评分 + 评论文本, 已完成任务互评
- ✅ **CANCELLED 状态**: 结束任务标记已取消, 可重新发布自动填表
- ✅ **实时筛选**: 任务列表搜索框点击搜索, 下拉筛选即时生效

### 路由表

| 路由 | 页面 | 数据源 |
|------|------|--------|
| `/` | 首页 Landing | 静态 |
| `/login` | 登录 (邮箱密码 + 角色选择) | Auth.js signIn |
| `/register` | 注册 | API + Auth.js |
| `/dashboard` | 控制台 (角色感知, 雇主/自由职业者双视图) | getDashboardData() |
| `/dashboard/my-tasks` | 雇主我的任务 | getEmployerTasks() |
| `/tasks` | 任务浏览 (搜索/筛选/排序) | getTasks() |
| `/tasks/[id]` | 任务详情 (动态状态 + 智能返回) | getTaskById() |
| `/tasks/new` | 发布新任务 + 重新发布自动填表 | createTask() |
| `/messages` | 消息页 (轮询 + 实时收发 + 对话定位) | getConversations() |
| `/applications/[id]` | 管理申请 (筛选 + 通过/拒绝) | getApplicationsForTask() |

### 数据模型

| 模型 | 字段 | 说明 |
|------|------|------|
| User | id, email, name, passwordHash, roles[] | 用户 (双角色支持) |
| Task | id, title, description, budget, deadline, status, category, skills[] | 任务 (OPEN/IN_PROGRESS/COMPLETED/CANCELLED) |
| Application | id, message, status, taskId, freelancerId | 申请 (PENDING/ACCEPTED/REJECTED) |
| Review | id, rating, comment, taskId, reviewerId, revieweeId | 评价 (1-5 星) |
| Conversation | id, taskId?, user1Id, user2Id, user1ReadAt, user2ReadAt | 对话 (双人+任务关联) |
| Message | id, content, senderId, conversationId | 消息 (对话内) |

### 测试账号

密码统一: `password123`
- `employer@test.com` — 张三 (双角色) ⭐推荐
- `employer2@test.com` — 李四 (仅雇主)
- `freelancer@test.com` — 李明 (仅自由职业者)
- `freelancer2@test.com` — 王小红 (仅自由职业者)
- `freelancer3@test.com` — 赵六 (仅自由职业者)
