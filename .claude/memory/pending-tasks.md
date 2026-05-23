---
name: pending-tasks
description: 待办事项列表 - 尚未实现的功能和已知限制 (2026-05-23)
metadata:
  type: project
---

## 待办事项

### 高优先级

- **OAuth 密钥配置**: `.env` 中 `AUTH_GOOGLE_ID/SECRET`、`AUTH_GITHUB_ID/SECRET` 为空，需去 Google Cloud Console / GitHub Developer Settings 创建 OAuth 应用后填入。OAuth 代码已就绪，填密钥即用。

### 中优先级

- **密码重置**: 未实现。需要重置密码页面 + 邮件发送 (需配置 SMTP)。
- **WebSocket/SSE 实时聊天**: 目前 3 秒轮询，未上实时推送。适合后期迁移。

### 低优先级

- **部署上线**: 未部署，目前仅本地开发。
- **任务详情页工作模式**: "远程/线上" 栏位写死，需改为数据库字段或下拉选择。

### 已知限制

- 聊天 3 秒轮询对服务端有持续请求压力，但当前用户量下无问题
- 文件上传为本地存储 (`public/uploads/`)，部署需改用 S3/OSS
- 分页为前端做 offset（每次全量查库后前端切片），数据量大后需改为后端分页
