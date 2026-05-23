# CLAUDE.md - GigMate 兼职平台

## 项目概述
GigMate 是一个连接雇主与自由职业者的短期兼职平台。用户分为雇主（EMPLOYER）和自由职业者（FREELANCER）两种角色。

## 技术栈
- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: Tailwind CSS 4 + shadcn/ui
- **认证**: Auth.js v5 (Credentials + Google/GitHub OAuth, JWT Session)
- **数据库**: PostgreSQL (Neon 托管)
- **ORM**: Prisma 7 (Adapter: @prisma/adapter-neon)
- **密码**: bcryptjs
- **包管理器**: pnpm

## 启动命令
| 命令 | 用途 |
|------|------|
| `pnpm dev` | 启动开发服务器 (localhost:3000) |
| `pnpm build` | 生产构建 |
| `pnpm lint` | 代码检查 |
| `npx prisma db push` | 推送 schema 变更到数据库 |
| `npx prisma db seed` | 填充种子数据 |
| `npx prisma db studio` | 打开数据库可视化管理 |

## 目录结构
src/
├── app/                       # 页面路由 (App Router)
│   ├── layout.tsx             # 根布局 (ThemeProvider + AuthProvider)
│   ├── page.tsx               # 首页 Landing
│   ├── (auth)/                # 登录/注册 (无需登录)
│   │   ├── login/page.tsx     # 邮箱密码 + OAuth 登录
│   │   └── register/page.tsx  # 注册页
│   ├── dashboard/             # 控制台 (需登录, 角色感知)
│   ├── tasks/                 # 任务浏览/详情/发布
│   ├── messages/              # 消息页 (对话列表 + 聊天)
│   ├── applications/          # 申请管理
│   ├── profile/               # 用户资料编辑
│   └── api/                   # API 路由 (auth/upload/register)
├── components/                # 共享 UI 组件
│   ├── Nav.tsx                # 导航栏
│   ├── AvatarMenu.tsx         # 头像下拉菜单 (主题/角色切换)
│   ├── ChatWindow.tsx         # 聊天窗口
│   ├── ConversationList.tsx   # 对话列表
│   ├── InlineChat.tsx         # 内联聊天 (控制台)
│   ├── TaskDetailSidebar.tsx  # 任务详情侧边栏
│   └── ...
├── actions/                   # Server Actions
│   ├── task-actions.ts        # 任务 CRUD
│   ├── application-actions.ts # 申请管理
│   ├── dashboard-actions.ts   # 控制台数据 (角色感知)
│   └── message-actions.ts     # 聊天消息
└── lib/                       # 工具函数
    ├── auth-context.tsx       # useAuth() hook
    ├── theme-context.tsx      # useTheme() hook (浅色/深色/跟随系统)
    ├── prisma.ts              # Prisma 客户端单例
    └── utils.ts               # 通用工具

## 数据模型 (prisma/schema.prisma)
- **User**: id, email, name?, passwordHash?, avatarUrl?, roles[] (EMPLOYER/FREELANCER 双角色), createdAt, updatedAt
- **Task**: id, title, description, budget, deadline?, status (OPEN/IN_PROGRESS/COMPLETED/CANCELLED), category?, skills[], employerId
- **Application**: id, message, status (PENDING/ACCEPTED/REJECTED), taskId, freelancerId
- **Review**: id, rating (1-5), comment?, taskId, reviewerId, revieweeId
- **Conversation**: id, taskId?, user1Id, user2Id, user1ReadAt?, user2ReadAt?, messages[]
- **Message**: id, content, senderId, conversationId, createdAt

## 核心业务规则
- 任务状态流转: OPEN → IN_PROGRESS → COMPLETED / CANCELLED
- 只有 OPEN 状态的任务可申请
- 一个任务只接受一个申请（通过后拒绝其余）
- 通过申请时任务自动变为 IN_PROGRESS
- 只有 EMPLOYER 角色可发布/管理任务
- 只有 FREELANCER 角色可申请任务
- 双角色用户可在头像菜单切换用户端
- 雇主不能申请任何任务（包括自己发布的）
- 金额以人民币为单位，显示时加人民币符号前缀

## 文件约定
- 页面组件用默认导出
- Server Actions 文件头加 `"use server"`，直接调 Prisma
- 客户端组件通过 Server Actions 获取数据
- 所有 Server Actions 做权限验证 (`const session = await auth()`)
- UI 组件用 `"use client"` 声明
- 深色模式用 CSS 变量 (--g-bg/--g-card/--g-text 等)，不用 Tailwind dark: 前缀
