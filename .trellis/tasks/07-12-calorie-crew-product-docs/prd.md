# CalorieCrew 第一阶段：产品与 MVP 定义

## Goal

明确 CalorieCrew 第一阶段的核心用户、最小可用闭环、技术边界和验收标准，并记录当前首版代码与剩余差距。

## What I already know

* 用户希望项目从零开始推进，并先了解如何启动第一阶段。
* 当前仓库已具备 Next.js App Router、React、TypeScript、Neon PostgreSQL 和 Drizzle 的首版代码骨架。
* 前端当前使用普通 CSS 响应式布局，尚未接入 Tailwind。
* 现有任务目录为 `07-12-calorie-crew-product-docs`，状态为 `in_progress`。

## Assumptions (temporary)

* CalorieCrew 的核心价值围绕饮食记录和热量/营养统计展开，餐次识别是后续能力。
* 仓库已有架构文档明确划分：第一阶段手动记录，第二阶段 AI 拍照识别，第三阶段历史快照与趋势，第四阶段小队功能。
* 第一阶段交付物包含产品文档、可运行页面/API 骨架和数据库迁移文件。
* 当前迁移文件已生成，但尚未执行到 Neon 数据库。

## Open Questions

* [ ] 用户填写 `.env.local` 后，确认是否执行 `npm run db:push` 到 Neon。

## Requirements (evolving)

* 明确目标用户、使用场景和核心痛点。
* 从候选能力中收敛出一个首版 MVP：记录方式、营养统计、餐次/日期视图、识别能力的取舍。
* 明确第一阶段不做的能力，避免在项目刚开始时范围膨胀。
* 为 MVP 写出可验证的用户流程、数据对象和验收标准。
* 已完成首版实现，并将真实代码模式同步到 `.trellis/spec/`。

## Confirmed auth scope

* 第一阶段包含邮箱/密码注册、登录、登出和受保护页面。
* 第一位注册者为管理员，后续用户为普通成员；不引入更多角色层级。
* `food_logs`、`daily_summaries` 必须通过当前登录用户隔离，用户不能读取或修改他人的数据。
* 数据库连接使用本地环境变量 `DATABASE_URL`；连接串不得写入仓库、PRD、日志或提交记录。
* 不在本阶段加入 OAuth、邮箱验证、找回密码、团队权限或复杂后台管理；当前仅提供基础邀请码管理 UI/API。

## MVP Scope (Phase 1)

### Included

* 手动新增一条饮食记录：餐次、食物名称、份量、热量、蛋白质、碳水、脂肪。
* 查看今日的早餐、午餐、晚餐、零食四个餐次及各自记录；日期切换列入下一步。
* 展示每日总热量、剩余热量和三大营养素汇总。
* 删除饮食记录，并在每次新增/删除后重算每日汇总；编辑接口列入下一步补齐项。
* 使用 `food_logs` 作为事实来源，使用 `daily_summaries` 作为可重算的实时汇总。

### User flow

1. 用户打开今日 Dashboard，看到四餐为空状态和每日汇总。
2. 用户选择餐次并填写食物与营养数据，提交后看到记录出现在对应餐次。
3. Dashboard 的每日总量、剩余热量和营养素同步更新。
4. 用户删除记录后，页面显示更新后的结果；保存失败时展示可理解的错误。

### Explicitly out of Phase 1

* AI 设置、图片上传、拍照识别、待确认记录。
* `daily_snapshots`、Cron、7/30 天趋势和 Progress 页面。
* 小队、社交、提醒、评论和排行榜。

## Decision (ADR-lite)

**Context**: 项目是空仓库，需要先验证最基本的记录和反馈闭环；AI、趋势和社交都会扩大数据模型与跨层复杂度。

**Decision**: 采用手动记录优先的 Phase 1。先建立 `food_logs`、`daily_summaries` 和今日 Dashboard，再在后续阶段叠加 AI 和历史快照。

**Consequences**: 第一阶段暂不体现 AI 识别能力，但数据事实来源和汇总契约会先稳定下来，后续 AI 可复用确认后的 `food_logs` 流程。

## Phase 2 implementation order

1. ✅ 初始化 Next.js App Router、TypeScript、普通 CSS、数据库客户端及环境变量校验。
2. ✅ 建立认证、邀请码、`users`、`food_logs`、`daily_summaries` schema 和迁移。
3. ✅ 实现登录、注册、邀请码、手动新增和删除记录。
4. ✅ 实现 `recalculateDailySummary(userId, date)`，写入/删除后幂等重算。
5. ✅ 实现今日 Dashboard 和响应式布局。
6. ⏳ 补齐编辑接口、日期切换、自动化测试和真实数据库迁移。

## Technical contract for Phase 2

* `food_logs` 是饮食事实数据，不能把汇总表当作唯一事实来源。
* `daily_summaries` 必须具备 `(user_id, log_date)` 唯一约束，并通过 upsert/重算维护。
* 餐次枚举固定为 `breakfast`、`lunch`、`dinner`、`snack`。
* 热量使用整数 kcal；蛋白质、碳水、脂肪使用克数并保留合理精度。
* 所有表单和 API 输入都必须做 schema 校验；当前错误响应为 `{ error: string }`。
* Dashboard 和登录/注册页面采用响应式布局：手机单列、平板双列、PC 多列；不依赖固定宽度或横向滚动。

## Acceptance Criteria (evolving)

* [x] 产品文档能用一句话说明目标用户和核心价值。
* [x] 至少一个端到端 MVP 用户流程已定义，并包含成功/失败状态。
* [x] MVP 范围、Out of Scope 和后续候选能力已明确。
* [x] 主要数据对象和跨层边界已列出，足以拆分实现任务。
* [x] 已形成 Phase 2 可执行的实现顺序和验收清单。
* [x] 用户确认需要登录；首个用户为管理员，后续用户通过可追溯邀请码加入。
* [x] 用户确认本地数据库通过 `DATABASE_URL` 环境变量接入。
* [x] 代码规范已根据当前实现同步到 `.trellis/spec/`。
* [ ] 编辑记录、日期切换、自动化测试和 Neon 迁移已完成。

## Definition of Done (team quality bar)

* 需求结论已通过用户确认并写入本文档。
* 当前实现模式和契约已持久化到 `.trellis/spec/`。
* `implement.jsonl` 和 `check.jsonl` 已配置实际需要的规范/研究文件。
* 任务状态已切换到 `in_progress`，后续差距按实现任务继续推进。

## Out of Scope (initial)

* AI 拍照识别、历史快照、Cron、小队和趋势页面。
* 一开始同时实现社交、商城、复杂个性化推荐、后台运营等扩展能力。
* 在没有明确数据/隐私需求前接入真实用户数据或第三方账号体系。

## Technical Notes

* 当前仓库基线：`fbde303 Initial commit: project scaffolding`。
* 相关规范入口：`.trellis/spec/backend/index.md`、`.trellis/spec/frontend/index.md`、`.trellis/spec/guides/index.md`。
* 当前工作树包含首版代码、迁移、环境变量示例和同步后的 Trellis 规范文档。
