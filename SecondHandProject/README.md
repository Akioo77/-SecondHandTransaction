# 闲趣二手平台（SecondHandTransaction）

> 基于 **Spring Boot + Next.js** 的全栈二手商品交易平台，包含完整的交易流程、数据分析与管理后台。

**在线访问**：`http://124.220.49.156`

**开发者**：莊英琪 | **学号**：202335450091

---

## 📋 项目简介

本项目是一个 B2C/C2C 二手商品交易系统，提供用户注册登录、商品浏览与发布、订单管理、收藏、数据分析与个性化推荐等完整功能，已部署上线。

---

## 🏗️ 系统架构

```
┌──────────────────────────────────────────┐
│           用户浏览器 (http://124.220.49.156) │
└──────────────────┬───────────────────────┘
                   │
         ┌─────────┴──────────┐
         │   Nginx (80/443)   │
         │  静态资源 + 反向代理 │
         └──┬──────────────┬──┘
            │             │
    ┌───────┴──┐    ┌─────┴──────┐
    │ Next.js  │    │  Spring    │
    │ (前端)    │    │  Boot      │
    │ 端口3000  │    │ (后端) 8080│
    └───────┬──┘    └─────┬──────┘
            │             │
    ┌───────┴─────────────┴──────┐
    │     Neon PostgreSQL        │
    │   (云端数据库)              │
    └────────────────────────────┘
```

---

## 📁 项目结构

```
SecondHandTransaction/           # 后端（Spring Boot）
├── README.md                    # 后端说明
├── pom.xml
└── src/main/java/...           # Java 源码

SecondHandFrontend/             # 前端（Next.js）
├── README.md                    # 前端说明
├── package.json
├── app/                        # 27个页面
│   ├── products/                # 商品浏览/详情
│   ├── orders/                  # 订单管理
│   ├── favorites/               # 收藏
│   ├── analytics/               # 数据分析
│   │   ├── product-ranking/    # 销售排行榜
│   │   └── recommendations/    # 个性化推荐
│   └── admin/                   # 管理后台（用户/商品/分类/订单/分析）
├── components/ui/               # 60个 UI 组件
├── lib/api.ts                  # 统一 API 调用层
└── hooks/use-auth.ts           # 登录状态管理
```

---

## 🎯 核心功能

### 用户端
| 模块 | 功能 |
|------|------|
| 认证 | 注册、登录、Cookie 鉴权 |
| 商品浏览 | 列表、分类筛选、关键词搜索、商品详情、浏览量统计 |
| 交易 | 下单、确认收货、取消订单、库存自动恢复 |
| 收藏 | 添加/移除收藏、收藏列表 |
| 数据分析 | 销售排行榜、销售趋势、用户画像、个性化推荐 |

### 管理端（/admin）
| 模块 | 功能 |
|------|------|
| 仪表盘 | 总用户/商品/订单/收入统计 |
| 用户管理 | 列表查看、启用/禁用 |
| 商品管理 | 价格/库存/分类修改、软删除/恢复 |
| 分类管理 | 新增/删除分类 |
| 订单管理 | 订单查看、状态管理 |
| 操作日志 | 管理员操作记录 |

---

## 🛠️ 技术栈

| 分层 | 技术 |
|------|------|
| 前端框架 | Next.js 16.0.10 + React 19 |
| 前端语言 | TypeScript 5 |
| 前端样式 | Tailwind CSS 4 + shadcn/ui + Radix UI |
| 图表 | Recharts |
| 后端框架 | Spring Boot 4.0.1 |
| 后端语言 | Java 21 |
| 数据库 | Neon PostgreSQL（云端）+ Spring Data JPA |
| 安全 | BCrypt 密码加密 + AdminAuthInterceptor |

---

## 🚀 快速启动

### 环境要求
- Java 21+ / Node.js 18+ / Maven 3.8+

### 后端
```bash
cd SecondHandProject
mvn spring-boot:run
# http://localhost:8080
```

### 前端
```bash
cd SecondHandFrontend
npm install && npm run dev
# http://localhost:3000
```

### 测试账号
| 角色 | 用户名 | 密码 |
|------|--------|------|
| 普通用户 | akioo77 | test123 |
| 管理员 | admin | admin |

---

## 📂 子项目说明

详细文档请查看各子项目内的 README：

- 📦 **[SecondHandProject/README.md](SecondHandProject/)** — 后端技术细节、API 文档
- 🎨 **[SecondHandFrontend/README.md](SecondHandFrontend/)** — 前端页面结构、组件说明

---

## 🔒 安全特性

- **订单状态权限校验**：买家/卖家才能操作自己的订单（403 Forbidden）
- **商品库存悲观锁**：`SELECT FOR UPDATE` 防止并发超卖
- **参数化查询**：全部使用 JPQL `?1` 绑定，杜绝 SQL 注入
- **密码加密**：BCrypt 哈希存储
- **禁用账号拦截**：登录时检查账号状态，禁用后无法登录
- **Admin 独立鉴权**：AdminAuthInterceptor 验证 `admin_session` Cookie

---

## 📊 数据分析能力

| 功能 | 说明 |
|------|------|
| 销售排行榜 | 按销量/销售额排序，多维度展示 |
| 销售趋势图 | 近14天日/周/月粒度切换 |
| 用户画像 | 地域分布、购买力分层、品类偏好 |
| 个性化推荐 | 深度浏览品类优先 + 为你推荐（排除自己发布的商品）|
| 销售预测 | 一元线性回归 + 90% 置信区间预测未来7天 |

---

## 📄 许可证

本项目仅供课程设计学习交流使用。

---

> 💎 由庄英琪 AI 助手协助开发