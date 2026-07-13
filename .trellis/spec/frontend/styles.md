# 样式规范

> 当前实现：Tailwind CSS + Y2K / Frutiger Aero 设计体系

## 技术选型

- **CSS 框架**：Tailwind CSS v4（Utility-first）
- **PostCSS**：`@tailwindcss/postcss`
- **字体**：Inter（通过 `next/font/google` 引入）
- **设计规范文档**：[`src/app/design-tokens.md`](../../src/app/design-tokens.md)

## 核心原则

1. **优先使用 Tailwind utility classes**，而非自定义 CSS
2. **自定义组件类**（如 `.glass-card`）仅在 `globals.css` 的 `@layer components` 中定义
3. **设计 token** 统一在 `tailwind.config.ts` 中扩展，不要硬编码色值
4. **浅色渐变背景 + Y2K 玻璃质感 + 渐变色彩** 是整体视觉基调
5. **禁止在 `@layer components` 中使用 `@apply` 引用其他组件类**（Tailwind v4 限制）

## 可用组件类

所有自定义类在 `src/app/globals.css` 的 `@layer components` 中定义：

| 类名 | 用途 | 变体 |
|---|---|---|
| `.glass-card` | 通用毛玻璃卡片 | `.glass-card-narrow`（窄版居中） |
| `.stat-card` | 指标卡（带图标容器） | — |
| `.icon-box` | 渐变色图标容器 | 配合 `bg-gradient-to-br from-*-* to-*-*` |
| `.glass-input` | 文本输入框 | 共用 `.glass-select`（下拉框） |
| `.glass-button-primary` | 主要渐变按钮 | — |
| `.glass-button` | 次要玻璃按钮 | `.glass-button-danger` |
| `.glass-tag` | 标签/徽标 | `.glass-tag-success` / `.glass-tag-warning` / `.glass-tag-error` |
| `.glass-message` | 消息提示 | `.glass-message-success` / `.glass-message-error` |
| `.glass-label` | 表单标签文本 | — |
| `.glass-divider` | 分割线 | — |
| `.list-item` | 列表行 | — |
| `.progress-bar` / `.progress-fill` | 进度条 | — |
| `.y2k-bubble` | 装饰浮动气泡 | — |
| `.y2k-logo` | 登录/注册等页面的 logo 圆形容器 | — |
| `.trend-up` / `.trend-down` | 趋势标签 | — |

## Logo 组件类

登录/注册等页面的 logo 圆形容器必须使用 `.y2k-logo` 组件类（定义在 `globals.css` 的 `@layer components`），不要在页面内重复内联一长串 Tailwind 工具类。这样可保证多个鉴权页面 logo 样式一致，并便于后续统一调整。

## 图表响应式规范

SVG 图表组件（如 `CalorieChart`、`WeightTrendChart`）必须使用响应式 `viewBox` + `width="100%"`，禁止用固定像素宽度配合 `overflow-x-auto` 兜底。固定宽度在长期数据（如 365 天）下会触发横向滚动，违反"不得出现横向滚动"规范。正确做法是让 SVG 通过 `viewBox` 自适应容器宽度，必要时在内部做数据抽样/聚合而非撑破容器。

## Tailwind 自定义扩展

在 `tailwind.config.ts` 中定义的扩展 token：

| 类别 | Token | 说明 |
|---|---|---|
| 颜色 | `y2k-*` | 霓虹色板（cyan, purple, pink, green 等） |
| 颜色 | `glass-*` | 玻璃半透明色板 |
| 圆角 | `rounded-y2k` (20px) / `rounded-y2k-sm` (12px) | 自定义圆角 |
| 阴影 | `shadow-y2k` / `y2k-card` / `y2k-hover` / `y2k-btn` / `y2k-btn-hover` / `y2k-icon` / `y2k-glow` | 毛玻璃 + 3D 质感阴影 |
| 动画 | `animate-float` | 气泡漂浮动画 |
| 动画 | `animate-slide-in` | 消息滑入动画 |

## 常用渐变组合

```
按钮/进度条:  from-cyan-400 to-blue-500
Logo 气泡:    from-cyan-400 via-blue-400 to-teal-400
热量指标:     from-cyan-400 to-blue-500
剩余热量:     from-amber-400 to-orange-500
蛋白质:       from-purple-400 to-pink-500
脂肪:         from-teal-400 to-emerald-500
```

## 开发前检查清单（样式相关）

- [ ] 是否使用了 Tailwind utility classes 而非手写 CSS？
- [ ] 自定义组件类是否在 `globals.css` 的 `@layer components` 中定义？
- [ ] 是否避免了在组件类中用 `@apply` 引用其他组件类？
- [ ] 颜色/阴影/圆角是否使用了 `tailwind.config.ts` 中的 token？
- [ ] 新组件是否遵循 Y2K 玻璃质感设计语言（白色半透明、渐变、内阴影）？
- [ ] 是否适配了 sm/640px 和 lg/1024px 两个响应式断点？
- [ ] 表单元素是否使用了 `.glass-input` 或 `.glass-select` 类？
- [ ] 鉴权页面的 logo 圆形容器是否使用了 `.y2k-logo` 组件类，而非内联一长串 Tailwind 工具类？
- [ ] SVG 图表是否使用响应式 `viewBox` + `width="100%"`，未用固定像素宽度 + `overflow-x-auto` 兜底？
- [ ] 按钮是否有 disabled/loading 状态处理？
- [ ] 文字层级是否符合设计规范（h1/h2/label/body/value）？
