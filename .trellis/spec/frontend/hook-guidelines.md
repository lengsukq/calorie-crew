# Hook 规范

## 当前实现

项目在 `src/hooks/` 目录下已有以下自定义 Hook：

| Hook | 用途 | 所属页面 |
|---|---|---|
| `useFoodLogs` | 按日期获取饮食记录、新增/删除/更新操作 | Diary / Today |
| `useSummary` | 获取今日汇总 + 日志列表 | Today |
| `useHistory` | 获取历史汇总数据 (7/30/365天) | Progress |
| `useUserTarget` | 更新每日热量目标 | Profile |
| `useMediaQuery` | 响应媒体查询变化，用于 Sheet 方向切换 | 多处 |
| `useWeightLogs` / `useWaterLogs` / `useExerciseLogs` / `useSleepLogs` / `useBodyMeasurements` | 按日期范围获取健康日志、保存/删除 | Diary / Today / Progress |
| `useAiAdvice` | AI 建议列表、生成、完成、屏蔽、反馈、重新激活 | 多处 |
| `useRecentFoods` | localStorage 最近食物快增 | Today |
| `useResourceForm` | 通用表单状态管理（提交中/错误/重置） | 多处卡片 |
| `useConfirm` | 命令式确认弹窗 | 多处删除操作 |

## 数据请求型 Hook 签名规范

必须返回 `{ data, loading, error, reload }` 统一签名。`data` 为统一字段名，不再使用 `logs`/`summary`/`advices` 等业务命名。动作方法（如 `addLog`/`saveLog`/`removeLog`/`generate`/`remove`/`complete`/`dismiss`/`feedback`/`reactivate`）作为附加字段，命名使用动词短语。当返回包含多个数据实体时，`data` 可以是对象，如 `data: { summary, logs }`。

## 乐观更新规范

删除和快速添加使用乐观更新：
- `removeLog`：先从 `data` 中移除该项，再调 API；失败回滚 `data` 并 toast.error
- `addLog`/快速添加：同上乐观插入，失败回滚
- 新增/编辑表单提交：仍 `await + reload`，不乐观（避免临时 id 与服务端 id 不一致带来的编辑冲突）

## 工厂 Hook

健康日志（weight/water/sleep/exercise/body）使用 `src/hooks/createDateRangeLogHook.ts` 工厂生成，避免 5 份复制粘贴。工厂统一了 load/save/remove 的错误规范化与 reload 时机。薄包装 hook 可暴露别名（如 `useWaterLogs` 暴露 `addLog = saveLog`）以兼容旧调用方。新增同类日志资源时优先用工厂，不要手写一遍 load/save/remove 模板。

## AI 建议 Hook

`useAiAdvice` 是 AI 建议的唯一前端入口：`generate` / `remove` / `complete` / `dismiss` / `feedback` / `reactivate` 全部走 hook。`AiAdviceCard` 等组件不得直调 `@/lib/api/ai-advice`，避免出现「半吊子封装」——调用方不知道该走 hook 还是 api。

## 工具型 Hook

工具型 Hook（如 `useMediaQuery`/`useFoodSearch`/`useRecentFoods`/`useResourceForm`/`useConfirm`）允许自定义签名，但必须在文件头用注释 `// 工具型 Hook，不遵循统一数据请求签名` 声明豁免。

## 新增 Hook 的原则

当两个或更多组件共享以下逻辑时，抽取 Hook：

- 同类型 API 数据获取和刷新
- 相同表单提交/验证逻辑
- 跨组件共享的客户端状态

## Hook 签名规范

```typescript
interface UseXxxOptions {
  // 必填参数尽量用具名字段，不用位置参数
}

interface UseXxxReturn {
  data: XxxData[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  // 动作方法作为附加字段，用动词短语命名
  addXxx?: (input: XxxInput) => Promise<void>;
  removeXxx?: (id: string) => Promise<void>;
}
```

## 注意事项

- 不在条件语句中调用 Hook
- 不用 Hook 保存可由 API 响应直接派生的数据
- 数据请求型 Hook 的 `data` 字段名不可改为业务命名（如 `logs`），以保证跨 Hook 一致性；多实体场景使用 `data: { summary, logs }` 对象形态
- 数据请求失败必须返回可展示的错误状态
- Hook 使用 `"use client"` 指令表明客户端边界
- 不在 render 阶段直接读取 `window.innerWidth`；响应式分支应使用 `useMediaQuery` 或 CSS breakpoint 控制
