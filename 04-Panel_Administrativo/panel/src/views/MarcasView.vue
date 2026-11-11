
<template>
  <div>
    <!-- Notificaciones de éxito o error -->
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

    <!-- Catálogo de marcas -->
    <CatalogoGenerico
      ref="catalogo"
      titulo="Marcas del producto"
      :columnas="columnas"
      :campos="campos"
      :registros="marcas"
      :total-registros="totalRegistros"
      :version-tabla="versionTabla"
      :cargando="cargando"
      :guardando="guardando"
      campo-estado="isActive"
      @cargar="cargarMarcas"
      @guardar="guardarMarca"
      @cambiar-estado="cambiarEstado"
    />
  </div>
</template>

<script>
import axios from 'axios'
import CatalogoGenerico from '../components/CatalogoGenerico.vue'

export default {
  name: 'MarcasView',

  components: {
    CatalogoGenerico
  },

  data() {
    return {
      // Endpoint de marcas
      apiUrl: '/api/brands',

      // Columnas de la tabla
      columnas: [
        {
          title: 'Nombre',
          key: 'name',
          sortable: false
        }
      ],

      // Campos del formulario
      campos: [
        {
          key: 'name',
          label: 'Nombre de la marca',
          required: true
        }
      ],

      // Datos de las marcas
      marcas: [],
      totalRegistros: 0,
      versionTabla: 0,

      // Estados de carga
      cargando: false,
      guardando: false,

      // Notificaciones
      mensaje: '',
      tipoMensaje: 'success',
      mostrarNotificacion: false,

      // Búsqueda y paginación
      opciones: {
        page: 1,
        size: 10,
        search: ''
      }
    }
  },

  methods: {
    // Cierra la notificación
    cerrarNotificacion() {
      this.mostrarNotificacion = false
    },

    // Limpia las notificaciones anteriores
    limpiarMensaje() {
      this.mostrarNotificacion = false
      this.mensaje = ''
      this.tipoMensaje = 'success'
    },

    // Muestra una notificación
    mostrarMensaje(texto, tipo = 'success') {
      this.mostrarNotificacion = false
      this.mensaje = texto
      this.tipoMensaje = tipo

      this.$nextTick(() => {
        this.mostrarNotificacion = true
      })
    },

    // Obtiene los errores de Spring Boot
    obtenerError(error) {
      const respuesta = error.response?.data
      const estado = error.response?.status

      if (Array.isArray(respuesta?.errors)) {
        const detalles = respuesta.errors
          .map(item => item.message || item.defaultMessage)
          .filter(Boolean)
          .join(', ')

        if (detalles) {
          return detalles
        }
      }

      if (
        typeof respuesta?.message === 'string' &&
        respuesta.message.trim()
      ) {
        return respuesta.message
      }

      if (estado === 400) {
        return 'Revisa los datos ingresados.'
      }

      if (estado === 401 || estado === 403) {
        return 'No tienes autorización para realizar esta operación.'
      }

      if (estado === 404) {
        return 'No se encontró la marca solicitada.'
      }

      if (estado === 409) {
        return 'Ya existe una marca con ese nombre.'
      }

      if (estado >= 500) {
        return 'Ocurrió un error en el servidor.'
      }

      return 'No fue posible conectar con la API de marcas.'
    },

    // GET: carga las marcas con búsqueda y paginación
    async cargarMarcas(opciones) {
      this.opciones = { ...opciones }
      this.cargando = true

      try {
        const respuesta = await axios.get(this.apiUrl, {
          params: {
            page: opciones.page - 1,
            size: opciones.size,
            search: opciones.search || ''
          }
        })

        const resultado = respuesta.data

        this.marcas = resultado.content || []
        this.totalRegistros = resultado.totalElements ?? 0
        this.versionTabla += 1

      } catch (error) {
        console.error('Error al cargar marcas:', error)

        this.marcas = []
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

    // POST y PUT: registra o actualiza una marca
    async guardarMarca({ id, editando, datos }) {
      if (this.guardando) return

      this.limpiarMensaje()

      const nombre = String(datos.name || '').trim()

      // Valida el nombre
      if (!nombre) {
        this.mostrarMensaje(
          'El nombre de la marca es obligatorio.',
          'error'
        )
        return
      }

      if (nombre.length > 100) {
        this.mostrarMensaje(
          'El nombre no puede superar los 100 caracteres.',
          'error'
        )
        return
      }

      this.guardando = true

      const cuerpo = {
        name: nombre
      }

      try {
        if (editando) {
          // PUT: actualiza la marca
          await axios.put(
            `${this.apiUrl}/${id}`,
            cuerpo
          )
        } else {
          // POST: registra la marca
          await axios.post(this.apiUrl, cuerpo)
        }

        // Cierra el formulario después de guardar
        this.$refs.catalogo.cerrarFormulario()

        // Recarga las marcas
        await this.cargarMarcas(this.opciones)

        this.mostrarMensaje(
          editando
            ? 'Marca actualizada correctamente.'
            : 'Marca registrada correctamente.',
          'success'
        )

      } catch (error) {
        console.error('Error al guardar marca:', error)

        this.mostrarMensaje(
          this.obtenerError(error),
          'error'
        )

      } finally {
        this.guardando = false
      }
    },

    // PATCH: activa o desactiva una marca
    async cambiarEstado({ id, activo }) {
      this.limpiarMensaje()

      try {
        await axios.patch(
          `${this.apiUrl}/${id}/status`,
          {
            isActive: activo
          }
        )

        // Recarga los registros
        await this.cargarMarcas(this.opciones)

        this.mostrarMensaje(
          activo
            ? 'Marca activada correctamente.'
            : 'Marca desactivada correctamente.',
          'success'
        )

      } catch (error) {
        console.error('Error al cambiar estado:', error)

        this.mostrarMensaje(
          this.obtenerError(error),
          'error'
        )
      }
    }
  }
}
</script>
