# 03 · API REST (Java + Spring Boot)

**Responsable:** Marvin Gómez · **Apoyo:** Ali Velásquez

## Crear el proyecto (Sprint 1, tarea HU-T1 / HU-T2)

1. Generar el proyecto en [Spring Initializr](https://start.spring.io) con **Maven** y **Java**, usando la versión estable que ofrezca el sitio.
2. Dependencias: Spring Web, Spring Data JPA, Validation, Spring Security y **PostgreSQL Driver**.
3. Descomprimir el proyecto **dentro de esta carpeta** (`03-API/`), de modo que `pom.xml` quede en `03-API/`.

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
- Ejecutar: `mvnw spring-boot:run` (Windows) o `./mvnw spring-boot:run`.

## Pruebas

Guardar la colección de Postman en `03-API/postman/` y actualizarla con cada endpoint nuevo.



# TAMACHIHUA-ERP-API - (Como correr la API)

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
CREATE DATABASE tamachihua_db;
```

### 4.2. Ejecutar el script SQL oficial

Antes de ejecutar la API, debes contar con la estructura de la base de datos.

Para ello:

1. Solicita o localiza el script SQL oficial proporcionado para el proyecto.
2. Abre pgAdmin.
3. Selecciona la base de datos `tamachihua_db`.
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
| `DB_URL` | Dirección de conexión a PostgreSQL | `jdbc:postgresql://localhost:5432/tamachihua_db` |
| `DB_USERNAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña del usuario | Tu contraseña local |

Cada integrante debe utilizar las credenciales de su propia instalación de PostgreSQL.


### 5.2. Configuración en Windows PowerShell

Si utilizas Windows, puedes establecer las variables para la sesión actual de PowerShell:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/tamachihua_db"
$env:DB_USERNAME="tu_usuario_postgres"
$env:DB_PASSWORD="tu_contraseña_postgres"
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
DB_URL=jdbc:postgresql://localhost:5432/tamachihua_db
DB_USERNAME=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
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

- `API_CONTRACT.md`: contrato de la API, endpoints, formatos de datos y reglas de comunicación.
- Script SQL oficial: estructura de la base de datos.
- Product Backlog: funcionalidades y requerimientos del sistema.

**Nota:** Si existe alguna diferencia entre una propuesta de arquitectura y el contrato de API vigente, se debe revisar y coordinar el cambio con el equipo antes de implementarlo.

---

## 12. Resumen del proceso de configuración

Para que un nuevo integrante pueda ejecutar el backend, debe seguir este orden:

1. Instalar Java 21, PostgreSQL y las herramientas necesarias.
2. Clonar el repositorio de GitHub.
3. Abrir el proyecto en IntelliJ IDEA.
4. Crear la base de datos `tamachihua_db`.
5. Ejecutar el script SQL oficial.
6. Configurar las variables de entorno.
7. Verificar la configuración de `application.properties`.
8. Ejecutar la aplicación Spring Boot.
9. Comprobar que la API inicia correctamente.
10. Acceder a Swagger UI o utilizar Postman para probar los endpoints.

