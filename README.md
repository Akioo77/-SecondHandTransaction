# 二手交易平台 (Second Hand Transaction Platform)

一个基于 Spring Boot + Next.js 的全栈二手商品交易平台，支持商品发布、浏览、交易、评价等完整功能。

> 📌 **本仓库为项目文档与接口说明**（README / 架构与接口清单 / 测试用例表）。业务源码暂未公开，架构与接口定义以本文档为准。

## 📋 项目简介

本项目是一个现代化的二手交易平台，提供用户注册登录、商品管理、订单处理、收藏功能等完整的电商交易流程。

## 👥 开发者信息

- 姓名：莊英琪
- 学号：202335450091

### 主要功能

- 👤 用户认证：注册、登录、个人信息管理
- 📦 商品管理：发布、编辑、删除商品
- 🛒 交易功能：下单、订单管理、交易状态跟踪
- ⭐ 收藏功能：收藏感兴趣的商品
- 💬 评价系统：买家卖家互评
- 📊 销售统计：卖家销售数据汇总
- 🔍 分类浏览：按商品分类查看

## 🛠️ 技术栈

### 后端 (SecondHandTransaction)

- **框架**: Spring Boot 4.0.1
- **语言**: Java 21
- **数据库**: PostgreSQL 14+
- **ORM**: Spring Data JPA
- **安全**: Spring Security
- **构建工具**: Maven

### 前端 (SecondHandTransaction-Frontend)

- **框架**: Next.js 16.0.10
- **语言**: TypeScript 5
- **UI 库**: React 19.2.0
- **样式**: Tailwind CSS 4.1.9
- **组件库**: Radix UI
- **表单**: React Hook Form + Zod
- **图表**: Recharts

## 📁 项目结构

```
second-hand-transaction/
├── SecondHandTransaction/              # 后端项目
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/org/zyq/transaction/
│   │   │   │   ├── common/            # 公共模块
│   │   │   │   ├── config/            # 配置类
│   │   │   │   ├── transaction/       # 交易模块
│   │   │   │   │   ├── controller/    # 控制器
│   │   │   │   │   ├── service/       # 业务逻辑
│   │   │   │   │   ├── repository/    # 数据访问
│   │   │   │   │   ├── entity/        # 实体类
│   │   │   │   │   ├── dto/           # 数据传输对象
│   │   │   │   │   └── vo/            # 视图对象
│   │   │   └── user/                  # 用户模块
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│   ├── pom.xml
│   └── SecondHandPlatform.sql         # 数据库初始化脚本（PostgreSQL）
│
└── SecondHandTransaction-Frontend/     # 前端项目
    ├── app/                            # Next.js 页面
    │   ├── categories/                 # 分类页面
    │   ├── favorites/                  # 收藏页面
    │   ├── login/                      # 登录页面
    │   ├── register/                   # 注册页面
    │   ├── products/                   # 商品页面
    │   ├── orders/                     # 订单页面
    │   ├── my-products/                # 我的商品
    │   ├── publish/                    # 发布商品
    │   ├── profile/                    # 个人中心
    │   └── sales-summary/              # 销售统计
    ├── components/                     # 组件
    │   ├── ui/                         # UI 组件
    │   ├── header.tsx                  # 头部组件
    │   ├── footer.tsx                  # 底部组件
    │   └── product-card.tsx            # 商品卡片
    ├── lib/                            # 工具库
    ├── hooks/                          # 自定义 Hooks
    └── package.json
```

## 🚀 快速开始

### 环境要求

- Java 21+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

### 后端启动

1. 导入数据库
```bash
createdb -U postgres second_hand_platform
psql -U postgres -d second_hand_platform -f SecondHandTransaction/SecondHandPlatform.sql
```

2. 配置数据库连接
编辑 `SecondHandTransaction/src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/second_hand_platform
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. 启动后端服务
```bash
cd SecondHandTransaction
mvn spring-boot:run
```

后端服务将运行在 `http://localhost:8080`

### 前端启动

```bash
cd SecondHandTransaction-Frontend
npm install
npm run dev
```

前端服务将运行在 `http://localhost:3000`

## 📡 API 接口

### 用户模块
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息

### 商品模块
- `GET /api/products` - 获取商品列表
- `GET /api/products/{id}` - 获取商品详情
- `POST /api/products` - 发布商品
- `PUT /api/products/{id}` - 更新商品
- `DELETE /api/products/{id}` - 删除商品

### 订单模块
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取订单列表
- `PUT /api/orders/{id}/status` - 更新订单状态

### 分类模块
- `GET /api/categories` - 获取分类列表

### 收藏模块
- `POST /api/favorites` - 添加收藏
- `DELETE /api/favorites/{id}` - 取消收藏
- `GET /api/favorites` - 获取收藏列表

## 🗄️ 数据库设计

- **表结构**：10+ 张表，按业务域拆分用户 / 商品 / 订单 / 收藏 / 评价 / 分类
- **ORM 映射**：Spring Data JPA 实体与 Repository，业务查询走 Repository 层
- **初始化脚本**：`SecondHandPlatform.sql`（PostgreSQL 方言，含建表与初始数据）
- **驱动依赖**：`org.postgresql:postgresql`（见 `pom.xml`）

## 📈 数据分析模块

基于交易与订单数据实现 3 个分析模块：

- **用户画像** —— 地域分布 / 购买力 / 品类偏好
- **销售趋势** —— 按时间维度的成交额与订单量走势
- **商品排行榜** —— 按销量 / 热度排序的商品榜单

前端以 Recharts 渲染图表，管理后台侧栏入口：`/sales-summary`、`/profile`。

## 🛡️ 安全特性

- Spring Security 身份认证
- BCrypt 密码加密
- CORS 跨域配置
- SQL 注入防护

## 📝 开发说明

### 后端开发
- 遵循 RESTful API 设计规范
- 使用 DTO 模式进行数据传输
- 统一异常处理
- 分层架构：Controller -> Service -> Repository

### 前端开发
- 使用 TypeScript 进行类型安全开发
- 组件化开发，复用性强
- 响应式设计，支持移动端
- 使用 React Hook Form 进行表单验证

## 🧪 功能测试与多端适配

按页面与接口两条线维护测试覆盖，重点关注多端显示与跳转链路：

| 检查维度 | 覆盖内容 |
|---|---|
| 页面可达性 | 10 个前端页面 + 全部 API 端点的可达性检查 |
| 跳转链路 | 登录 → 首页 → 商品详情 → 下单 → 订单列表 → 个人中心的闭环跳转 |
| 表单校验 | 注册、登录、发布商品表单的前后端双端校验一致性 |
| 多端显示 | 移动端 / 平板 / 桌面端的布局与表格错位检查 |
| 状态流转 | 订单状态、收藏状态在刷新与多端之间的一致性 |

> 用例表与缺陷记录在补齐后随仓库一并提供；本节定义的是测试覆盖的五个维度。

## 📦 构建部署

### 后端打包
```bash
cd SecondHandTransaction
mvn clean package
java -jar target/SecondHandTransaction-0.0.1-SNAPSHOT.jar
```

### 前端打包
```bash
cd SecondHandTransaction-Frontend
npm run build
npm start
```

### 生产部署
- **服务器**：腾讯云轻量应用服务器
- **反向代理**：Nginx 统一入口，转发后端 `8080` 与前端静态资源
- **服务保活**：systemd 托管后端 jar，`restart` 策略保证异常退出自动拉起
- **可用性**：7×24 公网访问

## 📄 许可证

本项目仅供学习交流使用。

---

_庄英琪 · 华南理工大学 网络工程（2023–2027）_
