# 前端开发规范

> 当前实现：Next.js App Router + React + TypeScript + Tailwind CSS（Y2K / Frutiger Aero 设计体系）

## 开发前检查清单

* [ ] 页面是否使用 Server Component 处理鉴权和首屏边界？
* [ ] 客户端组件是否只保留必要的表单/交互状态？
* [ ] 复杂数据流是否通过 Hook + API Client 层管理？
* [ ] API 输入/输出是否有对应的 TypeScript 类型或 Zod schema？
* [ ] 所有按钮是否有 disabled/loading 状态？
* [ ] 手机、平板、PC 是否都没有横向溢出？
* [ ] 用户数据是否只通过当前会话用户访问？
* [ ] 样式是否正确使用了 Y2K 玻璃质感组件类？（见 [样式规范](./styles.md)）
* [ ] 新增逻辑是否有对应的测试覆盖？（`npm run test`）

## 规范索引

| 文档 | 说明 | 状态 |
|---|---|---|
| [样式规范](./styles.md) | Tailwind CSS + Y2K 玻璃质感设计体系 | 已完成 |
| [目录结构](./directory-structure.md) | 当前页面和组件组织 | 已完成 |
| [组件规范](./component-guidelines.md) | Props、客户端组件、响应式 | 已完成 |
| [Hook 规范](./hook-guidelines.md) | 自定义 Hook 的约定和签名 | 已完成 |
| [状态管理](./state-management.md) | Server Component 与本地 state | 已完成 |
| [质量规范](./quality-guidelines.md) | lint、类型、测试、响应式检查 | 已完成 |
| [类型安全](./type-safety.md) | TypeScript 与 Zod | 已完成 |
