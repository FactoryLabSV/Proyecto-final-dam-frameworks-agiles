-- =====================================================================
-- Script de referencia: base de datos del proyecto existente
-- "Inventario Pro" (proyecto final de DAW, ciclo 1-2026 – Laravel + MySQL 8)
--
-- Generado a partir de las migraciones de Laravel (database/migrations).
-- Es SOLO REFERENCIA para el diseño de TAMACHIHUA-ERP: el script del
-- proyecto actual se escribe para PostgreSQL (tarea del Sprint 1).
--
-- Tablas fuera del alcance de TAMACHIHUA-ERP (se incluyen como referencia):
--   suppliers_contacts, brands_suppliers, product_units, inventory_moves
-- Se omiten las tablas internas de Laravel (sessions, cache, jobs, etc.).
--
-- Diferencias acordadas para el proyecto actual (documento 07):
--   D-01: products agrega requires_expiration
--   D-03: roles Administrador, Bodega, Compras y Vendedor
-- =====================================================================

CREATE DATABASE IF NOT EXISTS inventario_pro
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventario_pro;

-- ---------------------------------------------------------------------
-- Seguridad
-- ---------------------------------------------------------------------
CREATE TABLE roles (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_name        VARCHAR(50)  NOT NULL,
  role_description VARCHAR(255) NULL,
  is_active        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY roles_role_name_unique (role_name)
) ENGINE=InnoDB;

CREATE TABLE users (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id        BIGINT UNSIGNED NOT NULL,
  user_name      VARCHAR(50)  NOT NULL,
  password       VARCHAR(255) NOT NULL,
  user_email     VARCHAR(100) NOT NULL,
  is_active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NULL,
  remember_token VARCHAR(100) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY users_user_name_unique (user_name),
  UNIQUE KEY users_user_email_unique (user_email),
  CONSTRAINT users_role_id_foreign FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Catálogos
-- ---------------------------------------------------------------------
CREATE TABLE measure_units (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  unit_name  VARCHAR(80) NOT NULL,
  unit_code  VARCHAR(3)  NULL,
  created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP   NULL,
  PRIMARY KEY (id),
  UNIQUE KEY measure_units_unit_name_unique (unit_name)
) ENGINE=InnoDB;

CREATE TABLE presentations (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  unit_id             BIGINT UNSIGNED NOT NULL,
  presentation_name   VARCHAR(100)  NOT NULL,
  unit_contained      DECIMAL(10,2) NULL,
  total_weight_pounds DECIMAL(10,2) NULL,
  width_cm            DECIMAL(10,2) NULL,
  height_cm           DECIMAL(10,2) NULL,
  length_cm           DECIMAL(10,2) NULL,
  is_active           TINYINT(1)    NOT NULL DEFAULT 1,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY presentations_presentation_name_unique (presentation_name),
  CONSTRAINT presentations_unit_id_foreign FOREIGN KEY (unit_id) REFERENCES measure_units (id)
) ENGINE=InnoDB;

CREATE TABLE product_categories (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name        VARCHAR(100) NOT NULL,
  category_description VARCHAR(255) NULL,
  is_active            TINYINT(1)   NOT NULL DEFAULT 1,
  created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY product_categories_category_name_unique (category_name)
) ENGINE=InnoDB;

CREATE TABLE product_types (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  prod_type_name        VARCHAR(100) NOT NULL,
  prod_type_description VARCHAR(255) NULL,
  is_active             TINYINT(1)   NOT NULL DEFAULT 1,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY product_types_prod_type_name_unique (prod_type_name)
) ENGINE=InnoDB;

CREATE TABLE product_brands (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  brand_name        VARCHAR(100) NOT NULL,
  brand_description TEXT         NULL,
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY product_brands_brand_name_unique (brand_name)
) ENGINE=InnoDB;

CREATE TABLE product_models (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  brand_id          BIGINT UNSIGNED NOT NULL,
  model_name        VARCHAR(100) NOT NULL,
  model_description TEXT         NULL,
  is_link           TINYINT(1)   NOT NULL DEFAULT 1,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NULL,
  PRIMARY KEY (id),
  CONSTRAINT product_models_brand_id_foreign FOREIGN KEY (brand_id) REFERENCES product_brands (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Productos y precios
-- ---------------------------------------------------------------------
CREATE TABLE products (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id         BIGINT UNSIGNED NOT NULL,
  model_id            BIGINT UNSIGNED NULL,
  prod_type_id        BIGINT UNSIGNED NOT NULL,
  code                VARCHAR(50)  NOT NULL,
  product_name        VARCHAR(150) NOT NULL,
  product_description VARCHAR(255) NULL,
  is_active           TINYINT(1)   NOT NULL DEFAULT 1,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY products_code_unique (code),
  KEY products_is_active_index (is_active),
  CONSTRAINT products_category_id_foreign  FOREIGN KEY (category_id)  REFERENCES product_categories (id),
  CONSTRAINT products_model_id_foreign     FOREIGN KEY (model_id)     REFERENCES product_models (id),
  CONSTRAINT products_prod_type_id_foreign FOREIGN KEY (prod_type_id) REFERENCES product_types (id)
) ENGINE=InnoDB;

CREATE TABLE products_presentations (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id        BIGINT UNSIGNED NOT NULL,
  presentation_id   BIGINT UNSIGNED NOT NULL,
  current_stock     DECIMAL(10,2) NOT NULL DEFAULT 0,
  minimum_stock     DECIMAL(10,2) NOT NULL DEFAULT 10,
  presentation_code VARCHAR(50)   NULL,
  sale_price        DECIMAL(10,2) NULL,      -- copia del precio vigente (caché)
  last_price_update TIMESTAMP     NULL,      -- caché
  is_active         TINYINT(1)    NOT NULL DEFAULT 1,
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY products_presentations_product_id_presentation_id_unique (product_id, presentation_id),
  CONSTRAINT products_presentations_product_id_foreign      FOREIGN KEY (product_id)      REFERENCES products (id),
  CONSTRAINT products_presentations_presentation_id_foreign FOREIGN KEY (presentation_id) REFERENCES presentations (id)
) ENGINE=InnoDB;

CREATE TABLE product_prices (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  prod_presentation_id BIGINT UNSIGNED NOT NULL,
  created_by           BIGINT UNSIGNED NOT NULL,
  sale_price           DECIMAL(10,2) NOT NULL,
  effective_date       DATE          NOT NULL,
  end_date             DATE          NULL,
  is_current           TINYINT(1)    NOT NULL DEFAULT 1,
  created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP     NULL,
  PRIMARY KEY (id),
  CONSTRAINT product_prices_prod_presentation_id_foreign FOREIGN KEY (prod_presentation_id) REFERENCES products_presentations (id),
  CONSTRAINT product_prices_created_by_foreign           FOREIGN KEY (created_by)           REFERENCES users (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Proveedores
-- ---------------------------------------------------------------------
CREATE TABLE suppliers (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  trade_name          VARCHAR(100)  NOT NULL,
  legal_name          VARCHAR(100)  NOT NULL,
  supplier_address    TEXT          NULL,
  nit                 VARCHAR(30)   NOT NULL,
  nrc                 VARCHAR(30)   NULL,
  supplier_email      VARCHAR(100)  NOT NULL,
  supplier_phone_code VARCHAR(3)    NOT NULL,
  supplier_phone      VARCHAR(20)   NOT NULL,
  credit_days         INT           NOT NULL DEFAULT 0,
  credit_limit        DECIMAL(10,2) NULL,
  is_active           TINYINT(1)    NOT NULL DEFAULT 1,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY suppliers_supplier_email_unique (supplier_email)
) ENGINE=InnoDB;

-- Fuera del alcance de TAMACHIHUA-ERP
CREATE TABLE suppliers_contacts (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  supplier_id        BIGINT UNSIGNED NOT NULL,
  contact_name       VARCHAR(100) NOT NULL,
  contact_email      VARCHAR(80)  NOT NULL,
  contact_phone_code VARCHAR(3)   NOT NULL,
  contact_phone      VARCHAR(20)  NOT NULL,
  created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP    NULL,
  PRIMARY KEY (id),
  CONSTRAINT suppliers_contacts_supplier_id_foreign FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
) ENGINE=InnoDB;

-- Fuera del alcance de TAMACHIHUA-ERP
CREATE TABLE brands_suppliers (
  brand_id    BIGINT UNSIGNED NOT NULL,
  supplier_id BIGINT UNSIGNED NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NULL,
  PRIMARY KEY (brand_id, supplier_id),
  CONSTRAINT brands_suppliers_brand_id_foreign    FOREIGN KEY (brand_id)    REFERENCES product_brands (id),
  CONSTRAINT brands_suppliers_supplier_id_foreign FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Lotes
-- ---------------------------------------------------------------------
CREATE TABLE product_lots (
  id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  prod_presentation_id    BIGINT UNSIGNED NOT NULL,
  supplier_id             BIGINT UNSIGNED NOT NULL,
  lot_number              VARCHAR(50)   NOT NULL,
  purchase_currency       CHAR(3)       NOT NULL DEFAULT 'USD',
  purchase_price_unit     DECIMAL(10,2) NOT NULL,
  purchase_price_total    DECIMAL(10,2) NOT NULL,
  purchase_invoice_number VARCHAR(20)   NOT NULL,
  purchase_invoice_date   TIMESTAMP     NOT NULL,
  quantity_received       DECIMAL(10,2) NOT NULL,
  quantity_available      DECIMAL(10,2) NOT NULL,
  production_date         DATE          NULL,
  expiration_date         DATE          NULL,
  entry_date              DATE          NOT NULL DEFAULT (CURRENT_DATE),
  notes                   VARCHAR(200)  NULL,
  is_active               TINYINT(1)    NOT NULL DEFAULT 1,
  created_at              TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY product_lots_supplier_id_lot_number_unique (supplier_id, lot_number),
  KEY product_lots_expiration_date_index (expiration_date),
  CONSTRAINT product_lots_prod_presentation_id_foreign FOREIGN KEY (prod_presentation_id) REFERENCES products_presentations (id),
  CONSTRAINT product_lots_supplier_id_foreign          FOREIGN KEY (supplier_id)          REFERENCES suppliers (id)
) ENGINE=InnoDB;

-- Fuera del alcance de TAMACHIHUA-ERP (unidades seriadas)
CREATE TABLE product_units (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lot_id             BIGINT UNSIGNED NOT NULL,
  serial_number      VARCHAR(100) NULL,
  status             TINYINT      NOT NULL DEFAULT 0 COMMENT '0=Disponible,1=Reservado,2=Vendido,3=Averiado',
  sold_at            TIMESTAMP    NULL,
  last_status_change TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY product_units_serial_number_unique (serial_number),
  CONSTRAINT product_units_lot_id_foreign FOREIGN KEY (lot_id) REFERENCES product_lots (id)
) ENGINE=InnoDB;

-- Fuera del alcance de TAMACHIHUA-ERP (movimientos de inventario)
CREATE TABLE inventory_moves (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lot_id          BIGINT UNSIGNED NOT NULL,
  user_id         BIGINT UNSIGNED NOT NULL,
  movement_type   TINYINT       NOT NULL COMMENT '1=DevCliente,2=DevProveedor,3=DescVenc,4=DescAveria,5=Donacion,6=Transfer,7=Merma,8=Ajuste',
  moved_quantity  DECIMAL(10,2) NOT NULL,
  movement_date   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  movement_reason VARCHAR(255)  NOT NULL,
  invoice_code    VARCHAR(60)   NULL,
  purchase_order  VARCHAR(60)   NULL,
  cost_impact     DECIMAL(10,2) NULL,
  notes           VARCHAR(200)  NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NULL,
  PRIMARY KEY (id),
  KEY inventory_moves_movement_type_index (movement_type),
  KEY inventory_moves_lot_id_movement_date_index (lot_id, movement_date),
  CONSTRAINT inventory_moves_lot_id_foreign  FOREIGN KEY (lot_id)  REFERENCES product_lots (id),
  CONSTRAINT inventory_moves_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;
