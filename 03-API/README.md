# 03-API REST (Java + Spring Boot) - TAMACHIHUA-ERP-API

**Responsable:** Marvin Gómez · **Apoyo:** Ali Velásquez

## Crear el proyecto (Sprint 1, tarea HU-T1 / HU-T2)

1. Generar el proyecto en [Spring Initializr](https://start.spring.io) con **Maven** y **Java**, usando la versión estable que ofrezca el sitio.
2. Dependencias: Spring Web, Spring Data JPA, Validation, Spring Security y **PostgreSQL Driver**.
3. Descomprimir el proyecto **dentro de esta carpeta** (`03-API/`), de modo que `pom.xml` quede en `03-API/api`.

## Organización por capas

```
entity/        Entidades JPA (una por tabla)
repository/    Interfaces de Spring Data JPA
service/       Lógica de negocio
controller/    Controladores REST
dto/           Objetos de respuesta (por ejemplo, los de la app sin costos)
security/      Configuración de JWT y permisos
```

Marvin deja una entidad completa (de la entidad al controlador) como plantilla para que los demás endpoints sigan la misma estructura.

## Rutas

- `/api/...` → panel administrativo (requieren token JWT).
- `/api/app/...` → app móvil (solo lectura; sin costos ni proveedores).

## Configuración

- No subir usuario ni contraseña de la base de datos. Usar `application-local.properties` (ignorado por Git) y subir un `application-example.properties` con valores de ejemplo.
- Ejecutar: `.\mvnw.cmd spring-boot:run` (Windows) o `./mvnw spring-boot:run`.

## Pruebas

Guardar la colección de Postman en `03-API/postman/` y actualizarla con cada endpoint nuevo.



# COMO CORRER LA API

## 1. Descripción del proyecto

TAMACHIHUA ERP es un sistema de gestión empresarial orientado al control de inventario de pequeñas y medianas empresas.

Este repositorio contiene el desarrollo del **backend**, construido con Java y Spring Boot. Su función principal es proporcionar una API REST para que las aplicaciones cliente puedan consultar y gestionar la información del sistema.

### Tecnologías utilizadas

- **Java 21**
- **Spring Boot 4.1.2**
- **Spring Data JPA**
- **PostgreSQL**
- **Maven**
- **Springdoc OpenAPI**
- **Postman**

---

## 2. Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instaladas las siguientes herramientas:

| Herramienta | Descripción |
|---|---|
| Java 21 | Entorno de ejecución y desarrollo |
| PostgreSQL | Sistema gestor de base de datos |
| pgAdmin | Herramienta opcional para administrar PostgreSQL |
| Maven | Gestión de dependencias y ejecución |
| Git | Control de versiones |
| IntelliJ IDEA | Entorno de desarrollo recomendado |
| Postman | Pruebas de endpoints de la API |

Puedes comprobar la instalación de Java y Maven ejecutando:

```bash
java -version
mvn -version
```

Si el repositorio incluye Maven Wrapper, también puedes utilizarlo sin instalar Maven globalmente.

---

## 3. Clonar el repositorio

Primero, clona el repositorio desde GitHub:

```bash
git clone <REPOSITORY_URL>
```

Ingresa al directorio del proyecto:

```bash
cd tamachihua_erp-api
```

Abre el proyecto desde IntelliJ IDEA y espera a que Maven descargue las dependencias necesarias.

---

## 4. Configuración de la base de datos

El proyecto utiliza PostgreSQL como sistema gestor de base de datos.

### 4.1. Crear la base de datos

Desde pgAdmin o desde la terminal de PostgreSQL, crea una base de datos llamada:

```sql
CREATE DATABASE tamachihua_erp;
```

### 4.2. Ejecutar el script SQL oficial

Antes de ejecutar la API, debes contar con la estructura de la base de datos.

Para ello:

1. Localiza `02-Base_de_Datos/scripts/` que es donde está el script SQL oficial proporcionado para el proyecto.
2. Abre pgAdmin.
3. Selecciona la base de datos `tamachihua_erp`.
4. Abre la herramienta Query Tool.
5. Ejecuta el script SQL oficial.
6. Verifica que las tablas se hayan creado correctamente.

**Importante:** El script SQL oficial es la fuente de referencia para la estructura de la base de datos. No se debe modificar la estructura por cuenta propia sin coordinarlo con el equipo.

El proyecto utiliza:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Esto significa que Hibernate únicamente verifica que las entidades Java coincidan con la estructura existente de la base de datos. No crea ni modifica automáticamente las tablas.

Actualmente, la configuración acordada utiliza el script SQL oficial y no Flyway.

---

## 5. Configuración de variables de entorno

Para conectar la API con PostgreSQL se utilizan variables de entorno.

Esto permite que cada integrante configure sus propias credenciales sin escribir contraseñas directamente en el código fuente.

### 5.1. Variables necesarias

El proyecto necesita las siguientes variables:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_URL` | Dirección de conexión a PostgreSQL | `jdbc:postgresql://localhost:5432/tamachihua_erp` |
| `DB_USERNAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña del usuario | Tu contraseña local |
| `JWT_SECRET` | Clave Base64 para firmar los tokens (mínimo 32 bytes decodificados) | Se genera con el comando de la sección de JWT |

Cada integrante debe utilizar las credenciales de su propia instalación de PostgreSQL.


### 5.2. Configuración en Windows PowerShell

Si utilizas Windows, puedes establecer las variables para la sesión actual de PowerShell:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/tamachihua_erp"
$env:DB_USERNAME="tu_usuario_postgres"
$env:DB_PASSWORD="tu_contraseña_postgres"
$env:JWT_SECRET="el_secreto_base64_que_generaste"
```

Estas variables estarán disponibles mientras permanezca abierta esa sesión.

### 5.3. Configuración en IntelliJ IDEA

Si ejecutas el proyecto desde IntelliJ IDEA, debes configurar las variables en la configuración de ejecución.

1. Abre IntelliJ IDEA.
2. Dirígete a **Run → Edit Configurations**.
3. Selecciona la configuración de ejecución de la API.
4. Busca la sección **Environment variables**.
5. Agrega las siguientes variables:

```text
DB_URL=jdbc:postgresql://localhost:5432/tamachihua_erp
DB_USERNAME=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
JWT_SECRET=el_secreto_base64_que_generaste
```

6. Guarda los cambios.

**Importante:** Cada integrante debe configurar estas variables en su propio entorno. No se deben compartir contraseñas mediante GitHub ni subir archivos que contengan credenciales.

---

## 6. Configuración de application.properties

El archivo `src/main/resources/application.properties` contiene la configuración principal de Spring Boot.

La configuración de conexión debe tener la siguiente estructura:

```properties
spring.application.name=tamachihua-erp-api

# Configuración de PostgreSQL
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# Configuración de JPA e Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
spring.jpa.show-sql=false
```

Las variables `${DB_URL}`, `${DB_USERNAME}` y `${DB_PASSWORD}` son obtenidas del entorno de ejecución.

No es necesario escribir directamente las credenciales en este archivo.

---

## 7. Ejecutar el proyecto

Una vez configurada la base de datos y las variables de entorno, puedes iniciar la aplicación.

Desde la terminal, ubicada en la raíz del proyecto, ejecuta:

**Si tienes Maven instalado:**

```bash
mvn spring-boot:run
```

**En Windows, si el proyecto incluye Maven Wrapper:**

```powershell
.\mvnw.cmd spring-boot:run
```

Si todo está configurado correctamente, Spring Boot iniciará la aplicación.

La API estará disponible en:

```text
http://localhost:8080
```

La ruta base de los endpoints será:

```text
http://localhost:8080/api
```

---

## 8. Documentación de la API

El proyecto utiliza Springdoc OpenAPI para generar documentación de los endpoints.

Una vez iniciada la aplicación, puedes acceder a Swagger UI desde:

```text
http://localhost:8080/swagger-ui/index.html
```

También puedes consultar la especificación OpenAPI en formato JSON:

```text
http://localhost:8080/v3/api-docs
```

Swagger permite visualizar los endpoints disponibles, sus parámetros, los formatos de respuesta y realizar pruebas de las operaciones implementadas.

---

## 9. Solución de problemas comunes

A continuación, se presentan algunos errores que pueden aparecer durante la configuración del proyecto.

### Error: Connection refused

**Posible causa:** PostgreSQL no está iniciado o el puerto configurado no es correcto.

**Solución:**
- Verifica que el servicio de PostgreSQL esté activo.
- Comprueba que el puerto sea el correcto.
- Confirma que `DB_URL` tenga la dirección de conexión esperada.

### Error: password authentication failed

**Posible causa:** Las credenciales de PostgreSQL son incorrectas.

**Solución:**
- Verifica `DB_USERNAME`.
- Verifica `DB_PASSWORD`.
- Comprueba que el usuario tenga acceso a la base de datos.

### Error: The server does not support SSL

**Posible causa:** Existe una configuración de conexión incompatible con el servidor PostgreSQL.

**Solución:** Revisa la URL de conexión y la configuración de PostgreSQL utilizada por tu entorno.

### Error: Schema-validation

**Posible causa:** Las entidades Java no coinciden con las tablas o columnas existentes en PostgreSQL.

**Solución:**
- Verifica que hayas ejecutado el script SQL oficial.
- Comprueba los nombres de tablas y columnas.
- Revisa los tipos de datos y las relaciones entre entidades.

Recuerda que `ddl-auto=validate` no crea las tablas; únicamente valida la estructura existente.

### Error: Port 8080 already in use

**Posible causa:** Otra aplicación está utilizando el puerto 8080.

**Solución:** Detén la aplicación que está utilizando ese puerto o coordina un cambio de puerto para tu entorno local.

---

## 10. Convenciones de desarrollo

Para mantener una estructura uniforme y facilitar el trabajo colaborativo, todos los integrantes deben respetar las siguientes convenciones:

### Nombres e identificadores

- Los nombres de clases y métodos Java deben utilizar las convenciones de Java.
- Los endpoints y recursos de la API deben nombrarse en inglés.
- Los nombres de tablas y columnas de PostgreSQL deben utilizar inglés y `snake_case`.
- Los campos JSON deben utilizar `camelCase`.

### Base de datos

- Utilizar el script SQL oficial como referencia de la estructura.
- Mantener `spring.jpa.hibernate.ddl-auto=validate`.

### Seguridad y configuración

- No subir contraseñas ni credenciales al repositorio.
- No compartir archivos locales que contengan secretos.
- Mantener las variables de entorno configuradas individualmente.
- No incluir tokens ni información sensible en commits.

### Desarrollo colaborativo

- Revisar el contrato de API antes de implementar nuevos endpoints.
- Comunicar los cambios que afecten a otros módulos.
- Probar los endpoints con Postman.
- Mantener los cambios organizados y utilizar Git para el control de versiones.

---

## 11. Documentación de referencia

Antes de implementar nuevas funcionalidades, consulta los documentos oficiales del proyecto:

- `Diagramas/Endpoints-API.md`: contrato de la API, endpoints, formatos de datos y reglas de comunicación.
- Script SQL oficial: estructura de la base de datos.
- Product Backlog: funcionalidades y requerimientos del sistema.

**Nota:** Si existe alguna diferencia entre una propuesta de arquitectura y el contrato de API vigente, se debe revisar y coordinar el cambio con el equipo antes de implementarlo.

---

## 12. Resumen del proceso de configuración

Para que un nuevo integrante pueda ejecutar el backend, debe seguir este orden:

1. Instalar Java 21, PostgreSQL y las herramientas necesarias.
2. Clonar el repositorio de GitHub.
3. Abrir el proyecto en IntelliJ IDEA.
4. Crear la base de datos `tamachihua_erp`.
5. Ejecutar el script SQL oficial.
6. Configurar las variables de entorno.
7. Verificar la configuración de `application.properties`.
8. Ejecutar la aplicación Spring Boot.
9. Comprobar que la API inicia correctamente.
10. Acceder a Swagger UI o utilizar Postman para probar los endpoints.



# ARQUITECTURA BACKEND Y FLUJO DEL PROCESO 

## 1. Descripción del proyecto

TAMACHIHUA-ERP es un sistema de gestión empresarial orientado al control de inventario de pequeñas y medianas empresas (Pymes), como ferreterías y agroservicios.

El backend proporciona una API REST que centraliza la lógica de negocio y permite la comunicación entre los diferentes clientes del sistema:

- Panel administrativo desarrollado con Vue 3.
- Aplicación móvil desarrollada con Ionic y Angular.

La API administra la información del sistema, aplica las reglas de negocio, controla los permisos de acceso y gestiona la comunicación con la base de datos.

## 2. Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Java 21 | Lenguaje de programación |
| Spring Boot 4.1.2 | Desarrollo de la API REST |
| Spring Web MVC | Creación de endpoints |
| Spring Data JPA | Persistencia y consultas a la base de datos |
| Spring Security | Autenticación y autorización |
| JWT | Autenticación mediante tokens |
| PostgreSQL | Sistema gestor de base de datos |
| Maven | Gestión de dependencias y construcción |
| Bean Validation | Validación de datos de entrada |
| Lombok | Reducción de código repetitivo |
| Springdoc OpenAPI | Documentación de endpoints |
| Postman | Pruebas de la API |
| JUnit / Testcontainers | Pruebas automatizadas |

## 3. Estructura del proyecto

El proyecto utiliza una arquitectura por capas para separar las responsabilidades y facilitar el mantenimiento y crecimiento del código.

```text
src/
└── main/
    ├── java/
    │   └── com/
    │       └── tamachihua_erp/
    │           └── api/
    │               ├── ApiApplication.java
    │               │
    │               ├── config/
    │               │
    │               ├── controller/
    │               │
    │               ├── dto/
    │               │
    │               ├── entity/
    │               │
    │               ├── exception/
    │               │
    │               ├── mapper/
    │               │
    │               ├── repository/
    │               │
    │               ├── security/
    │               │
    │               └── service/
    │
    └── resources/
        └── application.properties
```

### Responsabilidad de cada capa

- **config:** configuraciones generales de la aplicación, CORS y documentación OpenAPI.
- **controller:** recibe las solicitudes HTTP y expone los endpoints de la API.
- **dto:** define los objetos utilizados para recibir y devolver información.
- **entity:** representa las entidades que se relacionan con las tablas de PostgreSQL.
- **exception:** centraliza el manejo de excepciones y las respuestas de error.
- **mapper:** transforma entidades en DTO y viceversa.
- **repository:** administra el acceso y las operaciones de persistencia de datos.
- **security:** contiene la configuración de seguridad, autenticación JWT, filtros y autorización por roles.
- **service:** contiene la lógica de negocio y coordina las operaciones entre controladores y repositorios.

## 4. Arquitectura de comunicación

La API utiliza una arquitectura por capas. Una solicitud sigue este flujo general:

```text
Cliente (Vue / Ionic)
        |
        v
   HTTP Request
        |
        v
   Controller
        |
        v
     Service
        |
        v
   Repository
        |
        v
    PostgreSQL
```

Los DTO y los Mapper permiten controlar cómo se reciben y se presentan los datos, evitando exponer directamente las entidades de persistencia.

La capa de seguridad interviene en las solicitudes protegidas para validar el token JWT y los permisos correspondientes.

## 5. Configuración del entorno

### Requisitos previos

Antes de ejecutar el proyecto, se debe contar con:

- JDK 21.
- Maven.
- PostgreSQL.
- Una base de datos llamada `tamachihua_erp`.
- Git.
- Postman (para realizar pruebas de los endpoints).

### Variables de entorno

La conexión a PostgreSQL se configura mediante variables de entorno para evitar almacenar credenciales directamente en el código fuente.

Variables requeridas:

| Variable | Descripción |
|---|---|
| DB_URL | Dirección de conexión a PostgreSQL |
| DB_USERNAME | Usuario de PostgreSQL |
| DB_PASSWORD | Contraseña del usuario de PostgreSQL |

Ejemplo de configuración local en Linux:

```bash
export DB_URL="jdbc:postgresql://localhost:5432/tamachihua_erp"
export DB_USERNAME="tu_usuario"
export DB_PASSWORD="tu_contraseña"
```

Los valores anteriores son ejemplos. Cada desarrollador debe configurar sus propias credenciales localmente.

### Configuración de application.properties

```properties
# Aplicación
spring.application.name=tamachihua-erp-api

# Configuración de base de datos
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
spring.jpa.show-sql=false
```

**Importante:** `ddl-auto=validate` indica que Hibernate debe comprobar que las entidades coincidan con el esquema existente. No debe utilizarse para crear o modificar automáticamente las tablas.

El script SQL oficial del proyecto es la fuente de referencia para la estructura de la base de datos.

## 6. Módulo de categorías de productos

El primer módulo que se desarrollará es el de categorías de productos.

Este módulo permitirá administrar las categorías utilizadas para clasificar los productos del inventario.

### Estructura de la tabla

Tabla: `product_categories`

| Campo | Tipo | Descripción |
|---|---|---|
| id | BIGSERIAL | Identificador único |
| name | VARCHAR(100) | Nombre de la categoría |
| description | VARCHAR(255) | Descripción de la categoría |
| is_active | BOOLEAN | Estado de la categoría |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### Script SQL

```sql
CREATE TABLE product_categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO product_categories (name, description) VALUES
    ('Ferretería', 'Herramientas y materiales'),
    ('Agroquímicos', 'Fertilizantes y plaguicidas');
```

## 7. Endpoints del módulo de categorías

La ruta base del módulo es:

`/api/categories`

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/categories` | Obtener categorías con filtros y paginación |
| GET | `/api/categories/options` | Obtener categorías activas para selectores |
| GET | `/api/categories/{id}` | Obtener una categoría por su identificador |
| POST | `/api/categories` | Registrar una categoría |
| PUT | `/api/categories/{id}` | Actualizar una categoría |
| PATCH | `/api/categories/{id}/status` | Cambiar el estado de una categoría |

### Consideraciones

- Los registros no se eliminarán físicamente.
- Para desactivar una categoría se utilizará el endpoint de cambio de estado.
- Los listados deberán admitir paginación.
- Se validarán los datos recibidos mediante DTO y Bean Validation.
- Se evitarán nombres duplicados de categorías.
- Las respuestas utilizarán códigos HTTP apropiados.

### 7.1 Otros catálogos con el mismo patrón (S2-04)

Siguen el patrón de categorías: listado paginado (`search`, `isActive`, `page`, `size` ≤ 100, `sort`), `GET /options`, `GET /{id}`, `POST` (201 + `Location`), `PUT /{id}` y `PATCH /{id}/status` (204).

| Recurso | Ruta base | Filtros extra | Reglas propias |
|---|---|---|---|
| Unidades de medida (HU-05) | `/api/measure-units` | — | `name` (≤ 50) y `code` (≤ 10) únicos sin distinguir mayúsculas. No se desactiva si tiene presentaciones activas (409). |
| Presentaciones (HU-05) | `/api/presentations` | `measureUnitId` | `quantity` > 0 con 2 decimales; `measureUnitId` debe existir y estar activa (400 con `errors[]`). La respuesta incluye `measureUnit {id, name, code}`. No se desactiva si está asignada a productos activos (409). |
| Marcas (HU-04) | `/api/brands` | — | `name` (≤ 100) único sin distinguir mayúsculas. No se desactiva si tiene modelos activos (409). |
| Modelos (HU-04) | `/api/models` | `brandId` (también en `/options?brandId=`) | `name` único **dentro de la misma marca**; `brandId` debe existir y estar activa (400 con `errors[]`). La respuesta incluye `brand {id, name}`. No se desactiva si lo usan productos activos (409). |
| Tipos de producto | `/api/product-types` | — | Solo `GET /options` (HU-20 aplazada: los tipos vienen en los datos iniciales). |

Reglas comunes:

- Un id del cuerpo que no existe o está inactivo responde **400** con `errors: [{ field, message }]` (`InvalidFieldException`).
- Nombre repetido o desactivar un registro con hijos activos responde **409**.
- El cuerpo de `PATCH /{id}/status` es `{ "isActive": false }` (`StatusRequestDto`).
- Pruebas: carpetas de cada recurso en `Postman/Tamachihua_erp.postman_collection.json`.

## 8. Seguridad y autorización

La API incorporará Spring Security y JWT para proteger los endpoints que requieran autenticación.

El sistema contempla los siguientes roles:

| Rol | Descripción |
|---|---|
| ADMIN | Administrador del sistema |
| WAREHOUSE | Personal de bodega |
| PURCHASING | Personal de compras |
| SELLER | Personal de ventas |

Los permisos se definirán explícitamente para cada endpoint de acuerdo con el contrato de la API.

Para el módulo de categorías:

- ADMIN: puede consultar y administrar categorías.
- WAREHOUSE: puede consultar categorías.
- PURCHASING: puede consultar categorías.
- SELLER: no tiene acceso a este catálogo según la matriz de permisos del contrato.

Los endpoints de escritura estarán protegidos para que únicamente los roles autorizados puedan ejecutarlos.

## 9. Manejo de errores

La API contará con un manejador global de excepciones para mantener un formato uniforme en las respuestas de error.

Códigos HTTP principales:

| Código | Significado |
|---|---|
| 200 | Solicitud procesada correctamente |
| 201 | Recurso creado correctamente |
| 204 | Operación realizada sin contenido de respuesta |
| 400 | Datos de entrada inválidos |
| 401 | Usuario no autenticado |
| 403 | Acceso denegado |
| 404 | Recurso no encontrado |
| 409 | Conflicto con el estado o los datos existentes |
| 500 | Error interno del servidor |

## 10. Pruebas de la API

Los endpoints se probarán mediante Postman y pruebas automatizadas.

Se deberán comprobar, como mínimo:

- Consultas correctas.
- Registro de categorías.
- Actualización de categorías.
- Cambio de estado.
- Búsqueda de registros inexistentes.
- Validación de campos obligatorios.
- Detección de nombres duplicados.
- Paginación y filtros.
- Autenticación y permisos de acceso.

## 11. Ejecución del proyecto

Una vez configuradas las variables de entorno y preparada la base de datos, ejecutar:

```bash
./mvnw spring-boot:run
```

Para ejecutar las pruebas:

```bash
./mvnw test
```

## 12. Convenciones de desarrollo

Para mantener un código consistente entre los integrantes del equipo:

- Utilizar nombres de clases y métodos descriptivos.
- Mantener separadas las responsabilidades de cada capa.
- Utilizar DTO para la comunicación con los clientes.
- No exponer directamente las entidades JPA en las respuestas.
- Centralizar el manejo de errores.
- Validar los datos antes de procesarlos.
- No almacenar contraseñas ni secretos en el repositorio.
- Mantener los cambios de código coordinados mediante Git.
- Respetar el contrato oficial de la API antes de modificar endpoints o estructuras de datos.

## 13. Documentación de referencia

El contrato oficial de la API define las rutas, estructuras JSON, códigos de respuesta, permisos, paginación y reglas de negocio que deben respetarse durante el desarrollo.

Este documento debe mantenerse actualizado conforme avance la implementación del backend.


#CONFIGURACIÓN DE LOGIN CON JWT Y ROLES

## Autenticación y autorización con JWT

La API utiliza **Spring Security y JSON Web Tokens (JWT)** para
autenticar a los usuarios y controlar el acceso a los endpoints según el
rol asignado a cada cuenta.

Las contraseñas se almacenan utilizando **BCrypt**. Después de iniciar
sesión correctamente, el backend genera un token JWT firmado que el
cliente debe enviar en las solicitudes a endpoints protegidos.

### 1. Configuración de seguridad

La configuración del token se realiza mediante variables de entorno. Se
debe definir `JWT_SECRET` con una clave secreta segura, codificada en
Base64 y con una longitud mínima de 32 bytes una vez decodificada.

Cómo generar `JWT_SECRET`:

- **Windows (PowerShell):**

  ```powershell
  $bytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $rng.GetBytes($bytes)
  [Convert]::ToBase64String($bytes)
  ```

  Copia el resultado y asígnalo a la variable:

  ```powershell
  $env:JWT_SECRET="el_secreto_base64_que_generaste"
  ```

- **Linux, macOS o Git Bash:**

  ```bash
  export JWT_SECRET="$(openssl rand -base64 32)"
  ```

En `application.properties` se utilizan las siguientes propiedades:

``` properties
app.jwt.secret=${JWT_SECRET}
app.jwt.expiration=3600
```

  -----------------------------------------------------------------------
  Propiedad                           Descripción
  ----------------------------------- -----------------------------------
  `app.jwt.secret`                    Clave utilizada para firmar y
                                      validar los tokens JWT. Se obtiene
                                      de la variable de entorno
                                      `JWT_SECRET`.

  `app.jwt.expiration`                Tiempo de validez del token,
                                      expresado en segundos. El valor
                                      establecido es 3600 segundos (1
                                      hora).
  -----------------------------------------------------------------------

**Importante:** - Cada entorno debe configurar su propio secreto. - No
se debe escribir el secreto directamente en el código fuente ni subirlo
al repositorio. - No se deben compartir tokens ni secretos mediante
GitHub. - La API no implementa refresh tokens. Cuando el token expira,
el usuario debe iniciar sesión nuevamente.

### 2. Roles del sistema

La autorización se basa en los roles definidos para el sistema. Los
roles no son jerárquicos: cada endpoint debe declarar explícitamente qué
roles pueden acceder.

  Rol            Descripción
  -------------- ----------------------------
  `ADMIN`        Administrador del sistema.
  `WAREHOUSE`    Personal de bodega.
  `PURCHASING`   Personal de compras.
  `SELLER`       Personal de ventas.

Los permisos se asignan de acuerdo con la matriz definida en
`Diagramas/Endpoints-API.md`. No se debe asumir que un rol hereda los
permisos de otro.

### 3. Endpoints de autenticación

  -------------------------------------------------------------------------
  Método            Endpoint            Acceso            Descripción
  ----------------- ------------------- ----------------- -----------------
  `POST`            `/api/auth/login`   Público           Autentica al
                                                          usuario y
                                                          devuelve un JWT.

  `GET`             `/api/auth/me`      Autenticado       Devuelve la
                                                          información del
                                                          usuario asociado
                                                          al token.

  `GET`             `/api/roles`        `ADMIN`           Consulta los
                                                          roles disponibles
                                                          para el sistema.
  -------------------------------------------------------------------------

#### Iniciar sesión

**Solicitud**

`POST /api/auth/login`

``` http
Content-Type: application/json
```

``` json
{
  "username": "jperez",
  "password": "TuContraseña"
}
```

**Respuesta exitosa --- HTTP 200**

``` json
{
  "accessToken": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 3,
    "username": "jperez",
    "fullName": "Juan Pérez",
    "role": "WAREHOUSE"
  }
}
```

  -----------------------------------------------------------------------
  Campo                               Descripción
  ----------------------------------- -----------------------------------
  `accessToken`                       Token JWT que debe utilizarse para
                                      acceder a los endpoints protegidos.

  `tokenType`                         Tipo de autenticación. Su valor es
                                      `Bearer`.

  `expiresIn`                         Tiempo de expiración del token en
                                      segundos.

  `user`                              Información básica del usuario
                                      autenticado y su rol.
  -----------------------------------------------------------------------

Si el usuario no existe, la contraseña es incorrecta o la cuenta está
inactiva, la API responde con **HTTP 401** y el mensaje genérico
`Credenciales inválidas`. No se debe revelar cuál de esas condiciones
ocurrió.

#### Consultar el usuario autenticado

**Solicitud**

`GET /api/auth/me`

Debe enviarse el token JWT en el encabezado `Authorization`.

Esta operación devuelve la información del usuario asociado al token.
Requiere autenticación, pero no un rol específico.

#### Consultar roles

**Solicitud**

`GET /api/roles`

Este endpoint requiere el rol `ADMIN` y permite consultar los roles
disponibles para utilizarlos, por ejemplo, en los formularios de
administración de usuarios.

### 4. Enviar el token en solicitudes protegidas

Después de iniciar sesión, el cliente debe conservar el `accessToken` y
enviarlo en el encabezado `Authorization` de cada solicitud que requiera
autenticación.

Formato:

``` http
Authorization: Bearer <accessToken>
```

Ejemplo de consulta:

``` http
GET /api/categories
Authorization: Bearer eyJhbGciOi...
```

En Postman, se puede configurar desde **Authorization → Bearer Token**,
pegando el valor de `accessToken`.

El cliente debe dejar de utilizar el token cuando expire. Según el
contrato actual, no existe un endpoint de logout: para cerrar sesión, el
cliente elimina el token almacenado localmente.

### 5. Autorización y respuestas de seguridad

Spring Security valida el token y comprueba que el rol del usuario tenga
permiso para acceder al endpoint solicitado.

Los principales escenarios son:

  -----------------------------------------------------------------------
  Código HTTP             Situación               Descripción
  ----------------------- ----------------------- -----------------------
  `401 Unauthorized`      No se envía un token    La solicitud no está
                          válido, el token expiró autenticada.
                          o las credenciales de   
                          inicio de sesión son    
                          incorrectas.            

  `403 Forbidden`         El usuario está         La solicitud está
                          autenticado, pero su    autenticada, pero no
                          rol no tiene permiso    está autorizada.
                          para realizar la        
                          operación.              
  -----------------------------------------------------------------------

Ejemplo de respuesta **HTTP 403**:

``` json
{
  "timestamp": "2026-11-06T15:44:41",
  "status": 403,
  "error": "FORBIDDEN",
  "message": "No tienes permisos para realizar esta operación",
  "path": "/api/categories/2"
}
```

Las respuestas de error mantienen el formato definido en
`Diagramas/Endpoints-API.md`. Para errores de validación HTTP 400 se
incluye el arreglo `errors` con los campos que presentan problemas.

### 6. Consideraciones de seguridad

-   Las contraseñas se almacenan mediante BCrypt; nunca se devuelven en
    las respuestas de la API.
-   El endpoint de login es público; los demás endpoints protegidos
    requieren un JWT válido.
-   Los permisos se comprueban según el rol incluido en el token y las
    reglas configuradas para cada endpoint.
-   Una cuenta desactivada no puede iniciar nuevas sesiones. Un token
    emitido antes de la desactivación conserva su validez hasta su
    expiración, de acuerdo con el contrato de la API.
-   El identificador del usuario utilizado para operaciones de auditoría
    debe obtenerse del token, nunca de un valor enviado por el cliente
    en el cuerpo de la solicitud.
-   El cliente es responsable de eliminar el token al cerrar sesión.

### 7. Pruebas recomendadas

Las siguientes verificaciones permiten comprobar el flujo de
autenticación y autorización mediante Postman y las pruebas
automatizadas:

1.  Iniciar sesión con credenciales correctas y comprobar que se recibe
    `accessToken`.
2.  Intentar iniciar sesión con una contraseña incorrecta y comprobar la
    respuesta HTTP 401.
3.  Intentar iniciar sesión con un usuario inactivo y comprobar la
    respuesta HTTP 401 con el mismo mensaje genérico.
4.  Consultar `/api/auth/me` con un token válido.
5.  Consultar un endpoint protegido sin token y comprobar la respuesta
    HTTP 401.
6.  Consultar un endpoint con un rol autorizado y comprobar que la
    operación se permite.
7.  Consultar un endpoint con un rol no autorizado y comprobar la
    respuesta HTTP 403.
8.  Comprobar que un token expirado no permite acceder a endpoints
    protegidos.

Para conocer los permisos específicos de cada recurso, se debe consultar
la matriz de autorización de `Diagramas/Endpoints-API.md`.
