CREATE DATABASE IF NOT EXISTS web_rental
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE web_rental;

CREATE TABLE users (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    email       VARCHAR(100)    NOT NULL,
    password    VARCHAR(255)    NOT NULL,
    full_name   VARCHAR(100)    NOT NULL,
    phone       VARCHAR(20)     DEFAULT NULL,
    role        ENUM('SUPER_ADMIN','ADMIN','USER') NOT NULL DEFAULT 'USER',
    status      ENUM('ACTIVE','BANNED')    NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE server_categories (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    description TEXT            DEFAULT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_server_categories PRIMARY KEY (id),
    CONSTRAINT uq_server_categories_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE servers (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    category_id     BIGINT          DEFAULT NULL,
    name            VARCHAR(150)    NOT NULL,
    description     TEXT            DEFAULT NULL,
    cpu             VARCHAR(50)     NOT NULL COMMENT 'vd: 2 core',
    ram             VARCHAR(50)     NOT NULL COMMENT 'vd: 4 GB',
    storage         VARCHAR(50)     NOT NULL COMMENT 'vd: 50 GB SSD',
    bandwidth       VARCHAR(50)     NOT NULL COMMENT 'vd: 1 TB',
    price           DECIMAL(15,2)   NOT NULL,
    status          ENUM('AVAILABLE','RENTED','MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_servers PRIMARY KEY (id),
    CONSTRAINT fk_servers_category
        FOREIGN KEY (category_id) REFERENCES server_categories(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_servers_status (status),
    INDEX idx_servers_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT          NOT NULL,
    server_id   BIGINT          NOT NULL,
    start_date  DATE            NOT NULL,
    end_date    DATE            NOT NULL,
    total_price DECIMAL(15,2)   NOT NULL,
    status      ENUM('PENDING','ACTIVE','EXPIRED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_orders PRIMARY KEY (id),
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_orders_server
        FOREIGN KEY (server_id) REFERENCES servers(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_orders_date CHECK (end_date > start_date),
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_server (server_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_date_range (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    order_id        BIGINT          NOT NULL,
    amount          DECIMAL(15,2)   NOT NULL,
    method          ENUM('BANKING','MOMO','VNPAY','CASH') NOT NULL,
    status          ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    transaction_id  VARCHAR(255)    DEFAULT NULL,
    paid_at         TIMESTAMP       NULL DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_payments PRIMARY KEY (id),
    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_payments_order (order_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_transaction (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT          NOT NULL,
    token       VARCHAR(500)    NOT NULL,
    expires_at  TIMESTAMP       NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_refresh_tokens_token UNIQUE (token),
    CONSTRAINT uq_refresh_tokens_user UNIQUE (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
