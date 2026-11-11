
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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
