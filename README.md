# GigMate — 兼职就该这么简单

连接雇主与自由职业者的短期兼职平台，支持双角色切换、里程碑验收、薪酬托管、实时聊天、深色模式。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 (深色模式 CSS 变量方案) |
| 认证 | Auth.js v5 (Credentials + GitHub/Google OAuth, JWT Session) |
| 数据库 | PostgreSQL (Neon 托管) |
| ORM | Prisma 7 (Adapter: @prisma/adapter-neon) |
| 密码 | bcryptjs |
| 包管理 | pnpm |

## 功能模块

- **用户系统**: 两步注册（邮箱密码 → 昵称）+ 角色追加 + 密码重置
- **双角色**: 雇主/自由职业者一键切换 + 管理员 (gigmateadmin)
- **任务**: CRUD + 固定/范围双预算 + 搜索筛选排序 + 状态流转
- **里程碑**: 拖拽排序 + 比例校验 + 提交验收 + 审批通过/驳回
- **薪酬**: 付款托管 + 按比例打款 + 5% 平台手续费 + 交易事务 + 行级锁
- **聊天**: 对话列表 + 实时聊天 (3s 轮询) + 审批卡片融入消息流 + 文件上传
- **评价**: 双向评价（雇主 ↔ 自由职业者）+ 历史评价展示
- **管理员**: 任务管理 + 搜索分页排序 + 状态日志/交易日志
- **UI**: 满屏轮播首页 + 半透明固定导航栏 + 深色模式 + 响应式

---

## 前置要求

- **Node.js** >= 20
- **pnpm** >= 9（`npm i -g pnpm`）
- **PostgreSQL 数据库**（推荐 [Neon](https://neon.tech) 免费版）

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Zzgb/gigmate.git
cd gigmate
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env`，填入你的配置：

```bash
cp .env.example .env
```

必填项：

| 变量 | 说明 | 获取方式 |
|------|------|----------|
| `DATABASE_URL` | PostgreSQL 连接串 | [Neon](https://neon.tech) 创建免费数据库后获取 |
| `AUTH_SECRET` | Auth.js 加密密钥 | 运行 `npx auth secret` 或 `openssl rand -base64 32` |
| `AUTH_URL` | 应用地址 | 本地开发填 `http://localhost:3000` |

可选（OAuth 登录）：

| 变量 | 说明 |
|------|------|
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth App 凭据 |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth 凭据 |

### 4. 初始化数据库

```bash
npx prisma db push    # 同步 schema
npx prisma generate   # 生成客户端
npx prisma db seed    # 测试数据
npx prisma db studio  # 可视化浏览（可选）
```

### 5. 启动

```bash
pnpm dev              # → http://localhost:3000
```

---

## OAuth 登录配置

### GitHub

1. 前往 [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps → New OAuth App
2. 回调地址填：`http://localhost:3000/api/auth/callback/github`
3. 将生成的 Client ID 和 Client Secret 填入 `.env`

### Google

1. 前往 [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → 创建凭据 → OAuth 客户端 ID
2. 回调地址填：`http://localhost:3000/api/auth/callback/google`
3. 将 Client ID 和 Client Secret 填入 `.env`

不配置 OAuth 也能通过邮箱密码正常登录使用。

---

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

## 生产部署

### Vercel（推荐）

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入仓库
3. 在 Vercel 项目设置中配置所有环境变量
4. **注意**: Vercel 无本地文件系统，需将文件上传迁移到对象存储（S3/Cloudflare R2 等），修改 `src/app/api/upload/` 下的路由

### 自建服务器

```bash
# 构建
pnpm build

# 启动 (端口 3000)
pnpm start
```

推荐使用 PM2 管理进程：

```bash
npm i -g pm2
pm2 start node_modules/.bin/next --name gigmate -- start -p 3000
```

### Docker Compose

```yaml
version: "3.8"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: gigmate
      POSTGRES_PASSWORD: your-password
      POSTGRES_DB: gigmate
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://gigmate:your-password@db:5432/gigmate
      AUTH_SECRET: your-secret
      AUTH_URL: http://localhost:3000
    depends_on:
      - db

volumes:
  pgdata:
```

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3000
CMD ["pnpm", "start"]
```

---

## 项目结构

```
src/
├── auth.ts                     # Auth.js v5 配置
├── middleware.ts                # 路由鉴权
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页
│   ├── globals.css             # 主题变量 + Tailwind
│   ├── (auth)/
│   │   ├── login/              # 邮箱密码 + OAuth 登录
│   │   ├── register/           # 两步注册
│   │   └── reset-password/     # 密码重置
│   ├── dashboard/
│   │   ├── layout.tsx          # 控制台布局
│   │   ├── page.tsx            # 雇主/自由职业者双视图
│   │   └── my-tasks/           # 雇主我的任务
│   ├── tasks/
│   │   ├── page.tsx            # 搜索 + 筛选 + 排序
│   │   ├── new/                # 发布任务
│   │   └── [id]/               # 任务详情 + 历史评价
│   ├── messages/               # 对话列表 + 聊天窗口
│   ├── applications/[id]/      # 申请详情
│   ├── profile/                # 个人资料
│   ├── admin/salary/           # 管理员任务管理
│   └── api/
│       ├── auth/[...nextauth]/ # Auth.js 路由
│       ├── register/           # 注册 API
│       ├── reset-password/     # 密码重置 API
│       ├── upload/             # 文件上传 API
│       ├── upload/milestone/   # 里程碑附件上传
│       └── download/milestone/ # 附件下载（权限校验）
├── components/
│   ├── Nav.tsx                 # 固定导航栏
│   ├── AvatarMenu.tsx          # 头像下拉（主题/角色切换）
│   ├── LandingHero.tsx         # 首页轮播 Hero
│   ├── FooterSection.tsx       # 页脚
│   ├── ChatWindow.tsx          # 聊天窗口
│   ├── ConversationList.tsx    # 对话列表
│   ├── InlineChat.tsx          # 内联聊天
│   ├── TaskCard.tsx            # 任务卡片
│   ├── TaskDetailSidebar.tsx   # 任务详情侧边栏
│   ├── FilterBar.tsx           # 筛选栏
│   ├── ConfirmModal.tsx        # 通用确认弹窗
│   ├── MilestoneEditor.tsx     # 里程碑编辑器
│   ├── MilestoneProgressBar.tsx
│   ├── MilestoneApprovalCard.tsx
│   ├── FileDropZone.tsx        # 拖拽文件上传
│   ├── PaymentModal.tsx        # 付款弹窗
│   ├── ReviewSection.tsx       # 双向评价
│   └── SalaryLogModal.tsx      # 状态/交易日志
├── actions/
│   ├── task-actions.ts         # 任务 CRUD + 薪酬转移
│   ├── application-actions.ts  # 申请管理
│   ├── dashboard-actions.ts    # 控制台数据 + 评价
│   ├── message-actions.ts      # 对话 / 消息
│   ├── milestone-actions.ts    # 验收 + 审批（事务 + 行级锁）
│   └── admin-actions.ts        # 管理员查询 + 日志
├── lib/
│   ├── auth-context.tsx        # useAuth() hook
│   ├── theme-context.tsx       # 深色模式 hook
│   ├── prisma.ts               # Prisma 客户端单例
│   └── utils.ts                # cn / formatBudget / formatSize
└── types/
    └── next-auth.d.ts          # Auth.js 类型扩展
```

---

## 核心业务规则

### 任务生命周期

```
雇主发布(付款托管) → OPEN → 自由职业者申请 → PENDING
  → 雇主通过 → IN_PROGRESS → 里程碑验收 → COMPLETED → 双向评价
  → 取消 → CANCELLED → 可重新发布(薪酬转移)
```

### 里程碑薪酬流程

```
创建任务(付款到平台托管) → 自由职业者完成节点 → 提交验收
  → 雇主审批通过 → 按比例打款(扣 5% 手续费) → 最后一个节点通过 → 任务完成
  → 雇主驳回 → 自由职业者重新提交
```

### 其他规则

- 只有 OPEN 状态任务可申请；一个任务只接受一个申请
- 雇主不能申请任何任务（包括自己发布的）
- 同邮箱可注册不同端（不可重复注册已有端）
- 创建任务后里程碑不可修改
- 同一任务同时只允许一个待审批里程碑
- 资金操作使用数据库事务 + `SELECT ... FOR UPDATE` 行级锁

---

## 数据库表结构

### 1. User — 用户

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| email | String (unique) | 登录邮箱 |
| name | String? | 昵称 |
| passwordHash | String? | bcrypt 密码哈希（OAuth 用户为空） |
| avatarUrl | String? | 头像 URL |
| roles | String[] | 角色数组: `["EMPLOYER"]` / `["FREELANCER"]` / 双端 / `["gigmateadmin"]` |
| balance | Float | 钱包余额 |
| createdAt / updatedAt | DateTime | 时间戳 |

**关联**: applications, reviewsReceived/Given, conversations, messages, milestone approvals, transactions, statusLogs

### 2. Task — 任务

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| title | String | 任务名称 |
| description | String | 任务描述 |
| budget | Float | 预算金额（固定模式=固定值，范围模式=最大值） |
| budgetMin | Float? | 预算范围最小值（固定模式为 null） |
| deadline | DateTime? | 截止日期 |
| status | String | OPEN → IN_PROGRESS → COMPLETED / CANCELLED |
| category | String? | 分类 |
| skills | String[] | 技能标签 |
| escrow | Float | 平台托管金额 |
| parentTaskId | String? | 来源任务 ID（重新发布链路） |
| createdAt / updatedAt | DateTime | 时间戳 |

**关联**: employer, applications, reviews, conversations, milestones, transactions, statusLogs, parentTask/childTasks

### 3. Application — 申请

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| message | String | 申请留言 |
| status | String | PENDING → ACCEPTED / REJECTED |
| taskId | String | → Task.id |
| freelancerId | String | → User.id |

**规则**: 同一 (task, freelancer) 只能有一个 PENDING 申请；通过后自动拒绝其余。

### 4. Review — 评价

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| rating | Int | 评分 1-5 |
| comment | String? | 评价内容 |
| taskId | String | → Task.id |
| reviewerId | String | → User.id（评价人） |
| revieweeId | String | → User.id（被评价人） |

**规则**: 双向评价（雇主 ↔ 自由职业者），每人每任务限评一次，仅已完成任务可评价。

### 5. Conversation — 对话

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| taskId | String? | → Task.id（可选） |
| user1Id | String | → User.id |
| user2Id | String | → User.id |
| user1ReadAt | DateTime? | user1 已读时间 |
| user2ReadAt | DateTime? | user2 已读时间 |

**规则**: 同一 (user1, user2, taskId) 组合唯一。

### 6. Message — 消息

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| content | String | 消息内容 |
| senderId | String | → User.id |
| conversationId | String | → Conversation.id |

- 文件消息格式: `[文件] name\nurl`
- 里程碑标记: `[里程碑审批:id]`

### 7. Milestone — 里程碑节点

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| taskId | String | → Task.id |
| order | Int | 排序序号 |
| name | String | 节点名称 |
| criteria | String | 验收条件 |
| ratio | Float | 付款比例 0-100 |
| amount | Float | ratio/100 × task.budget |
| status | String | PENDING → SUBMITTED → APPROVED / REJECTED |
| version | Int | 乐观锁版本号 |

**规则**: 创建后锁定不可修改; 所有节点 ratio 总和 = 100%; taskId+order 唯一。

### 8. MilestoneApproval — 审批记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| milestoneId | String | → Milestone.id |
| submittedById | String | → User.id（提交人） |
| description | String? | 验收材料描述 |
| status | String | PENDING → APPROVED / REJECTED |
| reviewedById | String? | → User.id（审批人） |
| reviewedAt | DateTime? | 审批时间 |
| rejectionReason | String? | 驳回原因 |

**规则**: 同一任务同时只允许一个 PENDING 审批；通过后触发付款；驳回后可重新提交。

### 9. MilestoneAttachment — 附件

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| approvalId | String | → MilestoneApproval.id |
| filename | String | UUID 重命名的磁盘文件名 |
| originalName | String | 原始文件名 |
| fileSize | Int | 字节数 |
| mimeType | String | 文件类型 |
| url | String | 访问路径 |

### 10. Transaction — 交易记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| taskId | String? | → Task.id |
| milestoneId | String? | → Milestone.id |
| type | String | DEPOSIT / PLATFORM_FEE / FREELANCER_PAYMENT / REFUND / TRANSFER_OUT / TRANSFER_IN |
| amount | Float | 金额 |
| payerId | String? | 付款方 |
| payeeId | String? | 收款方 |
| escrowBefore | Float? | 变化前托管金 |
| escrowAfter | Float? | 变化后托管金 |
| operatorId | String? | 操作人 |
| description | String? | 备注 |

### 11. TaskStatusLog — 状态日志

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| taskId | String | → Task.id |
| fromStatus | String? | 旧状态 |
| toStatus | String | 新状态 |
| event | String | 事件描述 |
| operatorId | String? | → User.id |
| createdAt | DateTime | 时间戳 |

### 表关系总览

```
User (1) ──< Task (N)             雇主发布任务
User (1) ──< Application (N)      自由职业者申请
Task (1) ──< Application (N)      任务收到的申请
Task (1) ──< Review (N)           任务关联的评价
Task (1) ──< Milestone (N)        任务的里程碑节点
Task (1) ──< Transaction (N)      任务的交易记录
Task (1) ──< TaskStatusLog (N)    任务的状态日志
Task (1) ──< Task (N)             parentTask → childTasks

Milestone (1) ──< MilestoneApproval (N)
MilestoneApproval (1) ──< MilestoneAttachment (N)
Conversation (1) ──< Message (N)
Conversation (N) ── Task (1)?     对话可选关联任务

User ── Transaction (payer/payee/operator)
User ── TaskStatusLog (operator)
User ── MilestoneApproval (submitter/reviewer)
```

---

## 开源协议

MIT

## 💡 关于这个项目

GigMate 诞生于一次”全栈实战”的挑战——用 AI 辅助编码，从零搭建一个真实、完整、可用的兼职平台。因政策门槛无法商业化运营，我选择将其开源，希望能帮助到正在学习全栈开发或想要搭建类似平台的独立开发者。

## 作者

- **开发**: Claude Code CLI 接入 DeepSeek V4 Pro
- **最后更新**: 2026-05-26
