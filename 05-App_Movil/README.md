
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

- Productos: búsqueda por nombre o código y listado de existencias (HU-13).
- Detalle de producto: presentaciones, existencia y precio vigente (HU-14, pendiente).
- Categorías: listado de categorías y productos por categoría (HU-15, pendiente).
- Login (HU-17, versión futura).
- Avisos de error y sin conexión (HU-19, pendiente).
- Alertas (HU-16, versión futura).

La navegación principal utiliza únicamente dos pestañas: Productos y Categorías.

## Configuración

- La URL de la API se configura en `app/src/environments/environment.ts` (`apiUrl`).
- El servicio HTTP se encuentra en `app/src/app/services/api.ts`.
- Para probar en un celular, la API debe estar disponible en la misma red y se debe utilizar la IP de la computadora en lugar de `localhost`.

## Estado actual

- S2-13: proyecto base Ionic + Angular y servicio HTTP aprobado.
- S2-14: búsqueda de productos implementada con datos simulados.
- La conexión con la API real se realizará cuando esté disponible el endpoint móvil correspondiente.
```
