---
name: frontend-interactive-audit
description: 全页面控件审计 + 后端功能集成状态 (2026-05-23 最终版)
metadata:
  type: project
---

## 全页面功能状态

已全部接入后端数据库，所有交互功能均可用。

| 页面 | 数据库接入 | 交互控件 | 状态 |
|------|-----------|----------|------|
| `/` | 静态 | 我要雇佣/找工作 → login+role | ✅ |
| `/login` | Auth.js signIn | 邮箱密码登录 + 角色选择 + 测试账号快捷填充 | ✅ |
| `/register` | API /register | 昵称/邮箱/密码 + 角色选择 → 自动登录 | ✅ |
| `/dashboard` (雇主) | getDashboardData() | 统计卡片/进行中列表/完成任务/结束任务(取消)/重新发布/评价弹窗(星级) | ✅ |
| `/dashboard` (自由职业者) | getDashboardData() | 统计卡片/进行中(联系雇主)/已完成(评价星级)/待处理申请 | ✅ |
| `/dashboard/my-tasks` | getEmployerTasks() | 任务列表/查看申请/发布新任务 | ✅ |
| `/tasks` | getTasks() | 搜索+实时筛选/单双列切换/任务卡片点击 | ✅ |
| `/tasks/[id]` | getTaskById() | 智能返回(来源感知)/状态按钮(角色+状态感知) | ✅ |
| `/tasks/new` | createTask() | 9 字段完整表单/重新发布自动填表 | ✅ |
| `/messages` | getConversations/getMessages/sendMessage | 对话列表/聊天窗口/3s轮询/未读检测/自动创建对话 | ✅ |
| `/applications/[id]` | getApplications/getTaskById | 筛选/通过/拒绝按钮 | ✅ |

### 全局功能
- ✅ 深色模式: CSS 变量方案, 浅色/深色/跟随系统
- ✅ 角色切换: 双端 pill 按钮, 单端灰色禁用
- ✅ 未读消息红点: Nav 铃铛 10s 轮询检测
- ✅ 头像菜单: 悬停+点击外部关闭
