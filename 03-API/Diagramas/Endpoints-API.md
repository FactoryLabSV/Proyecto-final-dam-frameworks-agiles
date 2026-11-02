# TAMACHIHUA-ERP · Contrato de APIs REST (T-10)

**Módulo:** Inventario · **Backend:** Java + Spring Boot + PostgreSQL · **Versión:** 1.1 (con decisiones del equipo) · **Autor:** Marvin Isaí Gómez
**Base de referencia:** Product Backlog v1.2 (28/10/2026) y MER v1.0 (29/10/2026, 13 tablas)

---

## 1. Convenciones generales

| Tema | Regla |
|---|---|
| Base path | `/api/...` (según HU-T2: `GET /api/categories`). Rutas de la app móvil: `/api/app/...` |
| Formato | JSON (`application/json`, UTF-8). Campos en `camelCase`; tablas y columnas en `snake_case` inglés (RNF-06) |
| Fechas | `DATE` → `yyyy-MM-dd`; `TIMESTAMP` → ISO-8601 (`2026-10-30T14:05:00`) |
| Decimales | Números JSON (no strings). Redondeo `HALF_UP` a 2 decimales en costos y precios |
| Autenticación | `Authorization: Bearer <JWT>` (BCrypt + JWT, RNF-01). El token **vence a la hora** (3600 s), sin refresh token |
| Borrado | **Lógico** (`is_active`). No existe `DELETE` en ningún recurso; se usa `PATCH /{id}/status` (RNF-04) |
| Mensajes | En español, comprensibles para el usuario final |
| Auditoría | `userId` se toma **siempre del token**, nunca del body |
| Base de datos | El **script SQL de Ali (T-08) es la fuente oficial** del esquema. No se usa Flyway. La API arranca con `spring.jpa.hibernate.ddl-auto=validate`: si una entidad no coincide con la base, la API no arranca y avisa |

> **Nota Jackson/Lombok:** un campo `boolean isActive` genera el getter `isActive()` y Jackson lo serializa como `"active"`. Usar `Boolean isActive` (wrapper) o `@JsonProperty("isActive")` para respetar este contrato.

### 1.1 Roles

| Código | Rol | Interfaz |
|---|---|---|
| `ADMIN` | Administrador (gerencia / soporte IT) | Panel Vue (y app) |
| `WAREHOUSE` | Bodega | Panel Vue y app |
| `PURCHASING` | Compras | Panel Vue |
| `SELLER` | Vendedor | Solo app Ionic |

Los roles **no son jerárquicos** (HU-17 v1.2): cada endpoint declara explícitamente qué roles acepta (`hasAnyRole`). Los permisos se validan en la API, no solo en el menú (HU-02).

### 1.2 Códigos HTTP

| Código | Uso |
|---|---|
| 200 / 201 / 204 | Consulta o actualización OK / creación OK / sin contenido (cambios de estado) |
| 400 | Validación fallida (Bean Validation o regla de negocio sobre un campo). Incluye `errors[]` (RNF-04) |
| 401 | Sin token, token vencido o credenciales incorrectas |
| 403 | Autenticado pero sin permiso para el recurso |
| 404 | Recurso no existe |
| 409 | Conflicto de unicidad o de estado (usuario duplicado, lote duplicado, precio vigente concurrente) |

### 1.3 Formato de error (único para toda la API, `@RestControllerAdvice`)

```json
{
  "timestamp": "2026-10-30T14:05:00",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Hay campos inválidos",
  "path": "/api/products",
  "errors": [
    { "field": "code", "message": "El código es obligatorio" },
    { "field": "categoryId", "message": "La categoría no existe o está inactiva" }
  ]
}
```

`error` toma valores: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`. `errors[]` solo aparece en 400.

### 1.4 Paginación y orden (listados del panel)

Parámetros: `page` (base 0, default 0), `size` (default 20, máximo 100), `sort` (`campo,asc|desc`). Respuesta:

```json
{ "content": [ ... ], "page": 0, "size": 20, "totalElements": 134, "totalPages": 7 }
```

### 1.5 Patrón CRUD de catálogos

Se repite en categorías, tipos de producto, marcas, modelos, unidades, presentaciones y proveedores.

| Operación | Método y ruta | Éxito |
|---|---|---|
| Listar (filtros `search`, `isActive`, paginado) | `GET /api/{recurso}` | 200 |
| Opciones para combos (solo activos, sin paginar) | `GET /api/{recurso}/options` → `[{id, name}]` | 200 |
| Detalle | `GET /api/{recurso}/{id}` | 200 |
| Crear | `POST /api/{recurso}` | 201 + `Location` |
| Editar | `PUT /api/{recurso}/{id}` | 200 |
| Activar / desactivar | `PATCH /api/{recurso}/{id}/status` body `{ "isActive": false }` | 204 |

---

## 2. Matriz de permisos

| Recurso | ADMIN | WAREHOUSE | PURCHASING | SELLER |
|---|:-:|:-:|:-:|:-:|
| Auth (login, me) | ✔ | ✔ | ✔ | ✔ |
| Usuarios y roles | ✔ | – | – | – |
| Catálogos (escritura) | ✔ | – | – | – |
| Catálogos (lectura / options) | ✔ | ✔ | ✔ | – |
| Productos y presentaciones (escritura) | ✔ | ✔ | – | – |
| Productos (lectura) | ✔ | ✔ | ✔ | – |
| Precios: cambiar y ver historial | ✔ | – | – | – |
| Proveedores | ✔ | – | ✔ | – |
| Lotes: registrar y corregir cantidad | ✔ | ✔ | – | – |
| Lotes: consultar (sin costos) | ✔ | ✔ | ✔ | – |
| Lotes: ver costos y último costo | ✔ | – | ✔ | – |
| Dashboard: resumen y lotes por vencer | ✔ | ✔ | – | – |
| Dashboard: bajo stock | ✔ | ✔ | ✔ | – |
| Exportar reporte (PDF/Excel) | ✔ | – | – | – |
| `/api/app/*` (consulta móvil) | ✔ | ✔ | – | ✔ |

---

## 3. Seguridad y autenticación (HU-01, HU-02, HU-17)

| Método y ruta | Roles | Descripción |
|---|---|---|
| `POST /api/auth/login` | Público | Login panel y app (misma API) |
| `GET /api/auth/me` | Autenticado | Datos del usuario en sesión |
| `GET /api/roles` | ADMIN | Lista de roles para combos |
| `GET /api/users` | ADMIN | Filtros: `search`, `roleId`, `isActive` |
| `GET /api/users/{id}` | ADMIN | Detalle |
| `POST /api/users` | ADMIN | Crear usuario (no hay autorregistro) |
| `PUT /api/users/{id}` | ADMIN | Editar datos y rol (no cambia contraseña) |
| `PATCH /api/users/{id}/status` | ADMIN | Activar / desactivar |

**LoginRequest**

| Campo | Tipo | Validación |
|---|---|---|
| `username` | string | Obligatorio, ≤ 50 |
| `password` | string | Obligatorio |

**LoginResponse (200)**

```json
{
  "accessToken": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": { "id": 3, "username": "jperez", "fullName": "Juan Pérez", "role": "WAREHOUSE" }
}
```

Reglas:
- Credenciales incorrectas **o** usuario inactivo → 401 con el mismo mensaje genérico `"Credenciales inválidas"` (no revela si falló usuario o contraseña).
- La app solo acepta roles `SELLER`, `WAREHOUSE` y `ADMIN`; el panel acepta `ADMIN`, `WAREHOUSE` y `PURCHASING`. Si el rol no corresponde a la interfaz → 403.
- **Cierre de sesión:** lo hace el cliente (la app y el panel borran el token). La API **no guarda sesiones** ni lista de tokens revocados; no existe `POST /api/auth/logout`.
- El token vence a la hora. Con un token vencido, la API responde 401 y el cliente redirige al login.
- Sin token válido, la API rechaza toda operación protegida (401).
- Un usuario desactivado conserva su token hasta que venza (máximo 1 hora); no puede iniciar sesión de nuevo.

**UserCreateRequest**

| Campo | Tipo | Validación |
|---|---|---|
| `username` | string | Obligatorio, ≤ 50, único (409 si duplicado) |
| `password` | string | Obligatorio, mínimo 8 caracteres. Se guarda con BCrypt, **nunca** se devuelve |
| `fullName` | string | Obligatorio, ≤ 150 |
| `email` | string | Opcional, formato válido, ≤ 150 |
| `roleId` | long | Obligatorio, el rol debe existir |

**UserUpdateRequest:** `fullName`, `email`, `roleId` (mismas validaciones; `username` no se edita).

**UserResponse:** `id`, `username`, `fullName`, `email`, `role {id, name}`, `isActive`, `createdAt`, `updatedAt`.

Reglas extra de seguridad: un administrador no puede desactivarse a sí mismo ni dejar al sistema sin un `ADMIN` activo (409).

---

## 4. Catálogos (HU-03, HU-04, HU-05)

Todos siguen el patrón de la sección 1.5. Escritura: `ADMIN`. Lectura y `options`: `ADMIN`, `WAREHOUSE`, `PURCHASING`.

### 4.1 Categorías · `/api/categories`

| Campo | Tipo | Validación |
|---|---|---|
| `name` | string | Obligatorio, ≤ 100, único (sin distinguir mayúsculas) |
| `description` | string | Opcional, ≤ 255 |

### 4.2 Tipos de producto · `/api/product-types`

Un nivel más de filtrado y búsqueda de productos (panel y app), con el mismo patrón CRUD que los demás catálogos.

| Campo | Tipo | Validación |
|---|---|---|
| `name` | string | Obligatorio, ≤ 100, único (sin distinguir mayúsculas) |
| `description` | string | Opcional, ≤ 255 |

### 4.3 Marcas · `/api/brands`

| Campo | Tipo | Validación |
|---|---|---|
| `name` | string | Obligatorio, ≤ 100, único |

### 4.4 Modelos · `/api/models`

Listado filtrable por `brandId`.

| Campo | Tipo | Validación |
|---|---|---|
| `brandId` | long | Obligatorio, la marca debe existir y estar activa |
| `name` | string | Obligatorio, ≤ 100, único **dentro de la misma marca** |

La respuesta incluye `brand {id, name}`.

### 4.5 Unidades de medida · `/api/measure-units`

| Campo | Tipo | Validación |
|---|---|---|
| `name` | string | Obligatorio, ≤ 50, único |
| `code` | string | Obligatorio, ≤ 10, único |

### 4.6 Presentaciones · `/api/presentations`

| Campo | Tipo | Validación |
|---|---|---|
| `name` | string | Obligatorio, ≤ 100, único (ej.: "Caja", "Saco", "Libra") |
| `measureUnitId` | long | Obligatorio, la unidad debe existir y estar activa |
| `quantity` | decimal(10,2) | Obligatorio, **> 0** (cantidad contenida) |

La respuesta incluye `measureUnit {id, name, code}`.

Regla común: **no se puede desactivar** un registro de catálogo que tenga hijos activos (categoría o tipo con productos activos, marca con modelos activos, etc.) → 409.

---

## 5. Productos (HU-06, HU-07, HU-08)

### 5.1 Productos · `/api/products`

| Método y ruta | Roles | Descripción |
|---|---|---|
| `GET /api/products` | ADMIN, WAREHOUSE, PURCHASING | Filtros: `search` (nombre o código), `categoryId`, `productTypeId`, `isActive`; paginado |
| `GET /api/products/{id}` | ADMIN, WAREHOUSE, PURCHASING | Detalle con presentaciones |
| `POST /api/products` | ADMIN, WAREHOUSE | Crear |
| `PUT /api/products/{id}` | ADMIN, WAREHOUSE | Editar |
| `PATCH /api/products/{id}/status` | ADMIN, WAREHOUSE | Activar / desactivar |

**ProductRequest**

| Campo | Tipo | Validación |
|---|---|---|
| `code` | string | Obligatorio, ≤ 50, único (409) |
| `name` | string | Obligatorio, ≤ 150 |
| `description` | string | Opcional, ≤ 255 |
| `categoryId` | long | Obligatorio, categoría existente y activa |
| `productTypeId` | long | Obligatorio, tipo existente y activo |
| `productModelId` | long | Opcional, modelo existente y activo |
| `requiresExpiration` | boolean | Obligatorio (D-01). Si el producto ya tiene lotes activos, no se permite cambiarlo a `false` (409) |

**ProductListItem** (listado del panel)

```json
{
  "id": 12, "code": "CLV-001", "name": "Clavo 2 pulgadas",
  "categoryName": "Ferretería general", "productTypeName": "Consumible",
  "requiresExpiration": false, "isActive": true,
  "stockByPresentation": [
    { "productPresentationId": 31, "presentationName": "Caja", "stock": 40.00, "stockStatus": "OK" },
    { "productPresentationId": 32, "presentationName": "Libra", "stock": 5.00, "stockStatus": "LOW" }
  ]
}
```

**ProductDetail**

```json
{
  "id": 12, "code": "CLV-001", "name": "Clavo 2 pulgadas", "description": "Clavo de acero",
  "category": { "id": 1, "name": "Ferretería general" },
  "productType": { "id": 2, "name": "Consumible" },
  "productModel": { "id": 5, "name": "Std", "brand": { "id": 2, "name": "Acme" } },
  "requiresExpiration": false, "isActive": true,
  "presentations": [
    {
      "id": 31, "code": "CLV-001-CJ",
      "presentation": { "id": 4, "name": "Caja", "measureUnit": "Libra", "quantity": 25.00 },
      "minStock": 10.00, "currentPrice": 18.50, "stock": 40.00,
      "stockStatus": "OK", "isActive": true
    }
  ]
}
```

**Regla de existencia (derivada, no se guarda):** `stock` = suma de `available_quantity` de los **lotes activos** de esa presentación (lote activo: `is_active = true` y `available_quantity > 0`). `stockStatus`: `OUT` si `stock = 0`; `LOW` si `stock ≤ minStock`; `OK` en otro caso. `currentPrice` es `null` si la presentación aún no tiene precio.

### 5.2 Presentaciones del producto (HU-07) · `/api/products/{productId}/presentations`

| Método y ruta | Roles | Descripción |
|---|---|---|
| `GET /api/products/{productId}/presentations` | ADMIN, WAREHOUSE, PURCHASING | Lista con existencia, mínimo y precio |
| `POST /api/products/{productId}/presentations` | ADMIN, WAREHOUSE | Asignar presentación |
| `PUT /api/products/{productId}/presentations/{id}` | ADMIN, WAREHOUSE | Editar código y stock mínimo |
| `PATCH /api/products/{productId}/presentations/{id}/status` | ADMIN, WAREHOUSE | Activar / desactivar |

| Campo | Tipo | Validación |
|---|---|---|
| `presentationId` | long | Obligatorio al crear, presentación existente y activa. Combinación producto + presentación **única** (409) |
| `code` | string | Obligatorio, ≤ 50, único en todo el sistema (409). Se usa en la búsqueda de la app |
| `minStock` | decimal(12,2) | Obligatorio, **> 0**, editable en cualquier momento, distinto por producto |

### 5.3 Precios (HU-08)

| Método y ruta | Roles | Descripción |
|---|---|---|
| `POST /api/products/{productId}/presentations/{id}/prices` | ADMIN | Cambiar precio de venta (201) |
| `GET /api/products/{productId}/presentations/{id}/prices` | ADMIN | Historial, más reciente primero |

**PriceRequest:** `{ "price": 19.75 }` → `price` obligatorio, **> 0**, `decimal(10,2)`.

Reglas (una sola transacción):
1. Cierra el precio vigente (`end_date = now`) y crea el nuevo (`start_date = now`, `end_date = null`, `user_id` del token).
2. Solo puede existir **un precio vigente** por presentación. Se valida en el servicio (bloqueando la fila de la presentación) y, si el script de la BD lo incluye, también con el índice único parcial `UNIQUE (product_presentation_id) WHERE end_date IS NULL` (ver P-11). Conflicto concurrente → 409.

**PriceHistoryItem:** `id`, `price`, `startDate`, `endDate` (null = vigente), `changedBy {id, fullName}`.

---

## 6. Proveedores (HU-09) · `/api/suppliers`

Patrón CRUD (sección 1.5). Roles: `ADMIN`, `PURCHASING`. Filtros: `search` (nombre comercial, razón social o NIT), `isActive`.

| Campo | Tipo | Validación |
|---|---|---|
| `tradeName` | string | Obligatorio, ≤ 150 |
| `legalName` | string | Obligatorio, ≤ 150 |
| `nit` | string | Obligatorio, único, ≤ 17. Acepta **NIT de 14 dígitos** (`0000-000000-000-0`) o **DUI usado como NIT** (`00000000-0`): `^(\d{4}-\d{6}-\d{3}-\d\|\d{8}-\d)$`. Solo formato, sin dígito verificador |
| `nrc` | string | Opcional, único, ≤ 10, formato `^\d{1,7}-\d$` (propuesto, ver P-08) |
| `address` | string | Opcional, ≤ 255 |
| `phone` | string | Opcional, ≤ 20, solo dígitos, espacios, `+` y `-` |
| `email` | string | Opcional, formato válido, ≤ 150, **único** (409) |
| `creditDays` | integer | Obligatorio, **≥ 0** |

---

## 7. Lotes (HU-10, HU-11)

| Método y ruta | Roles | Descripción |
|---|---|---|
| `POST /api/lots` | ADMIN, WAREHOUSE | Registrar ingreso de un lote (201) |
| `GET /api/lots` | ADMIN, WAREHOUSE, PURCHASING | Consulta ordenada por vencimiento |
| `GET /api/lots/{id}` | ADMIN, WAREHOUSE, PURCHASING | Detalle |
| `PATCH /api/lots/{id}/available-quantity` | ADMIN, WAREHOUSE | Corregir cantidad disponible |
| `GET /api/products/{productId}/last-cost` | ADMIN, PURCHASING | Último costo pagado por presentación |

**LotRequest (POST)**

| Campo | Tipo | Validación |
|---|---|---|
| `productPresentationId` | long | Obligatorio, existente y activa |
| `supplierId` | long | Obligatorio, proveedor existente y activo |
| `invoiceNumber` | string | Obligatorio, ≤ 50 |
| `invoiceDate` | date | Obligatorio, no puede ser futura |
| `lotNumber` | string | Obligatorio, ≤ 50. **Único por proveedor** (409) |
| `receivedQuantity` | decimal(12,2) | Obligatorio, **> 0** (conteo físico) |
| `unitCost` | decimal(10,2) | Obligatorio, **≥ 0** |
| `expirationDate` | date | **Obligatoria si el producto tiene `requiresExpiration = true`** (D-01); si viene, debe ser **posterior** a la fecha de ingreso |
| `notes` | string | Opcional, **≤ 200** caracteres (diferencias entre lo facturado y lo contado) |

Lo calcula el servidor (el cliente no lo envía): `entryDate = hoy`, `availableQuantity = receivedQuantity`, `totalCost = receivedQuantity × unitCost`, `userId` del token, `isActive = true`.

Al ser la existencia derivada de los lotes, guardar el lote **ya incrementa el stock**. Todo el registro va en una transacción (`@Transactional`): si algo falla, no se guarda nada a medias.

**LotItem** (listado/detalle)

```json
{
  "id": 77, "lotNumber": "L-2026-0415",
  "product": { "id": 12, "code": "CLV-001", "name": "Clavo 2 pulgadas" },
  "presentation": { "productPresentationId": 31, "name": "Caja" },
  "supplier": { "id": 4, "tradeName": "Distribuidora Sur" },
  "invoiceNumber": "F-10234", "invoiceDate": "2026-10-28", "entryDate": "2026-10-30",
  "expirationDate": "2027-03-01", "daysToExpire": 122, "expirationSeverity": "NONE",
  "receivedQuantity": 50.00, "availableQuantity": 40.00,
  "notes": "Faltaron 2 cajas", "isActive": true,
  "unitCost": 12.50, "totalCost": 625.00
}
```

`expirationSeverity`: `NONE` (sin fecha o más de 30 días), `YELLOW`, `RED` o `EXPIRED` (misma regla de la sección 8). `daysToExpire` es negativo si el lote ya venció.

`unitCost` y `totalCost` **solo se serializan para `ADMIN` y `PURCHASING`**; para `WAREHOUSE` el campo no aparece (se usan dos DTOs: `LotResponse` y `LotCostResponse`, nunca ocultar con `@JsonIgnore`).

**Filtros de `GET /api/lots`:** `productId`, `supplierId`, `invoiceNumber`, `onlyAvailable` (`availableQuantity > 0`), paginado. Orden por defecto: `expirationDate asc` con nulos al final.

**Corrección de cantidad (HU-11):** `PATCH /api/lots/{id}/available-quantity` con `{ "availableQuantity": 38.00 }`. Validación: **≥ 0** y **≤ `receivedQuantity`**. El stock se recalcula solo (derivado). Es la vía para que Bodega retire un lote vencido (cantidad 0).

**Último costo:** `GET /api/products/{productId}/last-cost` → `[{ productPresentationId, presentationName, lastUnitCost, lotId, entryDate }]` (lote más reciente por presentación).

---

## 8. Dashboard (HU-12)

| Método y ruta | Roles | Respuesta |
|---|---|---|
| `GET /api/dashboard/summary` | ADMIN, WAREHOUSE | `{ activeProducts, lowStockProducts, activeLots, expiringLots, expiredLots }` |
| `GET /api/dashboard/low-stock` | ADMIN, WAREHOUSE, PURCHASING | Tabla de bajo stock, paginada |
| `GET /api/dashboard/expiring-lots` | ADMIN, WAREHOUSE | Lotes vencidos y por vencer en 30 días |

**LowStockItem:** `productId`, `productCode`, `productName`, `presentationName`, `currentStock`, `minStock`, `missing` (`minStock − currentStock`, nunca negativo). Condición: `currentStock ≤ minStock`.

**ExpiringLotItem:** `lotId`, `productName`, `presentationName`, `lotNumber`, `expirationDate`, `daysRemaining`, `severity`, `label`.

Solo entran **lotes activos** (`is_active = true` y `available_quantity > 0`) con `expirationDate` informada y `expirationDate ≤ hoy + 30 días`. Orden: `expirationDate asc` (los vencidos aparecen primero).

| `severity` | Condición (`daysRemaining`) | `label` | Color |
|---|---|---|---|
| `EXPIRED` | `< 0` (ya venció y aún tiene existencia) | Vencido | Rojo |
| `RED` | `0` a `15` | Vence pronto | Rojo |
| `YELLOW` | `16` a `30` | Vence pronto | Amarillo |

Regla D-04: ventana fija de 30 días. Los valores se calculan en cada consulta, por lo que la alerta desaparece cuando deja de cumplirse (por ejemplo, cuando Bodega corrige la cantidad del lote a 0). `expiringLots` cuenta `RED` + `YELLOW`; `expiredLots` cuenta `EXPIRED`.

---

## 9. Reporte de existencias (HU-18)

| Método y ruta | Roles | Descripción |
|---|---|---|
| `GET /api/reports/stock/export?format=PDF\|XLSX&categoryId=` | ADMIN | Descarga el archivo |

Columnas: código, producto, presentación, existencia, stock mínimo, precio vigente. Respuesta: `Content-Disposition: attachment; filename="existencias-2026-10-30.pdf|xlsx"`. `categoryId` es opcional. Si el equipo decide generar el archivo en Vue (pendiente del Planning), el panel puede usar `GET /api/products` con sus filtros y este endpoint queda como alternativa.

---

## 10. API móvil (HU-13, HU-14, HU-15, HU-16, HU-19) · `/api/app/*`

Roles permitidos: `SELLER`, `WAREHOUSE`, `ADMIN`. **Sprint 3:** rutas sin token (para pruebas). **Sprint 4:** requieren JWT (HU-17); las reglas de acceso viven en un único `SecurityFilterChain`, por lo que el cambio es una línea.

Regla de oro (HU-14): estos DTOs **no contienen costos, lotes ni proveedores**, aunque la ruta se llame directamente. Son clases distintas de las del panel.

| Método y ruta | Descripción | HU |
|---|---|---|
| `GET /api/app/products?search=&categoryId=&productTypeId=&page=&size=` | Búsqueda y filtros por categoría y tipo | 13, 15 |
| `GET /api/app/products/{id}` | Detalle con presentaciones, existencia y precio | 14 |
| `GET /api/app/categories` | Categorías activas para filtrar | 15 |
| `GET /api/app/product-types` | Tipos de producto activos para filtrar | 15 |
| `GET /api/app/alerts/low-stock` | Productos en bajo stock | 16 |

**Búsqueda (`search`):** coincide por nombre (contiene, sin distinguir mayúsculas), por código de producto o por **código exacto de presentación**. Se combina con `categoryId` y `productTypeId`. Solo productos y presentaciones activos. Sin resultados → 200 con `content: []` (el mensaje "sin resultados" lo muestra la app). Tamaño máximo de página: 50.

**AppProductSummary** (lista)

```json
{
  "content": [
    {
      "id": 12, "code": "CLV-001", "name": "Clavo 2 pulgadas", "categoryName": "Ferretería general",
      "stock": [
        { "presentationName": "Caja", "stock": 40.00, "stockStatus": "OK" },
        { "presentationName": "Libra", "stock": 0.00, "stockStatus": "OUT" }
      ]
    }
  ],
  "page": 0, "size": 20, "totalElements": 1, "totalPages": 1
}
```

**AppProductDetail**

```json
{
  "id": 12, "code": "CLV-001", "name": "Clavo 2 pulgadas", "description": "Clavo de acero",
  "categoryName": "Ferretería general", "productTypeName": "Consumible", "brandName": "Acme",
  "presentations": [
    { "code": "CLV-001-CJ", "name": "Caja", "unit": "Libra", "quantity": 25.00,
      "price": 18.50, "stock": 40.00, "stockStatus": "OK" }
  ]
}
```

`price` es `null` si no hay precio vigente. `stockStatus`: `OK`, `LOW` (bajo stock) u `OUT` (agotado). `brandName` es `null` si el producto no tiene modelo. **Nunca** se devuelve `minStock`, `unitCost`, `supplier` ni datos de lotes.

**AppCategory / AppProductType:** `{ "id": 1, "name": "Ferretería general" }`.

**AppLowStockItem (HU-16):** `productId`, `productName`, `presentationName`, `stock`, `stockStatus`. Sin `minStock`.

**Sin conexión (HU-19):** es responsabilidad de la app (interceptor HTTP + `ion-toast`/`ion-alert` con reintento). La API no cachea ni devuelve datos antiguos.

---

## 11. Decisiones y pendientes

### 11.1 Decisiones cerradas (incorporadas en esta versión)

| ID | Tema | Decisión |
|---|---|---|
| P-02 | Cierre de sesión | Lo hace el cliente borrando el token; JWT de 1 hora; sin lista de revocados ni tabla 14 |
| P-04 | Productos y Bodega | Bodega registra y edita productos y presentaciones (HU-06). El PO corrige la tabla de roles del documento 07 |
| P-05 | Tipos de producto | Nivel extra de filtrado y búsqueda; mismo CRUD que los demás catálogos |
| P-06 | Lotes vencidos | Con existencia, aparecen en el dashboard con `severity = EXPIRED`, etiqueta "Vencido", en rojo. Lote activo = `is_active = true` y `available_quantity > 0` |
| P-08 (NIT) | Formato de NIT | Acepta NIT de 14 dígitos y DUI como NIT; solo validación de formato |
| Flyway | Control del esquema | Sin Flyway. Script de Ali (T-08) como fuente oficial; `ddl-auto=validate` |

### 11.2 Pendientes abiertos

| ID | Tema | Propuesta | Con quién |
|---|---|---|---|
| P-01 | Tabla `products_presentations` (plural en ambos lados, distinta al resto). Con `ddl-auto=validate` el nombre de la entidad debe coincidir con el script | Renombrar a `product_presentations` en el script antes de crear las entidades. Si no se renombra, la entidad usa `@Table(name = "products_presentations")` | Ali |
| P-03 | "Existencia total" (HU-06, HU-13) contradice HU-07 ("sin mezclar presentaciones distintas"): sumar cajas con libras no tiene sentido | El contrato devuelve la existencia **por presentación**. Si el PO quiere un solo número, se agrega `totalStock` | PO |
| P-07 | Unicidad de lote: el MER la define por proveedor (`supplier_id + lot_number`). Un proveedor puede reutilizar el mismo número para productos distintos de una factura | Si ocurre, ampliar a `supplier_id + lot_number + product_presentation_id` | PO / Ali |
| P-08 (NRC) | Formato del NRC (HU-09) | `hasta 7 dígitos, guion, 1 dígito`. Validar con el PO | PO |
| P-09 | La corrección de lote (HU-11) no guarda quién la hizo (`user_id` del lote es quien lo registró) | Aceptable para esta versión; a futuro, tabla de movimientos/kardex | Equipo |
| P-10 | Un lote vencido con existencia **sigue sumando** al stock que ve el vendedor en la app, hasta que Bodega corrige su cantidad | Mantener la regla simple del MER (suma de lotes activos). Si el PO prefiere excluir vencidos del stock mostrado, se agrega la condición `expiration_date >= hoy` en la consulta | PO |
| P-11 | Con `ddl-auto=validate`, el script de Ali debe coincidir exactamente con las entidades (tipos, longitudes, nombres). `validate` **no revisa** índices, `CHECK` ni datos | El script T-08 debe incluir: índice único parcial de precios vigentes; `CHECK` de cantidades (> 0) y `notes` ≤ 200; **datos iniciales**: los 4 roles (`ADMIN`, `WAREHOUSE`, `PURCHASING`, `SELLER`) y un **usuario administrador inicial** con contraseña en BCrypt (no hay autorregistro, sin él nadie puede entrar) | Ali |

---

## 12. Cobertura de historias

| Épica | Historias | Sección |
|---|---|---|
| Seguridad | HU-01, HU-02, HU-17 | 3 |
| Catálogos | HU-03, HU-04, HU-05 | 4 |
| Productos | HU-06, HU-07, HU-08 | 5 |
| Proveedores | HU-09 | 6 |
| Lotes | HU-10, HU-11 | 7 |
| Dashboard | HU-12, HU-18 | 8, 9 |
| App móvil | HU-13, HU-14, HU-15, HU-16, HU-19 | 10 |

---

## 13. Historial de cambios

**v1.1**
- Se eliminó `POST /api/auth/logout`; el cierre de sesión es del cliente y el JWT vence a la hora (P-02).
- Se quitó la marca de pendiente en permisos de productos: Bodega escribe productos y presentaciones (P-04).
- Tipos de producto pasan a CRUD completo (`/api/product-types`) y se agregó el filtro `productTypeId` y `GET /api/app/product-types` en la app (P-05).
- Dashboard: nueva severidad `EXPIRED` con etiqueta "Vencido"; definición de lote activo; `summary` incluye `expiredLots` (P-06).
- NIT acepta DUI como NIT (P-08).
- Se eliminó Flyway: el script de Ali es la fuente oficial y se usa `ddl-auto=validate`; nuevos pendientes P-10 y P-11.

**v1.0** · Primera versión del contrato.
