# 05 · App móvil (Ionic + Angular)

**Responsable:** Henry Guerra

Se construye con lo visto en las prácticas de DAM: Ionic + Angular, plantilla **tabs**, componentes standalone, Axios o fetch.

## Crear el proyecto

Desde la carpeta `05-App_Movil/`:

```
ionic start app tabs      (seleccionar Angular y componentes standalone)
cd app
ionic serve
```

## Pantallas

- Login (HU-17, Sprint 4)
- Tab Productos: búsqueda y lista (HU-13)
- Detalle de producto `producto/:id` (HU-14)
- Tab Categorías y productos por categoría (HU-15)
- Tab Alertas (HU-16)
- Avisos de error y sin conexión con `ion-toast` / `ion-alert` (HU-19)

## Configuración

- La URL de la API va en `src/environments/environment.ts` (`apiUrl`).
- Para probar en el celular, la API debe estar en la misma red y usar la IP de la computadora, no `localhost`.
