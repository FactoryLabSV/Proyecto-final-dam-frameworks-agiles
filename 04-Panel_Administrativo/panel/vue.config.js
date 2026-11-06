
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  // Configuración de Vuetify 3.
  pluginOptions: {
    vuetify: {}
  },

  // Configuración del servidor Vue.
  devServer: {
    port: 8080,

    // Redirige las solicitudes de la API hacia Spring Boot.
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  }
})
