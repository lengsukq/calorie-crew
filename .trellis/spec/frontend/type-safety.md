# 类型安全

## 当前约定

* TypeScript 使用 `strict: true`。
* API 输入使用 Zod：`registerSchema`、`loginSchema`、`foodLogSchema`。
* 餐次类型从 `src/lib/db/schema.ts` 的 `mealTypes` 常量派生：`breakfast | lunch | dinner | snack`。
* 数据库类型由 Drizzle schema 推导，API 返回值在客户端使用局部 interface 描述。

## 校验边界

```typescript
const parsed = foodLogSchema.safeParse(await request.json());
if (!parsed.success) return jsonError("饮食记录格式不正确", 400);
```

所有来自请求体、URL、Cookie 和数据库的外部数据都必须在边界处校验；不能把未经校验的值直接交给 Service 或 SQL 查询。

## 当前改进点

`Dashboard.tsx` 为了读取 JSON 使用了局部类型断言式转换。新增 API 时应优先将响应类型放入共享类型文件，再逐步消除组件内重复类型。

## 禁止

* `any`、`@ts-ignore`、非必要的非空断言。
* 把 AI 或用户输入当作可信结构直接使用。
* 让前端自行推导权限；管理员权限必须由服务端会话和数据库 `role` 判断。
