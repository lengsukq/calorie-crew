# 数据库规范

> 当前实现：Neon PostgreSQL + Drizzle ORM/Drizzle Kit。

## 1. Scope / Trigger

所有新增或修改表、汇总逻辑、用户隔离逻辑和迁移文件时，必须同步检查本规范。

## 2. 当前 Schema 与签名

Schema 定义位于 `src/lib/db/schema.ts`，客户端位于 `src/lib/db/client.ts`。

当前表：

* `users`：`id`、`email`、`password_hash`、`role`、`calorie_target`、`created_at`。
* `sessions`：当前 schema 已预留，但 JWT Cookie 会话暂未写入该表。
* `invite_codes`：邀请码、创建者、最大使用次数、已使用次数、过期时间。
* `invite_usages`：邀请码、邀请人、被邀请人、使用时间的审计记录。
* `food_logs`：饮食事实数据；`meal_type` 为 `breakfast | lunch | dinner | snack`。
* `daily_summaries`：按用户和日期唯一的可重算汇总。

核心 Service：

```typescript
recalculateDailySummary(userId: string, logDate: string): Promise<void>
```

## 3. Contracts

* `DATABASE_URL` 是必需环境变量，连接串只能通过环境变量注入。
* `food_logs` 是事实来源；写入或删除后调用 `recalculateDailySummary()`。
* `food_logs` 编辑后必须调用 `recalculateDailySummary()`；如果 `logDate` 变更，旧日期和新日期都要重算。
* `daily_summaries` 使用 `(user_id, log_date)` 唯一约束和 upsert，不使用 delete-then-insert。
* 所有涉及用户数据的查询必须同时限制 `userId`，不能只按资源 ID 查询。
* 迁移位于 `src/lib/db/migrations/`，由 `npm run db:generate` 生成、`npm run db:push` 执行。
* 本地业务日期统一使用 `src/lib/date.ts` 校验和生成，避免用 UTC `toISOString().slice(0, 10)` 生成用户可见日期。
* 批量新增接口仅接受同一天的记录；跨日期 batch 返回 HTTP 400，避免部分日期汇总未重算。

## 4. Validation & Error Matrix

| 条件 | 行为 |
|---|---|
| 缺少 `DATABASE_URL` | 运行时环境校验失败 |
| 未登录访问用户数据 | 返回 HTTP 401，`{ "error": "未登录" }` |
| 用户访问他人记录 | 查询条件不匹配，返回 404 |
| 日期、餐次或营养值格式错误 | Zod 校验失败，返回 HTTP 400 |
| 批量新增包含多个日期 | 返回 HTTP 400，`{ "error": "一次批量添加只能包含同一天的记录" }` |
| 汇总不存在 | Dashboard 返回 `summary: null`，不伪造数据库记录 |

## 5. Good / Base / Bad Cases

* Good：`foodLogs` 写入后调用 `recalculateDailySummary(userId, logDate)`。
* Good：`foodLogs` 更新时先按 `id + userId` 读取旧记录，更新后按旧日期和必要的新日期重算汇总。
* Base：没有饮食记录时返回空 logs 和 `summary: null`，由 UI 展示空状态。
* Bad：把 `daily_summaries.total_kcal` 当成唯一事实，或查询 `food_logs` 时省略 `user_id`。

## 6. Tests Required

* 迁移检查：表、外键、唯一约束和默认值存在。
* Service 集成测试：新增/删除记录后汇总正确，重复重算结果相同。
* 隔离测试：用户 A 不能读取、删除用户 B 的记录。
* 邀请审计测试：邀请码次数递增，`invite_usages` 保存邀请人、被邀请人和时间。

## 7. Wrong vs Correct

```typescript
// Wrong：可能跨用户访问
db.query.foodLogs.findFirst({ where: eq(foodLogs.id, id) });

// Correct：资源 ID 和当前用户同时约束
db.query.foodLogs.findFirst({
  where: and(eq(foodLogs.id, id), eq(foodLogs.userId, userId)),
});
```

## 迁移注意事项

当前首个迁移文件为 `0000_skinny_microbe.sql`。它是一次性生成的 SQL，当前项目尚未提供自动 down migration；执行前必须检查目标数据库和环境变量。
