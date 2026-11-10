
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

    <!-- Catálogo de unidades de medida -->
    <CatalogoGenerico
      ref="catalogo"
      titulo="Unidades de medida"
      :columnas="columnas"
      :campos="campos"
      :registros="unidades"
      :total-registros="totalRegistros"
      :version-tabla="versionTabla"
      :cargando="cargando"
      :guardando="guardando"
      campo-estado="isActive"
      @cargar="cargarUnidades"
      @guardar="guardarUnidad"
      @cambiar-estado="cambiarEstado"
    />
  </div>
</template>

<script>
import axios from 'axios'
import CatalogoGenerico from '../components/CatalogoGenerico.vue'

export default {
  name: 'UnidadesMedidaView',

  components: {
    CatalogoGenerico
  },

  data() {
    return {
      // Ruta de la API mediante el proxy de Vue
      // Vue (8081) redirige /api hacia Spring Boot (8080)
      apiUrl: '/api/measure-units',

      // Columnas de la tabla
      columnas: [
        {
          title: 'Nombre',
          key: 'name',
          sortable: false
        },
        {
          title: 'Código',
          key: 'code',
          sortable: false
        }
      ],

      // Campos definidos en MeasureUnitRequestDto
      campos: [
        {
          key: 'name',
          label: 'Nombre',
          required: true
        },
        {
          key: 'code',
          label: 'Código',
          required: true
        }
      ],

      // Datos recibidos desde la API
      unidades: [],
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

    // Limpia los mensajes anteriores
    limpiarMensaje() {
      this.mostrarNotificacion = false
      this.mensaje = ''
      this.tipoMensaje = 'success'
    },

    // Muestra una notificación durante 5 segundos
    mostrarMensaje(texto, tipo = 'success') {
      this.mostrarNotificacion = false
      this.mensaje = texto
      this.tipoMensaje = tipo

      this.$nextTick(() => {
        this.mostrarNotificacion = true
      })
    },

    // Interpreta los errores de Spring Boot
    obtenerError(error) {
      const respuesta = error.response?.data
      const estado = error.response?.status

      // Errores de validación
      if (Array.isArray(respuesta?.errors)) {
        const detalles = respuesta.errors
          .map(item => item.message || item.defaultMessage)
          .filter(Boolean)
          .join(', ')

        if (detalles) {
          return detalles
        }
      }

      // Mensaje de la API
      if (
        typeof respuesta?.message === 'string' &&
        respuesta.message.trim()
      ) {
        return respuesta.message
      }

      if (estado === 400) {
        return 'Revisa los datos ingresados.'
      }

      if (estado === 401) {
        return 'Debes iniciar sesión para continuar.'
      }

      if (estado === 403) {
        return 'No tienes permisos para realizar esta operación.'
      }

      if (estado === 404) {
        return 'No se encontró la unidad de medida.'
      }

      if (estado === 409) {
        return 'Ya existe una unidad con ese nombre o código, o tiene registros asociados.'
      }

      if (estado >= 500) {
        return 'Ocurrió un error en el servidor.'
      }

      return 'No fue posible conectar con la API de unidades de medida.'
    },

    // GET: consultar unidades con búsqueda y paginación
    async cargarUnidades(opciones) {
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

        this.unidades = resultado.content || []
        this.totalRegistros = resultado.totalElements ?? 0
        this.versionTabla += 1

      } catch (error) {
        console.error('Error al cargar unidades:', error)

        this.unidades = []
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

    // POST y PUT: registrar o editar unidades
    async guardarUnidad({ id, editando, datos }) {
      if (this.guardando) return

      this.limpiarMensaje()

      const cuerpo = {
        name: String(datos.name || '').trim(),
        code: String(datos.code || '').trim()
      }

      // Validaciones del DTO
      if (!cuerpo.name) {
        this.mostrarMensaje(
          'El nombre de la unidad es obligatorio.',
          'error'
        )
        return
      }

      if (cuerpo.name.length > 50) {
        this.mostrarMensaje(
          'El nombre no puede superar los 50 caracteres.',
          'error'
        )
        return
      }

      if (!cuerpo.code) {
        this.mostrarMensaje(
          'El código de la unidad es obligatorio.',
          'error'
        )
        return
      }

      if (cuerpo.code.length > 10) {
        this.mostrarMensaje(
          'El código no puede superar los 10 caracteres.',
          'error'
        )
        return
      }

      this.guardando = true

      try {
        if (editando) {
          // PUT: actualizar unidad
          await axios.put(
            `${this.apiUrl}/${id}`,
            cuerpo
          )
        } else {
          // POST: registrar unidad
          await axios.post(
            this.apiUrl,
            cuerpo
          )
        }

        // Cierra el formulario después del éxito
        this.$refs.catalogo.cerrarFormulario()

        // Actualiza la tabla
        await this.cargarUnidades(this.opciones)

        this.mostrarMensaje(
          editando
            ? 'Unidad de medida actualizada correctamente.'
            : 'Unidad de medida registrada correctamente.',
          'success'
        )

      } catch (error) {
        console.error('Error al guardar unidad:', error)

        this.mostrarMensaje(
          this.obtenerError(error),
          'error'
        )

      } finally {
        this.guardando = false
      }
    },

    // PATCH: activar o desactivar unidades
    async cambiarEstado({ id, activo }) {
      this.limpiarMensaje()

      try {
        await axios.patch(
          `${this.apiUrl}/${id}/status`,
          {
            isActive: activo
          }
        )

        await this.cargarUnidades(this.opciones)

        this.mostrarMensaje(
          activo
            ? 'Unidad de medida activada correctamente.'
            : 'Unidad de medida desactivada correctamente.',
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
