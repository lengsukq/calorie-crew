# 后端开发规范

> 后端开发的最佳实践。

---

## 概览

后端使用 Next.js App Router API Routes + PostgreSQL (Neon)。代码遵循 Clean Code 原则：函数短小、单一职责、显式依赖。

---

## 开发前检查清单

在开始编码前，先确认以下事项：

- [ ] 新增的表是否有对应的 index
- [ ] 汇总/快照操作是否使用 upsert 而不是 delete-then-insert
- [ ] 是否需要在 `recalculateDailySummary` 中增加新的聚合逻辑
- [ ] 新增的 API 端点是否遵循了统一的错误响应格式
- [ ] AI 相关功能是否检查了 rate limit
- [ ] Cron 任务是否校验了 `CRON_SECRET`
- [ ] 是否需要在 meal-recognition-snapshot.md 中记录新的表/流程

---

## 规范索引

| 文档 | 说明 | 状态 |
|------|------|------|
| [目录结构](./directory-structure.md) | 模块组织和文件布局 | 已完成 |
| [数据库规范](./database-guidelines.md) | ORM 模式、查询、迁移 | 已完成 |
| [错误处理](./error-handling.md) | 错误类型、处理策略 | 已完成 |
| [质量规范](./quality-guidelines.md) | 代码标准、禁止模式 | 已完成 |
| [日志规范](./logging-guidelines.md) | 结构化日志、日志级别 | 已完成 |
| [餐次识别 & 快照架构](./meal-recognition-snapshot.md) | 拍照识别 + 每日快照系统 | 已完成 |
| [鉴权与邀请码](./auth-guidelines.md) | 登录、首个管理员、邀请码审计 | 已完成 |

---

## 语言

说明文档使用**中文**。代码中的标识符（函数名、变量名、类型名）使用**英文**。
