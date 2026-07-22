# Design Tokens & Style Guide

> CalorieCrew 设计规范 · 现代极简数据风

## 设计理念

以「清晰、克制、数据优先」为核心的现代极简风格，服务于卡路里记录这一高频日常场景：

- **白底 + 单一青蓝主色**：视觉收敛，避免多色干扰，让数据本身成为主角
- **语义化令牌**：所有颜色通过 CSS 变量引用，禁止在组件中硬编码 `text-slate-*` / `bg-cyan-*` 等具体色值
- **原生暗色模式**：基于 `next-themes`（`attribute="class"`）+ `.dark` 变量集，亮 / 暗 / 系统三态切换
- **卡片层次**：轻阴影 + 细边框表达层级，暗色下依赖背景色差异而非阴影
- **数据等宽对齐**：统计数值统一使用 `tabular-nums`

## 主题基础设施

| 项 | 说明 |
|---|---|
| 方案 | `next-themes`，`attribute="class"`，`defaultTheme="system"`，`enableSystem` |
| 包裹位置 | `src/app/layout.tsx` → `ThemeProvider`（`src/components/theme-provider.tsx`） |
| 暗色变体 | `@custom-variant dark (&:is(.dark *))` |
| 切换入口 | TopBar 右侧 Sun / Moon 按钮（亮 ↔ 暗 toggle） |
| 防闪烁 | 切换按钮在 `mounted` 后才渲染图标，避免 hydration 错位 |

## 颜色体系（语义令牌）

所有令牌定义于 `src/app/globals.css` 的 `:root` 与 `.dark`，并在 `@theme inline` 中注册为 Tailwind 工具类（`bg-*` / `text-*` / `border-*`）。

### 基础令牌

| Token | 亮色 | 暗色 | 用途 |
|---|---|---|---|
| `--background` | `0 0% 100%` | `222 47% 11%` | 页面背景 |
| `--foreground` | `222 47% 11%` | `210 40% 98%` | 主文字 |
| `--card` | `0 0% 100%` | `222 47% 13%` | 卡片背景 |
| `--primary` | `192 81% 40%` | `192 81% 45%` | 主色（青蓝，cyan-600 附近） |
| `--muted` | `210 40% 96%` | `217 33% 20%` | 弱背景（占位 / 分组） |
| `--muted-foreground` | `215 16% 47%` | `215 20% 65%` | 辅助文字 |
| `--border` | `214 32% 91%` | `217 33% 25%` | 边框 / 分隔线 |
| `--destructive` | `0 72% 51%` | `0 63% 50%` | 危险操作 |

### 业务语义色

| Token | 亮色 | 暗色 | 用途 |
|---|---|---|---|
| `--success` | `142 71% 45%` | `142 71% 45%` | 达标 / 有用 / 已完成 |
| `--warning` | `38 92% 50%` | `38 92% 50%` | 过期 / 提醒 |
| `--danger` | `0 72% 51%` | `0 63% 50%` | 超标 / 无用 / 错误 |

**透明度写法**：浅色底徽章统一用 `bg-{token}/10 text-{token}`（如 `bg-success/10 text-success`），暗色下自动适配，无需额外处理。

### 图表配色

| Token | 亮色 | 暗色 | 语义 |
|---|---|---|---|
| `--chart-1` | `192 81% 40%` | `192 81% 50%` | 青（主数据色：热量 / 体重 / 饮水） |
| `--chart-2` | `142 71% 45%` | `142 71% 50%` | 绿（脂肪 / 8h 睡眠线 / 臀围） |
| `--chart-3` | `38 92% 50%` | `38 92% 55%` | 琥珀（碳水 / 目标线 / 臂围） |
| `--chart-4` | `262 83% 58%` | `262 83% 65%` | 紫（蛋白质 / 睡眠主线 / 腰围） |
| `--chart-5` | `215 16% 47%` | `215 20% 65%` | 中性灰蓝（腿围） |
| `--chart-grid` | `214 32% 91%` | `217 33% 25%` | 图表网格 / 轴线 |
| `--chart-label` | `215 16% 47%` | `215 20% 65%` | 图表轴标签文字 |

**SVG 图表规则**：标签 `fill="hsl(var(--chart-label))"`、网格 `stroke="hsl(var(--chart-grid))"`、数据点描边 `stroke="hsl(var(--card))"`、数据色 `hsl(var(--chart-1~5))`。

## 阴影与渐变

| Token | 亮色 | 暗色 | 用途 |
|---|---|---|---|
| `--card-shadow` | `0 1px 3px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.03)` | `0 1px 2px rgba(0,0,0,.2)` | Card 默认阴影（工具类 `shadow-card`） |
| `--card-shadow-hover` | `0 2px 6px rgba(0,0,0,.05), 0 8px 24px rgba(0,0,0,.06)` | `0 2px 8px rgba(0,0,0,.3)` | 可交互卡片 hover（`shadow-card-hover`） |
| `--ring-start` / `--ring-end` | `187 92% 55%` → `217 91% 60%` | 提亮版 | 热量环正常渐变（青 → 蓝） |
| `--ring-over-start` / `--ring-over-end` | `0 84% 60%` → `15 75% 55%` | 提亮版 | 热量环超标渐变（红 → 橙红） |

- 暗色下 Card 主要依赖 `border` + 背景色差异表达层次，阴影减弱
- 可交互卡片 hover 时叠加 `border-primary/20` 微亮

## 排版

| 层级 | Class | 用途 |
|---|---|---|
| 页面标题 | `text-xl font-bold` | 页面级标题（TopBar 已显示日期，标题在内容区） |
| 卡片标题 | `text-sm font-semibold`（CardTitle） | 卡片区块标题 |
| 关键数值 | `text-3xl font-black tabular-nums` | 热量环中心数字 |
| 统计数值 | `text-xl font-bold tabular-nums` | StatCard / StatBox 数值 |
| 正文 | `text-sm` | 主体内容 |
| 标签 / 辅助 | `text-xs` / `text-[11px]` + `text-muted-foreground` | 标签、单位、说明 |

**字体栈：** `Inter`（`next/font/google`）→ `system-ui` → `sans-serif`

## 布局规范

| 项 | 值 | 说明 |
|---|---|---|
| 内容区宽度 | `max-w-5xl` | `(tabs)/layout.tsx` 统一控制 |
| 今日页（桌面 lg+） | `grid-cols-[360px_1fr]` 双栏 | 左栏概览 + 健康追踪（sticky），右栏餐食列表 + 快捷添加 + AI 建议 |
| 今日页左栏 | `lg:sticky lg:top-24 self-start` | 滚动时热量概览始终可见 |
| 今日页（移动） | 单列：概览 → 餐食 → 追踪 | 操作优先，餐食列表紧随概览 |
| 页面间距 | `.stack`（`grid gap-4`） | 页面级垂直间距 |
| 卡片内边距 | `p-6`（CardHeader / CardContent） | shadcn Card 默认 |

## 组件规范

| 组件 | 位置 | 要点 |
|---|---|---|
| `Card` | `ui/card.tsx` | `rounded-xl border bg-card shadow-card`，暗色靠边框分层 |
| `TrackerCard` | `shared/TrackerCard.tsx` | 健康追踪摘要卡，`grid-template-rows` 展开 / 收起动画 |
| `Segmented` | `ui/segmented.tsx` | 分段控制器，容器 `bg-muted rounded-lg p-1`，选中 `bg-background shadow-sm` |
| `StatCard` | `shared/StatCard.tsx` | 进度条用 `bg-{accent}`（非 `text-*`），`transition-[width] duration-500` |
| `EmptyState` | `progress/ProgressParts.tsx` | 圆形图标容器 `rounded-full bg-muted p-3` + `font-medium` 主文案 + 可选 `hint` |
| `QuickAddButton` | `shared/QuickAddButton.tsx` | `shadow-lg shadow-primary/25`，hover 图标 `rotate-90` |
| `CalorieRing` | `today/CalorieRing.tsx` | SVG `linearGradient` 进度弧，`size` 可调，中心 `font-black` |
| `Badge` | `ui/badge.tsx` | `success` / `warning` / `danger` variants 用 `bg-{token}/15 text-{token}` |

## 动效

| 场景 | 实现 |
|---|---|
| 页面进入 | `.page-enter` → `page-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)` |
| TrackerCard 展开 | `grid-rows-[0fr] ↔ grid-rows-[1fr]` + `transition-[grid-template-rows]` |
| 进度条填充 | `transition-[width] duration-500 ease-out` |
| 热量环填充 | `transition: stroke-dashoffset 0.6s ease-in-out` |
| QuickAdd hover | 图标 `group-hover:rotate-90` + `duration-300` |

## 响应式断点

| 断点 | 宽度 | 变化 |
|---|---|---|
| `sm` | `640px` | 统计卡 2 列 → 4 列，表单分列 |
| `md` | `768px` | 进度页睡眠 / 身体数据双列 |
| `lg` | `1024px` | 今日页单列 → 仪表盘双栏 |

## 开发约定

1. **禁止硬编码颜色**：不使用 `text-slate-*` / `bg-cyan-*` / `#hex` 等，一律用语义令牌
2. **新增颜色需求**：优先复用现有令牌；确需新增时，在 `:root` 与 `.dark` 同时定义并注册到 `@theme inline`
3. **图表新增数据色**：从 `--chart-1~5` 中选取，保持跨图表语义一致（如目标线恒为 `chart-3`）
4. **可交互元素**：hover 态统一用 `hover:text-foreground` / `border-primary/20` 微亮，不做大幅位移
