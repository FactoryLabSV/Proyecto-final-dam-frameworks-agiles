
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  // Configuración de Vuetify 3.
  pluginOptions: {
    vuetify: {}
  },

  // Configuración del servidor de desarrollo Vue.
  devServer: {
    // Puerto del panel administrativo.
    port: 8081,

    // Redirige las solicitudes de la API hacia Spring Boot.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
