# 组件规范

## 当前模式

* 页面默认是 Server Component；需要表单事件、`useState` 或 `useEffect` 时在组件顶部使用 `"use client"`。
* `AuthForm` 复用 `mode: "login" | "register"`，避免登录和注册复制两套表单。
* `Dashboard` 接收 `email`、`role` Props，负责当前首版的记录表单、汇总展示和管理员邀请码操作。
* Today / Diary 的饮食记录展示复用 `MealGroup`，新增批量选择复用 `FoodLogForm`，编辑单条记录复用 `FoodLogManualForm`。
* Props 使用显式 `interface`；组件使用 named export。

## 响应式契约

`src/app/globals.css` 当前约定：

* 默认桌面宽度：`main` 最大 960px，指标/表单使用 4 列 grid。
* `max-width: 720px`：grid 切换为 2 列，适配平板和窄屏。
* `max-width: 520px`：单列布局、缩小内边距、标题区域纵向排列，适配手机。
* 不使用固定页面宽度，不允许横向滚动。
* 需要根据断点切换交互容器时，使用 `useMediaQuery("(min-width: 768px)")` 或 CSS breakpoint，不在 render 期间直接读 `window.innerWidth`。

## 状态

表单必须展示提交中、成功和失败状态；当前 `AuthForm` 使用 `pending`，Dashboard 使用 `message`。
保存失败时必须保留用户输入。批量新增表单的 `onSubmit` 失败应 throw，让 `FoodLogForm` 展示错误并保留已选食物；单条编辑表单由 `FoodLogManualForm` 展示错误并保留字段值。

## 反模式

* 不在 Server Component 中使用浏览器 API。
* 不把数据库连接、Session Secret 或邀请码放入客户端组件。
* 新增复杂功能时不要继续扩大 `Dashboard.tsx`；应拆分成领域组件。
* 不把单条编辑能力塞进批量选择列表；编辑已有记录应使用专门的手动表单，避免快速添加和编辑状态混杂。
