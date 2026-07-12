# Hook 规范

## 当前状态

项目当前没有独立 `hooks/` 目录。首版 `Dashboard` 直接在客户端组件中使用 `useState`、`useEffect` 和 `fetch`，这是当前实现事实，不应在维护文档中假设 `useDashboard()` 已存在。

## 新增 Hook 的触发条件

当两个或更多组件共享以下逻辑时，抽取 Hook：

* Dashboard 数据加载和刷新。
* 登录/注册提交状态。
* 邀请码列表和审计详情。

Hook 应返回具名对象，例如 `{ data, isLoading, error, reload }`，并明确返回类型。

## 注意事项

* 不在条件语句中调用 Hook。
* 不用 Hook 保存可由 API 响应直接派生的数据。
* 数据请求失败必须返回可展示的错误状态，不能只写控制台。
