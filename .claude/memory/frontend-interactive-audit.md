---
name: frontend-interactive-audit
description: 全页面控件审计结果 - 所有 input 为真实控件，button 皆有 onClick (2026-05-23)
metadata:
  type: project
---

## 全页面交互控件审计

已于 2026-05-23 完成所有 11 个页面的控件审计。

### 审计标准
- 输入框: 必须为真实 `<input>` 或 `<textarea>`，非装饰性 div
- 按钮: 必须有 `onClick` 处理器 (mock 允许)，不可为静态 span
- 筛选/切换: 必须有功能行为

### 各页面状态

| 页面 | 输入控件 | 按钮/交互 | 状态 |
|------|----------|-----------|------|
| `/` | 无 | 我要雇佣/找工作 → login+role | ✅ |
| `/login` | 无 | 角色选择 + 进入平台 → /dashboard | ✅ |
| `/register` | 无 | 角色选择 + 注册 → /dashboard | ✅ |
| `/dashboard` (雇主) | 评价弹窗 input | 统计卡片可点击、Tab 可导航、搜索+筛选 | ✅ |
| `/dashboard` (自由职业者) | 无 | 统计卡片可点击、联系雇主 → /messages?with= | ✅ |
| `/dashboard/my-tasks` | 无 | 返回按钮、查看申请 → /applications/[id] | ✅ |
| `/tasks` | 搜索 input (真实) | 搜索按钮、筛选栏下拉、单列/双列切换 | ✅ |
| `/tasks/[id]` | 无 | 返回链接、立即申请 → /messages | ✅ |
| `/tasks/new` | 9 个 input/textarea (全真实) | 发布按钮 | ✅ |
| `/messages` | 聊天 input (真实) | 对话列表可切换、发送按钮、?with= 参数定位 | ✅ |
| `/applications/[id]` | 无 | 筛选 全部/待审核/已通过、通过/拒绝按钮 | ✅ |

### WorkerList 内联聊天

雇主端「进行中任务」点击铃铛不跳转 `/messages`，而是在当前卡片下方展开内联聊天窗口：
- 聊天头部显示: 通过时间 + 截止时间
- 消息列表 + 输入框 + 发送按钮
- 铃铛蓝色高亮表示聊天窗口已展开
