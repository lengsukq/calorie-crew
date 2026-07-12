# 错误处理

## 当前实现

API 使用 `src/lib/http.ts` 的 `jsonError()` 返回扁平错误：

```typescript
{ error: string }
```

路由通常先做鉴权，再做 Zod `safeParse`，失败时直接返回合适的 HTTP 状态码。当前没有全局 AppError 处理器。

## 当前错误矩阵

| 场景 | HTTP | 响应示例 |
|---|---:|---|
| 未登录 | 401 | `{ "error": "未登录" }` |
| 无管理员权限 | 403 | `{ "error": "无管理员权限" }` |
| 输入校验失败 | 400 | `{ "error": "饮食记录格式不正确" }` |
| 邮箱已注册 | 409 | `{ "error": "该邮箱已注册" }` |
| 邀请码无效/用完/过期 | 403 | `{ "error": "邀请码无效、已用完或已过期" }` |
| 资源不存在 | 404 | `{ "error": "饮食记录不存在" }` |

## 路由模式

```typescript
const userId = await getSessionUserId();
if (!userId) return jsonError("未登录", 401);

const parsed = foodLogSchema.safeParse(await request.json());
if (!parsed.success) return jsonError("饮食记录格式不正确", 400);
```

## 约定

* 不把密码、密码哈希、Session Token、数据库连接串写入响应或日志。
* 4xx 使用明确状态码，不用 200 表示失败。
* 新增错误先复用 `jsonError()`，若未来引入错误码对象，必须同步更新所有 API 和前端调用方。
* 不使用空的 `catch`；当前会话 JWT 校验失败时按未登录处理，不暴露验证细节。
