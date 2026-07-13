# 样式规范

> 当前实现：Tailwind CSS v4（CSS-first）+ shadcn/ui + 现代极简数据风

## 技术选型

- **CSS 框架**：Tailwind CSS v4（`@tailwindcss/postcss`）
- **设计系统**：shadcn/ui（Radix Primitives + CVA + Tailwind）
- **字体**：Inter（通过 `next/font/google` 引入）
- **图标**：lucide-react
- **设计 token**：CSS 变量（`src/app/globals.css` + `@theme inline`）

## 核心原则

1. **优先使用 Tailwind utility classes**，复杂组件才抽 `src/components/ui/`
2. **设计 token 统一在 `globals.css` 的 `:root` 中定义**，通过 `@theme inline` 映射为 Tailwind 颜色
3. **极简数据风**：白底 + 单一主色（cyan-600）+ slate 中性灰，强调数据可读性
4. **禁止在组件中写 `!` 强覆盖**，类名粒度要细到不需要覆盖
5. **所有交互组件必须由 shadcn/ui 或 Radix 提供**，保证可访问性（`role`/`aria-modal`/focus trap/ESC）

## 可用组件类

| 组件 | 位置 | 用途 |
|---|---|---|
| `Card` | `src/components/ui/card.tsx` | 通用卡片容器 |
| `Button` | `src/components/ui/button.tsx` | 按钮（cva variants） |
| `Input` / `Label` / `Textarea` | `src/components/ui/input.tsx` 等 | 表单原子 |
| `Sheet` | `src/components/ui/sheet.tsx` | 移动端底部 / 桌面右侧滑入 |
| `Dialog` | `src/components/ui/dialog.tsx` | 居中弹窗 |
| `AlertDialog` | `src/components/ui/alert-dialog.tsx` | 确认弹窗（替换 `window.confirm`） |
| `DropdownMenu` | `src/components/ui/dropdown-menu.tsx` | 下拉菜单 |
| `Tabs` | `src/components/ui/tabs.tsx` | 标签切换 |
| `Accordion` | `src/components/ui/accordion.tsx` | 手风琴折叠 |
| `Progress` | `src/components/ui/progress.tsx` | 进度条 |
| `Badge` | `src/components/ui/badge.tsx` | 标签/徽标 |
| `Skeleton` | `src/components/ui/skeleton.tsx` | 骨架屏 |
| `StatCard` | `src/components/shared/StatCard.tsx` | 统计指标卡 |
| `ListItem` | `src/components/shared/ListItem.tsx` | 列表行 |

## Tailwind 自定义扩展

在 `globals.css` 的 `@theme inline` 中定义：

| 类别 | Token | 说明 |
|---|---|---|
| 颜色 | `background/foreground/card/popover` | 基础语义色 |
| 颜色 | `primary/primary-foreground` | 主色：cyan-600 |
| 颜色 | `secondary/secondary-foreground` | 次要色 |
| 颜色 | `muted/muted-foreground` | 弱化色 |
| 颜色 | `accent/accent-foreground` | 强调色 |
| 颜色 | `destructive/destructive-foreground` | 危险色 |
| 颜色 | `border/input/ring` | 边框/输入/聚焦环 |
| 颜色 | `success/warning/danger` | 业务语义色 |
| 圆角 | `--radius: 0.75rem` | 全局圆角 |
| 字体 | `--font-sans` | Inter |

## 常用渐变/强调色

```
主色：primary / primary-foreground
成功：emerald-600 / emerald-50
警告：amber-600 / amber-50
危险：red-600 / red-50
紫色：purple-600
```

## 开发前检查清单（样式相关）

- [ ] 是否使用了 Tailwind utility classes 而非手写 CSS？
- [ ] 颜色是否使用了 `globals.css` 中的 CSS 变量 token？
- [ ] 按钮/输入/卡片是否使用了 shadcn/ui 组件？
- [ ] 是否避免了 `!` 强覆盖？
- [ ] 图标是否使用 lucide-react，而非 emoji？
- [ ] 是否适配了 sm/640px 和 lg/1024px 两个响应式断点？
- [ ] SVG 图表是否使用响应式 `viewBox` + `width="100%"`？
- [ ] 按钮是否有 disabled/loading 状态处理？
- [ ] 删除确认是否使用 AlertDialog，而非 `window.confirm`？
- [ ] Sheet/Dialog 是否由 Radix 提供（保证 a11y）？
