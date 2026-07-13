# 后端质量规范

## 当前实现基线

* TypeScript 使用 `strict: true`，质量门禁是 `npm run lint`、`npm run typecheck`、`npm run build`。
* 输入边界使用 Zod；数据库访问使用 Drizzle 参数化表达式。
* API 路由不直接调用 `db`：鉴权、入参解析走 `src/lib/api-route.ts`（`requireSessionUserId` / `parseJsonBody` / `parseDateRangeSearchParams` / `withRouteError`），业务逻辑走 `src/lib/services/`。food/weight/exercise/water/sleep/body 路由均已收敛到此模式。
* health logs（water/sleep/body）的 service 文件按资源拆分：`water-log.service.ts`、`sleep-log.service.ts`、`body-measurement.service.ts`，不再塞进 `food-log.service.ts`。
* 当前业务测试覆盖纯函数（duplicate key、history stats、mapper、constants）；DB/鉴权行为仍需集成测试补充。

## 当前代码示例

```typescript
const userIdOrError = await requireSessionUserId();
if (userIdOrError instanceof Response) return userIdOrError;

const parsed = foodLogSchema.safeParse(await parseJsonBody(request));
if (!parsed.success) return jsonError("饮食记录格式不正确", 400);

return withRouteError(async () => {
  const log = await createFoodLog(userIdOrError, parsed.data);
  return Response.json({ log }, { status: 201 });
}, "保存饮食记录失败");
```

## 禁止

* `any`、`@ts-ignore`、无必要的非空断言。
* 输出密码、哈希、JWT、数据库连接串、邀请码源值。
* 拼接 SQL 或省略 `userId` 过滤。
* 用 200 表示鉴权、校验或资源错误。
* 新增 `console.log` 调试代码（`withRouteError` 内部的 `console.error` 是允许的服务端错误记录例外，仅记 error name/message，不记堆栈与机密）。
* API 路由直接调用 `db.*`：新增路由必须走 service；重构旧路由时同步迁移。
* 批量按 ID 查询/删除使用多个 `eq(id)` 经 `and` 组合（语义错误），必须使用 `inArray`。
* service 文件名与职责不符（例如把 water/sleep/body 塞进 `food-log.service.ts`）。

## 质量检查

* `git diff --check`
* `npm run lint`
* `npm run typecheck`
* `npm run build`
* 检查迁移文件是否与 `src/lib/db/schema.ts` 一致。
* 检查 UI/API/Service/DB 的用户 ID 是否贯穿完整。

## 后续测试要求

新增行为后补充注册/登录、邀请码次数与审计、用户隔离、汇总重算的集成测试；引入 UI 测试后覆盖手机、平板、PC 三种视口。
