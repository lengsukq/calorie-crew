# Hook 规范

## 当前实现

项目在 `src/hooks/` 目录下已有以下自定义 Hook：

| Hook | 用途 | 所属页面 |
|---|---|---|
| `useFoodLogs` | 按日期获取饮食记录、新增/删除/更新操作 | Diary / Today |
| `useSummary` | 获取今日汇总 + 日志列表 | Today |
| `useHistory` | 获取历史汇总数据 (7/30天) | Progress |
| `useUserTarget` | 更新每日热量目标 | Profile |
| `useMediaQuery` | 响应媒体查询变化，用于移动端 BottomSheet 与桌面 SlideOver 切换 | Today / Diary |
| `useWeightLogs` / `useWaterLogs` / `useExerciseLogs` / `useSleepLogs` / `useBodyMeasurements` | 按日期范围获取健康日志、保存/删除 | Diary / Today / Progress |
| `useAiAdvice` | AI 建议列表、生成、完成、屏蔽、反馈、重新激活 | 多处 |
| `useRecentFoods` | localStorage 最近食物快增 | Today |

所有数据请求型 Hook 遵循统一规范，并明确区分为两类：

- **数据请求型 Hook**：必须返回 `{ data, loading, error, reload }` 统一签名。`data` 为统一字段名，不再使用 `logs`/`summary`/`advices` 等业务命名。动作方法（如 `addLog`/`saveLog`/`removeLog`/`generate`/`remove`/`complete`/`dismiss`/`feedback`）作为附加字段，命名使用动词短语。当返回包含多个数据实体时，`data` 可以是对象，如 `data: { summary, logs }`。
- **工具型 Hook**（如 `useMediaQuery`/`useFoodSearch`/`useRecentFoods`）：允许自定义签名，但必须在文件头用注释 `// 工具型 Hook，不遵循统一数据请求签名` 声明豁免。

两类 Hook 共同要求：
- 通过 `src/lib/api/` 层调用后端 API，不在 Hook 中直接写 `fetch`
- 使用 `useCallback` 包裹加载函数，`useEffect` 触发初始化加载
- 错误状态可展示（不 throw，不 console.error 了之）
- 变更型 Hook 方法可以向调用方 throw 可展示错误，调用方负责 toast 或表单错误；Hook 自身仍维护加载错误状态

## date-range Hook 工厂

健康日志（weight/water/sleep/exercise/body）使用 `src/hooks/createDateRangeLogHook.ts` 工厂生成，避免 5 份复制粘贴。工厂统一了 load/save/remove 的错误规范化与 reload 时机。薄包装 hook 可暴露别名（如 `useWaterLogs` 暴露 `addLog = saveLog`）以兼容旧调用方。新增同类日志资源时优先用工厂，不要手写一遍 load/save/remove 模板。

## AI 建议 Hook

`useAiAdvice` 是 AI 建议的唯一前端入口：`generate` / `remove` / `complete` / `dismiss` / `feedback` / `reactivate` 全部走 hook。`AiAdviceCard` 等组件不得直调 `@/lib/api/ai-advice`，避免出现「半吊子封装」——调用方不知道该走 hook 还是 api。

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
