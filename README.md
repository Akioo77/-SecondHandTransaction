# 闲趣二手平台（SecondHandTransaction）

> 一个面向广告业从业者的课程设计全栈项目，基于 **Spring Boot + Next.js**，包含完整的交易流程与数据分析功能。

**开发者**：莊英琪 | **学号**：202335450091

---

## 📋 项目简介

闲趣二手平台是一个 B2C/C2C 二手商品交易系统，提供用户注册登录、商品浏览与发布、订单管理、收藏、数据分析与销售预测等完整功能，适用于课程设计展示。

---

## 🗂️ 项目结构

```
second-hand-transaction/
├── SecondHandProject/              # 后端（Spring Boot）
│   ├── src/main/java/org/zyq/transaction/
│   │   ├── transaction/           # 交易核心模块
│   │   │   ├── controller/        # 5个控制器（商品/订单/分类/分析/Admin）
│   │   │   ├── service/           # 7个服务类
│   │   │   ├── repository/        # 7个数据仓库
│   │   │   ├── entity/            # 8个实体
│   │   │   ├── dto/               # 数据传输对象
│   │   │   └── vo/                # 14个视图对象
│   │   ├── user/                  # 用户模块
│   │   ├── common/                # 公共模块（异常/日志）
│   │   └── config/                # 配置类（CORS/Security/WebConfig）
│   ├── src/main/resources/
│   │   ├── application.properties # H2 数据库配置
│   │   └── SecondHandPlatform.sql  # 数据初始化脚本
│   └── pom.xml
│
└── SecondHandFrontend/             # 前端（Next.js）
    ├── app/                        # 页面（27个 page.tsx）
    │   ├── products/               # 商品浏览/详情
    │   ├── orders/                 # 订单管理
    │   ├── favorites/              # 收藏
    │   ├── admin/                  # 管理后台（8个页面）
    │   │   ├── users/              # 用户管理
    │   │   ├── products/          # 商品管理
    │   │   ├── categories/        # 分类管理
    │   │   ├── orders/            # 订单管理
    │   │   ├── analytics/         # 销售预测分析
    │   │   └── operation-logs/    # 操作日志
    │   └── analytics/             # 数据分析（销售趋势/排行榜/推荐）
    ├── components/ui/              # UI 组件（60个）
    ├── lib/api.ts                  # 统一 API 调用层
    └── hooks/use-auth.ts          # 鉴权 Hook
```

---

## 🎯 功能列表

### 用户端
| 模块 | 功能 |
|------|------|
| 认证 | 注册、登录、Cookie 鉴权、修改密码 |
| 商品浏览 | 列表、分类筛选、关键词搜索、商品详情、浏览量统计 |
| 交易 | 下单、填写收货信息、确认收货、取消订单 |
| 收藏 | 添加/移除收藏、收藏列表查看 |
| 个人中心 | 订单历史、发布商品管理 |

### 管理端（Admin /admin）
| 模块 | 功能 |
|------|------|
| 仪表盘 | 总用户/商品/订单/收入统计、TOP商品展示 |
| 用户管理 | 列表查看、启用/禁用、用户画像（购买力/品类偏好/行为） |
| 商品管理 | 价格/库存/分类修改 |
| 分类管理 | 新增/删除分类 |
| 订单管理 | 各状态订单查看、订单状态管理 |
| 操作日志 | 管理员操作记录（商品修改/用户变更/订单操作） |

### 数据分析（/analytics & /admin/analytics）
| 模块 | 功能 |
|------|------|
| 销售排行榜 | 按销量/销售额排序 |
| 销售趋势图 | 近14天/近30天日/周/月粒度切换 |
| 趋势分析 | 本期 vs 上期销售额对比、变化率 |
| 品类分析 | 各品类订单量统计 |
| 分类供需分析 | 各品类供需比与热度评级 |
| 用户画像 | 地域分布、购买力分层、品类偏好 |
| 个性化推荐 | 深度浏览品类优先 + 看了又买（协作过滤） |
| 销售预测 | 一元线性回归 + 置信区间预测未来7天 |
| 异常检测 | 突增检测、刷单检测、价格异常检测 |
| 商品趋势 | 单商品日浏览量/独立用户数/峰值日 |

---

## 🛠️ 技术栈

### 后端
| 技术 | 说明 |
|------|------|
| Spring Boot 4.0.1 | 核心框架 |
| Java 21 | 开发语言 |
| Spring Data JPA + Hibernate | ORM |
| H2 Database | 内嵌数据库（`jdbc:h2:file:./data/secondhand`）|
| Querydsl / JPQL | 数据查询 |
| Spring Security | 密码加密（BCrypt）|
| Lombok | 简化代码 |

### 前端
| 技术 | 说明 |
|------|------|
| Next.js 16.0.10 | React 框架 |
| TypeScript 5 | 类型安全 |
| Tailwind CSS 4 | 样式 |
| shadcn/ui + Radix UI | UI 组件库 |
| Recharts | 图表 |
| React Hook Form + Zod | 表单验证 |

---

## 🚀 快速启动

### 环境要求
- Java 21+
- Node.js 18+
- Maven 3.8+

### 后端

```bash
cd SecondHandProject
export JAVA_HOME=/usr/local/Cellar/openjdk@21/21.0.10
export PATH="$JAVA_HOME/bin:$PATH"
./mvnw spring-boot:run
```

> 服务地址：http://localhost:8080
> H2 控制台：http://localhost:8080/h2-console（用户名 `sa`，无密码）
> 数据库文件：`SecondHandProject/data/secondhand.mv.db`

### 前端

```bash
cd SecondHandFrontend
npm install
npm run dev
```

> 服务地址：http://localhost:3000


## 📡 API 概览

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录（返回 Cookie）|

### 商品
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/products` | 列表（支持 categoryId/keyword 筛选）|
| GET | `/api/products/{id}` | 详情 |
| POST | `/api/products` | 发布商品 |
| PUT | `/api/products/{id}` | 更新商品 |
| POST | `/api/products/{id}/view` | 记录浏览（含停留时长）|

### 订单
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/orders` | 创建订单 |
| GET | `/api/orders` | 列表（buyerId/sellerId/status 筛选）|
| PATCH | `/api/orders/{id}/shipping` | 填写收货信息 |
| PATCH | `/api/orders/{id}/status` | 更新状态（需传 userId 鉴权）|

### 收藏
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/users/favorites/add` | 添加收藏 |
| POST | `/api/users/favorites/remove` | 取消收藏 |
| POST | `/api/users/favorites/isFavorite` | 检查是否已收藏 |
| POST | `/api/users/favorites/` | 获取收藏列表 |

### 数据分析
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/analytics/sales-ranking` | 销售排行榜 |
| GET | `/api/analytics/sales-trend/daily` | 日销售趋势 |
| GET | `/api/analytics/sales-trend/monthly` | 月销售趋势 |
| GET | `/api/analytics/trend-analysis` | 趋势对比分析 |
| GET | `/api/analytics/category-analysis` | 品类分析 |
| GET | `/api/analytics/supply-demand` | 分类供需分析 |
| GET | `/api/analytics/user-portrait` | 全域用户画像 |
| GET | `/api/analytics/personalized` | 个性化推荐 |
| GET | `/api/analytics/also-bought` | 看了又买推荐 |
| GET | `/api/analytics/product-trend` | 单商品趋势 |
| GET | `/api/analytics/forecast` | 销售预测 |
| GET | `/api/analytics/anomaly-summary` | 异常检测摘要 |
| GET | `/api/analytics/anomalies` | 异常检测详情 |

### 管理后台
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/stats` | 仪表盘统计 |
| GET | `/api/admin/users` | 用户列表 |
| GET | `/api/admin/users/{id}/profile` | 用户画像 |
| PUT | `/api/admin/users/{id}/status` | 启用/禁用用户 |
| GET | `/api/admin/products` | 商品列表 |
| PUT | `/api/admin/products/{id}` | 修改商品 |
| GET | `/api/admin/orders` | 订单列表 |
| GET | `/api/admin/categories` | 分类列表 |
| POST | `/api/admin/categories` | 新增分类 |
| DELETE | `/api/admin/categories/{id}` | 删除分类 |
| GET | `/api/admin/sales-trend` | 销售趋势 |
| GET | `/api/admin/operation-logs` | 操作日志 |

---

## 🔒 安全特性

- **订单状态权限校验**：买家/卖家才能操作自己的订单（403 Forbidden）
- **商品库存悲观锁**：下单时 `SELECT FOR UPDATE` 防止并发超卖
- **SQL 注入防护**：AdminService 全部使用参数化查询（JPQL `?1` 绑定）
- **密码加密**：BCrypt 哈希存储
- **IP 格式标准化**：支持 IPv6 环回与 `::ffff:` 映射格式
- **CORS 配置**：WebConfig 统一配置前后端跨域
- **前端路由保护**：middleware.ts 检查 Admin/分析页面的登录状态

---

## 🧠 数据采集与分析

| 采集项 | 实现方式 |
|--------|----------|
| 浏览停留时长 | `beforeunload` + `sendBeacon` / `keepalive` fetch |
| 用户行为统计 | ProductView 明细表 + 聚合查询 |
| 商品评分 | 用户评价汇总计算 |
| 销售异常检测 | 突增/刷单/价格异常三重检测 |
| 销售预测 | 一元线性回归 + 90% 置信区间 |
| 推荐系统 | 看了又买（时长加权协作过滤） + 个性化首页 |

---

## 📊 技术亮点

1. **低代码量实现完整电商流程**：前后端分离，RESTful API 设计
2. **内置数据分析能力**：销售预测 + 异常检测 + 用户画像，无需第三方 BI
3. **H2 内嵌数据库**：零配置运行，方便课程演示
4. **悲观锁并发控制**：数据库行级锁防止超卖
5. **参数化查询**：杜绝 SQL 注入风险
6. **完整的 Admin 后台**：支持运营人员日常管理

---

## 📄 许可证

本项目仅供课程设计学习交流使用。

---

> 💎 由庄英琪 AI 助手协助开发
