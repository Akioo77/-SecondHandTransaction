-- ===== 0) 删除旧表（可选）=====
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ===== 1) 用户（支持逻辑删除）=====
CREATE TABLE users (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  username   VARCHAR(32) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== 2) 分类（不做逻辑删除，简单）=====
CREATE TABLE categories (
  id   BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- ===== 3) 商品（支持逻辑删除，图片 Base64 JSON）=====
CREATE TABLE products (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  seller_id   BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  title       VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL,
  price       DECIMAL(10,2) NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  status      TINYINT NOT NULL DEFAULT 1,  -- 1上架 2下架 3售罄
  images      LONGTEXT NULL,
  is_deleted  TINYINT NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),

  INDEX idx_seller(seller_id, status, is_deleted, created_at),
  INDEX idx_cat(category_id, status, is_deleted, created_at)
) ENGINE=InnoDB;

-- ===== 4) 订单（不做逻辑删除）=====
CREATE TABLE orders (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no     VARCHAR(32) NOT NULL UNIQUE,
  product_id   BIGINT NOT NULL,
  buyer_id     BIGINT NOT NULL,
  seller_id    BIGINT NOT NULL,
  receiver_name VARCHAR(50) DEFAULT NULL,
  receiver_phone VARCHAR(20) DEFAULT NULL,
  receiver_address VARCHAR(255) DEFAULT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  total_price  DECIMAL(10,2) NOT NULL,
  status       TINYINT NOT NULL DEFAULT 10, -- 10已下单 40完成 50取消
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id),

  INDEX idx_buyer(buyer_id, created_at),
  INDEX idx_seller(seller_id, created_at),
  INDEX idx_product(product_id)
) ENGINE=InnoDB;

-- ===== 5) 评价（不做逻辑删除）=====
CREATE TABLE reviews (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id   BIGINT NOT NULL UNIQUE,
  rating     TINYINT NOT NULL,
  content    VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

-- ===== 6) 聊天消息（不做逻辑删除）=====
CREATE TABLE chat_messages (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id  BIGINT NULL,
  sender_id   BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  content     VARCHAR(500) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),

  INDEX idx_product_time(product_id, created_at),
  INDEX idx_pair_time(sender_id, receiver_id, created_at)
) ENGINE=InnoDB;

-- ===== 7) 收藏（直接物理删除）=====
CREATE TABLE favorites (
  user_id    BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, product_id),

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),

  INDEX idx_product(product_id, created_at)
) ENGINE=InnoDB;
