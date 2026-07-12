# Cross-Layer Thinking Guide

> **Purpose**: Think through data flow across layers before implementing.

---

## The Problem

**Most bugs happen at layer boundaries**, not within layers.

Common cross-layer bugs:
- API returns format A, frontend expects format B
- Database stores X, service transforms to Y, but loses data
- Multiple layers implement the same logic differently

---

## Before Implementing Cross-Layer Features

### Step 1: Map the Data Flow

Draw out how data moves:

```
Source → Transform → Store → Retrieve → Transform → Display
```

For each arrow, ask:
- What format is the data in?
- What could go wrong?
- Who is responsible for validation?

### Step 2: Identify Boundaries

| Boundary | Common Issues |
|----------|---------------|
| API ↔ Service | Type mismatches, missing fields |
| Service ↔ Database | Format conversions, null handling |
| Backend ↔ Frontend | Serialization, date formats |
| Component ↔ Component | Props shape changes |

### Step 3: Define Contracts

For each boundary:
- What is the exact input format?
- What is the exact output format?
- What errors can occur?

---

## Common Cross-Layer Mistakes

### Mistake 1: Implicit Format Assumptions

**Bad**: Assuming date format without checking

**Good**: Explicit format conversion at boundaries

### Mistake 2: Scattered Validation

**Bad**: Validating the same thing in multiple layers

**Good**: Validate once at the entry point

### Mistake 3: Leaky Abstractions

**Bad**: Component knows about database schema

**Good**: Each layer only knows its neighbors

---

## Checklist for Cross-Layer Features

Before implementation:
- [ ] Mapped the complete data flow
- [ ] Identified all layer boundaries
- [ ] Defined format at each boundary
- [ ] Decided where validation happens

After implementation:
- [ ] Tested with edge cases (null, empty, invalid)
- [ ] Verified error handling at each boundary
- [ ] Checked data survives round-trip

---

## Cross-Platform Template Consistency

In Trellis, command templates (e.g., `record-session.md`) exist in **multiple platforms** with identical or near-identical content. This is a cross-layer boundary.

### Checklist: After Modifying Any Command Template

- [ ] Find all platforms with the same command: `find src/templates/*/commands/trellis/ -name "<command>.*"`
- [ ] Update all platform copies (Markdown `.md` and TOML `.toml`)
- [ ] For Gemini TOML: adapt line continuations (`\\` vs `\`) and triple-quoted strings
- [ ] Run `/trellis:check-cross-layer` to verify nothing was missed

**Real-world example**: Updated `record-session.md` in Claude to use `--mode record`, but forgot iFlow, Kilo, OpenCode, and Gemini — caught by cross-layer check.

---

## Generated Runtime Template Upgrade Consistency

Some generated files are both documentation and runtime input. In Trellis,
`.trellis/workflow.md` is parsed by `get_context.py`, `workflow_phase.py`,
SessionStart filters, and per-turn hooks. Template changes must be validated
against both fresh init and upgrade paths.

### Checklist: After Modifying A Runtime-Parsed Template

- [ ] Identify every runtime parser that reads the template, not just the file
  writer that installs it
- [ ] Check whether relevant syntax lives outside obvious managed regions
  such as tag blocks
- [ ] Verify fresh `init` output and a versioned `update` scenario that writes
  the older `.trellis/.version`
- [ ] Add an upgrade regression using an older pristine template fixture, then
  assert the installed file reaches the current packaged shape
- [ ] Update the backend spec that owns the runtime contract

**Real-world example**: Codex inline mode changed workflow platform markers from
`[Codex]` / `[Kilo, Antigravity, Windsurf]` to `[codex-sub-agent]` /
`[codex-inline, Kilo, Antigravity, Windsurf]`. Fresh init was correct, but
`trellis update` only merged `[workflow-state:*]` blocks and preserved stale
markers outside those blocks. Result: upgraded projects got new hook scripts
but old workflow routing, so `get_context.py --mode phase --platform codex`
could return empty Phase 2.1 detail.

---

## Mode-Detection Probe Checklist

When a CLI auto-detects a mode by probing a remote resource (e.g., checking if `index.json` exists to decide marketplace vs direct download):

### Before implementing:
- [ ] Probe runs in **ALL** code paths that use the result (interactive, `-y`, `--flag` combos)
- [ ] 404 vs transient error are distinguished — don't treat both as "not found"
- [ ] Transient errors **abort or retry**, never silently switch modes
- [ ] Shared state (caches, prefetched data) is **reset** when context changes (e.g., user switches source)
- [ ] **Shortcut paths** (e.g., `--template` skipping picker) must have the same error-handling quality as the probed path — check that downstream functions don't call catch-all wrappers

### After implementing:
- [ ] Trace every path from probe result to the mode-decision branch — no fallthrough
- [ ] External format contracts (giget URI, raw URLs) are tested or at least documented as comments
- [ ] Metadata reads consume a complete response or use a streaming parser — never parse a fixed-size prefix as full JSON
- [ ] When reconstructing a composite identifier from parsed parts, verify **all** fields are included and in the **correct position** (e.g., `provider:repo/path#ref` not `provider:repo#ref/path`)
- [ ] Verify that **action functions** called after a shortcut don't internally use the old catch-all fetch — they must use the probe-quality variant when error distinction matters

**Real-world example**: Custom registry flow had 8 bugs across 3 review rounds: (1) probe only ran in interactive mode, (2) transient errors fell through to wrong mode, (3) giget URI had `#ref` in wrong position, (4) prefetched templates leaked across source switches, (5) `--template` shortcut bypassed probe but `downloadTemplateById` internally used catch-all `fetchTemplateIndex`, turning timeouts into "Template not found".

**Real-world example**: Agent-session update hints fetched npm `latest` metadata with `response.read(4096)` and then parsed it as complete JSON. The `@mindfoldhq/trellis` package metadata exceeded 4 KB, so the JSON was truncated, parse failed silently, and the first session injection showed no update hint. Fix: read the complete response before parsing, and add a regression where `version` is followed by an 8 KB metadata tail.

---

## When to Create Flow Documentation

Create detailed flow docs when:
- Feature spans 3+ layers
- Multiple teams are involved
- Data format is complex
- Feature has caused bugs before

---

## CalorieCrew: 拍照识别跨层数据流

下面是 CalorieCrew 特有的餐次拍照识别跨层流程。每次实现相关功能时参考。

### 完整数据流

```
[前端]    用户拍照 → PhotoUploadCard → POST /api/ai/recognize-meal
                                         ↓
[API]     图片校验（大小/格式） → rate limit 检查
                                         ↓
[Service] 调用 AI 供应商 → 解析 JSON → Zod 校验
                                         ↓
[DB]      写入 ai_recognition_tasks + pending_food_logs
                                         ↓
[API]     返回识别结果到前端
                                         ↓
[前端]    AiRecognitionResult → 用户编辑（可选）
                                         ↓
[前端]    用户确认 → POST /api/ai/recognize-meal/[taskId]/confirm
                                         ↓
[API]     校验 taskId/status → 写入 food_logs
                                         ↓
[DB]      food_logs insert → trigger recalculateDailySummary
                                         ↓
[DB]      upsert daily_summaries
                                         ↓
[API]     返回 updated daily_summary
                                         ↓
[前端]    Dashboard 刷新今日热量
```

### 每个边界的格式契约

| 边界 | 输入格式 | 输出格式 | 校验 |
|------|----------|----------|------|
| 前端 → API (recognize) | `multipart/form-data`: image + date + mealType | JSON `{ taskId, status, result }` | 前端: 图片大小/格式; API: rate limit |
| Service → AI Provider | system prompt + image (base64) | JSON string | Zod `mealRecognitionSchema` |
| AI → DB (pending) | Parsed `MealRecognitionResult` | SQL insert | 无（已校验） |
| 前端 → API (confirm) | JSON `{ items: FoodItem[] }` | JSON `{ message, foodLogIds, dailySummary }` | Zod `confirmSchema` |
| API → DB (food_logs) | Validated food items | SQL insert | 无（已校验） |
| food_logs → daily_summaries | food_logs row | SQL upsert | 幂等, 可重算 |

### 快照系统跨层数据流

```
                               ┌─────────────────────────────┐
                               │  food_logs 变更              │
                               │  (INSERT/UPDATE/DELETE)      │
                               └──────────┬──────────────────┘
                                          │
                                          ▼
                               ┌─────────────────────────────┐
                               │  recalculateDailySummary()   │
                               │  → upsert daily_summaries    │
                               └──────────┬──────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              ▼                           ▼                           ▼
   ┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
   │ Dashboard 今日视图   │     │ Cron 00:10 UTC     │     │ 按需补算             │
   │ (读 daily_summaries)│     │ → daily_snapshots  │     │ (Dashboard 打开时)   │
   └────────────────────┘     └────────────────────┘     └────────────────────┘
```

### 每日 Cron 流程

```
POST /api/cron/generate-daily-snapshots
  ↓
校验 Authorization: Bearer ${CRON_SECRET}
  ↓
查询所有活跃用户
  ↓
为昨天生成 daily_snapshots（跳过已存在的）
  ↓
查询所有活跃小队
  ↓
为昨天生成 team_daily_snapshots
  ↓
清理过期 invite codes
  ↓
清理过期 AI pending tasks
  ↓
清理过期临时图片
  ↓
返回 { userCount, teamCount, durationMs }
```

### 常见跨层问题

1. **日期格式不统一**：前端用 `2026-07-12`，DB 用 `DATE` 类型，API 用 `string`。统一用 `YYYY-MM-DD`。
2. **AI 返回 JSON 格式异常**：AI 可能返回 Markdown 包裹的 JSON 或格式错误的 JSON。Zod schema 校验必须在入库前完成。
3. **Snapshot 重复生成**：Cron 和按需补算可能同时运行。用 `UNIQUE(user_id, snapshot_date)` + `ON CONFLICT DO NOTHING` 防止重复。
4. **mealType 不匹配**：四种餐次的枚举值在前端、API、DB 三处必须完全一致（`breakfast | lunch | dinner | snack`）。
