# 状态管理

## 当前分层

项目不使用 Redux、Zustand 等全局状态库：

| 状态 | 当前放置位置 |
|---|---|
| 会话身份 | HttpOnly Cookie；服务端通过 `getSessionUserId()` 获取 |
| 页面鉴权 | Server Component 中检查并 `redirect()` |
| Dashboard 记录/汇总 | `Dashboard` 客户端组件的局部 state |
| 表单提交状态 | 组件内 `useState` |
| 日期 | 当前首版使用客户端当天日期，后续应迁移到 URL 参数 |

## 数据流

```text
Dashboard client
  → GET /api/dashboard/today
  → POST /api/food-logs
  → recalculateDailySummary()
  → reload()
```

服务端数据不能被当作全局可变单例；修改成功后重新请求 API，而不是手动猜测汇总值。
