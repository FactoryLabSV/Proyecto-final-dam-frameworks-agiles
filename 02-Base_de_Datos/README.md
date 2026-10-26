# 02 · Base de datos

**Responsable:** Ali Velásquez · **Apoyo:** Marvin Gómez (entidades JPA) · **Revisión:** Carlos Hernández

Motor: **por confirmar** (propuesta SQL Server Express; alternativa PostgreSQL).

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

## Convenciones

- Nombres de tablas y columnas en inglés, en minúsculas con guion bajo (`snake_case`).
- Llave primaria `id`; llaves foráneas `<tabla_en_singular>_id`.
- Borrado lógico con `is_active`; no se eliminan registros con historial.
- Campos `created_at` y `updated_at` en todas las tablas.
- Los scripts deben poder ejecutarse desde cero en una base vacía.
