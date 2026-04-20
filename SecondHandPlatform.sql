-- ===== 0) 删除旧表 =====
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_views;
DROP TABLE IF EXISTS product_stats;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS user_addresses;
DROP TABLE IF EXISTS users;

-- ===== 1) 用户（支持逻辑删除）=====
CREATE TABLE users (
  id         BIGSERIAL PRIMARY KEY,
  username   VARCHAR(32) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  is_deleted SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===== 2) 分类（不做逻辑删除，简单）=====
CREATE TABLE categories (
  id   BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

-- ===== 3) 商品（支持逻辑删除，图片 Base64 JSON）=====
CREATE TABLE products (
  id          BIGSERIAL PRIMARY KEY,
  seller_id   BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  title       VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL,
  price       DECIMAL(10,2) NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  status      SMALLINT NOT NULL DEFAULT 1,  -- 1上架 2下架 3售罄
  images      TEXT NULL,
  is_deleted  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_products_seller ON products(seller_id, status, is_deleted, created_at);
CREATE INDEX idx_products_cat ON products(category_id, status, is_deleted, created_at);

-- ===== 4) 订单（不做逻辑删除）=====
CREATE TABLE orders (
  id              BIGSERIAL PRIMARY KEY,
  order_no        VARCHAR(32) NOT NULL UNIQUE,
  product_id      BIGINT NOT NULL,
  buyer_id        BIGINT NOT NULL,
  seller_id       BIGINT NOT NULL,
  receiver_name   VARCHAR(50) DEFAULT NULL,
  receiver_phone  VARCHAR(20) DEFAULT NULL,
  receiver_address VARCHAR(255) DEFAULT NULL,
  quantity        INT NOT NULL DEFAULT 1,
  total_price     DECIMAL(10,2) NOT NULL,
  status          SMALLINT NOT NULL DEFAULT 10, -- 10已下单 40完成 50取消
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id, created_at);
CREATE INDEX idx_orders_seller ON orders(seller_id, created_at);
CREATE INDEX idx_orders_product ON orders(product_id);

-- ===== 5) 评价（不做逻辑删除）=====
CREATE TABLE reviews (
  id         BIGSERIAL PRIMARY KEY,
  order_id   BIGINT NOT NULL UNIQUE,
  rating     SMALLINT NOT NULL,
  content    VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ===== 6) 聊天消息（不做逻辑删除）=====
CREATE TABLE chat_messages (
  id          BIGSERIAL PRIMARY KEY,
  product_id  BIGINT NULL,
  sender_id   BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  content     VARCHAR(500) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE INDEX idx_chat_product_time ON chat_messages(product_id, created_at);
CREATE INDEX idx_chat_pair_time ON chat_messages(sender_id, receiver_id, created_at);

-- ===== 7) 收藏（直接物理删除）=====
CREATE TABLE favorites (
  user_id    BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, product_id),

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_favorites_product ON favorites(product_id, created_at);

-- ===== 8) 用户地域表（支持地域画像分析）=====
CREATE TABLE user_addresses (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL,
  receiver_name   VARCHAR(50)  DEFAULT NULL,
  phone           VARCHAR(20)  DEFAULT NULL,
  province        VARCHAR(32)  DEFAULT NULL,
  city            VARCHAR(32)  DEFAULT NULL,
  district        VARCHAR(32)  DEFAULT NULL,
  detail_address  VARCHAR(255) DEFAULT NULL,
  is_default      SMALLINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_province ON user_addresses(province);
CREATE INDEX idx_user_addresses_city ON user_addresses(city);

-- ===== 9) 商品统计表（浏览量、销量累计，供排行榜和推荐用）=====
CREATE TABLE product_stats (
  product_id        BIGINT PRIMARY KEY,
  view_count        BIGINT NOT NULL DEFAULT 0,
  order_count       BIGINT NOT NULL DEFAULT 0,
  order_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
  favorite_count    BIGINT NOT NULL DEFAULT 0,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ===== 10) 商品浏览记录（支持趋势分析）=====
CREATE TABLE product_views (
  id          BIGSERIAL PRIMARY KEY,
  product_id  BIGINT NOT NULL,
  user_id     BIGINT NULL,
  viewed_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_product_views_product_time ON product_views(product_id, viewed_at);
CREATE INDEX idx_product_views_viewed_at ON product_views(viewed_at);
