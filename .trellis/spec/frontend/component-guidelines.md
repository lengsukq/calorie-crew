# 组件规范

## 当前模式

* 页面默认是 Server Component；需要表单事件、`useState` 或 `useEffect` 时在组件顶部使用 `"use client"`。
* `AuthForm` 复用 `mode: "login" | "register"`，避免登录和注册复制两套表单。
* Server Component 负责数据获取，通过 props 把 `email`/`role`/`calorieTarget` 传给客户端组件。
* Today / Diary 的饮食记录展示复用 `MealGroup`，新增批量选择复用 `FoodLogForm`，编辑单条记录复用 `FoodLogManualForm`。
* Props 使用显式 `interface`；组件使用 named export。

## 响应式契约

`src/app/globals.css` 当前约定：

* 桌面侧栏：`lg>=1024px` 显示固定左侧栏 `w-64`
* 主内容区：`max-w-3xl` 居中，移动端 `px-4`
* `sm/640px`：grid 切换为 2 列
* `lg/1024px`：grid 切换为 3-4 列
* 不使用固定页面宽度，不允许横向滚动
* 需要根据断点切换交互容器时，使用 `useMediaQuery("(min-width: 768px)")` 或 CSS breakpoint，不在 render 期间直接读 `window.innerWidth`

## 状态

表单必须展示提交中、成功和失败状态。
保存失败时必须保留用户输入。批量新增表单的 `onSubmit` 失败应 throw，让 `FoodLogForm` 展示错误并保留已选食物；单条编辑表单由 `FoodLogManualForm` 展示错误并保留字段值。

## 弹窗规范

所有弹窗/Sheet 必须使用 shadcn/ui 或 Radix 组件：
* `Sheet`：移动端底部滑入 / 桌面右侧滑入，替换旧的 `BottomSheet` / `SlideOver`
* `Dialog`：居中弹窗
* `AlertDialog`：确认删除等危险操作，替换 `window.confirm`
* 必须自带 `role=dialog` / `aria-modal` / focus trap / ESC 关闭

## 反模式

* 不在 Server Component 中使用浏览器 API。
* 不把数据库连接、Session Secret 或邀请码放入客户端组件。
* 不把单条编辑能力塞进批量选择列表；编辑已有记录应使用专门的 Sheet/表单，避免快速添加和编辑状态混杂。
* 不用 emoji 做图标，统一使用 `lucide-react`。
* 不在组件类中写 `@apply` 引用其他组件类（Tailwind v4 限制）。
* 不写 `!` 强覆盖类名。
