# 前端目录结构

## 当前布局

```text
src/
├── app/
│   ├── page.tsx                 # 根据会话跳转 /login 或 /dashboard
│   ├── layout.tsx               # metadata、全局 CSS
│   ├── globals.css               # 当前响应式 CSS
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── dashboard/page.tsx       # 服务端鉴权后组合 Dashboard
└── components/
    ├── auth/AuthForm.tsx         # 登录/注册客户端表单
    └── dashboard/Dashboard.tsx  # 当前 Dashboard 客户端交互
```

API 客户端目前直接写在客户端组件中，项目尚未建立 `hooks/` 或 `lib/api/` 层。新增功能如果出现重复 fetch，应优先抽成 Hook/API client，而不是继续复制。

## 命名

* 页面文件使用 App Router 保留名 `page.tsx`、`layout.tsx`。
* React 组件使用 PascalCase 文件名和 named export。
* API、schema、service 文件使用 kebab-case。
