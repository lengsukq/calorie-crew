# 鉴权与邀请码规范

## 1. Scope / Trigger

涉及注册、登录、Cookie、用户隔离、管理员能力或邀请码时，必须遵守本规范。

## 2. Signatures

```typescript
hashPassword(password: string): Promise<string>
verifyPassword(password: string, passwordHash: string): Promise<boolean>
setSession(userId: string): Promise<void>
getSessionUserId(): Promise<string | null>
clearSession(): Promise<void>
```

API：

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`
* `GET /api/auth/me`
* `GET|POST /api/admin/invites`
* `GET /api/admin/invites/:id/usages`

## 3. Contracts

注册请求：

```json
{ "email": "user@example.com", "password": "至少 8 位", "inviteCode": "..." }
```

* 第一个用户必须匹配 `INITIAL_INVITE_CODE`，并写入 `role = admin`。
* 后续用户必须使用 `invite_codes` 中仍有次数且未过期的邀请码，并写入 `role = member`。
* `invite_usages` 必须记录 `invite_code_id`、`inviter_user_id`、`invited_user_id`、`used_at`。
* `SESSION_SECRET` 至少 32 个字符；会话存放于 HttpOnly、SameSite=Lax Cookie。
* 当前实现使用 JWT Cookie；`sessions` 表仅为后续服务端会话替换预留。

管理员创建邀请码请求：

```json
{ "maxUses": 10, "expiresAt": "2026-08-01T00:00:00.000Z" }
```

`expiresAt` 可省略或为 null，`maxUses` 范围为 1–1000。

## 4. Validation & Error Matrix

| 条件 | HTTP | 行为 |
|---|---:|---|
| 邮箱格式错误/密码少于 8 位 | 400 | 拒绝请求 |
| 第一个用户使用错误初始邀请码 | 403 | 不创建用户 |
| 后续用户使用初始邀请码 | 403 | 初始邀请码不会继续生效 |
| 邀请码不存在、用完或过期 | 403 | 不创建用户 |
| 邮箱已存在 | 409 | 不创建重复用户 |
| 未登录调用管理员 API | 403 | 拒绝请求 |
| member 调用管理员 API | 403 | 拒绝请求 |

## 5. Good / Base / Bad Cases

* Good：注册时规范化邮箱为小写，密码只保存 bcrypt hash。
* Base：第一个账号创建后，初始环境邀请码不再用于后续注册。
* Bad：把邀请码放进前端构建产物、日志或 API 响应之外的公开位置；邀请码只能由管理员显式分发。

## 6. Tests Required

* 第一个注册者角色为 `admin`。
* 第二个用户不能使用 `INITIAL_INVITE_CODE`，只能使用管理员生成的邀请码。
* 邀请码使用次数达到 `maxUses` 后注册失败。
* 邀请码过期后注册失败。
* `invite_usages` 能追溯邀请人、被邀请人和使用时间。
* member 无法读取或创建邀请码。
* 用户 A 的饮食记录不能被用户 B 读取或删除。

## 7. Wrong vs Correct

```typescript
// Wrong：只按记录 ID 查询，可能越权
eq(foodLogs.id, id)

// Correct：资源 ID 和会话用户同时约束
and(eq(foodLogs.id, id), eq(foodLogs.userId, userId))
```

> **Warning**：执行 `npm run db:push` 会修改真实数据库；提交前先确认 `.env.local` 指向正确环境，仓库只提交 `.env.local.example`。
