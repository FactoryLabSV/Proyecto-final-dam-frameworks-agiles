
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MenuLayout from '../components/MenuLayout.vue'

const routes = [
  {
    // Página principal del proyecto
    path: '/',
    redirect: '/login'
  },
  {
    // S2-08: Login (única ruta pública)
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true }
  },
  {
    // Inicio después de iniciar sesión (luego será el dashboard)
    path: '/inicio',
    name: 'home',
    component: HomeView,
    meta: { title: 'Dashboard' }
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
    // Ruta principal que envuelve a todas las vistas protegidas con el menú
    path: '/',
    component: MenuLayout,
    children: [
      {
        path: 'inicio', // Se convierte en /inicio
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'Dashboard' }
      },
      {
        path: 'categorias',
        name: 'categorias',
        component: () => import('@/views/CategoriasView.vue'),
        meta: { title: 'Gestión de Categorías' }
      },
      {
        path: 'unidades-medida', // Se convierte en /unidades-medida
        name: 'unidades-medida',
        component: () => import('@/views/UnidadesMedidaView.vue'),
        meta: { title: 'Unidades de medida' }
      },
      {
        path: '/presentaciones',
        name: 'presentaciones',
        component: () => import('../views/PresentacionesView.vue'),
        meta: { title: 'Presentaciones' }
      },
      {
        path: '/marcas',
        name: 'marcas',
        component: () => import('../views/MarcasView.vue'),
        meta: { title: 'Marcas' }
      },
      {
        path: '/modelos',
        name: 'modelos',
        component: () => import('../views/ModelosView.vue'),
        meta: { title: 'Modelos' }
      },
        // ... el resto de tus rutas (productos, marcas, lotes, etc.)
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
