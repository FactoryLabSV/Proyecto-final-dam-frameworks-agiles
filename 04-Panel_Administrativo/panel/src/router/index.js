
import { createRouter, createWebHistory } from 'vue-router'
import MenuLayout from '../components/MenuLayout.vue'

const routes = [
  {
    // S2-08: Login (única ruta pública)
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true }
  },
  {
    // S2-08: Ruta principal que envuelve a todas las vistas protegidas con el menú
    path: '/',
    component: MenuLayout,
    redirect: '/inicio',
    children: [
      {
        // HU-12: Dashboard (inicio después de iniciar sesión)
        path: 'inicio',
        name: 'home',
        component: () => import('../views/DashboardView.vue'),
        meta: { title: 'Dashboard' }
      },
      {
        // S2-09: Categorías
        path: 'categorias',
        name: 'categorias',
        component: () => import('../views/CategoriasView.vue'),
        meta: { title: 'Gestión de Categorías' }
      },
      {
        // S2-10: Unidades de medida
        path: 'unidades-medida',
        name: 'unidades-medida',
        component: () => import('../views/UnidadesMedidaView.vue'),
        meta: { title: 'Unidades de medida' }
      },
      {
        // S2-10: Presentaciones
        path: 'presentaciones',
        name: 'presentaciones',
        component: () => import('../views/PresentacionesView.vue'),
        meta: { title: 'Presentaciones' }
      },
      {
        // S2-11: Marcas
        path: 'marcas',
        name: 'marcas',
        component: () => import('../views/MarcasView.vue'),
        meta: { title: 'Marcas' }
      },
      {
        // S2-11: Modelos
        path: 'modelos',
        name: 'modelos',
        component: () => import('../views/ModelosView.vue'),
        meta: { title: 'Modelos' }
      },
      {
        // S2-12a: Listado de productos (HU-06)
        path: 'productos',
        name: 'productos',
        component: () => import('../views/ProductosView.vue'),
        meta: { title: 'Productos' }
      },
      {
        // S2-12a: Registrar producto (HU-06)
        path: 'productos/nuevo',
        name: 'producto-nuevo',
        component: () => import('../views/ProductoFormularioView.vue'),
        meta: { title: 'Registrar producto' }
      },
      {
        // S2-12a: Editar producto (HU-06)
        path: 'productos/:id/editar',
        name: 'producto-editar',
        component: () => import('../views/ProductoFormularioView.vue'),
        meta: { title: 'Editar producto' }
      },
      {
        // S2-12a: Detalle del producto y sus presentaciones (HU-07)
        path: 'productos/:id',
        name: 'producto-detalle',
        component: () => import('../views/ProductoDetalleView.vue'),
        meta: { title: 'Detalle del producto' }
      }
    ]
  },
  {
    // Cualquier ruta que no exista regresa al inicio
    path: '/:pathMatch(.*)*',
    redirect: '/inicio'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// S2-08: Protección de rutas por token
router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  // Sin sesión solo se puede entrar a las rutas públicas
  if (!token && !to.meta.public) {
    return { name: 'login' }
  }

  // Con sesión no tiene sentido volver al login
  if (token && to.name === 'login') {
    return { name: 'home' }
  }

  return true
})

export default router
