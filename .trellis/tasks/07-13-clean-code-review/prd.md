# Clean Code 审查与规范对齐修复

## Goal

对 calorie-crew 项目进行全量 Clean Code 审查，识别不符合 `.trellis/spec/` 规范的问题，并按优先级系统修复，使项目达到规范基线要求。

## What I already know

* 项目是 Next.js App Router + React 19 + TypeScript + Tailwind CSS
* 后端规范：`.trellis/spec/backend/`，要求 API 路由不直接调用 db、统一错误兜底、输入边界用 Zod、批量查询用 `inArray`
* 前端规范：`.trellis/spec/frontend/`，要求 Hook 统一签名 `{ data, loading, error, reload }`、Props 用显式 interface、组件 named export
* 共享规范：`.trellis/spec/guides/`，要求函数短小、单一职责、显式依赖、避免重复代码
* 已完成三路并行审查（后端、前端、共享层），共发现 5 类高严重度、15 类中严重度、若干低严重度问题
* 项目现有 188 个 TS/TSX 文件，33 个 API 路由，14 个 service 文件
* 现有规范执行度较高：无 `any`、`@ts-ignore`、`console.log`；批量查询使用 `inArray`；用户数据都带 `userId` 过滤

## Assumptions (temporary)

* 修复按优先级分 Phase 推进，每个 Phase 保持功能不变
* 不改变现有 API 契约（除非发现 bug）
* 不新增业务功能，只做规范对齐
* 每个 Phase 完成后跑质量门禁，确保可独立合入
* 组件调用方在 H4/H5 修复时同步调整，避免编译失败

## Open Questions

* [已解决] 用户要求"给出完整计划和详情到 PRD"——已补充完整实现细节

## Requirements

### Phase 1：高严重度问题修复（必须）

#### 1.1 API 路由直接调用 db 问题（H1）

**问题根因**：部分历史路由未按规范下沉到 service 层，导致路由层职责过重、难以测试、违反单一职责。

**改造原则**：每个路由最终形态统一为“鉴权 → 解析 → 调 service → `withRouteError` 包装 → `Response.json`”。

**新建 service 文件**：

| 文件 | 职责 |
|---|---|
| `src/lib/services/auth.service.ts` | 登录校验、注册用户、邀请码校验与使用记录、获取当前用户信息 |
| `src/lib/services/dashboard.service.ts` | 今日汇总查询、历史汇总查询 |
| `src/lib/services/invite.service.ts` | 邀请码列表/创建/使用审计 |
| `src/lib/services/user-ai-config.service.ts` | 用户 AI 配置 upsert/查询 |

**改造文件映射**：

| 路由 | 改造动作 | 调用 service |
|---|---|---|
| `src/app/api/auth/login/route.ts` | 把 `db.query.users.findFirst` 登录校验下沉 | `auth.service.ts:validateLogin` |
| `src/app/api/auth/register/route.ts` | 把查重、邀请码校验、用户插入、邀请码使用记录全部下沉 | `auth.service.ts:registerUser` |
| `src/app/api/auth/me/route.ts` | 把 `db.query.users.findFirst` 下沉 | `auth.service.ts:getCurrentUser` |
| `src/app/api/dashboard/today/route.ts` | 把并行查询 `dailySummaries`/`foodLogs` 下沉 | `dashboard.service.ts:getTodayDashboard` |
| `src/app/api/dashboard/history/route.ts` | 把 `dailySummaries` 查询下沉 | `dashboard.service.ts:getHistoryDashboard` |
| `src/app/api/admin/invites/route.ts` | 把列表/创建 db 操作下沉 | `invite.service.ts` |
| `src/app/api/admin/invites/[id]/usages/route.ts` | 把审计查询 + N+1 修复一起下沉 | `invite.service.ts` |
| `src/app/api/users/target/route.ts` | 把 `db.update(users)` 下沉 | 视现有 service 位置决定，优先复用或新建最小 service |
| `src/app/api/ai/config/route.ts` | 把 upsert 全部下沉 | `user-ai-config.service.ts` |
| `src/app/api/ai/recognize/route.ts` | 把 `userAiConfigs` 查询下沉 | `user-ai-config.service.ts` |

**质量门禁**：
- [ ] 每个改造后路由不包含 `db.query`/`db.insert`/`db.update`/`db.delete`
- [ ] 所有 service 函数保持单一职责，单个函数不超过 40 行
- [ ] 注册等复杂逻辑保留在 service，不泄露到路由

#### 1.2 AI/profile 路由统一错误处理（H2）

**改造模式**：

```typescript
// Before
try {
  // ...
} catch {
  return jsonError("xxx", 400);
}

// After
return withRouteError(async () => {
  // ...
}, "xxx");
```

**改造文件清单**：

| 文件 | 改造点 |
|---|---|
| `src/app/api/profile/route.ts` | 裸 `try/catch` → `withRouteError` |
| `src/app/api/ai/advice/route.ts` | 同上 |
| `src/app/api/ai/advice/[id]/route.ts` | 同上 |
| `src/app/api/ai/advice/[id]/feedback/route.ts` | 同上 |
| `src/app/api/ai/advice/[id]/dismiss/route.ts` | 同上 |
| `src/app/api/ai/advice/[id]/complete/route.ts` | 同上 |
| `src/app/api/ai/advice/[id]/reactivate/route.ts` | 同上 |
| `src/app/api/ai/advice/history/route.ts` | 同上 |
| `src/app/api/ai/advice/generate/route.ts` | 同上 |

**质量门禁**：
- [ ] 9 个路由不再有裸 `try/catch` 吞错
- [ ] 错误信息可诊断（包含操作名称）
- [ ] 服务端错误通过 `withRouteError` 内部 `console.error` 记录

#### 1.3 batch targetDate 日期校验（H3）

**改造点**：

```typescript
// Before
targetDate: z.string().optional(),

// After
targetDate: localDateStringSchema.optional(),
```

**文件**：`src/app/api/food-logs/batch/route.ts`

**质量门禁**：
- [ ] `"not-a-date"` 等非法日期返回 400
- [ ] `copy` 模式下合法日期仍正常工作

#### 1.4 Hook 签名统一（H4）

**改造模式**：数据请求型 Hook 统一返回 `{ data, loading, error, reload }`，`data` 为统一字段名。

**改造文件清单**：

| 文件 | 改造点 |
|---|---|
| `src/hooks/useAiAdviceHistory.ts` | `advices` → `data`；`setAdvices` → `setData` |
| `src/hooks/useUserTarget.ts` | 检查并统一签名 |
| 所有引用 `advices` 的组件 | 同步改为 `data` |

**依赖调整**：
- `useAiAdviceHistory` 返回 `data: AiAdviceData[]`
- 调用方（如 `AdviceHistoryPanel`、`AiAdviceCard` 等）同步调整解构字段
- 保留 `reactivate` 等动作方法作为附加字段

**质量门禁**：
- [ ] 所有数据请求型 Hook 返回 `{ data, loading, error, reload }`
- [ ] 所有引用方编译通过

#### 1.5 组件绕 Hook 直调 API（H5）

**改造模式**：组件不直接 `import { fetchXxx } from "@/lib/api/xxx"`，改为走 Hook。

**改造文件清单**：

| 文件 | 改造点 |
|---|---|
| `src/components/today/TodayContent.tsx` | 直调 API client → 改为 `useSummary`/`useFoodLogs` |
| `src/components/diary/DiaryContent.tsx` | 同上 |

**原则**：如果组件需要的数据/操作没有对应 Hook，先补 Hook 再改组件。

**质量门禁**：
- [ ] 组件不再直调 `src/lib/api/*`
- [ ] UI 行为与改造前一致

### Phase 2：中严重度问题修复（应该）

#### 2.1 类型安全改进

**2.1.1 `as unknown as` 双重断言重构（M1）**

- 文件：`src/lib/services/food-recognize.service.ts`
- 改造：外部 JSON 先 `as unknown as { foods?: unknown[] }`，再对每个元素 `sanitizeFood`
- 目标：类型流从“未知”流向“已校验”，避免反向断言

**2.1.2 抽共享 LLM 响应解析（M2）**

- 新建：`src/lib/services/llm-parse.ts` 或 `src/lib/parsers/llm-json.ts`
- 抽取：`parseLlmChoiceContent(json: unknown): string | null`
- 改造：`ai-advice.service.ts` 的 `requestAiAdvice` 改用共享解析器
- 复用：`food-recognize.service.ts` 也可复用相同结构

**2.1.3 抽共享 `extractJson`（M3）**

- 新建：`src/lib/utils/json.ts`
- 抽取 `extractJson` 纯函数
- 改造：`advice-safety.ts` 和 `food-recognize.service.ts` 改为 import

**质量门禁**：
- [ ] 无 `as unknown as` 绕过类型
- [ ] 外部 LLM 响应有显式结构 narrowing
- [ ] `extractJson` 单一实现源

#### 2.2 性能与重复代码

**2.2.1 N+1 改 inArray（M4）**

- 文件：`src/app/api/admin/invites/[id]/usages/route.ts`
- 改造：`Promise.all(usages.map(...))` → `inArray(users.id, invitedUserIds)` 一次查询

**2.2.2 抽 `requireAdminUserId`（M5）**

- 新建：`src/lib/api-route.ts` 增加 `requireAdminUserId(): Promise<string | Response>`
- 改造：两个 admin 路由统一调用

**2.2.3 部分更新映射工具（M6/M7）**

- 新建：`src/lib/utils/partial-update.ts`
- 抽取 `buildPartialUpdate<T>` 工具，统一处理 `undefined` 过滤
- 改造：`profile.service.ts` 和 `food-log.service.ts` 复用

**2.2.4 reactivateAdvice 用 .returning()（L9）**

- 文件：`src/lib/services/ai-advice.service.ts`
- 改造：先 `update().returning()` 拿回更新后行，省一次 `findFirst`

**质量门禁**：
- [ ] 批量查询使用 `inArray`
- [ ] admin 校验逻辑单一实现
- [ ] 部分更新映射无重复代码

#### 2.3 错误处理一致性

**2.3.1 requestAiAdvice 不再静默吞错（H6）**

- 文件：`src/lib/services/ai-advice.service.ts`
- 改造：区分配置缺失、网络失败、解析失败，至少记日志
- 调用方可据此做重试或告警

**质量门禁**：
- [ ] 不把“请求失败”和“AI 返回空内容”混为 `null`
- [ ] 错误可诊断

### Phase 3：低严重度与清理（可以）

#### 3.1 死代码清理

| 文件 | 动作 |
|---|---|
| `src/lib/services/food-log.service.ts` | 移除未使用的 `buildFoodDuplicateKey` re-export |
| `src/lib/services/profile.service.ts` | 移除或补测试说明 `getProfilePreferences` 用途 |
| `src/lib/ui/undo-toast.ts` | 移除死代码 `deleteWithUndo` |

#### 3.2 类型精确化

| 文件 | 动作 |
|---|---|
| `src/lib/services/food-log.service.ts` | `copyFoodLogsToDate` 去掉冗余 `| string` |
| `src/lib/services/food-log.duplicate-key.ts` | 统一 `string | number` 转换，避免类型不确定性传染 |

#### 3.3 其他规范对齐

| 文件 | 动作 |
|---|---|
| `src/lib/rate-limit.ts` | 补充 serverless 限制说明或迁移到 Redis |
| `src/middleware.ts` + `src/lib/auth/session.ts` | 抽共享 JWT 核心逻辑到 `src/lib/auth/jwt-core.ts` |
| `src/lib/env.ts` | build 占位密钥加显式前缀防误部署 |
| `src/app/api/ai/config/route.ts` | 改用 `parseJsonBody` + `z.string().url().nullable().optional()` |
| `src/app/api/users/target/route.ts` | 改用 `parseJsonBody` + `withRouteError` |
| `src/lib/services/daily-summary.service.ts` | `user` 不存在时不写汇总，避免伪造 |

## Implementation Order

```
Phase 1.3 (H3)
  ↓
Phase 1.2 (H2)
  ↓
Phase 1.4 + 1.5 (H4 + H5)
  ↓
Phase 1.1 (H1)
  ↓
Phase 2
  ↓
Phase 3
```

**理由**：
1. H3 是 1 行改动，风险最低，立即堵输入边界
2. H2 是纯机械替换，风险低，统一错误处理
3. H4/H5 改动影响前端调用方，需要在组件层同步验证
4. H1 改动最大（10 个路由 + 4 个新 service），放在前面是因为它影响后续 H2 的落地位置
5. Phase 2/3 按剩余风险逐个推进

## Rollback Plan

* 每个 Phase 独立 commit，便于 revert
* 改动前确保有清晰的 diff
* 路由层改动保留原有逻辑，只调整分层，不做行为变更
* Hook 签名改动时保留兼容层（如 `get data() { return this.advices }`）作为过渡

## Acceptance Criteria

### 全局

* [ ] `npm run lint` 通过
* [ ] `npm run typecheck` 通过
* [ ] `npm run build` 通过
* [ ] `npm run test` 通过
* [ ] `git diff --check` 无空白错误

### Phase 1

* [ ] H1：10 个 API 路由不包含 `db.query`/`db.insert`/`db.update`/`db.delete`
* [ ] H2：9 个 AI/profile 路由无裸 `try/catch` 吞错
* [ ] H3：`food-logs/batch` 非法日期返回 400
* [ ] H4：所有数据请求型 Hook 返回 `{ data, loading, error, reload }`
* [ ] H5：`TodayContent`/`DiaryContent` 不再直调 `src/lib/api/*`

### Phase 2

* [ ] 无 `as unknown as` 绕过类型
* [ ] 外部 LLM 响应有显式结构 narrowing
* [ ] `extractJson` 单一实现源
* [ ] 批量查询使用 `inArray`
* [ ] admin 校验逻辑单一实现
* [ ] `requestAiAdvice` 区分错误类型

### Phase 3

* [ ] 死代码已清理
* [ ] 类型冗余已去除
* [ ] 其他规范对齐项已落地

## Definition of Done

* 代码修改后通过上述质量门禁
* PRD 中每个问题都有对应修复 commit
* 如有规范更新，同步到 `.trellis/spec/`
* 提交前运行 `git diff --check` 确保无空白错误

## Out of Scope (explicit)

* 不新增业务功能
* 不改变现有 API 响应格式（除非发现 bug）
* 不配置 E2E 测试（Playwright 未配置，属于已知债务）
* 不重构 UI 样式（Y2K 玻璃质感设计体系保持不变）
* 不修改数据库 schema
* 不调整路由 URL 路径

## Technical Notes

* 审查基于 `.trellis/spec/backend/quality-guidelines.md`、`.trellis/spec/frontend/quality-guidelines.md`、`.trellis/spec/guides/cross-layer-thinking-guide.md`
* 三路并行审查覆盖 188 个 TS/TSX 文件，后端 33 路由 + 14 service，前端 components/hooks/app，共享层 api/mappers/constants/stats/types/utils
* 核心债务集中在：错误处理不统一、API 路由直接调 db、Hook 签名不一致、部分重复代码/死代码
* 现有代码已有良好基础：无 `any`/`@ts-ignore`/`console.log`，批量查询使用 `inArray`，用户数据都带 `userId` 过滤
* 修复过程中注意保持向后兼容，特别是 Hook 签名变更时
