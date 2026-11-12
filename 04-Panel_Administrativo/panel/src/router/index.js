
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    // Página principal
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    // Página About
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    // S2-09: Categorías
    path: '/categorias',
    name: 'categorias',
    component: () => import('../views/CategoriasView.vue')
  },
  {
    // S2-10: Unidades de medida
    path: '/unidades-medida',
    name: 'unidades-medida',
    component: () => import('../views/UnidadesMedidaView.vue')
  },
  {
    // S2-10: Presentaciones
    path: '/presentaciones',
    name: 'presentaciones',
    component: () => import('../views/PresentacionesView.vue')
  },
  {
    // S2-11: Marcas
    path: '/marcas',
    name: 'marcas',
    component: () => import('../views/MarcasView.vue')
  },
  {
    // S2-11: Modelos
    path: '/modelos',
    name: 'modelos',
    component: () => import('../views/ModelosView.vue')
  },
  {
    // S2-12a: Listado de productos (HU-06)
    path: '/productos',
    name: 'productos',
    component: () => import('../views/ProductosView.vue'),
    meta: { title: 'Productos' }
  },
  {
    // S2-12a: Registrar producto (HU-06)
    path: '/productos/nuevo',
    name: 'producto-nuevo',
    component: () => import('../views/ProductoFormularioView.vue'),
    meta: { title: 'Registrar producto' }
  },
  {
    // S2-12a: Editar producto (HU-06)
    path: '/productos/:id/editar',
    name: 'producto-editar',
    component: () => import('../views/ProductoFormularioView.vue'),
    meta: { title: 'Editar producto' }
  },
  {
    // S2-12a: Detalle del producto y sus presentaciones (HU-07)
    path: '/productos/:id',
    name: 'producto-detalle',
    component: () => import('../views/ProductoDetalleView.vue'),
    meta: { title: 'Detalle del producto' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
