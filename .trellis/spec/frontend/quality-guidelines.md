# 前端质量规范

## 当前实现基线

* TypeScript 使用 `strict: true`，质量门禁是 `npm run lint`、`npm run typecheck`、`npm run build`。
* 当前 UI 使用普通 CSS，不是 Tailwind。
* `AuthForm` 和 `Dashboard` 是客户端组件；`page.tsx` 负责服务端鉴权和页面组合。
* 当前 `Dashboard` 直接调用 API，这是首版现状；当页面继续增加功能时应抽出 Hook/API client。

## 响应式检查

* PC：默认 4 列、最大内容宽度 960px。
* Pad/窄屏：`max-width: 720px` 切换为 2 列。
* 手机：`max-width: 520px` 切换为单列，标题和按钮垂直排列。
* 页面不得出现横向滚动；表单控件必须适应容器宽度。

## 必须

* Props 使用显式 interface，组件使用 named export。
* 提交按钮有 pending/disabled 或可见结果反馈。
* 错误使用 `role="alert"` 或 `role="status"` 等可访问反馈。
* 不把服务端环境变量、密码、Token、数据库连接串放入客户端代码。

## 当前已知债务

* 尚未配置 Vitest、Testing Library 或 Playwright 测试套件。
* `Dashboard` 中有多处内联 API 请求和局部响应类型，后续应提取为共享类型和 Hook。
* 当前没有统一 UI 组件库；新增样式沿用 `globals.css` 的卡片、grid、stack 约定。
