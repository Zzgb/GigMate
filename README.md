# GigMate - 兼职就该这么简单

**连接雇主与自由职业者的短期兼职平台**，支持双角色切换、里程碑验收、薪酬托管、实时聊天、深色模式。

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

## 快速开始

```bash
pnpm install
pnpm prisma db push
pnpm prisma generate
pnpm prisma db seed
pnpm dev               # → http://localhost:3000
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
| balance | Float | 钱包余额（自由职业者收入 / 雇主退款） |
| createdAt / updatedAt | DateTime | 时间戳 |

**关联**：
- `tasks` → 作为雇主发布的任务
- `applications` → 作为自由职业者的申请
- `reviewsReceived` / `reviewsGiven` → 收到/给出的评价
- `conversationsAs1` / `conversationsAs2` → 参与的对话
- `messages` → 发送的消息
- `submittedApprovals` / `reviewedApprovals` → 提交/审批的里程碑
- `paidTransactions` / `receivedTransactions` / `operatedTransactions` → 付款/收款/操作的交易
- `statusLogs` → 操作的任务状态日志

---

### 2. Task — 任务

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| title | String | 任务名称 |
| description | String | 任务描述（含任职要求等） |
| budget | Float | 预算金额（固定模式=固定值，范围模式=最大值） |
| budgetMin | Float? | 预算范围最小值（固定模式为 null） |
| deadline | DateTime? | 截止日期 |
| status | String | OPEN → IN_PROGRESS → COMPLETED / CANCELLED |
| category | String? | 分类 |
| skills | String[] | 技能标签 |
| escrow | Float | 平台托管金额（创建任务时入账，审批时扣减） |
| parentTaskId | String? | 来源任务 ID（重新发布链路） |
| createdAt / updatedAt | DateTime | 时间戳 |

**关联**：
- `employer` (User) — 发布者
- `applications` — 收到的申请
- `reviews` — 关联的评价
- `conversations` — 关联的对话
- `milestones` — 验收里程碑节点
- `transactions` — 交易记录
- `statusLogs` — 状态变更日志
- `parentTask` / `childTasks` — 任务重新发布链路（自关联）

---

### 3. Application — 申请

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| message | String | 申请留言 |
| status | String | PENDING → ACCEPTED / REJECTED |
| taskId | String | → Task.id |
| freelancerId | String | → User.id（申请人） |

**规则**：同一 (task, freelancer) 只能有一个 PENDING 申请；通过一个后自动拒绝其余。

---

### 4. Review — 评价

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| rating | Int | 评分 1-5 |
| comment | String? | 评价内容 |
| taskId | String | → Task.id（关联任务） |
| reviewerId | String | → User.id（评价人） |
| revieweeId | String | → User.id（被评价人） |

**规则**：双向评价（雇主 ↔ 自由职业者），每人每任务限评一次，仅已完成任务可评价。

---

### 5. Conversation — 对话

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| taskId | String? | → Task.id（可选，关联任务） |
| user1Id | String | → User.id |
| user2Id | String | → User.id |
| user1ReadAt | DateTime? | user1 已读时间 |
| user2ReadAt | DateTime? | user2 已读时间 |

**规则**：同一 (user1, user2, taskId) 组合唯一，关联任务的对话不会与无关对话混淆。

---

### 6. Message — 消息

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| content | String | 消息内容（文件消息格式 `[文件] name\nurl`；里程碑标记 `[里程碑审批:id]`） |
| senderId | String | → User.id |
| conversationId | String | → Conversation.id |

---

### 7. Milestone — 里程碑节点

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| taskId | String | → Task.id |
| order | Int | 排序序号（唯一约束 taskId+order） |
| name | String | 节点名称 |
| criteria | String | 验收条件 |
| ratio | Float | 付款比例 0-100 |
| amount | Float | ratio/100 × task.budget |
| status | String | PENDING → SUBMITTED → APPROVED / REJECTED |
| version | Int | 乐观锁版本号 |
| createdAt / updatedAt | DateTime | 时间戳 |

**规则**：创建任务时锁定不可修改；所有节点 ratio 总和必须 = 100%。

---

### 8. MilestoneApproval — 里程碑审批记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| milestoneId | String | → Milestone.id |
| submittedById | String | → User.id（提交人，自由职业者） |
| description | String? | 验收材料文字描述 |
| status | String | PENDING → APPROVED / REJECTED |
| reviewedById | String? | → User.id（审批人，雇主） |
| reviewedAt | DateTime? | 审批时间 |
| rejectionReason | String? | 驳回原因 |
| createdAt / updatedAt | DateTime | 时间戳 |

**规则**：同一任务同时只允许一个 PENDING 审批；通过后触发付款；驳回后允许重新提交。

---

### 9. MilestoneAttachment — 里程碑附件

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| approvalId | String | → MilestoneApproval.id |
| filename | String | UUID 重命名的磁盘文件名 |
| originalName | String | 用户上传的原始文件名 |
| fileSize | Int | 字节数 |
| mimeType | String | 文件类型 |
| url | String | 访问路径 |

---

### 10. Transaction — 交易记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| taskId | String? | → Task.id |
| milestoneId | String? | → Milestone.id |
| type | String | DEPOSIT / PLATFORM_FEE / FREELANCER_PAYMENT / REFUND / TRANSFER_OUT / TRANSFER_IN |
| amount | Float | 金额 |
| payerId | String? | → User.id（付款方） |
| payeeId | String? | → User.id（收款方） |
| escrowBefore | Float? | 变化前托管金 |
| escrowAfter | Float? | 变化后托管金 |
| operatorId | String? | → User.id（操作人） |
| description | String? | 备注 |
| createdAt | DateTime | 时间戳 |

**交易类型**：
- `DEPOSIT` — 雇主创建任务时付款托管
- `PLATFORM_FEE` — 平台 5% 手续费
- `FREELANCER_PAYMENT` — 打款给自由职业者
- `REFUND` — 退款给雇主
- `TRANSFER_OUT` / `TRANSFER_IN` — 重新发布时薪酬转移

---

### 11. TaskStatusLog — 任务状态日志

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| taskId | String | → Task.id |
| fromStatus | String? | 旧状态（创建时为 null） |
| toStatus | String | 新状态 |
| event | String | 事件描述（"任务创建"/"通过申请"/"里程碑全部验收完成" 等） |
| operatorId | String? | → User.id（操作人） |
| createdAt | DateTime | 时间戳 |

---

## 表关系总览

```
User (1) ──< Task (N)             雇主发布任务
User (1) ──< Application (N)      自由职业者申请
Task (1) ──< Application (N)      任务收到的申请
Task (1) ──< Review (N)           任务关联的评价
Task (1) ──< Milestone (N)        任务的里程碑节点
Task (1) ──< Transaction (N)      任务的交易记录
Task (1) ──< TaskStatusLog (N)    任务的状态日志
Task (1) ──< Task (N)             parentTask → childTasks 重新发布链路

Milestone (1) ──< MilestoneApproval (N)  节点的审批记录
MilestoneApproval (1) ──< MilestoneAttachment (N)  审批的附件

Conversation (N) ── Task (1)?    对话可选关联任务
Conversation (1) ──< Message (N) 对话的消息
User (1) ──< Message (N)         用户发送的消息

User --< Review (reviewer)        用户给出的评价
User --< Review (reviewee)       用户收到的评价
```

### User 的多角色关系

```
User ── Transaction (payer)      付款方
User ── Transaction (payee)      收款方
User ── Transaction (operator)   操作人
User ── TaskStatusLog (operator) 状态变更操作人
User ── MilestoneApproval (submitter)  提交人
User ── MilestoneApproval (reviewer)   审批人
```

---

## 项目结构

### 页面路由 (`src/app/`)

| 路由 | 功能 |
|------|------|
| `/` | 首页落地页 |
| `/login` | 邮箱密码 + OAuth 登录 + 测试账号 |
| `/register` | 两步注册（邮箱密码角色 → 昵称头像）+ 角色追加 |
| `/reset-password` | 重置密码 |
| `/dashboard` | 角色感知控制台（雇主/自由职业者双视图） |
| `/dashboard/my-tasks` | 雇主我的任务列表 |
| `/tasks` | 任务搜索 + 筛选 + 排序 |
| `/tasks/[id]` | 任务详情 + 历史评价 |
| `/tasks/new` | 发布任务（含里程碑编辑器 + 付款弹窗） |
| `/messages` | 聊天页（对话列表 + 聊天窗口 + 3s 轮询） |
| `/profile` | 个人资料编辑 |
| `/admin/salary` | 管理员任务管理（搜索/分页/排序/日志） |
| `/api/auth/[...nextauth]` | Auth.js API |
| `/api/register` | 注册 API |
| `/api/reset-password` | 重置密码 API |
| `/api/upload` | 文件上传 |
| `/api/upload/milestone` | 里程碑附件上传 |
| `/api/download/milestone` | 里程碑附件下载（权限校验） |

### Server Actions (`src/actions/`)

| 文件 | 功能 |
|------|------|
| `task-actions.ts` | 任务 CRUD + 重新发布 + 薪酬转移 + 历史评价查询 |
| `application-actions.ts` | 申请管理（通过/拒绝+防重复+级联修复） |
| `dashboard-actions.ts` | 控制台数据（角色感知）+ 完成任务/取消/评价 |
| `message-actions.ts` | 对话/消息 CRUD + 未读/已读 |
| `milestone-actions.ts` | 里程碑提交验收 + 审批通过/驳回（事务+行级锁） |
| `admin-actions.ts` | 管理员任务查询（分页/搜索/排序）+ 完整日志 |

### UI 组件 (`src/components/`)

| 文件 | 功能 |
|------|------|
| `Nav.tsx` | 导航栏（任务列表/控制台/铃铛/任务管理(管理员)/头像菜单） |
| `AvatarMenu.tsx` | 头像下拉（主题/角色切换/退出） |
| `ChatWindow.tsx` | 聊天窗口（消息+审批卡片融入消息流） |
| `ConversationList.tsx` | 对话列表 |
| `InlineChat.tsx` | 内联聊天（验收提交+审批卡片+文件上传） |
| `TaskCard.tsx` | 任务卡片 |
| `TaskDetailSidebar.tsx` | 任务详情侧边栏（角色+状态感知按钮） |
| `MilestoneEditor.tsx` | 里程碑编辑器（增删行+拖拽排序+比例校验） |
| `MilestoneProgressBar.tsx` | 里程碑进度条（圆点+tooltip） |
| `MilestoneApprovalCard.tsx` | 审批卡片（通过/驳回/附件） |
| `FileDropZone.tsx` | 拖拽文件上传组件 |
| `PaymentModal.tsx` | 付款方式选择弹窗（微信/支付宝/Visa/PayPal/Monster） |
| `ReviewSection.tsx` | 双向评价展示+评价弹窗 |
| `SalaryLogModal.tsx` | 日志侧边栏（状态日志/交易日志） |
| `ConfirmModal.tsx` | 通用确认弹窗 |
| `FilterBar.tsx` | 任务筛选栏 |

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
  → 雇主审批通过 → 按比例打款(扣5%手续费) → 最后一个节点通过 → 任务完成
  → 雇主驳回 → 自由职业者重新提交
```

### 其他规则
- 只有 OPEN 状态任务可申请；一个任务只接受一个申请
- 雇主不能申请任何任务（包括自己发布的）
- 同邮箱可注册不同端（不可重复注册已有端）
- 创建任务后里程碑不可修改
- 同一任务同时只允许一个待审批里程碑
- 资金操作使用数据库事务 + 行级锁

---

## 项目作者

- **开发**: Claude Code + DeepSeek V4 Pro
- **最后更新**: 2026-05-25
