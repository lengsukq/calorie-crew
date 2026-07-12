# 状态管理

## 当前分层

项目不使用 Redux、Zustand 等全局状态库：

| 状态 | 当前放置位置 |
|---|---|
| 会话身份 | HttpOnly Cookie；服务端通过 `getSessionUserId()` 获取 |
| 页面鉴权 | Middleware 中间件 + Server Component 双重检查 |
| 今日汇总/日志 | `useSummary` Hook (组件内 state) |
| 饮食记录 CRUD | `useFoodLogs` Hook (组件内 state) |
| 历史趋势数据 | `useHistory` Hook (组件内 state) |
| 热量目标设置 | `useUserTarget` Hook (组件内 state) |
| 表单提交状态 | 组件内 `useState` |
| 日期选择 | 组件内 `useState` + URL query (待迁移) |

## 数据流

```text
Page (Server Component)
  → getSessionUserId() + db query
  → 传递 Props 给客户端组件

Client Component
  → Hook (useSummary / useFoodLogs / etc.)
    → API Client (lib/api/)
      → fetch() 后端 REST API
  → 成功后 Hook 内部 reload()
  → 组件重新渲染

服务端数据不能被当作全局可变单例；修改成功后重新请求 API，而不是手动猜测汇总值。
