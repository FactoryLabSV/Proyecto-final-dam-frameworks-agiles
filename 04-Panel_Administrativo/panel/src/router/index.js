
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    // Página principal del proyecto.
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    // Página About original.
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    // S2-09: Pantalla de Categorías.
    path: '/categorias',
    name: 'categorias',
    component: () => import('../views/CategoriasView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
