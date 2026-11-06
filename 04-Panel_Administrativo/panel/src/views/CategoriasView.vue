
<template>
  <div>
    <!-- Notificaciones automáticas de éxito o error -->
    <v-snackbar
      v-model="mostrarNotificacion"
      :color="tipoMensaje === 'error' ? 'error' : 'success'"
      :timeout="5000"
      location="top right"
      rounded="lg"
    >
      {{ mensaje }}

      <template #actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          @click="cerrarNotificacion"
        ></v-btn>
      </template>
    </v-snackbar>

    <!-- Componente genérico desarrollado en S2-07 -->
    <CatalogoGenerico
      ref="catalogo"
      titulo="Categorías del producto"
      :columnas="columnas"
      :campos="campos"
      :registros="categorias"
      :total-registros="totalRegistros"
      :version-tabla="versionTabla"
      :cargando="cargando"
      :guardando="guardando"
      campo-estado="isActive"
      @cargar="cargarCategorias"
      @guardar="guardarCategoria"
      @cambiar-estado="cambiarEstado"
    />
  </div>
</template>

<script>
import axios from 'axios'
import CatalogoGenerico from '../components/CatalogoGenerico.vue'

export default {
  name: 'CategoriasView',

  components: {
    CatalogoGenerico
  },

  data() {
    return {
      // Ruta relativa mediante el proxy de Vue.
      // Vue (8080) redirige /api hacia Spring Boot (8081).
      apiUrl: '/api/categories',

      // Columnas de la tabla.
      columnas: [
        {
          title: 'Nombre',
          key: 'name',
          sortable: false
        },
        {
          title: 'Descripción',
          key: 'description',
          sortable: false
        }
      ],

      // Campos definidos en ProductCategoryRequestDto.java.
      campos: [
        {
          key: 'name',
          label: 'Nombre',
          required: true
        },
        {
          key: 'description',
          label: 'Descripción',
          type: 'textarea'
        }
      ],

      // Datos recibidos desde Spring Boot.
      categorias: [],
      totalRegistros: 0,
      versionTabla: 0,

      // Estados de carga.
      cargando: false,
      guardando: false,

      // Configuración de notificaciones.
      mensaje: '',
      tipoMensaje: 'success',
      mostrarNotificacion: false,

      // Parámetros de búsqueda y paginación.
      opciones: {
        page: 1,
        size: 10,
        search: ''
      }
    }
  },

  methods: {
    // Cierra la notificación actual.
    cerrarNotificacion() {
      this.mostrarNotificacion = false
    },

    // Limpia los mensajes anteriores.
    limpiarMensaje() {
      this.mostrarNotificacion = false
      this.mensaje = ''
      this.tipoMensaje = 'success'
    },

    // Muestra una notificación durante 5 segundos.
    mostrarMensaje(texto, tipo = 'success') {
      // Cerramos la notificación anterior.
      this.mostrarNotificacion = false

      this.mensaje = texto
      this.tipoMensaje = tipo

      // Esperamos a que Vue actualice el componente.
      // Esto permite reiniciar el temporizador.
      this.$nextTick(() => {
        this.mostrarNotificacion = true
      })
    },

    // Interpreta los errores enviados por Spring Boot.
    obtenerError(error) {
      const respuesta = error.response?.data
      const estado = error.response?.status

      // Errores de validación de campos.
      if (Array.isArray(respuesta?.errors)) {
        const detalles = respuesta.errors
          .map(item => item.message || item.defaultMessage)
          .filter(Boolean)
          .join(', ')

        if (detalles) {
          return detalles
        }
      }

      // Mensaje específico enviado por Spring Boot.
      if (
        typeof respuesta?.message === 'string' &&
        respuesta.message.trim()
      ) {
        return respuesta.message
      }

      // Mensajes alternativos según el estado HTTP.
      if (estado === 400) {
        return 'Revisa los datos ingresados.'
      }

      if (estado === 404) {
        return 'No se encontró la categoría solicitada.'
      }

      if (estado === 409) {
        return 'Ya existe una categoría con ese nombre.'
      }

      if (estado >= 500) {
        return 'Ocurrió un error en el servidor.'
      }

      return 'No fue posible conectar con la API de categorías.'
    },

    // GET: listar categorías con búsqueda y paginación.
    async cargarCategorias(opciones) {
      this.opciones = { ...opciones }
      this.cargando = true

      try {
        const respuesta = await axios.get(this.apiUrl, {
          params: {
            // Spring Boot utiliza páginas desde cero.
            page: opciones.page - 1,
            size: opciones.size,
            search: opciones.search || ''
          }
        })

        const resultado = respuesta.data

        // Estructura definida en PageResponseDto.java.
        this.categorias = resultado.content || []
        this.totalRegistros = resultado.totalElements ?? 0

        // Actualizamos la tabla.
        this.versionTabla += 1

      } catch (error) {
        console.error(
          'Error al cargar categorías:',
          error
        )

        this.categorias = []
        this.totalRegistros = 0
        this.versionTabla += 1

        this.mostrarMensaje(
          this.obtenerError(error),
          'error'
        )

      } finally {
        this.cargando = false
      }
    },

    // POST y PUT: crear o editar categorías.
    async guardarCategoria({ id, editando, datos }) {
      if (this.guardando) return

      // Eliminamos cualquier mensaje anterior.
      this.limpiarMensaje()

      this.guardando = true

      // Enviamos únicamente los campos del DTO.
      const cuerpo = {
        name: String(datos.name || '').trim(),
        description: String(datos.description || '').trim()
      }

      try {
        if (editando) {
          // PUT: actualizar una categoría.
          await axios.put(
            `${this.apiUrl}/${id}`,
            cuerpo
          )

        } else {
          // POST: registrar una categoría.
          await axios.post(
            this.apiUrl,
            cuerpo
          )
        }

        // Cerramos el formulario solo si la API confirma.
        this.$refs.catalogo.cerrarFormulario()

        // Actualizamos los registros desde Spring Boot.
        await this.cargarCategorias(this.opciones)

        // Mostramos el mensaje correspondiente.
        this.mostrarMensaje(
          editando
            ? 'Categoría actualizada correctamente.'
            : 'Categoría registrada correctamente.',
          'success'
        )

      } catch (error) {
        console.error(
          'Error al guardar categoría:',
          error
        )

        // El formulario permanece abierto.
        // Mostramos el error real de la API.
        this.mostrarMensaje(
          this.obtenerError(error),
          'error'
        )

      } finally {
        this.guardando = false
      }
    },

    // PATCH: activar o desactivar categorías.
    async cambiarEstado({ id, activo }) {
      this.limpiarMensaje()

      try {
        await axios.patch(
          `${this.apiUrl}/${id}/status`,
          {
            isActive: activo
          }
        )

        // Actualizamos los registros desde la API.
        await this.cargarCategorias(this.opciones)

        // Mostramos la notificación.
        this.mostrarMensaje(
          activo
            ? 'Categoría activada correctamente.'
            : 'Categoría desactivada correctamente.',
          'success'
        )

      } catch (error) {
        console.error(
          'Error al cambiar estado:',
          error
        )

        this.mostrarMensaje(
          this.obtenerError(error),
          'error'
        )
      }
    }
  }
}
</script>
