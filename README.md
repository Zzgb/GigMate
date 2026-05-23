# GigMate - 兼职就该这么简单

**连接雇主与自由职业者的短期兼职平台**，支持双角色切换、实时聊天、深色模式。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 (深色模式 CSS 变量方案) |
| 认证 | Auth.js v5 (Credentials + JWT Session) |
| 数据库 | PostgreSQL (Neon 托管) |
| ORM | Prisma 7 (Adapter: @prisma/adapter-neon) |
| 密码 | bcryptjs |

## 快速开始

```bash
pnpm install
pnpm prisma db push    # 推送数据库 schema
pnpm prisma generate   # 生成 Prisma 客户端
pnpm prisma db seed    # 填充种子数据
pnpm dev               # 启动开发服务器 → http://localhost:3000
```

## 测试账号

密码统一: `password123`

| 邮箱 | 姓名 | 角色 |
|------|------|------|
| `employer@test.com` | 张三 | 雇主 + 自由职业者 (双端) |
| `employer2@test.com` | 李四 | 雇主 |
| `freelancer@test.com` | 李明 | 自由职业者 |
| `freelancer2@test.com` | 王小红 | 自由职业者 |
| `freelancer3@test.com` | 赵六 | 自由职业者 |

---

## 项目结构

### 数据库模型 (`prisma/`)

| 文件 | 功能 |
|------|------|
| `schema.prisma` | 数据模型: User / Task / Application / Review / Conversation / Message |
| `seed.ts` | 种子数据脚本 (5 用户, 13 任务, 9 申请, 4 对话) |

### 认证系统 (`src/auth.ts`, `src/middleware.ts`)

| 文件 | 功能 |
|------|------|
| `auth.ts` | Auth.js v5 配置, Credentials Provider, JWT 回调 (角色切换) |
| `middleware.ts` | 路由保护: `/dashboard/*`, `/tasks/*`, `/messages/*`, `/applications/*` |

### Server Actions (`src/actions/`)

| 文件 | 功能 |
|------|------|
| `task-actions.ts` | 任务 CRUD: getTasks (筛选排序), getTaskById, createTask, getEmployerTasks |
| `application-actions.ts` | 申请管理: applyForTask, acceptApplication, rejectApplication |
| `dashboard-actions.ts` | 控制台数据 (角色感知), 完成任务, 取消任务, 创建评价 |
| `message-actions.ts` | 聊天: 对话列表, 消息收发, 未读检测, 已读标记, 创建对话 |

### 客户端状态 (`src/lib/`)

| 文件 | 功能 |
|------|------|
| `auth-context.tsx` | 认证上下文 (useAuth): 封装 Auth.js useSession, 提供 login/logout/switchRole |
| `theme-context.tsx` | 主题上下文 (useTheme): 浅色/深色/跟随系统, localStorage 持久化 |
| `prisma.ts` | Prisma 客户端单例 (Neon adapter) |
| `utils.ts` | 通用工具函数 (cn classname 合并) |

### 页面路由 (`src/app/`)

| 路由 | 文件 | 功能 |
|------|------|------|
| `/` | `page.tsx` | 首页落地页 (LandingHero + FeatureCards) |
| `/login` | `(auth)/login/page.tsx` | 邮箱密码登录 + 角色选择 + 测试账号快捷填充 |
| `/register` | `(auth)/register/page.tsx` | 注册 (昵称/邮箱/密码/角色) → 自动登录 |
| `/dashboard` | `dashboard/page.tsx` | 控制台: 雇主端(统计/进行中/已完成/待审批) + 自由职业者端 |
| `/dashboard/my-tasks` | `dashboard/my-tasks/page.tsx` | 雇主任务列表 |
| `/tasks` | `tasks/page.tsx` | 任务搜索 + 筛选 + 单双列视图 |
| `/tasks/[id]` | `tasks/[id]/page.tsx` | 任务详情 (状态感知 + 智能返回 + 角色感知按钮) |
| `/tasks/new` | `tasks/new/page.tsx` | 发布新任务 / 重新发布自动填表 |
| `/messages` | `messages/page.tsx` | 消息页: 对话列表 + 聊天窗口 + 3s 轮询 |
| `/applications/[id]` | `applications/[id]/page.tsx` | 申请管理: 筛选 + 通过/拒绝 |
| `/api/auth/[...nextauth]` | `api/auth/[...nextauth]/route.ts` | Auth.js API 路由处理 |
| `/api/register` | `api/register/route.ts` | 注册 API (创建用户 + bcrypt 哈希) |
| `layout.tsx` | `layout.tsx` | 根布局: ThemeProvider + AuthProvider |

### 全局样式

| 文件 | 功能 |
|------|------|
| `globals.css` | Tailwind 入口, CSS 变量 (--g-bg/--g-card/--g-text 等 15 个), 浅色/深色变量集 |

### UI 组件 (`src/components/`)

| 文件 | 功能 |
|------|------|
| `Nav.tsx` | 导航栏: Logo/任务列表/控制台/铃铛(未读红点)/用户名/头像菜单 |
| `AvatarMenu.tsx` | 头像下拉菜单: 账号信息/主题切换(浅色深色跟随系统)/角色切换(pill按钮)/退出 |
| `LandingHero.tsx` | 首页 Hero 区域: 我要雇佣/找工作 按钮 (可选身份登录) |
| `FeatureCards.tsx` | 首页功能介绍卡片 |
| `FooterSection.tsx` | 首页页脚 |
| `TaskCard.tsx` | 任务卡片 (列表页) |
| `TaskDetailSidebar.tsx` | 任务详情侧边栏: 预算/信息/申请按钮 (角色+状态感知) |
| `FilterBar.tsx` | 筛选栏: 任务类型/领域/地点/预算/排序 下拉 |
| `DashboardStats.tsx` | 控制台统计卡片 (进行中/已完成/总申请) |
| `WorkerList.tsx` | 雇主进行中任务列表 (铃铛+内联聊天) |
| `ApplicantCard.tsx` | 申请人卡片 (申请管理页) |
| `ConversationList.tsx` | 对话列表 (消息页左侧) |
| `ChatWindow.tsx` | 聊天窗口 (消息发送/接收/显示) |
| `InlineChat.tsx` | 内联聊天组件 (控制台进行中任务铃铛展开) |
| `ConfirmModal.tsx` | 确认弹窗 (完成任务/结束任务/重新发布) |

---

## 业务功能

### 任务生命周期
```
雇主发布 → OPEN(招募中)
  → 自由职业者申请 → PENDING
  → 雇主通过 → IN_PROGRESS(进行中)
  → 完成 → COMPLETED(已完成) → 双方评价
  → 取消 → CANCELLED(已取消) → 可重新发布
```

### 核心业务规则
- 只有 OPEN 状态的任务可申请
- 一个任务只接受一个申请 (通过后拒绝其余)
- 通过申请时任务自动变为 IN_PROGRESS
- 只有 EMPLOYER 角色可发布/管理任务
- 只有 FREELANCER 角色可申请任务
- 双角色用户可在头像菜单切换用户端
- 雇主不能申请任何任务

### 聊天系统
- 对话关联任务 (可选)
- 3 秒轮询实时更新
- 未读消息红点 (10 秒检测)
- 自动创建对话 (通过 "联系雇主" 按钮)
- 消息页同步已读状态
- 文件上传 (图片预览/附件下载)
- 客户端消息缓存 (切回看过的对话瞬间显示)
- 左侧对话列表 + 右侧聊天窗口独立滚动

### 深色模式
- CSS 变量方案 (15 个颜色变量)
- 三模式: 浅色/深色/跟随系统
- 所有组件统一配色

---

## 项目作者

- **开发**: Claude Code + DeepSeek V4 Pro
- **最后更新**: 2026-05-23
