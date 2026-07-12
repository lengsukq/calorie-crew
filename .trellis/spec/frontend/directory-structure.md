# 前端目录结构

## 当前布局

```text
src/
├── app/
│   ├── page.tsx                   # 根重定向（middleware 处理）
│   ├── layout.tsx                 # 根布局 (metadata + font)
│   ├── globals.css                # 全局样式（Y2K 组件类 + 布局类）
│   ├── middleware.ts              # 中间件鉴权
│   ├── (auth)/                    # 未认证路由组
│   │   ├── layout.tsx             # Auth 装饰布局（气泡）
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (tabs)/                    # 已认证路由组（AppShell）
│   │   ├── layout.tsx             # AppShell 布局（TopBar + TabBar + Toaster）
│   │   ├── loading.tsx            # 全局加载态
│   │   ├── today/page.tsx         # 今日 Tab（服务端鉴权）
│   │   ├── diary/page.tsx         # 日记 Tab
│   │   ├── progress/page.tsx      # 进度 Tab
│   │   └── profile/page.tsx       # 我的 Tab（服务端鉴权）
│   └── api/                       # API 路由
│       ├── auth/...
│       ├── food-logs/...
│       ├── dashboard/
│       │   ├── today/route.ts
│       │   └── history/route.ts   # GET - 历史汇总
│       ├── admin/invites/...
│       └── users/
│           └── target/route.ts    # PUT - 更新热量目标
├── components/
│   ├── auth/
│   │   ├── AuthBackground.tsx     # 共享装饰气泡
│   │   └── AuthForm.tsx           # 登录/注册复用表单
│   ├── layout/
│   │   ├── TabBar.tsx             # 底部 Tab / 桌面侧边栏
│   │   └── TopBar.tsx             # 顶部导航栏
│   ├── today/
│   │   ├── TodayContent.tsx       # 今日页面（使用 useSummary）
│   │   ├── CalorieRing.tsx        # SVG 热量圆环
│   │   └── MealGroup.tsx          # 餐次分组列表
│   ├── diary/
│   │   ├── DiaryContent.tsx       # 日记页面（使用 useFoodLogs）
│   │   └── DateNavigator.tsx      # 日期切换器
│   ├── progress/
│   │   ├── ProgressContent.tsx    # 进度页面（使用 useHistory）
│   │   ├── CalorieChart.tsx       # SVG 柱状图
│   │   └── MacroDonut.tsx         # SVG 营养素环形图
│   ├── profile/
│   │   ├── ProfileContent.tsx     # 我的页面（使用 useUserTarget）
│   │   ├── TargetSetting.tsx      # 热量目标编辑
│   │   └── AdminPanel.tsx         # 管理员面板
│   ├── notifications/
│   │   ├── NotificationBell.tsx   # 通知铃铛
│   │   └── NotificationPanel.tsx  # 通知下拉面板
│   ├── shared/
│   │   └── FoodLogForm.tsx        # 共享食物记录表单
│   └── ui/
│       └── BottomSheet.tsx        # 底部弹出层
├── hooks/                         # 自定义 Hook 目录（已建立）
│   ├── useFoodLogs.ts            # 饮食记录 CRUD
│   ├── useSummary.ts             # 今日汇总
│   ├── useHistory.ts             # 历史趋势
│   └── useUserTarget.ts          # 用户目标更新
├── lib/
│   ├── api/                       # API 客户端层（已建立）
│   │   ├── client.ts             # 基础 fetch 包装
│   │   ├── food-logs.ts          # 饮食记录 API
│   │   ├── dashboard.ts          # 仪表盘 API
│   │   └── users.ts              # 用户设置 API
│   ├── auth/...
│   ├── db/...
│   └── ...
├── shared/                        # 共享常量/类型（已建立）
│   ├── constants.ts               # MEAL_ORDER, MEAL_LABELS, MEAL_ICONS
│   └── types.ts                   # FoodLogEntry, DailySummary, HistoryDay 等
└── test/
    └── setup.ts                   # Vitest 测试初始化
```

## 命名

- 页面文件使用 App Router 保留名 `page.tsx`、`layout.tsx`
- React 组件使用 PascalCase 文件名和 named export
- Hook 文件使用 `useXxx` 前缀的 camelCase
- API、schema、service 文件使用 kebab-case
- 测试文件与被测文件同名 + `.test.ts` / `.test.tsx`
