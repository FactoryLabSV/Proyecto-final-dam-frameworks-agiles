
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import axios from 'axios'

// Envía el token JWT en las peticiones a la API
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// S2-08: Si la API responde 401 (token vencido o inválido), se cierra la sesión
axios.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status
    const rutaActual = router.currentRoute.value.name

    if (status === 401 && rutaActual !== 'login') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push({ name: 'login' })
    }

    return Promise.reject(error)
  }
)

loadFonts()

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .mount('#app')
