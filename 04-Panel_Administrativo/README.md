# 04 · Panel administrativo (Vue)

**Responsables:** Melvin Velásquez (layout, catálogos, productos, dashboard) · René Quintanilla (login, proveedores, usuarios, reporte)

Se construye con lo visto en UFDS: Vue CLI, Vue Router, Vuex, Vuetify 3 y Axios, con **Options API**.

## Crear el proyecto (lo hace un solo integrante)

Desde la carpeta `04-Panel_Administrativo/`:

```
vue create panel          (seleccionar Router y Vuex)
cd panel
vue add vuetify
npm install axios
npm run serve
```

## Configuración

- La URL de la API va en un archivo `.env.local` (ignorado por Git), por ejemplo:
  `VUE_APP_API_URL=http://localhost:8080/api`
- Subir un `.env.example` con la misma variable sin datos reales.

## Organización sugerida

```
src/views/        Una vista por pantalla (Login, Dashboard, Productos, ...)
src/components/   Componentes reutilizables (tabla de catálogo, diálogos)
src/services/     Llamadas a la API con Axios
src/store/        Vuex: token y usuario autenticado
src/router/       Rutas y protección de rutas
```

Las pantallas deben seguir los wireframes aprobados y la guía de estilo.
