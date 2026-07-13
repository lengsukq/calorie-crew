# 体验优化与数据维度扩展

## Goal

在现有饮食记录、个人档案与 AI 建议能力基础上，围绕**使用体验**和**数据完整性**两个方向进行补齐与优化，降低用户记录成本、提升档案完善率、建立 AI 反馈闭环，并扩展健康数据维度，为后续智能化推荐打下更丰富的数据基础。

## User Stories

| ID | 角色 | 需求 |
|----|------|------|
| US-01 | 普通用户 | 我可以在日记中直接编辑已有饮食记录，而不需要先删除再重新添加。 |
| US-02 | 普通用户 | 我可以批量选择多条记录进行删除或复制到其他日期。 |
| US-03 | 普通用户 | 我可以在首次填写个人资料时获得分步引导，而不是一次性面对长表单。 |
| US-04 | 普通用户 | 系统可以根据我是否完成记录，在 Today 页面给出轻量引导，而不是强制我立即填写完整档案。 |
| US-05 | 普通用户 | 我可以在 AI 建议上标记「有用」或「无用」，帮助系统改进后续建议质量。 |
| US-06 | 普通用户 | 我可以查看 AI 建议历史，并重新激活过期建议。 |
| US-07 | 普通用户 | 我可以在 Today 页面快速记录饮水，并看到今日饮水进度。 |
| US-08 | 普通用户 | 我可以在 Today 页面记录昨晚睡眠，并在 Progress 页面查看睡眠趋势。 |
| US-09 | 普通用户 | 我可以记录身体围度（如腰围、臂围），并在 Progress 页面查看围度变化。 |

## Scope

### Included

- **饮食记录编辑与批量操作**：单条编辑、批量删除、批量复制到其他日期、记录备注/标签。
- **个人档案渐进式引导**：分步表单、首次进入 Today 的轻量引导条、已填写字段折叠收起。
- **AI 建议反馈与迭代**：有用/无用反馈、建议执行标记、按类型屏蔽、建议历史页、重新激活过期建议。
- **新增数据维度**：饮水记录、睡眠记录、身体围度记录，统一接入 Today / Diary / Progress 页面。

### Explicitly Out of Scope

- 食物营养成分数据库（列入后续独立需求）。
- 连续打卡与徽章系统（列入后续独立需求）。
- 设备同步与离线模式（列入后续独立需求）。
- Apple Health / Google Fit 自动同步。
- 社交分享或排行榜。

## Module 1: 饮食记录编辑与批量操作

### 数据模型变更

#### 扩展 `food_logs` 表

```typescript
export const foodLogs = pgTable(
  "food_logs",
  {
    // ... 现有字段保持不变 ...
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    mealType: text("meal_type").notNull(),
    foodName: text("food_name").notNull(),
    servingDescription: text("serving_description").notNull(),
    calories: integer("calories").notNull(),
    proteinG: numeric("protein_g", { precision: 8, scale: 2 }).notNull().default("0"),
    carbsG: numeric("carbs_g", { precision: 8, scale: 2 }).notNull().default("0"),
    fatG: numeric("fat_g", { precision: 8, scale: 2 }).notNull().default("0"),
    note: text("note"),
    tags: json("tags").$type<string[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("food_logs_user_date_id_unique").on(table.userId, table.logDate, table.id)],
);
```

**新增字段说明**：
- `note`：可选备注，如「欺骗餐」「外食」「加餐」等自由文本。
- `tags`：可选标签数组，首版提供固定标签池（`cheat_meal` / `dining_out` / `late_night` / `high_protein`），支持前端多选。
- `updatedAt`：在编辑时自动更新，便于前端展示「最后编辑时间」。

### API 变更

#### 修改 `PUT /api/food-logs/[id]`（已有接口增强）

当前可能只支持删除，现扩展为支持编辑：

**请求体**：
```json
{
  "mealType": "lunch",
  "foodName": "鸡胸肉沙拉",
  "servingDescription": "200g",
  "calories": 350,
  "proteinG": "30.00",
  "carbsG": "15.00",
  "fatG": "8.00",
  "note": "公司楼下轻食店",
  "tags": ["high_protein"]
}
```

**响应**：
```json
{
  "id": "uuid",
  "logDate": "2026-07-13",
  "mealType": "lunch",
  "foodName": "鸡胸肉沙拉",
  "servingDescription": "200g",
  "calories": 350,
  "proteinG": "30.00",
  "carbsG": "15.00",
  "fatG": "8.00",
  "note": "公司楼下轻食店",
  "tags": ["high_protein"],
  "updatedAt": "2026-07-13T..."
}
```

**业务规则**：
- 编辑后自动调用 `recalculateDailySummary(userId, logDate)` 重算当日汇总。
- 若编辑导致 `logDate` 变更（跨日期复制场景），需删除原日期记录并在新日期创建，或单独提供复制接口。

#### 新增 `POST /api/food-logs/batch`

**请求体**：
```json
{
  "action": "delete" | "copy",
  "ids": ["uuid1", "uuid2"],
  "targetDate": "2026-07-14" // copy 时必填
}
```

**响应**：
```json
{
  "success": true,
  "deletedCount": 2,
  "copiedCount": 0
}
```

**业务规则**：
- `delete`：批量删除，删除后重算每个记录所在日期的 `daily_summaries`。
- `copy`：批量复制到 `targetDate`，复制后目标日期的 `daily_summaries` 重算；原记录保持不变。
- 跨用户 ID 的 ID 直接过滤，返回 404。

### 前端变更

#### Diary (`/diary`)

- 每条记录增加「编辑」按钮，点击后展开内联编辑表单。
- 支持长按/多选模式，进入批量操作状态：
  - 顶部显示「已选择 N 条」，提供「删除」「复制到其他日期」按钮。
  - 复制时弹出日期选择器，默认今天，支持选择未来/过去日期。
- 记录项展示 `note` 和 `tags`，标签以 pill 形式展示。
- 编辑/删除成功后实时更新当日汇总卡片。

#### Today (`/today`)

- 各餐次下的记录列表同样支持内联编辑和标签展示。
- 批量操作入口放在日记页，Today 页保持简洁，仅支持单条编辑。

### 服务层变更

- `src/lib/services/food-log.service.ts`：新增 `updateFoodLog(userId, id, data)` 和 `batchAction(userId, action, ids, targetDate?)`。
- `src/lib/services/daily-summary.service.ts`：`recalculateDailySummary` 保持不变，由调用方在编辑/删除/复制后触发。

### 验收标准

- [ ] 用户可以在 Diary 页面内联编辑饮食记录，保存后实时更新汇总。
- [ ] 编辑时如果只改了 `note` 或 `tags`，不影响热量汇总但会更新 `updatedAt`。
- [ ] 用户可以在 Diary 页面批量删除记录，删除后对应日期汇总正确更新。
- [ ] 用户可以将多条记录复制到其他日期，目标日期汇总正确增加。
- [ ] 批量操作时，跨用户的 ID 会被过滤并返回 404，不泄露数据。
- [ ] 编辑/删除/复制操作失败时，前端展示可理解错误信息。

---

## Module 2: 个人档案引导与渐进式填写

### 设计原则

- **不强迫**：用户首次进入 Today 时，即使没有完整档案也能正常记录饮食。
- **渐进式**：档案表单分步展示，降低认知负担。
- **场景触发**：只在需要计算结果（如 BMI、建议摄入区间）时才提示用户补充信息。

### 前端变更

#### Profile (`/profile`)

- 新增「引导模式」开关（默认开启）：
  - **步骤 1**：性别、出生日期、身高、当前体重（从最近体重记录带入）。
  - **步骤 2**：活动水平、健康目标。
  - **步骤 3**：体重目标、AI 建议偏好。
- 每步骤只展示 2-3 个字段，底部有「上一步」「下一步」「跳过」按钮。
- 非引导模式下，表单可折叠：
  - 已填写字段默认收起，展示「已填写」标签。
  - 点击「修改」展开对应区块。

#### Today (`/today`)

- 若用户未完成步骤 1（缺少性别/身高/年龄），顶部展示轻量引导条：
  - 「完善个人档案，获取更精准的健康指标与 AI 建议」
  - 提供「立即填写」和「稍后提醒」按钮。
  - 「稍后提醒」点击后 24 小时内不再展示。
- 引导条不影响饮食记录操作，不阻塞主流程。

#### Progress (`/progress`)

- 若档案不完整，健康指标卡片展示「待完善」状态：
  - BMI 区域展示「请先填写身高与体重」。
  - 建议摄入区间展示「请先填写身高、体重、年龄」。
  - 提供快捷跳转到 Profile 的链接。

### API 变更

- `/api/profile` 响应增加 `profileCompleteness` 字段：
  ```json
  {
    "profile": { ... },
    "metrics": { ... },
    "profileCompleteness": {
      "completedFields": ["gender", "heightCm", "birthDate"],
      "missingFields": ["activityLevel", "healthGoal"],
      "percentage": 60
    }
  }
  ```
- 前端根据 `missingFields` 动态决定引导条展示逻辑。

### 验收标准

- [ ] 新用户首次进入 Profile 时看到分步引导，可逐步填写或跳过。
- [ ] 用户跳过部分字段后，Today 页面顶部展示引导条，但不影响记录饮食。
- [ ] 用户点击「稍后提醒」后，24 小时内不再展示引导条。
- [ ] 用户返回 Profile 后，已填写字段可折叠收起，点击「修改」可展开。
- [ ] Progress 页面在档案不完整时展示友好提示，而非空白或错误。
- [ ] 引导模式不产生额外的数据库查询，字段完整性由前端根据 API 响应计算。

---

## Module 3: AI 建议反馈与迭代机制

### 数据模型变更

#### 扩展 `ai_advices` 表

```typescript
export const aiAdvices = pgTable(
  "ai_advices",
  {
    // ... 现有字段保持不变 ...
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["daily_diet", "weekly_summary", "bmi_alert", "goal_reminder"],
    }).notNull(),
    summary: text("summary").notNull(),
    suggestions: json("suggestions").$type<
      Array<{
        title: string;
        detail: string;
        priority: "high" | "medium" | "low";
      }>
    >().notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // 新增：反馈与迭代
    feedback: text("feedback", { enum: ["helpful", "not_helpful"] }),
    feedbackAt: timestamp("feedback_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    dismissed: boolean("dismissed").notNull().default(false),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
  },
  (table) => [unique("ai_advices_user_type_unique").on(table.userId, table.type, table.expiresAt)],
);
```

**新增字段说明**：
- `feedback`：用户反馈，`helpful` 或 `not_helpful`。
- `feedbackAt`：反馈时间。
- `completedAt`：用户标记建议为「已完成」的时间。
- `dismissed` / `dismissedAt`：用户主动屏蔽某条建议，不再展示。

### API 变更

#### 新增 `POST /api/ai/advice/[id]/feedback`

**请求体**：
```json
{
  "feedback": "helpful" | "not_helpful"
}
```

**响应**：
```json
{
  "success": true
}
```

#### 新增 `POST /api/ai/advice/[id]/complete`

标记建议为已完成，用于后续 prompt 权重调整。

**响应**：
```json
{
  "success": true
}
```

#### 新增 `POST /api/ai/advice/[id]/dismiss`

屏蔽建议，前端不再展示。

**响应**：
```json
{
  "success": true
}
```

#### 修改 `GET /api/ai/advice` 响应

增加过滤参数：
- `includeDismissed=false`：默认不返回已屏蔽建议。
- `includeHistory=false`：默认只返回有效期内建议；设为 `true` 时返回历史建议。

### 前端变更

#### Today (`/today`)

- AI 建议卡片每条建议增加操作按钮：
  - 「有用」/「无用」反馈按钮（互斥）。
  - 「已完成」按钮，标记后建议打勾并置灰。
  - 「屏蔽」按钮，点击后建议不再出现。
- 反馈后展示 Toast：「感谢反馈，我们会优化后续建议」。

#### Progress (`/progress`) 或独立页面 `/advice-history`

- 新增「AI 建议历史」入口：
  - 按时间线展示所有历史建议（含已过期、已屏蔽）。
  - 支持重新激活过期建议：点击「重新激活」后，生成新建议并延长有效期。
  - 展示反馈统计：「你有 80% 的建议被标记为有用」。

#### AI Advice Service 层

- `buildPrompt` 增加用户反馈上下文：
  - 近 30 天用户标记为 `helpful` 的建议特征。
  - 近 30 天用户标记为 `not_helpful` 的建议特征。
  - 在 prompt 中增加一句：「用户过去认为 {特征} 的建议更有帮助，请优先类似风格。」
- 首版 feedback 特征提取为简单规则（如：用户偏好「蛋白质摄入」建议，反感「BMI 提示」），后续可升级为模型微调。

### 验收标准

- [ ] 用户可以对 AI 建议标记「有用」或「无用」，标记后立即生效。
- [ ] 用户标记「已完成」后，建议在 Today 页面展示完成状态。
- [ ] 用户屏蔽建议后，该建议不再出现在 Today 页面。
- [ ] 用户可以在建议历史页查看所有历史建议，包括已过期和已屏蔽。
- [ ] 用户可以重新激活过期建议，系统生成新建议并延长有效期。
- [ ] 建议历史页展示反馈统计，让用户感知到反馈的价值。
- [ ] AI 生成建议时，会参考用户历史反馈特征（首版为规则引擎）。
- [ ] 反馈数据不影响主流程，即使 AI 服务不可用，反馈仍可正常写入。

---

## Module 4: 新增数据维度（饮水、睡眠、身体围度）

### 设计原则

- 三个新维度统一遵循「Today 展示 + Diary 查看 + Progress 趋势」的现有模式。
- 每个维度独立成表，避免 `food_logs` 过度膨胀。
- 首版提供基础记录与展示，不做复杂算法。

### 数据模型

#### 新增 `water_logs` 表

```typescript
export const waterLogs = pgTable(
  "water_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    amountMl: integer("amount_ml").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("water_logs_user_date_id_unique").on(table.userId, table.logDate, table.id)],
);
```

**设计理由**：
- 允许同一天多条记录，每次饮水独立记录。
- `amountMl` 为整数，单位毫升，支持 250ml / 500ml 快捷录入。
- 首版不做每日总目标硬约束，仅展示进度。

#### 新增 `sleep_logs` 表

```typescript
export const sleepLogs = pgTable(
  "sleep_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    sleepMinutes: integer("sleep_minutes").notNull(),
    quality: integer("quality").notNull().default(3), // 1-5
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("sleep_logs_user_date_unique").on(table.userId, table.logDate)],
);
```

**设计理由**：
- 同一用户同一天只记录一次睡眠（入睡时间 + 起床时间可后续扩展为 `startAt/endAt`）。
- `quality` 为 1-5 分主观评分，默认 3 分。
- `sleepMinutes` 为总睡眠时长（分钟）。

#### 新增 `body_measurements` 表

```typescript
export const bodyMeasurements = pgTable(
  "body_measurements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    chestCm: numeric("chest_cm", { precision: 6, scale: 2 }),
    waistCm: numeric("waist_cm", { precision: 6, scale: 2 }),
    hipCm: numeric("hip_cm", { precision: 6, scale: 2 }),
    armCm: numeric("arm_cm", { precision: 6, scale: 2 }),
    legCm: numeric("leg_cm", { precision: 6, scale: 2 }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("body_measurements_user_date_unique").on(table.userId, table.logDate)],
);
```

**设计理由**：
- 同一用户同一天只记录一次围度。
- 各部位字段均为可选，用户可只记录关心的部位。
- `numeric(6,2)` 保留两位小数精度。

### API 设计

#### 饮水记录

| Method | Path | 描述 |
|--------|------|------|
| GET | `/api/water-logs?startDate=&endDate=` | 查询日期范围内饮水记录 |
| POST | `/api/water-logs` | 新增饮水记录 |
| DELETE | `/api/water-logs/[id]` | 删除饮水记录 |

**请求体 (POST)**：
```json
{
  "logDate": "2026-07-13",
  "amountMl": 500,
  "note": "晨起一杯水"
}
```

#### 睡眠记录

| Method | Path | 描述 |
|--------|------|------|
| GET | `/api/sleep-logs?startDate=&endDate=` | 查询日期范围内睡眠记录 |
| POST | `/api/sleep-logs` | 新增/覆盖当日睡眠记录 |
| DELETE | `/api/sleep-logs/[id]` | 删除睡眠记录 |

**请求体 (POST)**：
```json
{
  "logDate": "2026-07-13",
  "sleepMinutes": 420,
  "quality": 4,
  "note": "睡前喝了咖啡，入睡较慢"
}
```

#### 身体围度记录

| Method | Path | 描述 |
|--------|------|------|
| GET | `/api/body-measurements?startDate=&endDate=` | 查询日期范围内围度记录 |
| POST | `/api/body-measurements` | 新增/覆盖当日围度记录 |
| DELETE | `/api/body-measurements/[id]` | 删除围度记录 |

**请求体 (POST)**：
```json
{
  "logDate": "2026-07-13",
  "waistCm": "78.50",
  "armCm": "32.00",
  "note": "晨起空腹测量"
}
```

### 前端变更

#### Today (`/today`)

在现有宏量营养素卡片下方，新增三行卡片：

1. **饮水卡片**：
   - 展示今日总饮水量 / 目标（默认 2000ml，可配置）。
   - 快捷按钮：+250ml / +500ml / +1000ml。
   - 点击展开详情，展示今日饮水时间线（按 `createdAt` 排序）。
   - 支持单条删除。

2. **睡眠卡片**：
   - 展示昨晚睡眠时长与质量评分。
   - 若今日尚未记录，展示「记录昨晚睡眠」按钮。
   - 展开表单：日期（默认今天）、睡眠时长（小时/分钟混合输入）、质量（1-5 星或 pill 选择）、备注。
   - 修改后自动覆盖昨日记录（因为 `logDate` 通常记录为起床日期）。

3. **围度卡片**：
   - 展示最近一次围度记录日期与关键数值（如腰围）。
   - 展开表单：日期、各部位输入框（可选填写）、备注。
   - 同日覆盖机制。

#### Diary (`/diary`)

- 新增三个 Tab 或折叠面板：**饮水**、**睡眠**、**围度**。
- 按日期展示对应记录列表，支持删除。
- 睡眠卡片展示质量星级。
- 围度卡片以表格形式展示各部位数值，未填写部位展示「-」。

#### Progress (`/progress`)

- 新增 **饮水趋势**：
  - 7 天 / 30 天柱状图，展示每日饮水量。
  - 目标线对比（2000ml）。
- 新增 **睡眠趋势**：
  - 7 天 / 30 天折线图，展示每日睡眠时长。
  - 可选叠加质量评分折线。
  - 参考范围线：6 小时 / 8 小时 / 10 小时。
- 新增 **围度趋势**：
  - 支持选择要展示的部位（腰围/臂围/腿围等）。
  - 折线图展示变化趋势。
  - 体重与腰围同屏对比，直观展示体脂变化。

### 服务层变更

#### 新增文件

- `src/lib/services/water-log.service.ts`
  - `getWaterLogs(userId, startDate, endDate)`
  - `createWaterLog(userId, logDate, amountMl, note)`
  - `deleteWaterLog(userId, id)`

- `src/lib/services/sleep-log.service.ts`
  - `getSleepLogs(userId, startDate, endDate)`
  - `upsertSleepLog(userId, logDate, sleepMinutes, quality, note)`
  - `deleteSleepLog(userId, id)`

- `src/lib/services/body-measurement.service.ts`
  - `getBodyMeasurements(userId, startDate, endDate)`
  - `upsertBodyMeasurement(userId, logDate, data)`
  - `deleteBodyMeasurement(userId, id)`

### 验收标准

#### 饮水记录

- [ ] 用户可以在 Today 页面快速添加饮水记录，提交后写入数据库。
- [ ] 用户可以看到今日总饮水量，并以进度条/数字形式展示。
- [ ] 用户可以在 Diary 页面查看历史饮水记录，并支持删除。
- [ ] 用户可以在 Progress 页面查看饮水趋势图。

#### 睡眠记录

- [ ] 用户可以在 Today 页面记录昨晚睡眠，提交后写入数据库。
- [ ] 同一用户同一天多次提交睡眠记录时，后一条覆盖前一条。
- [ ] 用户可以在 Diary 页面查看历史睡眠记录，并支持删除。
- [ ] 用户可以在 Progress 页面查看睡眠趋势图，支持时长和质量双轴展示。
- [ ] 睡眠数据可在 AI 建议 prompt 中作为上下文使用。

#### 身体围度记录

- [ ] 用户可以在 Today 页面记录围度，提交后写入数据库。
- [ ] 用户可以选择性填写部位（不必全填），未填写部位展示为「-」。
- [ ] 同一用户同一天多次提交围度记录时，后一条覆盖前一条。
- [ ] 用户可以在 Diary 页面查看历史围度记录，并支持删除。
- [ ] 用户可以在 Progress 页面选择特定部位查看围度趋势。
- [ ] 围度数据可在 AI 建议 prompt 中作为上下文使用。

#### 数据一致性

- [ ] 用户 A 无法查询、修改、删除用户 B 的饮水/睡眠/围度记录。
- [ ] 删除记录后，对应日期的汇总（如有）正确更新。
- [ ] 三个新模块的记录操作失败时，不阻塞其他模块的正常使用。

---

## Implementation Order

1. **饮食记录编辑与批量操作**：
   - 扩展 `food_logs` 表（`note` / `tags` / `updatedAt`）。
   - 修改 `PUT /api/food-logs/[id]` 支持编辑。
   - 新增 `POST /api/food-logs/batch`。
   - 前端 Diary/Today 页面增加编辑与批量操作 UI。

2. **个人档案渐进式引导**：
   - Profile 页面新增引导模式与分步表单。
   - Today 页面新增引导条组件。
   - `/api/profile` 响应增加 `profileCompleteness`。

3. **AI 建议反馈与迭代**：
   - 扩展 `ai_advices` 表（`feedback` / `completedAt` / `dismissed`）。
   - 新增反馈/完成/屏蔽 API。
   - 前端 Today/Progress 增加反馈按钮与历史页。
   - `ai-advice.service.ts` 增加反馈上下文读取。

4. **新增数据维度**：
   - 新建 `water_logs` / `sleep_logs` / `body_measurements` 三张表，生成迁移。
   - 实现三个新 Service 层。
   - 实现三组新 API。
   - Today 页面新增三张卡片。
   - Diary 页面新增三个 Tab/面板。
   - Progress 页面新增三组趋势图。

5. **测试与质量检查**：
   - 模块 1：编辑/批量操作集成测试。
   - 模块 2：引导模式 E2E 测试。
   - 模块 3：反馈/屏蔽/历史 API 测试，safety filter 回归。
   - 模块 4：三个新模块的 Service 集成测试与 API 测试。
   - 统一质量检查：lint、类型检查、响应式检查、测试套件。

## Technical Constraints

- 严格遵循 `.trellis/spec/backend/` 与 `.trellis/spec/frontend/` 规范。
- 所有 API 输入必须经过 Zod schema 校验。
- 所有查询必须同时限制 `userId`，防止跨用户数据泄露。
- 错误响应统一为 `{ "error": string }` 格式。
- 前端新增组件必须支持响应式布局，禁止横向溢出。
- 新增逻辑必须补充对应测试覆盖。
- `DATABASE_URL` 与 AI API Key 不得写入任何文档、日志或提交记录。

## Definition of Done

- PRD 已通过用户确认并锁定。
- 数据库迁移文件已生成并通过检查。
- 饮食编辑、批量操作、渐进式档案、AI 反馈、饮水/睡眠/围度六个模块均可在本地完整跑通。
- 前端页面在手机、平板、PC 下均无布局异常。
- 测试套件通过（`npm run test`）。
- 代码已通过 lint 与 TypeScript 类型检查。
- 必要知识已同步回 `.trellis/spec/`。
