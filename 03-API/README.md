# 03 · API REST (Java + Spring Boot)

**Responsable:** Marvin Gómez · **Apoyo:** Ali Velásquez

## Crear el proyecto (Sprint 1, tarea HU-T1 / HU-T2)

1. Generar el proyecto en [Spring Initializr](https://start.spring.io) con **Maven** y **Java**, usando la versión estable que ofrezca el sitio.
2. Dependencias: Spring Web, Spring Data JPA, Validation, Spring Security y el driver del motor de base de datos elegido.
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
