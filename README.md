# 闲趣二手平台 - 前端（SecondHandFrontend）

> Next.js 16 前端项目，为「闲趣二手平台」提供用户界面、数据分析看板和管理后台。

**配合后端使用**：请先启动 [SecondHandProject](../SecondHandProject/)（端口 8080）

---

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| Next.js 16.0.10 | React 全栈框架 |
| TypeScript 5 | 类型安全 |
| Tailwind CSS 4 | 原子化样式 |
| shadcn/ui + Radix UI | 组件库 |
| Recharts | 图表（折线/柱状/饼图）|
| React Hook Form + Zod | 表单验证 |

---

## 📁 页面结构

```
app/
├── page.tsx                     # 首页（商品展示 + 个性化推荐）
├── login/page.tsx              # 登录
├── register/page.tsx           # 注册
├── products/
│   ├── page.tsx                 # 商品列表（分类/搜索筛选）
│   └── [id]/page.tsx           # 商品详情（含看了又买）
├── orders/page.tsx             # 订单管理（买到的/卖出的）
├── favorites/page.tsx          # 收藏列表
├── my-products/page.tsx       # 我的发布商品
├── publish/page.tsx            # 发布商品
├── profile/page.tsx            # 个人中心（修改密码）
├── admin/
│   ├── page.tsx                # 仪表盘（数据概览）
│   ├── login/page.tsx          # Admin 登录
│   ├── users/page.tsx          # 用户管理
│   ├── products/page.tsx       # 商品管理（价格/库存修改）
│   ├── categories/page.tsx     # 分类管理
│   ├── orders/page.tsx         # 订单管理
│   ├── analytics/page.tsx       # 销售预测分析
│   └── operation-logs/page.tsx  # 操作日志
└── analytics/
    ├── page.tsx                # 数据概览（统计卡片 + 销售趋势）
    ├── sales-trend/page.tsx    # 销售趋势（切换日/周/月）
    ├── product-ranking/page.tsx # 销售排行榜
    └── recommendations/page.tsx # 个性化推荐
```

---

## 🚀 快速启动

```bash
npm install
npm run dev
```

访问 http://localhost:3000

> ⚠️ 需要后端服务已启动（http://localhost:8080）

---

## 📡 API 集成层

所有后端 API 调用统一在 `lib/api.ts` 中管理：

```typescript
// 认证
authApi.login(username, password)
authApi.register(username, password)

// 商品
productApi.getProducts({ categoryId, keyword })
productApi.getProduct(id)

// 订单
orderApi.getOrders({ buyerId, sellerId, status })
orderApi.updateStatus(orderId, status, userId)

// 数据分析
analyticsApi.getSalesRanking(limit)
analyticsApi.getDailyTrend(days)
analyticsApi.getForecast(historyDays, forecastDays)

// 管理后台
adminApi.getStats()
adminApi.getUsers()
adminApi.updateProduct(id, { price, quantity })
```

---

## 🔐 鉴权机制

- 用户登录成功后，后端设置 `Set-Cookie: ID=<userId>`
- `hooks/use-auth.ts` 读取 Cookie 判断登录状态
- `middleware.ts` 保护 `/admin/*` 和 `/analytics` 页面，未登录跳转登录页
- Admin 后台使用独立 Cookie（`admin_session`）

---

## 🧩 组件说明

| 目录 | 内容 |
|------|------|
| `components/ui/` | shadcn/ui 组件（Card/Select/Switch/Table 等）|
| `components/header.tsx` | 全局顶部导航 |
| `lib/api.ts` | API 调用封装 |
| `lib/utils.ts` | 工具函数（图片处理/时间格式化）|
| `hooks/use-auth.ts` | 登录状态管理 |

---

## 📊 数据分析页面说明

### /analytics（数据概览）
- 4 张统计卡片：累计销售额/订单数/浏览量/月销冠军
- 销售趋势折线图（近14天）
- 品类偏好饼图 + 购买力分布
- 分类供需状态展示

### /analytics/sales-trend（销售趋势）
- 日/周/月粒度切换
- 销售额 + 订单数双轴折线图
- 查看历史任意时间段

### /analytics/product-ranking（排行榜）
- 按销量/销售额排序
- 商品分类标签 + 收藏数展示

### /analytics/recommendations（个性化推荐）
- 为当前用户推荐商品
- 推荐理由标注（猜你喜欢 / 为你推荐 / 看了又买）

### /admin/analytics（销售预测）
- 未来7天销量/收入预测
- 一元线性回归 + 置信区间
- 日均订单 / 趋势判断 / 置信度显示

---

## 🔧 环境变量

```bash
# .env.local（前端无需配置，后端接口地址已写死为 localhost:8080）
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

> 💎 配合 [SecondHandProject](../SecondHandProject/) 后端使用
