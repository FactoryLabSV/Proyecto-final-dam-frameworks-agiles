
# 05 · App móvil (Ionic + Angular)

**Responsable:** Henry Guerra

Aplicación móvil del proyecto TAMACHIHUA-ERP, desarrollada con Ionic y Angular, utilizando componentes standalone y la plantilla tabs.

## Requisitos

- Node.js 22.22.3 o superior.
- Se recomienda Node.js 24 LTS.
- npm.
- Ionic CLI.

## Instalación y ejecución

Desde la carpeta `05-App_Movil/`:

```bash
cd app
npm install
ionic serve
```

El comando `npm install` instala las dependencias del proyecto y `ionic serve` inicia la aplicación en el navegador.

## Pantallas

- Login: autenticación contra la API con JWT y validación del rol de la app (HU-17).
- Productos: búsqueda por nombre o código, filtro por categoría y existencias por presentación (HU-13, HU-15).
- Detalle de producto: presentaciones, existencia y precio vigente (HU-14).
- Categorías: listado de categorías del inventario (HU-15).
- Avisos de error de conexión y reintento de consultas (HU-19).
- Cierre de sesión desde la pantalla de Productos.

La navegación principal utiliza únicamente dos pestañas: Productos y Categorías.

## Inicio de sesión

- La app envía el encabezado `X-Client-Interface: app` al endpoint `POST /api/auth/login`.
- Solo los roles `ADMIN`, `WAREHOUSE` y `SELLER` pueden ingresar a la aplicación móvil.
- El token se guarda en el dispositivo y se adjunta como `Bearer` en cada consulta.
- Si el token expira o la API responde `401`, se limpia la sesión y se vuelve al login.

## Configuración

- La URL de la API se configura en `app/src/environments/environment.ts` (`apiUrl`).
- El servicio HTTP se encuentra en `app/src/app/services/api.ts`.
- Para probar en un celular, la API debe estar disponible en la misma red y se debe utilizar la IP de la computadora en lugar de `localhost`.

## Estado actual

- S2-13: proyecto base Ionic + Angular y servicio HTTP aprobado.
- S2-14: búsqueda de productos conectada a la API.
- S3: login con JWT, protección de rutas e integración de la app con los endpoints móviles.
```
