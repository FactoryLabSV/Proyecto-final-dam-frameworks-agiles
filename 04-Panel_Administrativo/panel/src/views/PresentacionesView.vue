
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

    <!-- Catálogo de presentaciones -->
    <CatalogoGenerico
      ref="catalogo"
      titulo="Presentaciones"
      :columnas="columnas"
      :campos="campos"
      :registros="presentaciones"
      :total-registros="totalRegistros"
      :version-tabla="versionTabla"
      :cargando="cargando"
      :guardando="guardando"
      campo-estado="isActive"
      @cargar="cargarPresentaciones"
      @guardar="guardarPresentacion"
      @cambiar-estado="cambiarEstado"
    />
  </div>
</template>

<script>
import axios from 'axios'
import CatalogoGenerico from '../components/CatalogoGenerico.vue'

export default {
  name: 'PresentacionesView',

  components: {
    CatalogoGenerico
  },

  data() {
    return {
      // Rutas de la API mediante el proxy de Vue
      // Vue (8081) redirige /api hacia Spring Boot (8080)
      apiUrl: '/api/presentations',
      apiUnidades: '/api/measure-units/options',

      // Columnas de la tabla
      columnas: [
        {
          title: 'Nombre',
          key: 'name',
          sortable: false
        },
        {
          title: 'Cantidad',
          key: 'quantity',
          sortable: false
        },
        {
          title: 'Unidad de medida',
          key: 'measureUnit.name',
          sortable: false
        }
      ],

      // Opciones del selector de unidades
      opcionesUnidades: [],

      // Datos recibidos desde Spring Boot
      presentaciones: [],
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

  computed: {
    // Campos definidos en PresentationRequestDto
    campos() {
      return [
        {
          key: 'name',
          label: 'Nombre',
          required: true
        },
        {
          key: 'measureUnitId',
          label: 'Unidad de medida',
          type: 'select',
          required: true,
          options: this.opcionesUnidades
        },
        {
          key: 'quantity',
          label: 'Cantidad',
          type: 'number',
          required: true
        }
      ]
    }
  },

  mounted() {
    // Carga las unidades disponibles para el formulario
    this.cargarUnidades()
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

    // Interpreta los errores enviados por Spring Boot
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

      // Mensaje enviado por la API
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
        return 'No se encontró la presentación solicitada.'
      }

      if (estado === 409) {
        return 'Ya existe una presentación con ese nombre o tiene productos asociados.'
      }

      if (estado >= 500) {
        return 'Ocurrió un error en el servidor.'
      }

      return 'No fue posible conectar con la API de presentaciones.'
    },

    // GET: obtener unidades activas para el selector
    async cargarUnidades() {
      try {
        const respuesta = await axios.get(this.apiUnidades)

        this.opcionesUnidades = (respuesta.data || []).map(unidad => ({
          title: `${unidad.name} (${unidad.code})`,
          value: unidad.id
        }))

      } catch (error) {
        console.error('Error al cargar unidades:', error)

        this.opcionesUnidades = []

        this.mostrarMensaje(
          this.obtenerError(error),
          'error'
        )
      }
    },

    // GET: consultar presentaciones
    async cargarPresentaciones(opciones) {
      this.opciones = { ...opciones }
      this.cargando = true

      try {
        const respuesta = await axios.get(this.apiUrl, {
          params: {
            // Spring Boot comienza las páginas desde cero
            page: opciones.page - 1,
            size: opciones.size,
            search: opciones.search || ''
          }
        })

        const resultado = respuesta.data

        // Prepara los registros para la tabla y el formulario
        this.presentaciones = (resultado.content || []).map(item => ({
          ...item,
          measureUnitId: item.measureUnit?.id ?? null
        }))

        this.totalRegistros = resultado.totalElements ?? 0
        this.versionTabla += 1

      } catch (error) {
        console.error('Error al cargar presentaciones:', error)

        this.presentaciones = []
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

    // POST y PUT: registrar o editar presentaciones
    async guardarPresentacion({ id, editando, datos }) {
      if (this.guardando) return

      this.limpiarMensaje()

      const nombre = String(datos.name || '').trim()
      const unidadId = Number(datos.measureUnitId)
      const cantidadTexto = String(datos.quantity ?? '').trim()

      // Validar nombre
      if (!nombre) {
        this.mostrarMensaje(
          'El nombre de la presentación es obligatorio.',
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

      // Validar unidad de medida
      if (!Number.isInteger(unidadId) || unidadId <= 0) {
        this.mostrarMensaje(
          'Selecciona una unidad de medida válida.',
          'error'
        )
        return
      }

      // Validar cantidad: hasta 8 enteros y 2 decimales
      const formatoCantidad = /^\d{1,8}(\.\d{1,2})?$/

      if (!formatoCantidad.test(cantidadTexto)) {
        this.mostrarMensaje(
          'La cantidad admite hasta 8 enteros y 2 decimales.',
          'error'
        )
        return
      }

      const cantidad = Number(cantidadTexto)

      if (!Number.isFinite(cantidad) || cantidad < 0.01) {
        this.mostrarMensaje(
          'La cantidad debe ser mayor o igual a 0.01.',
          'error'
        )
        return
      }

      // Datos esperados por PresentationRequestDto
      const cuerpo = {
        name: nombre,
        measureUnitId: unidadId,
        quantity: cantidad
      }

      this.guardando = true

      try {
        if (editando) {
          // PUT: actualizar presentación
          await axios.put(
            `${this.apiUrl}/${id}`,
            cuerpo
          )
        } else {
          // POST: registrar presentación
          await axios.post(
            this.apiUrl,
            cuerpo
          )
        }

        // Cierra el formulario cuando la API confirma
        this.$refs.catalogo.cerrarFormulario()

        // Actualiza los registros
        await this.cargarPresentaciones(this.opciones)

        this.mostrarMensaje(
          editando
            ? 'Presentación actualizada correctamente.'
            : 'Presentación registrada correctamente.',
          'success'
        )

      } catch (error) {
        console.error('Error al guardar presentación:', error)

        this.mostrarMensaje(
          this.obtenerError(error),
          'error'
        )

      } finally {
        this.guardando = false
      }
    },

    // PATCH: activar o desactivar presentaciones
    async cambiarEstado({ id, activo }) {
      this.limpiarMensaje()

      try {
        await axios.patch(
          `${this.apiUrl}/${id}/status`,
          {
            isActive: activo
          }
        )

        await this.cargarPresentaciones(this.opciones)

        this.mostrarMensaje(
          activo
            ? 'Presentación activada correctamente.'
            : 'Presentación desactivada correctamente.',
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
