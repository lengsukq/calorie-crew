# 前端质量规范

## 当前实现基线

- TypeScript 使用 `strict: true`，质量门禁是 `npm run lint`、`npm run typecheck`、`npm run build`、`npm run test`
- 使用 Y2K / Frutiger Aero 玻璃质感设计体系（定义在 `globals.css` 的 `@layer components`）
- 页面使用 Server Component 处理鉴权；客户端组件仅保留表单/交互状态
- API 请求通过 `src/lib/api/` 客户端层统一管理，业务逻辑通过 `src/hooks/` 自定义 Hook 复用
- 测试使用 Vitest + React Testing Library + jsdom

## 响应式检查

- 手机 (<768px): 底部 Tab + 单列内容
- 平板 (768-1024px): 左侧图标侧边栏
- 桌面 (>1024px): 左侧展开侧边栏 + 最大宽度 max-w-5xl
- 页面不得出现横向滚动；表单控件必须适应容器宽度

## 必须

- Props 使用显式 interface，组件使用 named export
- 提交按钮有 pending/disabled 或可见结果反馈
- 错误使用 `role="alert"` 或 `role="status"` 等可访问反馈
- 不把服务端环境变量、密码、Token、数据库连接串放入客户端代码
- Hook 使用 `"use client"` 指令，返回 `{ data, loading, error, reload }` 统一签名

## 测试规范

- 测试文件放在与被测文件同目录下，以 `.test.ts` / `.test.tsx` 结尾
- 使用 `describe` / `it` 组织用例
- Mock 外部依赖使用 `vi.spyOn`，测试后 `vi.restoreAllMocks()`
- 组件测试使用 `@testing-library/react` 的 `render` + `screen` API
- 避免测试实现细节，优先测试用户可见行为

## 当前已知债务

- 无 E2E 测试（Playwright 未配置）
- 无视觉回归测试
- 管理员面板向后端硬编码了 `/api/admin/invites` URL
