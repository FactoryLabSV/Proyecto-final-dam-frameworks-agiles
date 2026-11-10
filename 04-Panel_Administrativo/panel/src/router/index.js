
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    // Página principal del proyecto
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    // Página About original
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    // S2-09: Pantalla de Categorías
    path: '/categorias',
    name: 'categorias',
    component: () => import('../views/CategoriasView.vue')
  },
  {
    // S2-10: Pantalla de Unidades de medida
    path: '/unidades-medida',
    name: 'unidades-medida',
    component: () => import('../views/UnidadesMedidaView.vue')
  },
  {
    // S2-10: Pantalla de Presentaciones
    path: '/presentaciones',
    name: 'presentaciones',
    component: () => import('../views/PresentacionesView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
