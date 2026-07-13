# 目录结构

## 当前布局

```text
src/
├── app/
│   ├── api/auth/                  # 注册、登录、登出、当前用户
│   ├── api/admin/invites/         # 管理员邀请码与使用审计
│   ├── api/ai/                    # AI 建议、配置、识别
│   ├── api/body-measurements/     # 围度记录
│   ├── api/dashboard/             # 今日与历史汇总
│   ├── api/exercise-logs/         # 运动记录
│   ├── api/food-logs/             # 饮食记录 CRUD + batch
│   ├── api/profile/               # 个人资料
│   ├── api/sleep-logs/            # 睡眠记录
│   ├── api/users/                 # 用户目标
│   ├── api/water-logs/            # 饮水记录
│   ├── api/weight-logs/           # 体重记录
│   ├── (auth)/                    # 登录/注册页面
│   ├── (tabs)/                    # today / diary / progress / profile
│   ├── globals.css                # 全局响应式 CSS
│   └── layout.tsx
├── components/                    # 按 feature 分子目录
├── hooks/                         # 数据请求与工具 Hook
├── lib/
│   ├── api/                       # 前端 API 客户端（按资源分文件）
│   ├── api-route.ts              # 路由共用 helper：鉴权、解析、错误兜底
│   ├── auth/                      # 密码哈希和 JWT Cookie 会话
│   ├── db/                        # Drizzle schema、client、migrations
│   ├── mappers/                   # entry→formdata 等映射纯函数
│   ├── services/                  # 按资源拆分的 service（food-log / water-log / sleep-log / body-measurement / weight-log / exercise-log / ai-advice / profile / ...）
│   ├── stats/                     # 历史统计纯函数（streak / on-target / week comparison）
│   ├── ui/                        # UI 工具（with-toast-action）
│   ├── validation/                # Zod 输入 schema
│   ├── env.ts                     # 环境变量校验
│   ├── http.ts                    # jsonError helper
│   └── date.ts                    # 本地日期工具
├── shared/
│   ├── types.ts                   # 前后端共享 Entry / FormData 类型（唯一源）
│   └── constants.ts               # 标签、宏量比例、KCAL_PER_GRAM 等
└── middleware.ts
```

## 组织规则

* App Router 页面和 API 放在 `src/app`，API 路径直接对应 URL。
* 数据库 schema 不放在 API 路由内，统一放在 `src/lib/db/schema.ts`。
* API 路由只做：鉴权（`requireSessionUserId`）→ 解析（Zod / `parseDateRangeSearchParams` / `parseJsonBody`）→ 调 service → `Response.json` / `jsonError`。禁止在路由内直接 `db.*`。
* service 按资源一个文件：`food-log.service.ts`、`water-log.service.ts`、`sleep-log.service.ts`、`body-measurement.service.ts`、`weight-log.service.ts`、`exercise-log.service.ts`。不要把多个资源的 CRUD 塞进同一文件。
* 共享类型只在 `src/shared/types.ts` 定义；API 客户端不得本地重复声明 Entry interface。
* 纯计算（映射、统计、duplicate key）放 `src/lib/mappers` / `src/lib/stats` / 同资源 `.duplicate-key.ts`，便于单测、避免 import 副作用。
* 组件按 feature 放在 `src/components/<feature>/`，PascalCase 文件名。

## 命名

* API 路径：kebab-case，例如 `/api/food-logs`。
* Service：`kebab-case.service.ts`，例如 `water-log.service.ts`。
* 数据库表/列：snake_case、复数表名。
* React 组件：PascalCase；函数和变量：camelCase。
