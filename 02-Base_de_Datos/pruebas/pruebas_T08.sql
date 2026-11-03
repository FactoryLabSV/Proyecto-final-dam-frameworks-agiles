-- =====================================================================
-- TAMACHIHUA-ERP · Pruebas de 01_create_tables.sql y 02_seed_data.sql
-- Se ejecuta DESPUÉS de los dos scripts. Todo va dentro de una
-- transacción que termina en ROLLBACK: la base queda igual que el seed.
-- Uso: psql -U <usuario> -d <base> -f pruebas_T08.sql
-- =====================================================================
SET client_encoding = 'UTF8';   -- el archivo está en UTF-8 (necesario en Windows)
\pset footer off
\pset null '—'
BEGIN;

-- Función auxiliar: ejecuta una sentencia que DEBE fallar y muestra el error
CREATE FUNCTION pg_temp.debe_fallar(prueba text, sentencia text)
RETURNS TABLE (resultado text, prueba_ text, error_esperado text) LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    EXECUTE sentencia;
    RETURN QUERY SELECT 'FALLÓ ✗'::text, prueba, 'La sentencia se aceptó y debía rechazarse'::text;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'OK ✓'::text, prueba, SQLSTATE || ' · ' || left(SQLERRM, 95);
  END;
END;
$$;

\echo
\echo '=== 1. Filas cargadas por tabla ==='
SELECT 'roles' AS tabla, count(*) AS filas FROM roles UNION ALL
SELECT 'users', count(*) FROM users UNION ALL
SELECT 'product_categories', count(*) FROM product_categories UNION ALL
SELECT 'product_types', count(*) FROM product_types UNION ALL
SELECT 'product_brands', count(*) FROM product_brands UNION ALL
SELECT 'product_models', count(*) FROM product_models UNION ALL
SELECT 'measure_units', count(*) FROM measure_units UNION ALL
SELECT 'presentations', count(*) FROM presentations UNION ALL
SELECT 'products', count(*) FROM products UNION ALL
SELECT 'product_presentations', count(*) FROM product_presentations UNION ALL
SELECT 'product_prices', count(*) FROM product_prices UNION ALL
SELECT 'suppliers', count(*) FROM suppliers UNION ALL
SELECT 'product_lots', count(*) FROM product_lots;

\echo
\echo '=== 2. Usuarios, roles y verificación del hash BCrypt (pgcrypto) ==='
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SELECT u.username, r.code AS rol, r.name AS rol_pantalla, u.is_active AS activo,
       left(u.password_hash, 7) AS prefijo, length(u.password_hash) AS largo,
       crypt('Tamachihua2026', u.password_hash) = u.password_hash AS "clave Tamachihua2026",
       crypt('otra-clave', u.password_hash) = u.password_hash   AS "clave incorrecta"
FROM users u JOIN roles r ON r.id = u.role_id ORDER BY u.id;

\echo
\echo '=== 3. Existencia por presentación = SUM(available_quantity) de lotes activos (regla del contrato) ==='
SELECT p.code AS producto, pr.name AS presentacion, pp.code AS codigo_pp,
       COALESCE(s.stock, 0) AS existencia, pp.min_stock AS minimo,
       CASE WHEN COALESCE(s.stock, 0) = 0 THEN 'OUT'
            WHEN COALESCE(s.stock, 0) <= pp.min_stock THEN 'LOW' ELSE 'OK' END AS estado,
       pc.price AS precio_vigente
FROM product_presentations pp
JOIN products p       ON p.id  = pp.product_id
JOIN presentations pr ON pr.id = pp.presentation_id
LEFT JOIN (SELECT product_presentation_id, SUM(available_quantity) AS stock
           FROM product_lots WHERE is_active AND available_quantity > 0
           GROUP BY product_presentation_id) s ON s.product_presentation_id = pp.id
LEFT JOIN product_prices pc ON pc.product_presentation_id = pp.id AND pc.end_date IS NULL
ORDER BY pp.id;

\echo
\echo '=== 4. Historial de precios (presentaciones con cambios) ==='
SELECT pp.code, pc.price AS precio, pc.start_date AS desde, pc.end_date AS hasta,
       CASE WHEN pc.end_date IS NULL THEN 'vigente' ELSE 'histórico' END AS estado, u.full_name AS autorizo
FROM product_prices pc
JOIN product_presentations pp ON pp.id = pc.product_presentation_id
JOIN users u ON u.id = pc.user_id
WHERE pp.id IN (SELECT product_presentation_id FROM product_prices WHERE end_date IS NOT NULL)
ORDER BY pp.code, pc.start_date DESC;

\echo
\echo '=== 5. Lotes con total_cost generado (columna GENERATED) ==='
SELECT l.lot_number, pp.code AS presentacion, s.trade_name AS proveedor, l.invoice_number AS factura,
       l.entry_date AS ingreso, l.expiration_date AS vence, l.received_quantity AS recibido,
       l.available_quantity AS disponible, l.unit_cost AS costo_u, l.total_cost AS costo_total
FROM product_lots l
JOIN product_presentations pp ON pp.id = l.product_presentation_id
JOIN suppliers s ON s.id = l.supplier_id
ORDER BY l.id;

\echo
\echo '=== 6. Dashboard: lotes vencidos o por vencer en 30 días (hoy = CURRENT_DATE) ==='
SELECT CURRENT_DATE AS hoy, p.name AS producto, pr.name AS presentacion, l.lot_number, l.expiration_date,
       l.expiration_date - CURRENT_DATE AS dias,
       CASE WHEN l.expiration_date < CURRENT_DATE THEN 'EXPIRED'
            WHEN l.expiration_date - CURRENT_DATE <= 15 THEN 'RED' ELSE 'YELLOW' END AS severity
FROM product_lots l
JOIN product_presentations pp ON pp.id = l.product_presentation_id
JOIN products p ON p.id = pp.product_id
JOIN presentations pr ON pr.id = pp.presentation_id
WHERE l.is_active AND l.available_quantity > 0 AND l.expiration_date IS NOT NULL
  AND l.expiration_date <= CURRENT_DATE + 30
ORDER BY l.expiration_date;

\echo
\echo '=== 7. Restricciones: cada sentencia DEBE ser rechazada ==='
SELECT * FROM pg_temp.debe_fallar('Categoría repetida con otras mayúsculas (lower(name))',
  $q$INSERT INTO product_categories (name) VALUES ('FERRETERÍA')$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Tipo de producto repetido (químico)',
  $q$INSERT INTO product_types (name) VALUES ('químico')$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Marca repetida (FERROMAX)',
  $q$INSERT INTO product_brands (name) VALUES ('FERROMAX')$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Modelo repetido en la misma marca',
  $q$INSERT INTO product_models (product_brand_id, name) SELECT id, 'protek' FROM product_brands WHERE name = 'AgroVerde'$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('roles.code en minúsculas',
  $q$INSERT INTO roles (code, name) VALUES ('admin2', 'Otro')$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('roles.code repetido',
  $q$INSERT INTO roles (code, name) VALUES ('ADMIN', 'Admin 2')$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('username repetido',
  $q$INSERT INTO users (role_id, username, password_hash, full_name) VALUES (1, 'mrivas', 'x', 'X')$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Código de unidad de 11 caracteres (máx. 10)',
  $q$INSERT INTO measure_units (name, code) VALUES ('Prueba', 'ABCDEFGHIJK')$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Presentación con cantidad 0',
  $q$INSERT INTO presentations (measure_unit_id, name, quantity) VALUES (1, 'Prueba', 0)$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Producto con código repetido',
  $q$INSERT INTO products (product_category_id, product_type_id, code, name) VALUES (1, 1, 'FER-001', 'X')$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Producto + presentación repetidos',
  $q$INSERT INTO product_presentations (product_id, presentation_id, code, min_stock)
     SELECT product_id, presentation_id, 'NUEVO-COD', 5 FROM product_presentations WHERE code = 'FER-001-LB'$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Stock mínimo 0',
  $q$UPDATE product_presentations SET min_stock = 0 WHERE code = 'FER-001-LB'$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Segundo precio vigente en la misma presentación',
  $q$INSERT INTO product_prices (product_presentation_id, user_id, price, start_date)
     SELECT id, 1, 1.50, CURRENT_TIMESTAMP FROM product_presentations WHERE code = 'FER-001-LB'$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Precio 0',
  $q$UPDATE product_prices SET price = 0 WHERE id = 1$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('end_date anterior a start_date',
  $q$UPDATE product_prices SET end_date = TIMESTAMP '2020-01-01' WHERE id = 1$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('NIT de 18 caracteres (máx. 17)',
  $q$INSERT INTO suppliers (trade_name, legal_name, nit, credit_days) VALUES ('X', 'X', '0614-150318-102-55', 0)$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('NRC de 11 caracteres (máx. 10)',
  $q$INSERT INTO suppliers (trade_name, legal_name, nit, nrc, credit_days) VALUES ('X', 'X', '00000000-0', '12345678-90', 0)$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('NIT repetido',
  $q$INSERT INTO suppliers (trade_name, legal_name, nit, credit_days) VALUES ('X', 'X', '0614-150318-102-5', 0)$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Correo de proveedor repetido con mayúsculas',
  $q$INSERT INTO suppliers (trade_name, legal_name, nit, email, credit_days) VALUES ('X', 'X', '00000000-0', 'VENTAS@lacosecha.example', 0)$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Días de crédito negativos',
  $q$UPDATE suppliers SET credit_days = -1 WHERE id = 1$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Lote: disponible mayor que recibido',
  $q$UPDATE product_lots SET available_quantity = received_quantity + 1 WHERE id = 1$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Lote: disponible negativo',
  $q$UPDATE product_lots SET available_quantity = -1 WHERE id = 1$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Lote: cantidad recibida 0',
  $q$INSERT INTO product_lots (product_presentation_id, supplier_id, user_id, lot_number, invoice_number, invoice_date, received_quantity, available_quantity, unit_cost)
     VALUES (1, 1, 1, 'T-1', 'F-1', CURRENT_DATE, 0, 0, 1)$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Lote: costo unitario negativo',
  $q$UPDATE product_lots SET unit_cost = -0.01 WHERE id = 1$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Lote: vencimiento igual a la fecha de ingreso',
  $q$UPDATE product_lots SET expiration_date = entry_date WHERE id = 1$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Lote repetido (proveedor + lote + presentación)',
  $q$INSERT INTO product_lots (product_presentation_id, supplier_id, user_id, lot_number, invoice_number, invoice_date, received_quantity, available_quantity, unit_cost)
     SELECT product_presentation_id, supplier_id, user_id, lot_number, 'F-X', CURRENT_DATE, 1, 1, 1 FROM product_lots WHERE lot_number = 'CF-2510'$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Notas de 201 caracteres (máx. 200)',
  $q$UPDATE product_lots SET notes = repeat('x', 201) WHERE id = 1$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('Enviar total_cost (columna generada)',
  $q$UPDATE product_lots SET total_cost = 1 WHERE id = 1$q$)
UNION ALL SELECT * FROM pg_temp.debe_fallar('FK inexistente (proveedor 999)',
  $q$UPDATE product_lots SET supplier_id = 999 WHERE id = 1$q$);

\echo
\echo '=== 8. Casos que SÍ deben aceptarse ==='
-- 8a. Mismo número de lote y proveedor en otra presentación (P-07): ya cargado con PX-2407
SELECT lot_number, count(*) AS presentaciones FROM product_lots
WHERE lot_number IN ('PX-2407', 'CF-2408', 'SC-H59-26A') GROUP BY lot_number ORDER BY 1;

-- 8b. Cambio de precio (HU-08): cerrar el vigente y abrir uno nuevo en una transacción
UPDATE product_prices SET end_date = TIMESTAMP '2026-11-02 15:00'
 WHERE end_date IS NULL AND product_presentation_id = (SELECT id FROM product_presentations WHERE code = 'FER-002-LB');
INSERT INTO product_prices (product_presentation_id, user_id, price, start_date)
SELECT id, 1, 1.40, TIMESTAMP '2026-11-02 15:00' FROM product_presentations WHERE code = 'FER-002-LB';
SELECT 'Cambio de precio FER-002-LB' AS prueba, count(*) FILTER (WHERE end_date IS NULL) AS vigentes,
       count(*) AS total_historial, max(price) FILTER (WHERE end_date IS NULL) AS precio_vigente
FROM product_prices WHERE product_presentation_id = (SELECT id FROM product_presentations WHERE code = 'FER-002-LB');

-- 8c. Corrección de cantidad (HU-11) recalcula la existencia derivada
UPDATE product_lots SET available_quantity = 0 WHERE lot_number = 'AV-PK-1123';
SELECT 'Retirar lote AV-PK-1123' AS prueba, SUM(available_quantity) FILTER (WHERE is_active AND available_quantity > 0) AS existencia_frasco_1L
FROM product_lots WHERE product_presentation_id = (SELECT id FROM product_presentations WHERE code = 'AGR-010-FR1L');

-- 8d. Trigger de auditoría: la API envía created_at/updated_at NULL; un UPDATE cambia updated_at
INSERT INTO product_brands (name, created_at, updated_at) VALUES ('Marca de prueba', NULL, NULL);
SELECT 'INSERT con NULL' AS prueba, created_at IS NOT NULL AS created_ok, updated_at = created_at AS updated_igual
FROM product_brands WHERE name = 'Marca de prueba';
UPDATE product_brands SET name = 'Marca de prueba 2', created_at = TIMESTAMP '2000-01-01', updated_at = TIMESTAMP '2000-01-01'
WHERE name = 'Marca de prueba';
SELECT 'UPDATE' AS prueba, created_at <> TIMESTAMP '2000-01-01' AS created_protegido,
       updated_at <> TIMESTAMP '2000-01-01' AS updated_actualizado
FROM product_brands WHERE name = 'Marca de prueba 2';

-- 8e. Correo NULL en varios proveedores/usuarios (opcional y único)
INSERT INTO suppliers (trade_name, legal_name, nit, credit_days) VALUES ('Sin correo 1', 'S1', '11111111-1', 0), ('Sin correo 2', 'S2', '22222222-2', 0);
SELECT 'Dos proveedores sin correo ni NRC' AS prueba, count(*) AS aceptados FROM suppliers WHERE trade_name LIKE 'Sin correo%';

ROLLBACK;
\echo
\echo 'Pruebas terminadas: se hizo ROLLBACK, la base queda con los datos del seed.'
