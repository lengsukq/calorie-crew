# Hook 规范

## 当前实现

项目在 `src/hooks/` 目录下已有以下自定义 Hook：

| Hook | 用途 | 所属页面 |
|---|---|---|
| `useFoodLogs` | 按日期获取饮食记录、新增/删除操作 | Diary |
| `useSummary` | 获取今日汇总 + 日志列表 | Today |
| `useHistory` | 获取历史汇总数据 (7/30天) | Progress |
| `useUserTarget` | 更新每日热量目标 | Profile |
| `useMediaQuery` | 响应媒体查询变化，用于移动端 BottomSheet 与桌面 SlideOver 切换 | Today / Diary |

所有 Hook 遵循统一规范：
- 返回 `{ data/hookSpecific, loading, error, reload }` 命名对象
- 通过 `src/lib/api/` 层调用后端 API，不在 Hook 中直接写 `fetch`
- 使用 `useCallback` 包裹加载函数，`useEffect` 触发初始化加载
- 错误状态可展示（不 throw，不 console.error 了之）
- 变更型 Hook 方法可以向调用方 throw 可展示错误，调用方负责 toast 或表单错误；Hook 自身仍维护加载错误状态

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
  // 可能包含 mutate 方法
}
```

## 注意事项

- 不在条件语句中调用 Hook
- 不用 Hook 保存可由 API 响应直接派生的数据
- 数据请求失败必须返回可展示的错误状态
- Hook 使用 `"use client"` 指令表明客户端边界
- 不在 render 阶段直接读取 `window.innerWidth`；响应式分支应使用 `useMediaQuery` 或 CSS breakpoint 控制
