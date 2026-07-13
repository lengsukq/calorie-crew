# 体重追踪与运动消耗记录

## Goal

在现有 CalorieCrew 饮食记录基础上，扩展**体重追踪**与**运动消耗记录**两个核心模块，形成“摄入 — 消耗 — 结果反馈”的完整热量管理闭环，提升用户对饮食与健康数据的掌控力。

## User Stories

| ID | 角色 | 需求 |
|----|------|------|
| US-01 | 普通用户 | 我可以在今日页面记录每日体重，并看到体重变化趋势。 |
| US-02 | 普通用户 | 我可以在今日页面记录运动消耗，系统将运动热量纳入今日剩余热量计算。 |
| US-03 | 普通用户 | 我可以在日记页面按日期查看历史体重与运动记录。 |
| US-04 | 普通用户 | 我可以在进度页面查看体重趋势图表与运动统计。 |
| US-05 | 普通用户 | 我可以在个人资料设置体重目标，系统在进度页面给出对比反馈。 |

## Scope

### Included

- 新增 `weight_logs` 表，支持按用户+日期唯一约束的体重记录。
- 新增 `exercise_logs` 表，支持运动类型、时长、消耗热量记录。
- 扩展 `daily_summaries` 聚合逻辑，将运动消耗纳入 `remainingKcal` 计算：
  - `netKcal = totalIntakeKcal - totalExerciseKcal`
  - `remainingKcal = targetKcal - netKcal`
- 前端页面扩展：
  - **Today**：新增体重卡片、运动卡片，支持快速录入。
  - **Diary**：新增体重与运动记录列表，支持删除。
  - **Progress**：新增体重趋势线图、运动周统计。
  - **Profile**：新增体重目标设置。
- API 端点：
  - `GET/POST /api/weight-logs`
  - `GET/POST/DELETE /api/weight-logs/[id]`
  - `GET/POST /api/exercise-logs`
  - `GET/POST/DELETE /api/exercise-logs/[id]`

### Explicitly Out of Scope

- 运动类型自定义库（首版使用固定枚举 + 自由文本）。
- 运动自动同步（如 Apple Health / Google Fit）。
- 体重与运动数据的社交对比或排行榜。
- 卡路里盈亏的医学建议或自动饮食调整。

## Data Model

### 新增表：weight_logs

```typescript
export const weightLogs = pgTable(
  "weight_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    weightKg: numeric("weight_kg", { precision: 6, scale: 2 }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("weight_logs_user_date_unique").on(table.userId, table.logDate),
  ],
);
```

**设计理由**：
- 同一用户同一天仅允许一条体重记录，使用 `(user_id, log_date)` 唯一约束，后续写入自动覆盖。
- `weightKg` 使用 `numeric(6,2)` 保留两位小数精度。
- `note` 为可选备注，允许用户记录身体感受或特殊情况。

### 新增表：exercise_logs

```typescript
export const exerciseLogs = pgTable(
  "exercise_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    exerciseType: text("exercise_type").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    caloriesBurned: integer("calories_burned").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("exercise_logs_user_date_id_unique").on(table.userId, table.logDate, table.id),
  ],
);
```

**设计理由**：
- 允许同一天多条运动记录，满足分段训练场景。
- `exerciseType` 首版使用文本存储，常见类型通过前端下拉框提供建议，保留自由输入能力。
- `durationMinutes` 与 `caloriesBurned` 均为必填，后端不自动换算，依赖用户或第三方工具输入。

### 扩展表：daily_summaries

在现有字段基础上，新增：

```typescript
totalExerciseKcal: integer("total_exercise_kcal").notNull().default(0),
netKcal: integer("net_kcal").notNull().default(0),
```

**业务公式**：
```
totalExerciseKcal = SUM(exercise_logs.calories_burned)
totalIntakeKcal   = SUM(food_logs.calories)
netKcal           = totalIntakeKcal - totalExerciseKcal
remainingKcal     = targetKcal - netKcal
```

当 `netKcal > targetKcal` 时，`remainingKcal` 可为负数，表示热量盈余；负数在 UI 中展示为“已超出”。

### 扩展表：users

新增：

```typescript
weightTargetKg: numeric("weight_target_kg", { precision: 6, scale: 2 }),
```

默认值为 `null`，表示未设置目标。

## Business Rules

1. **体重记录去重**：同一用户同一天只能有一条 `weight_logs` 记录；API 使用 `upsert` 策略，后提交覆盖先提交。
2. **运动消耗影响剩余热量**：每次新增/删除运动记录后，必须重算 `daily_summaries` 中的 `totalExerciseKcal`、`netKcal` 和 `remainingKcal`。
3. **用户隔离**：所有查询必须同时限制 `userId`，禁止跨用户访问。
4. **数据精度**：体重保留两位小数；热量使用整数 `kcal`。
5. **删除权限**：用户只能删除自己当天的体重/运动记录；删除后需重算当日汇总。
6. **空状态处理**：当日无体重/运动记录时，API 返回空数组，UI 展示占位提示。
7. **权重优先级**：`daily_summaries` 不再以 `food_logs` 为唯一数据源，而是聚合 `food_logs` 与 `exercise_logs`；但饮食摄入仍是 `totalIntakeKcal` 的唯一来源。

## API Design

### Weight Logs

| Method | Path | 描述 | Auth |
|--------|------|------|------|
| GET | `/api/weight-logs?startDate=&endDate=` | 按日期范围查询体重记录 | 必填 |
| POST | `/api/weight-logs` | 新增或覆盖当日体重 | 必填 |
| DELETE | `/api/weight-logs/[id]` | 删除体重记录 | 必填 |

**请求体 (POST)**：
```json
{
  "logDate": "2026-07-13",
  "weightKg": "70.50",
  "note": "晨起空腹"
}
```

**响应**：
```json
{
  "id": "uuid",
  "logDate": "2026-07-13",
  "weightKg": "70.50",
  "note": "晨起空腹",
  "createdAt": "2026-07-13T...",
  "updatedAt": "2026-07-13T..."
}
```

### Exercise Logs

| Method | Path | 描述 | Auth |
|--------|------|------|------|
| GET | `/api/exercise-logs?startDate=&endDate=` | 按日期范围查询运动记录 | 必填 |
| POST | `/api/exercise-logs` | 新增运动记录 | 必填 |
| DELETE | `/api/exercise-logs/[id]` | 删除运动记录 | 必填 |

**请求体 (POST)**：
```json
{
  "logDate": "2026-07-13",
  "exerciseType": "跑步",
  "durationMinutes": 30,
  "caloriesBurned": 300,
  "note": "公园慢跑"
}
```

**响应**：
```json
{
  "id": "uuid",
  "logDate": "2026-07-13",
  "exerciseType": "跑步",
  "durationMinutes": 30,
  "caloriesBurned": 300,
  "note": "公园慢跑",
  "createdAt": "2026-07-13T...",
  "updatedAt": "2026-07-13T..."
}
```

## Frontend Design

### 页面变更

#### Today (`/today`)

在现有宏量营养素卡片下方，新增两行卡片：

1. **体重卡片**：
   - 展示今日体重与目标体重的对比。
   - 提供快捷录入按钮，点击展开表单（日期默认今天、体重输入框、备注）。
   - 若今日已记录，展示体重值与“已记录”标识，点击可覆盖更新。
   - 成功后 Toast 提示。

2. **运动卡片**：
   - 展示今日总消耗热量。
   - 提供“添加运动”按钮，展开表单：日期（默认今天）、运动类型（下拉建议 + 自由输入）、时长（分钟）、消耗热量（kcal）、备注。
   - 展示今日已添加的运动列表（类型 + 时长 + 消耗），支持单条删除。
   - 删除后实时更新总消耗与剩余热量。

#### Diary (`/diary`)

- 在 DateNavigator 下方，新增两个 Tab 或折叠面板：**体重**、**运动**。
- 体重 Tab：按日期展示历史体重记录列表，支持删除。
- 运动 Tab：按日期展示历史运动记录列表，支持删除。
- 保持与现有饮食记录相同的日期切换与空状态风格。

#### Progress (`/progress`)

- 新增 **体重趋势** 图表：
  - 支持 7 天 / 30 天 / 全部 时间范围切换。
  - 折线图展示每日体重变化，可选叠加体重目标线。
  - 显示起始体重、当前体重、目标体重、变化差值。
- 新增 **运动统计** 面板：
  - 展示选定周期内的总运动次数、总消耗热量、平均每次时长。
  - 按运动类型展示占比（饼图或条形图）。

#### Profile (`/profile`)

- 在卡路里目标设置下方，新增 **体重目标设置**：
  - 输入目标体重（kg），保存到 `users.weightTargetKg`。
  - 显示当前体重与目标体重的差值。
  - 若未设置，展示“未设置目标”提示，引导用户填写。

### 组件拆分

| 组件 | 位置 | 职责 |
|------|------|------|
| `WeightCard` | `components/today/` | 今日体重展示与快速录入 |
| `ExerciseCard` | `components/today/` | 今日运动展示与快速录入 |
| `WeightLogItem` | `components/diary/` | 单条体重记录展示与删除 |
| `ExerciseLogItem` | `components/diary/` | 单条运动记录展示与删除 |
| `WeightTrendChart` | `components/progress/` | 体重趋势图表 |
| `ExerciseStatsPanel` | `components/progress/` | 运动统计面板 |
| `WeightTargetForm` | `components/profile/` | 体重目标设置表单 |

### Hook 约定

| Hook | 职责 |
|------|------|
| `useWeightLogs(startDate, endDate)` | 查询日期范围内的体重记录 |
| `useExerciseLogs(startDate, endDate)` | 查询日期范围内的运动记录 |
| `useWeightTarget()` | 获取当前用户体重目标 |

## Service Layer

### 新增文件

- `src/lib/services/weight-log.service.ts`
  - `getWeightLogs(userId, startDate, endDate)`
  - `upsertWeightLog(userId, logDate, weightKg, note)`
  - `deleteWeightLog(userId, id)`

- `src/lib/services/exercise-log.service.ts`
  - `getExerciseLogs(userId, startDate, endDate)`
  - `createExerciseLog(userId, logDate, exerciseType, durationMinutes, caloriesBurned, note)`
  - `deleteExerciseLog(userId, id)`

### 修改文件

- `src/lib/services/daily-summary.service.ts`
  - 扩展 `recalculateDailySummary(userId, logDate)` 以同时聚合 `food_logs` 与 `exercise_logs`。
  - 新增计算字段：`totalExerciseKcal`、`netKcal`。
  - 保持 `remainingKcal = targetKcal - netKcal`。

**修改示例逻辑**：
```typescript
const [user, foodLogs, exerciseLogs] = await Promise.all([
  db.query.users.findFirst({ where: eq(users.id, userId), columns: { calorieTarget: true } }),
  db.query.foodLogs.findMany({ where: and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, logDate)) }),
  db.query.exerciseLogs.findMany({ where: and(exerciseLogs.userId, userId, eq(exerciseLogs.logDate, logDate)) }),
]);

const intakeKcal = foodLogs.reduce((sum, log) => sum + log.calories, 0);
const exerciseKcal = exerciseLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
const netKcal = intakeKcal - exerciseKcal;
const targetKcal = user?.calorieTarget ?? 2000;
const remainingKcal = targetKcal - netKcal;
```

## Acceptance Criteria

### 体重追踪

- [ ] 用户可以在今日页面录入当日体重，提交后成功写入数据库。
- [ ] 同一用户同一天多次提交体重时，后一条覆盖前一条，不产生重复记录。
- [ ] 用户在日记页面可以查看历史体重记录，并支持删除。
- [ ] 用户在进度页面可以查看体重趋势图表，时间范围切换正常。
- [ ] 用户在个人资料设置体重目标后，进度页面显示目标对比线。
- [ ] 未设置体重目标时，进度页面不展示目标线，并给出引导提示。

### 运动消耗

- [ ] 用户可以在今日页面添加运动记录，提交后成功写入数据库。
- [ ] 添加运动后，今日剩余热量实时更新（考虑运动消耗）。
- [ ] 用户在今日页面可以删除单条运动记录，删除后剩余热量重新计算。
- [ ] 用户在日记页面可以查看历史运动记录，并支持删除。
- [ ] 用户在进度页面可以查看运动统计面板，数据正确。

### 数据一致性

- [ ] 新增/删除体重记录后，`daily_summaries` 无需重算（体重不影响热量汇总）。
- [ ] 新增/删除运动记录后，`daily_summaries` 正确更新 `totalExerciseKcal`、`netKcal`、`remainingKcal`。
- [ ] 用户 A 无法查询、修改、删除用户 B 的体重/运动记录。
- [ ] 删除运动记录后，当日无运动记录时，运动相关字段回归默认值（0）。

### 错误处理

- [ ] 未登录用户访问体重/运动 API 返回 401。
- [ ] 请求体重/运动记录时缺少日期参数，返回 400。
- [ ] 体重值格式错误（如负数、非数字），返回 400。
- [ ] 运动时长或消耗热量为负数，返回 400。
- [ ] 数据库异常时，返回 500 并记录结构化日志。

## Implementation Order

1. **数据库迁移**：新增 `weight_logs`、`exercise_logs` 表；扩展 `daily_summaries`、`users` 表；生成并执行迁移。
2. **Service 层**：实现 `weight-log.service.ts`、`exercise-log.service.ts`；修改 `daily-summary.service.ts`。
3. **API 层**：实现体重与运动的 CRUD 接口；统一错误响应格式。
4. **Today 页面**：新增 `WeightCard`、`ExerciseCard` 组件，接入 API。
5. **Diary 页面**：新增体重与运动记录列表，接入日期切换。
6. **Progress 页面**：新增体重趋势图表与运动统计面板。
7. **Profile 页面**：新增体重目标设置表单。
8. **测试**：编写 Service 集成测试、API 路由测试、组件测试。
9. **质量检查**：运行 lint、类型检查、响应式检查、测试套件。

## Technical Constraints

- 严格遵循 `.trellis/spec/backend/` 与 `.trellis/spec/frontend/` 规范。
- 数据库操作必须通过 Drizzle ORM，禁止原生 SQL 拼接。
- 所有 API 输入必须经过 Zod schema 校验。
- 所有查询必须同时限制 `userId`，防止跨用户数据泄露。
- 错误响应统一为 `{ "error": string }` 格式。
- 前端新增组件必须支持响应式布局，禁止横向溢出。
- 新增逻辑必须补充对应测试覆盖。
- `DATABASE_URL` 不得写入任何文档、日志或提交记录。

## Definition of Done

- PRD 已通过用户确认并锁定。
- 数据库迁移文件已生成并通过手动/自动化检查。
- 所有 API 接口可通过 Postman/浏览器验证。
- 前端页面在手机、平板、PC 下均无布局异常。
- 测试套件通过（`npm run test`）。
- 代码已通过 lint 与 TypeScript 类型检查。
- 必要知识已同步回 `.trellis/spec/`。
