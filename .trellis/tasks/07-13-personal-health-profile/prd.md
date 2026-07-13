# 个人健康档案与 AI 建议

## Goal

在现有饮食、体重、运动记录基础上，引入**个人健康档案**模块，自动计算 BMI、BMR、TDEE 等核心健康指标，并基于用户实时数据调用**内置预设 AI 模型**生成个性化饮食、运动与体重管理建议，让 CalorieCrew 从“记录工具”升级为“智能健康助手”。

## User Stories

| ID | 角色 | 需求 |
|----|------|------|
| US-01 | 普通用户 | 我可以在个人资料中填写/修改年龄、性别、身高、活动水平、健康目标等基础信息。 |
| US-02 | 普通用户 | 系统根据我的档案自动计算 BMI、BMR、TDEE，并在资料页清晰展示。 |
| US-03 | 普通用户 | 系统根据我近期的饮食、运动、体重数据，自动生成每日/每周健康建议。 |
| US-04 | 普通用户 | 我可以在今日/进度页查看 AI 建议卡片，获得可执行的改进提示。 |
| US-05 | 普通用户 | 我可以选择是否开启 AI 建议，并随时关闭或清除历史建议。 |
| US-06 | 管理员 | 我可以在后台预设系统级 AI 提示词模板，统一建议风格与合规边界。 |

## Scope

### Included

- **个人档案数据模型**：扩展 `users` 表或新增 `user_profiles` 表，存储年龄、性别、身高、活动水平、健康目标等。
- **健康指标计算引擎**：基于档案自动计算 BMI、BMR（Mifflin-St Jeor）、TDEE、建议摄入范围。
- **AI 建议系统**：
  - 内置多套系统级 prompt 模板（饮食优化、运动建议、体重趋势分析）。
  - 根据用户实时数据（近 7/30 天饮食、运动、体重、BMI 趋势）调用 AI 生成建议。
  - 支持用户自定义开启/关闭 AI 建议。
- **前端展示**：
  - **Profile**：新增个人档案表单 + 健康指标展示。
  - **Today**：新增“AI 今日建议”卡片。
  - **Progress**：新增 AI 周报入口。
- **系统级配置**：管理员可在环境变量或后台配置 AI 建议服务的 base URL、模型、默认提示词。

### Explicitly Out of Scope

- 医学诊断或医疗建议（仅提供一般性健康信息，不含疾病治疗）。
- 接入 Apple Health / Google Fit 自动同步。
- 用户自定义 prompt 模板编辑器。
- AI 建议的社交分享或排行榜。
- 多语言 AI 建议（首版仅中文）。

## Data Model

### 方案 B：独立 `user_profiles` 表（已确认）

```typescript
export const userProfiles = pgTable(
  "user_profiles",
  {
    userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name"),
    birthDate: date("birth_date"),
    gender: text("gender", { enum: ["male", "female", "other"] }).default("male"),
    heightCm: integer("height_cm"),
    activityLevel: text("activity_level", {
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
    }).default("sedentary"),
    healthGoal: text("health_goal", {
      enum: ["lose_weight", "maintain", "gain_muscle", "general_health"],
    }).default("general_health"),
    weightTargetKg: numeric("weight_target_kg", { precision: 6, scale: 2 }),
    aiAdviceEnabled: boolean("ai_advice_enabled").notNull().default(true),
    aiAdviceFrequency: text("ai_advice_frequency", {
      enum: ["daily", "weekly", "off"],
    }).default("daily"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);
```

**设计理由**：
- 与 `users` 主表解耦，避免主表字段持续膨胀。
- `userId` 作为主键，保证一对一关系，查询时只需一次 JOIN。
- 字段均为可选或带默认值，不影响现有用户。

### 新增表：ai_advices

```typescript
export const aiAdvices = pgTable(
  "ai_advices",
  {
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
  },
  (table) => [unique("ai_advices_user_type_unique").on(table.userId, table.type, table.expiresAt)],
);
```

**设计理由**：
- 服务端持久化建议，便于审计、去重和已读标记。
- `suggestions` 使用 `json` 存储结构化建议列表，避免多次 JOIN。
- `(user_id, type, expiresAt)` 唯一约束，避免同一周期内重复生成同类型建议。

### 决策确认

- 首版采用独立 `user_profiles` 表。
- AI 建议持久化到 `ai_advices` 表。
- 每次更新个人档案时，异步触发生成建议。
- Prompt 模板存储在 `src/lib/constants/ai-advice-prompts.ts`。
- 建议内容必须经过基础 safety filter。

## Health Metrics Engine

### 计算公式

所有计算在服务层统一封装，前端仅负责展示。

#### BMI（身体质量指数）

```typescript
function calculateBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

const bmiCategories = [
  { max: 18.5, label: "偏瘦", color: "blue" },
  { max: 24, label: "正常", color: "green" },
  { max: 28, label: "偏胖", color: "orange" },
  { max: Infinity, label: "肥胖", color: "red" },
];
```

#### BMR（基础代谢率，Mifflin-St Jeor）

```typescript
function calculateBmr(gender: "male" | "female", heightCm: number, weightKg: number, age: number): number {
  if (gender === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}
```

#### TDEE（每日总能量消耗）

```typescript
const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function calculateTdee(bmr: number, activityLevel: keyof typeof activityMultipliers): number {
  return Math.round(bmr * activityMultipliers[activityLevel]);
}
```

#### 建议摄入区间

```typescript
function getSuggestedIntakeRange(tdee: number, healthGoal: string): { min: number; max: number } {
  switch (healthGoal) {
    case "lose_weight":
      return { min: Math.round(tdee * 0.75), max: Math.round(tdee * 0.85) };
    case "gain_muscle":
      return { min: Math.round(tdee * 1.05), max: Math.round(tdee * 1.15) };
    case "maintain":
    default:
      return { min: Math.round(tdee * 0.95), max: Math.round(tdee * 1.05) };
  }
}
```

### 缓存策略

- 计算为纯函数，无需缓存数据库结果。
- 若档案字段变更，实时重新计算。
- 当前体重取最近一条 `weight_logs`；若无记录，使用 `null` 并在 UI 展示“未记录体重”。

## AI Advice System

### 设计原则

- **内置预设**：系统提供多套高质量 prompt 模板，用户无需手动编写。
- **数据驱动**：建议内容基于用户真实数据（近 7/30 天饮食、运动、体重、BMI 趋势）。
- **可关闭**：用户可随时关闭 AI 建议，系统尊重隐私。
- **非医疗**：建议仅用于一般性健康信息参考，不得替代专业医疗诊断。

### Prompt 模板结构

每条建议由以下部分组成：

```typescript
interface AdvicePrompt {
  systemPrompt: string;        // 系统角色与边界
  userContext: string;         // 用户档案与近期数据摘要
  taskPrompt: string;          // 具体任务指令
  outputFormat: {
    summary: string;           // 一句话总结
    suggestions: Array<{
      title: string;
      detail: string;
      priority: "high" | "medium" | "low";
    }>;
  };
}
```

### 内置模板

#### 模板 1：每日饮食建议

```
system: 你是一位专业的营养师助手，帮助用户优化日常饮食记录。
userContext: 用户 {gender}，{age} 岁，身高 {heightCm}cm，当前体重 {currentWeight}kg，
BMI {bmi}，活动水平 {activityLevel}，健康目标 {healthGoal}。
今日已摄入 {totalKcal}kcal，目标 {targetKcal}kcal，三大营养素：蛋白质 {protein}g，
碳水 {carbs}g，脂肪 {fat}g。近 7 天平均摄入 {avgKcal}kcal。
task: 基于以上数据，给出 3 条可执行的饮食优化建议，优先关注蛋白质摄入和热量控制。
outputFormat: JSON { summary, suggestions: [{ title, detail, priority }] }
```

**每日建议触发条件**：
- 用户 `aiAdviceFrequency` 为 `daily` 且 `aiAdviceEnabled` 为 `true`。
- 今日尚未生成过 `daily_diet` 类型建议，或用户手动点击“刷新建议”。
- 用户今日至少有一条饮食记录；若完全没有记录，不生成饮食建议，仅展示“暂无足够数据”。

**每日建议内容结构**：
- `summary`：1 句话总结今日饮食状态，如“今日蛋白质摄入偏低，建议午餐增加一份鸡胸肉。”
- `suggestions`：最多 3 条，按 `priority` 排序：
  - `high`：热量缺口/盈余过大、蛋白质严重不足
  - `medium`：碳水/脂肪比例失衡、饮水不足
  - `low`：食物多样性、进餐时间建议
- 每条建议必须包含：
  - `title`：简短标题，如“增加蛋白质摄入”
  - `detail`：具体可执行建议，如“今日蛋白质仅摄入 45g，建议达到 90g 以上，可在午餐增加 100g 鸡胸肉。”
  - `priority`：`high | medium | low`

**每日建议展示规则**：
- Today 页面仅在用户完成今日至少一次饮食记录后展示 AI 建议卡片。
- 若用户未开启 AI 建议，展示“已关闭”状态，引导开启。
- 建议生成后 24 小时内有效，过期后自动清理或标记为失效。

#### 模板 2：每周体重与运动总结

```
system: 你是一位健身与体重管理顾问。
userContext: 用户近 7 天体重变化 {weightChange}kg，运动 {exerciseCount} 次，
总消耗 {totalExerciseKcal}kcal，平均每日摄入 {avgIntake}kcal，目标 {targetKcal}kcal。
task: 分析本周数据，指出体重趋势是否健康，并给出下周运动与饮食的调整建议。
outputFormat: JSON { summary, suggestions: [{ title, detail, priority }] }
```

#### 模板 3：BMI 与健康风险提示

```
system: 你是一位健康科普顾问，语气温和、鼓励性。
userContext: 用户 BMI 为 {bmi}，属于 {bmiCategory}。
task: 基于 BMI 结果，提供 2-3 条改善建议，强调健康第一，不制造身材焦虑。
outputFormat: JSON { summary, suggestions: [{ title, detail, priority }] }
```

### AI 调用策略

- **模型来源**：优先使用用户 `user_ai_configs` 中配置的模型；若用户未配置，使用系统环境变量中的默认 AI 服务。
- **调用时机**：
  - 更新个人档案成功后，异步触发对应类型建议生成。
  - `daily`：每日首次打开 Today 页面时生成。
  - `weekly`：每周一生成周报。
  - `off`：不自动生成，用户手动触发。
- **失败降级**：若 AI 服务不可用，展示“建议暂时不可用”，不阻塞主流程。
- **限流与成本**：建议生成后缓存 24 小时，避免重复调用。
- **自动触发**：`updateProfile` 成功后，根据 `aiAdviceFrequency` 异步调用 `generateAdvice`，不阻塞前端响应。

### 建议展示

```typescript
interface AiAdvice {
  id: string;
  type: "daily_diet" | "weekly_summary" | "bmi_alert" | "goal_reminder";
  summary: string;
  suggestions: Array<{
    title: string;
    detail: string;
    priority: "high" | "medium" | "low";
  }>;
  generatedAt: string;
  expiresAt: string;
}
```

- 建议存储在 `ai_advices` 表或仅前端缓存（首版建议采用服务端存储，便于审计与去重）。
- 用户已读后标记 `readAt`，避免重复展示。
- 支持用户手动“刷新建议”，强制重新生成。

## API Design

### 个人档案

| Method | Path | 描述 | Auth |
|--------|------|------|------|
| GET | `/api/profile` | 获取当前用户档案与健康指标 | 必填 |
| PUT | `/api/profile` | 更新个人档案 | 必填 |

**请求体 (PUT)**：
```json
{
  "displayName": "张三",
  "birthDate": "1995-06-15",
  "gender": "male",
  "heightCm": 175,
  "activityLevel": "moderate",
  "healthGoal": "lose_weight",
  "weightTargetKg": "65.00",
  "aiAdviceEnabled": true,
  "aiAdviceFrequency": "daily"
}
```

**响应**：
```json
{
  "profile": {
    "displayName": "张三",
    "birthDate": "1995-06-15",
    "gender": "male",
    "heightCm": 175,
    "activityLevel": "moderate",
    "healthGoal": "lose_weight",
    "weightTargetKg": "65.00",
    "aiAdviceEnabled": true,
    "aiAdviceFrequency": "daily"
  },
  "metrics": {
    "bmi": 24.5,
    "bmr": 1650,
    "tdee": 2557,
    "suggestedIntake": { "min": 1918, "max": 2176 },
    "bmiCategory": "偏胖"
  }
}
```

### AI 建议

| Method | Path | 描述 | Auth |
|--------|------|------|------|
| GET | `/api/ai/advice?type=daily&range=7d` | 获取建议列表 | 必填 |
| POST | `/api/ai/advice/generate` | 手动触发生成建议 | 必填 |
| DELETE | `/api/ai/advice/[id]` | 删除单条建议 | 必填 |

**生成请求体**：
```json
{
  "type": "daily_diet",
  "force": false
}
```

**响应**：
```json
{
  "id": "uuid",
  "type": "daily_diet",
  "summary": "今日蛋白质摄入偏低，建议午餐增加一份鸡胸肉。",
  "suggestions": [
    {
      "title": "增加蛋白质摄入",
      "detail": "今日蛋白质仅摄入 45g，建议达到 90g 以上，可在午餐增加 100g 鸡胸肉。",
      "priority": "high"
    }
  ],
  "generatedAt": "2026-07-13T...",
  "expiresAt": "2026-07-14T..."
}
```

## Frontend Design

### Profile (`/profile`)

在现有卡路里目标设置下方，新增：

1. **个人档案表单**：
   - 显示名称（可选）
   - 出生日期（用于计算年龄）
   - 性别（单选框：男 / 女 / 其他）
   - 身高（cm）
   - 活动水平（下拉：久坐 / 轻度 / 中度 / 活跃 / 非常活跃）
   - 健康目标（下拉：减脂 / 维持 / 增肌 / 一般健康）
   - 体重目标（kg，复用现有 `weightTargetKg`）

2. **健康指标卡片**：
   - BMI 数值 + 分类标签（偏瘦/正常/偏胖/肥胖）
   - BMR / TDEE 数值
   - 建议摄入区间（基于 TDEE 与健康目标）
   - 若缺少身高/体重/年龄，展示“请完善档案以查看指标”

3. **AI 建议偏好**：
   - 开关：开启/关闭 AI 建议
   - 频率选择：每日 / 每周 / 关闭

### Today (`/today`)

在现有宏量营养素卡片下方，新增 **AI 建议卡片**：

- 展示最新建议摘要（1 句话）。
- 可展开查看详细建议列表（按优先级排序）。
- 提供“刷新建议”按钮（带 loading 状态）。
- 若用户关闭 AI 建议，展示“已关闭”状态，引导开启。

### Progress (`/progress`)

新增 **AI 健康周报** 入口：

- 展示最近一次周报时间。
- 点击进入详情页，展示：
  - 本周体重变化趋势摘要
  - 本周饮食完成度
  - 本周运动总结
  - 下周行动建议（3 条）

### Diary (`/diary`)

- 在日记头部增加“AI 洞察”入口，展示当日数据异常提醒（如连续 3 天热量超标）。

## Service Layer

### 新增文件

- `src/lib/services/profile.service.ts`
  - `getProfile(userId)` — 获取用户档案与计算后指标
  - `updateProfile(userId, data)` — 更新档案，触发指标重算
  - `calculateMetrics(profile, currentWeight)` — 计算 BMI/BMR/TDEE/建议区间

- `src/lib/services/ai-advice.service.ts`
  - `getAdvices(userId, type, range)` — 查询建议列表
  - `generateAdvice(userId, type, force)` — 生成新建议
  - `deleteAdvice(userId, id)` — 删除建议
  - `buildPrompt(user, profile, metrics, recentData, templateType)` — 组装 prompt

- `src/lib/services/health-metrics.service.ts`（可选拆分）
  - `calculateBmi(heightCm, weightKg)`
  - `calculateBmr(gender, heightCm, weightKg, age)`
  - `calculateTdee(bmr, activityLevel)`
  - `getSuggestedIntakeRange(tdee, healthGoal)`
  - `getBmiCategory(bmi)`

### 修改文件

- `src/lib/services/daily-summary.service.ts`
  - `recalculateDailySummary` 需在返回汇总时附带用户档案摘要（便于 AI 调用时无需重复查询）。

### 内置 Prompt 管理

- Prompt 模板统一存储在 `src/lib/constants/ai-advice-prompts.ts`。
- 首版不提供后台编辑器，模板版本随代码发布。
- 建议内容必须经过基础 safety filter 后再写入 `ai_advices` 表。

### Safety Filter

所有 AI 返回内容在入库前必须经过基础过滤，避免输出医疗诊断、极端节食、致病暗示等内容。

**过滤规则**：
- 拒绝类：包含“诊断”“治疗”“处方”“必须/只能/禁止吃某类食物”等医疗化措辞。
- 降级类：包含“快速减肥”“极端节食”“替代药物治疗”等高风险表述。
- 兜底类：若 AI 返回内容无法解析为结构化 JSON，直接返回降级提示“建议暂时不可用”。

**处理流程**：
```typescript
function sanitizeAdvice(raw: unknown): AiAdvice {
  const parsed = parseAdviceJson(raw);
  if (!parsed) return fallbackAdvice();

  const filtered = parsed.suggestions.filter((item) => !containsUnsafeContent(item));
  if (filtered.length === 0) return fallbackAdvice();

  return { ...parsed, suggestions: filtered };
}
```

**禁止输出示例**：
- “你患有 XX 病，应该…”
- “必须每天只吃 1000kcal”
- “用 XX 替代你的药物治疗”

## Acceptance Criteria

### 个人档案

- [ ] 用户可以在 Profile 页面填写/修改所有个人档案字段。
- [ ] 档案保存成功后，健康指标实时更新。
- [ ] 用户未填写身高/体重/年龄时，指标区域展示友好提示。
- [ ] 用户档案数据仅本人可见，API 严格限制 `userId`。

### 健康指标

- [ ] BMI 计算准确，分类标签正确（偏瘦 < 18.5 / 正常 18.5-24 / 偏胖 24-28 / 肥胖 ≥ 28）。
- [ ] BMR 使用 Mifflin-St Jeor 公式，男女计算正确。
- [ ] TDEE 根据活动水平正确乘以对应系数。
- [ ] 建议摄入区间根据健康目标动态调整（减脂 -15% / 增肌 +5%~15% / 维持 ±5%）。

### AI 建议

- [ ] 开启状态下，每日首次打开 Today 自动生成饮食建议。
- [ ] 每周一自动生成周报建议。
- [ ] 用户手动触发“刷新建议”可立即重新生成。
- [ ] AI 服务不可用时，页面降级展示“建议暂时不可用”，不阻塞主流程。
- [ ] 用户关闭 AI 建议后，不再自动生成，Today 卡片展示关闭状态。
- [ ] 建议内容不包含医疗诊断语句，符合合规要求。
- [ ] 更新个人档案成功后，异步触发生成建议，前端不阻塞。
- [ ] 建议内容经过 safety filter，高风险内容不会进入 `ai_advices` 表。动生成饮食建议。
- [ ] 每周一自动生成周报建议。
- [ ] 用户手动触发“刷新建议”可立即重新生成。
- [ ] AI 服务不可用时，页面降级展示“建议暂时不可用”，不阻塞主流程。
- [ ] 用户关闭 AI 建议后，不再自动生成，Today 卡片展示关闭状态。
- [ ] 建议内容不包含医疗诊断语句，符合合规要求。
- [ ] 更新个人档案成功后，异步触发生成建议，前端不阻塞。
- [ ] 建议内容经过 safety filter，高风险内容不会进入 `ai_advices` 表。动生成饮食建议。
- [ ] 每周一自动生成周报建议。
- [ ] 用户手动触发“刷新建议”可立即重新生成。
- [ ] AI 服务不可用时，页面降级展示“建议暂时不可用”，不阻塞主流程。
- [ ] 用户关闭 AI 建议后，不再自动生成，Today 卡片展示关闭状态。
- [ ] 建议内容不包含医疗诊断语句，符合合规要求。
- [ ] 更新个人档案成功后，异步触发生成建议，前端不阻塞。
- [ ] 建议内容经过 safety filter，高风险内容不会进入 `ai_advices` 表。

### 数据一致性

- [ ] 用户档案更新后，`user_profiles` 立即写入，指标实时更新。
- [ ] 用户删除体重记录后，BMI 显示为“待计算”。
- [ ] 用户修改健康目标后，建议摄入区间立即更新。
- [ ] 更新个人档案后，异步建议生成失败不影响档案保存结果。

### 错误处理

- [ ] 未登录用户访问档案/建议 API 返回 401。
- [ ] 档案字段格式错误（如身高为负数、日期格式错误）返回 400。
- [ ] AI 服务超时或返回异常时，记录结构化日志并返回 502/503。
- [ ] 用户未配置 AI 且系统环境变量缺失时，建议功能自动降级。
- [ ] safety filter 过滤掉全部建议时，返回降级提示而不是报错。

## Implementation Order

1. **数据模型**：新增 `user_profiles`、`ai_advices` 表，生成迁移。
2. **Service 层**：实现 `profile.service.ts`、`health-metrics.service.ts`、`ai-advice.service.ts`，增加 safety filter。
3. **API 层**：实现 `/api/profile` 与 `/api/ai/advice` 系列接口；`updateProfile` 成功后异步触发生成建议。
4. **Profile 页面**：新增档案表单 + 健康指标卡片 + AI 偏好设置。
5. **Today 页面**：新增 AI 建议卡片。
6. **Progress 页面**：新增 AI 周报入口。
7. **Diary 页面**：新增数据洞察提醒。
8. **内置 Prompt 常量**：创建 `src/lib/constants/ai-advice-prompts.ts` 并接入建议生成。
9. **测试**：指标计算单元测试、safety filter 单测、API 测试、端到端流程测试。
10. **质量检查**：lint、类型检查、响应式检查、测试套件。

## Technical Constraints

- 严格遵循 `.trellis/spec/backend/` 与 `.trellis/spec/frontend/` 规范。
- 健康指标计算必须使用服务层封装，禁止在前端计算核心公式。
- AI 调用必须通过服务层统一处理，禁止前端直接调用第三方 AI API。
- 所有 API 输入必须经过 Zod schema 校验。
- 建议内容需经过 basic safety filter，避免输出极端或医疗诊断类语句。
- 用户数据严格隔离，建议内容仅返回当前用户数据。
- 前端新增组件必须支持响应式布局，禁止横向溢出。
- `DATABASE_URL` 与 AI API Key 不得写入文档、日志或提交记录。

## Definition of Done

- PRD 已通过用户确认并锁定。
- 数据库迁移文件已生成并通过检查。
- 个人档案填写 → 指标计算 → AI 建议生成完整流程可端到端跑通。
- AI 建议内容准确、可读、无医疗诊断风险。
- 前端页面在手机、平板、PC 下均无布局异常。
- 测试套件通过（`npm run test`）。
- 代码已通过 lint 与 TypeScript 类型检查。
- 必要知识已同步回 `.trellis/spec/`。
