# 02 · Base de datos

**Responsable:** Ali Velásquez · **Apoyo:** Marvin Gómez (entidades JPA) · **Revisión:** Carlos Hernández

Motor: **PostgreSQL** (acordado por el equipo el 24/10/2026).

El diseño de DBDDR estaba en SQL Server: al adaptar los scripts usar tipos de PostgreSQL, por ejemplo `GENERATED ALWAYS AS IDENTITY` (o `BIGSERIAL`) en lugar de `IDENTITY(1,1)`, `BOOLEAN` en lugar de `BIT`, `TIMESTAMP` en lugar de `DATETIME` y `CURRENT_TIMESTAMP` en lugar de `GETDATE()`.

## Estructura sugerida

```
02-Base_de_Datos/
  diagramas/        MER / DER (archivo editable .drawio y exportación .png)
  diccionario/      Diccionario de datos
  scripts/
    01_create_tables.sql    Creación de tablas, llaves y restricciones
    02_seed_data.sql        Datos iniciales y de prueba
```

## Alcance (13 tablas)

`roles`, `users`, `product_categories`, `product_types`, `product_brands`, `product_models`,
`measure_units`, `presentations`, `products`, `products_presentations`, `product_prices`,
`suppliers`, `product_lots`

Se parte del diseño de DBDDR (ciclo 2-2025) y de Inventario Pro (DAW, ciclo 1-2026).

## Referencia: script de Inventario Pro

`Referencia/inventario_pro_mysql.sql` tiene las tablas de Inventario Pro (DAW, ciclo 1-2026) en MySQL 8, generadas desde sus migraciones de Laravel. Es **solo de consulta** para el MER y el script de PostgreSQL. No se ejecuta en el proyecto.

- Las tablas `suppliers_contacts`, `brands_suppliers`, `product_units` e `inventory_moves` están marcadas como fuera del alcance.
- Cambios ya acordados respecto a ese diseño: `requires_expiration` en `products` (D-01) y el rol Vendedor (D-03).
- Al pasarlo a PostgreSQL: `BIGINT UNSIGNED AUTO_INCREMENT` → `BIGINT GENERATED ALWAYS AS IDENTITY`, `TINYINT(1)` → `BOOLEAN`, `TINYINT` → `SMALLINT`, `COMMENT '...'` → `COMMENT ON COLUMN ...`, y quitar `ENGINE=InnoDB`.

## Convenciones

- Nombres de tablas y columnas en inglés, en minúsculas con guion bajo (`snake_case`).
- Llave primaria `id`; llaves foráneas `<tabla_en_singular>_id`.
- Borrado lógico con `is_active`; no se eliminan registros con historial.
- Campos `created_at` y `updated_at` en todas las tablas.
- Los scripts deben poder ejecutarse desde cero en una base vacía.
