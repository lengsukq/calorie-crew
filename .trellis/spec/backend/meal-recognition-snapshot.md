# 餐次拍照识别 & 每日快照架构

> 拍照识别 + 每日快照系统的架构指南。

> **实现状态**：本文是后续路线图，不代表当前代码已经实现这些 AI、快照或小队表。当前代码只实现手动 `food_logs`、`daily_summaries`、登录和邀请码；新增功能必须先确认是否进入对应阶段。

---

## 概览

CalorieCrew 支持两种饮食记录方式：
1. **拍照识别**——用户拍本餐照片，AI 返回结构化 JSON，用户确认后入库。
2. **手动记录**——用户填写表单（食物名、份量、宏量营养素）。

Dashboard 数据来自两个不同来源：
- **`daily_summaries`**——当天实时聚合，每次记录变更立即更新。
- **`daily_snapshots`**——历史趋势的不可变快照，每天生成一次。

---

## 拍照识别流程

```
用户拍照上传
  ↓
POST /api/ai/recognize-meal
  ↓
校验图片（大小 ≤ 2MB、格式、限流检查）
  ↓
调用 AI 供应商（使用该餐次对应提示词）
  ↓
解析 & 校验 AI 返回 JSON（Zod schema）
  ↓
写入 ai_recognition_tasks（status=completed）
  ↓
写入 pending_food_logs（status=pending）
  ↓
返回解析结果给用户
  ↓
用户编辑/确认 → POST /api/ai/recognize-meal/[taskId]/confirm
  ↓
写入 food_logs
  ↓
更新 ai_recognition_tasks.status = 'confirmed'
  ↓
更新 pending_food_logs.status = 'confirmed'
  ↓
recalculateDailySummary(userId, date)
```

**关键契约**：AI 从不直接写 `food_logs`，用户确认是必经环节。

---

## 快照体系

### 类型 A：实时汇总（daily_summaries）

| 属性 | 值 |
|------|-----|
| 触发时机 | 每次 food_logs 变更 |
| 可变性 | 原地更新，可重算 |
| 用途 | Dashboard 今日视图、打卡状态 |
| 事实来源 | `food_logs`（可从中重建） |

### 类型 B：每日快照（daily_snapshots）

| 属性 | 值 |
|------|-----|
| 触发时机 | 每日 Cron（00:10 UTC）+ 按需补算 |
| 可变性 | 一次写入（upsert），幂等 |
| 用途 | 7天/30天趋势、体重曲线、周报 |
| 事实来源 | `daily_summaries` + 体重记录 |

---

## 表定义

### daily_summaries

```sql
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  log_date DATE NOT NULL,
  target_kcal INTEGER,
  total_kcal INTEGER NOT NULL DEFAULT 0,
  remaining_kcal INTEGER,
  breakfast_kcal INTEGER NOT NULL DEFAULT 0,
  lunch_kcal INTEGER NOT NULL DEFAULT 0,
  dinner_kcal INTEGER NOT NULL DEFAULT 0,
  snack_kcal INTEGER NOT NULL DEFAULT 0,
  total_protein_g NUMERIC(8,2) DEFAULT 0,
  total_carbs_g NUMERIC(8,2) DEFAULT 0,
  total_fat_g NUMERIC(8,2) DEFAULT 0,
  breakfast_count INTEGER NOT NULL DEFAULT 0,
  lunch_count INTEGER NOT NULL DEFAULT 0,
  dinner_count INTEGER NOT NULL DEFAULT 0,
  snack_count INTEGER NOT NULL DEFAULT 0,
  has_breakfast BOOLEAN NOT NULL DEFAULT false,
  has_lunch BOOLEAN NOT NULL DEFAULT false,
  has_dinner BOOLEAN NOT NULL DEFAULT false,
  has_snack BOOLEAN NOT NULL DEFAULT false,
  weight_kg NUMERIC(5,2),
  is_checked_in BOOLEAN NOT NULL DEFAULT false,
  check_in_source TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, log_date)
);
```

### daily_snapshots

```sql
CREATE TABLE daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  snapshot_date DATE NOT NULL,
  target_kcal INTEGER,
  total_kcal INTEGER NOT NULL DEFAULT 0,
  remaining_kcal INTEGER,
  calorie_completion_rate NUMERIC(5,2),
  breakfast_kcal INTEGER NOT NULL DEFAULT 0,
  lunch_kcal INTEGER NOT NULL DEFAULT 0,
  dinner_kcal INTEGER NOT NULL DEFAULT 0,
  snack_kcal INTEGER NOT NULL DEFAULT 0,
  total_protein_g NUMERIC(8,2) DEFAULT 0,
  total_carbs_g NUMERIC(8,2) DEFAULT 0,
  total_fat_g NUMERIC(8,2) DEFAULT 0,
  weight_kg NUMERIC(5,2),
  weight_delta_kg NUMERIC(5,2),
  is_checked_in BOOLEAN NOT NULL DEFAULT false,
  check_in_count INTEGER NOT NULL DEFAULT 0,
  food_log_count INTEGER NOT NULL DEFAULT 0,
  ai_log_count INTEGER NOT NULL DEFAULT 0,
  manual_log_count INTEGER NOT NULL DEFAULT 0,
  crew_count INTEGER NOT NULL DEFAULT 0,
  reminder_count INTEGER NOT NULL DEFAULT 0,
  snapshot_version INTEGER NOT NULL DEFAULT 1,
  generated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);
```

### team_daily_snapshots

```sql
CREATE TABLE team_daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  snapshot_date DATE NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  checked_in_count INTEGER NOT NULL DEFAULT 0,
  check_in_rate NUMERIC(5,2),
  total_food_logs INTEGER NOT NULL DEFAULT 0,
  total_ai_logs INTEGER NOT NULL DEFAULT 0,
  total_manual_logs INTEGER NOT NULL DEFAULT 0,
  reminder_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMP DEFAULT now(),
  UNIQUE(team_id, snapshot_date)
);
```

---

## 生成策略（免费版）

1. **写入时更新**：每次 `food_logs` 变更调用 `recalculateDailySummary()`。
2. **每日 Cron**：Vercel Cron 在 00:10 UTC 执行 `POST /api/cron/generate-daily-snapshots`（Hobby 计划唯一可用频率）。
3. **按需补算**：`/api/dashboard/today` 被调用时，`ensureRecentSnapshots()` 检查最近 7 天，缺失的自动补算。

这套方案避免了对 `pg_cron` 或小时级定时器的依赖。

---

## AI 使用限制

| 限制 | 默认值 | 实现位置 |
|------|--------|----------|
| 每天 AI 调用次数 | 5 次 | `rate-limit.ts` |
| 每餐次每天 | 3 次 | `rate-limit.ts` |
| 图片最大尺寸 | 2MB | `image.ts` |
| 图片最长边 | 1024px | `image.ts` |

支持三种 AI 模式：
- `off`：关闭 AI，只能手动记录
- `env`：使用 Vercel 环境变量中的 `AI_API_KEY`
- `byok`（推荐）：用户自带 API Key + Base URL + Model ID

---

## API 端点

| 方法 | 路径 | 用途 |
|------|------|------|
| POST | `/api/ai/recognize-meal` | 上传并识别餐次图片 |
| POST | `/api/ai/recognize-meal/[taskId]/confirm` | 确认 AI 结果 → 写入 food_logs |
| POST | `/api/ai/recognize-meal/[taskId]/cancel` | 取消待确认的识别 |
| POST | `/api/summaries/recalculate` | 手动触发汇总重算 |
| GET | `/api/dashboard/today` | 获取今日 Dashboard 数据 |
| GET | `/api/progress/calories?range=7d` | 热量趋势（读 snapshots） |
| GET | `/api/progress/weight?range=30d` | 体重趋势（读 snapshots） |
| GET | `/api/progress/check-ins?range=30d` | 打卡历史（读 snapshots） |
| POST | `/api/cron/generate-daily-snapshots` | Cron：生成昨日快照 |

---

## 分阶段实现

| 阶段 | 范围 |
|------|------|
| 第一阶段 | `food_logs` + `daily_summaries` + Dashboard 四餐展示 + 手动记录 + 写入时汇总更新 |
| 第二阶段 | AI 设置页 + 拍照识别 + `pending_food_logs` + 用户确认流程 |
| 第三阶段 | `daily_snapshots` + Vercel Cron + Dashboard 7天曲线 + Progress 页面 30天曲线 |
| 第四阶段 | 小队 + `team_daily_snapshots` + 小队 Dashboard |
