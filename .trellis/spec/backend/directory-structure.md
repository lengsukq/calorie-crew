# 目录结构

## 当前布局

```text
src/
├── app/
│   ├── api/auth/                  # 注册、登录、登出、当前用户
│   ├── api/admin/invites/         # 管理员邀请码与使用审计
│   ├── api/dashboard/today/       # 今日汇总和记录
│   ├── api/food-logs/             # 饮食记录 CRUD
│   ├── dashboard/                 # Dashboard 页面
│   ├── login/                     # 登录页
│   ├── register/                  # 注册页
│   ├── globals.css                # 当前全局响应式 CSS
│   └── layout.tsx
├── components/
│   ├── auth/AuthForm.tsx           # 登录/注册表单
│   └── dashboard/Dashboard.tsx    # 当前 Dashboard 交互组件
└── lib/
    ├── auth/                       # 密码哈希和 JWT Cookie 会话
    ├── db/                        # Drizzle schema、client、migrations
    ├── services/                  # daily-summary.service.ts
    ├── validation/                # Zod 输入 schema
    ├── env.ts                     # 环境变量校验
    └── http.ts                    # 当前统一错误响应 helper
```

## 组织规则

* App Router 页面和 API 放在 `src/app`，API 路径直接对应 URL。
* 数据库 schema 不放在 API 路由内，统一放在 `src/lib/db/schema.ts`。
* 汇总逻辑放在 Service，路由负责鉴权、解析输入和调用 Service。
* 组件目前按功能放在 `src/components/auth` 和 `src/components/dashboard`；新增组件沿用 PascalCase 文件名。
* 当前项目尚未建立独立 `hooks/`、`types/` 或 `middleware.ts`，不要在规范中假设这些目录已经存在。

## 命名

* API 路径：kebab-case，例如 `/api/food-logs`。
* Service：`kebab-case.service.ts`，例如 `daily-summary.service.ts`。
* 数据库表/列：snake_case、复数表名。
* React 组件：PascalCase；函数和变量：camelCase。
