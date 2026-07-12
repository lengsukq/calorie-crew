# 后端质量规范

## 当前实现基线

* TypeScript 使用 `strict: true`，质量门禁是 `npm run lint`、`npm run typecheck`、`npm run build`。
* 输入边界使用 Zod；数据库访问使用 Drizzle 参数化表达式。
* 当前 API 路由仍直接调用 Drizzle 查询；这是首版现状。后续新增复杂业务应抽到 `src/lib/services/`，并逐步收敛现有路由。
* 当前没有业务测试套件，不能把“构建通过”当成数据库/鉴权行为已被集成验证。

## 当前代码示例

```typescript
const userId = await getSessionUserId();
if (!userId) return jsonError("未登录", 401);

const parsed = foodLogSchema.safeParse(await request.json());
if (!parsed.success) return jsonError("饮食记录格式不正确", 400);
```

## 禁止

* `any`、`@ts-ignore`、无必要的非空断言。
* 输出密码、哈希、JWT、数据库连接串、邀请码源值。
* 拼接 SQL 或省略 `userId` 过滤。
* 用 200 表示鉴权、校验或资源错误。
* 新增 `console.log` 调试代码。

## 质量检查

* `git diff --check`
* `npm run lint`
* `npm run typecheck`
* `npm run build`
* 检查迁移文件是否与 `src/lib/db/schema.ts` 一致。
* 检查 UI/API/Service/DB 的用户 ID 是否贯穿完整。

## 后续测试要求

新增行为后补充注册/登录、邀请码次数与审计、用户隔离、汇总重算的集成测试；引入 UI 测试后覆盖手机、平板、PC 三种视口。
