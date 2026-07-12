# Design Tokens & Style Guide

> CalorieCrew 设计规范 · Y2K / Frutiger Aero 主题

## 设计理念

融合 Y2K 时代的美学与 Frutiger Aero 的玻璃质感，营造清新、活泼、带有一丝怀旧感的视觉体验。核心元素：

- **浅色渐变背景**（cyan-50 → blue-50 → teal-50）
- **毛玻璃卡片** 白色半透明（`rgba(255,255,255,0.7)`）+ `backdrop-blur(20px)`
- **渐变色按钮** 青色→蓝色 gradient + 药丸形状
- **3D 质感** 内阴影 + 外阴影双重叠加，模拟突起/凹陷
- **浮动装饰气泡** 半透明渐变 + 动画漂浮
- **渐变图标容器** 各指标卡使用不同配色的渐变 icon box

## 颜色体系

### 背景色

```css
--bg-gradient: linear-gradient(135deg, #ecfeff 0%, #eff6ff 40%, #f0fdfa 100%);
```

### 主色

| Token | 色值 | 用途 |
|---|---|---|
| `y2k-cyan` | `#01CDFE` | 霓虹青（强调色） |
| `y2k-purple` | `#B967FF` | 霓虹紫 |
| `y2k-pink` | `#FF71CE` | 霓虹粉 |
| `y2k-green` | `#7FFF00` | 未来绿 |
| `y2k-metal-blue` | `#4682B4` | 金属蓝 |
| `y2k-cyan-light` | `#B0E0E6` | 浅青色 |
| `y2k-pink-light` | `#FFB6C1` | 浅粉色 |
| `y2k-silver` | `#C0C0C0` | 金属银 |

### 玻璃色板

| Token | 值 | 用途 |
|---|---|---|
| `glass` (DEFAULT) | `rgba(255, 255, 255, 0.7)` | 卡片/元素背景 |
| `glass-light` | `rgba(255, 255, 255, 0.85)` | Hover 状态 |
| `glass-lighter` | `rgba(255, 255, 255, 0.5)` | 列表项背景 |
| `glass-border` | `rgba(255, 255, 255, 0.3)` | 卡片边框 |
| `glass-border-light` | `rgba(226, 232, 240, 0.3)` | 分隔线/弱边框 |

### 功能渐变

| 用途 | Gradient |
|---|---|
| 主要按钮 / 进度条 | `from-cyan-400 to-blue-500` |
| 热量指标卡 | `from-cyan-400 to-blue-500` |
| 剩余热量指标卡 | `from-amber-400 to-orange-500` |
| 蛋白质指标卡 | `from-purple-400 to-pink-500` |
| 脂肪指标卡 | `from-teal-400 to-emerald-500` |
| Logo 气泡 | `from-cyan-400 via-blue-400 to-teal-400` |

### 文字色

| Token | 用途 |
|---|---|
| `text-slate-800` (`#1e293b`) | 标题 |
| `text-slate-700` (`#334155`) | 正文主体 |
| `text-slate-500` (`#64748b`) | 标签、辅助信息 |
| `text-slate-400` (`#94a3b8`) | 占位符、极弱文字 |
| `text-cyan-600` (`#0891b2`) | 链接、强调数字 |
| `text-cyan-700` (`#0e7490`) | 链接 hover |

## 排版

| 层级 | Class / Token | Size | Weight | 用途 |
|---|---|---|---|---|
| h1 | `text-3xl font-black` + gradient | 30px | 900 | 页面大标题（渐变文字） |
| h2 | `text-xl font-bold` | 20px | 700 | 区块标题 |
| label | `text-xs font-semibold uppercase tracking-wider` | 12px | 600 | 表单标签（`.glass-label`） |
| body | `text-sm` | 14px | 400 | 正文 |
| meta | `text-xs` | 12px | 400 | 辅助信息 |
| value | `text-3xl font-black` | 30px | 900 | 指标卡数值 |
| code | `font-mono text-sm` | 14px | 400 | 邀请码等 |

**字体栈：** `Inter` (`next/font/google`) → `system-ui` → `sans-serif`

## 间距体系

| Class | 值 | 用途 |
|---|---|---|
| `gap-1.5` | 6px | label + input 间距 |
| `gap-2` | 8px | 紧凑间距 |
| `gap-3` | 12px | 次要间距 |
| `gap-4` | 16px | `stack` 默认间距 |
| `p-4` | 16px | header 内边距 |
| `p-5` | 20px | 指标卡内边距 |
| `p-6` | 24px | 卡片内边距（`.glass-card`） |

## 玻璃效果参数

| 属性 | 值 | 说明 |
|---|---|---|
| 背景透明度 | `0.7` (卡片) / `0.6` (输入框) / `0.5` (列表项) | 白色叠加层 |
| `backdrop-blur` | `20px` (卡片) / `10px` (输入框/按钮) | 模糊半径 |
| 边框（卡片） | `1px solid rgba(255,255,255,0.3)` | 白色半透边框 |
| 边框（输入框） | `1px solid rgba(6,182,212,0.2)` | 青色调边框 |
| 圆角（卡片） | `20px` | 大圆角 |
| 圆角（输入框） | `12px` | 中圆角 |
| 圆角（按钮） | `24px` / `rounded-3xl` | 药丸形 |
| 阴影（卡片） | `0 4px 16px rgba(0,0,0,0.05)` + 内阴影高光 | 柔和浮起 |
| 阴影（hover） | `0 12px 32px rgba(0,0,0,0.08)` + 内阴影 | 抬起增强 |
| 阴影（按钮） | `0 4px 16px rgba(6,182,212,0.3)` + 内阴影 | 发光 |
| 阴影（图标容器） | `0 4px 12px rgba(0,0,0,0.15)` + 内阴影 | 3D 质感 |

## 组件规范

### `.glass-card`

- 通用毛玻璃卡片，`border-radius: 20px`
- Hover: `translateY(-2px)` 轻微上浮

### `.stat-card`

- 指标卡，带 `.icon-box` 图标容器
- Hover: `translateY(-4px)` 上浮更明显

### `.icon-box`

- 52x52px 渐变圆角容器，带 3D 阴影质感
- 内部放置 emoji 图标

### `.glass-input` / `.glass-select`

- 聚焦态：青色边框 + 3px 青色发光 `box-shadow`
- 占位符：`#94a3b8`

### `.glass-button-primary`

- 青色→蓝色渐变色药丸按钮
- 内阴影模拟 3D 凸起，外阴影发光
- Hover: `translateY(-2px)` + 阴影增强

### `.glass-button`

- 白色半透明药丸按钮，青色边框
- Hover: `translateY(-2px)` + 边框加深

### `.glass-tag` 系列

| 类 | 色系 |
|---|---|
| `glass-tag` | slate 灰 |
| `glass-tag-success` | emerald 绿 |
| `glass-tag-warning` | amber 黄 |
| `glass-tag-error` | red 红 |

### `.glass-message` 系列

| 类 | 色系 |
|---|---|
| `glass-message` | slate 灰 |
| `glass-message-success` | emerald 绿 |
| `glass-message-error` | red 红 |

### `.y2k-bubble`

- 全页面装饰性浮动气泡
- 半透明渐变、`backdrop-blur`、白色边框
- `y2k-float` 关键帧动画（上下浮动 6s）

### `.list-item`

- 列表项容器，Hover 时 `translateX(4px)` 右移

## 响应式断点

| 断点 | 宽度 | 变化 |
|---|---|---|
| `sm` | `640px` | 表单 1 列 → 2 列 |
| `lg` | `1024px` | 指标卡 2 列 → 4 列 |

## Tailwind 自定义扩展

```
colors: { y2k: { cyan, purple, pink, green, ... }, glass: { DEFAULT, light, ... } }
borderRadius: { y2k: 20px, y2k-sm: 12px }
boxShadow: { y2k, y2k-card, y2k-hover, y2k-btn, y2k-btn-hover, y2k-icon, y2k-glow }
keyframes: { float, slide-in }
animation: { float, slide-in }
```
