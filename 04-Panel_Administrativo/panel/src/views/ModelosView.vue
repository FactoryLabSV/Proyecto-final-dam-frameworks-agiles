
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

    <!-- Catálogo de modelos -->
    <CatalogoGenerico
      ref="catalogo"
      titulo="Modelos del producto"
      :columnas="columnas"
      :campos="campos"
      :registros="modelos"
      :total-registros="totalRegistros"
      :version-tabla="versionTabla"
      :cargando="cargando"
      :guardando="guardando"
      campo-estado="isActive"
      @cargar="cargarModelos"
      @guardar="guardarModelo"
      @cambiar-estado="cambiarEstado"
    />
  </div>
</template>

<script>
import axios from 'axios'
import CatalogoGenerico from '../components/CatalogoGenerico.vue'

export default {
  name: 'ModelosView',

  components: {
    CatalogoGenerico
  },

  data() {
    return {
      // Endpoints de modelos y marcas
      apiUrl: '/api/models',
      marcasUrl: '/api/brands/options',

      // Columnas de la tabla
      columnas: [
        {
          title: 'Nombre del modelo',
          key: 'name',
          sortable: false
        },
        {
          title: 'Marca',
          key: 'brandName',
          sortable: false
        }
      ],

      // Campos del formulario
      campos: [
        {
          key: 'brandId',
          label: 'Marca',
          type: 'select',
          required: true,
          options: []
        },
        {
          key: 'name',
          label: 'Nombre del modelo',
          required: true
        }
      ],

      // Datos de los modelos
      modelos: [],
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

  mounted() {
    // Carga las marcas disponibles para el formulario
    this.cargarMarcas()
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
        return 'No se encontró el modelo o la marca solicitada.'
      }

      if (estado === 409) {
        return 'Ya existe un modelo con esos datos.'
      }

      if (estado >= 500) {
        return 'Ocurrió un error en el servidor.'
      }

      return 'No fue posible completar la operación con la API.'
    },

    // GET: carga las marcas activas para el selector
    async cargarMarcas() {
      try {
        const respuesta = await axios.get(this.marcasUrl)

        const marcas = Array.isArray(respuesta.data)
          ? respuesta.data
          : []

        // Vuetify utiliza title para mostrar y value para seleccionar
        const opcionesMarcas = marcas.map(marca => ({
          title: marca.name,
          value: marca.id
        }))

        this.campos = this.campos.map(campo => {
          if (campo.key === 'brandId') {
            return {
              ...campo,
              options: opcionesMarcas
            }
          }

          return campo
        })

      } catch (error) {
        console.error('Error al cargar marcas:', error)

        this.mostrarMensaje(
          'No fue posible cargar las marcas disponibles. ' +
          this.obtenerError(error),
          'error'
        )
      }
    },

    // GET: carga los modelos con búsqueda y paginación
    async cargarModelos(opciones) {
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

        // Adaptamos la marca para el componente genérico
        this.modelos = (resultado.content || []).map(modelo => ({
          ...modelo,
          brandId: modelo.brand?.id ?? null,
          brandName: modelo.brand?.name || 'Sin marca'
        }))

        this.totalRegistros = resultado.totalElements ?? 0
        this.versionTabla += 1

      } catch (error) {
        console.error('Error al cargar modelos:', error)

        this.modelos = []
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

    // POST y PUT: registra o actualiza un modelo
    async guardarModelo({ id, editando, datos }) {
      if (this.guardando) return

      this.limpiarMensaje()

      const nombre = String(datos.name || '').trim()

      const marcaId = datos.brandId === '' ||
        datos.brandId === null ||
        datos.brandId === undefined
        ? null
        : Number(datos.brandId)

      // Valida que se seleccione una marca
      if (
        marcaId === null ||
        !Number.isInteger(marcaId) ||
        marcaId <= 0
      ) {
        this.mostrarMensaje(
          'La marca es obligatoria.',
          'error'
        )
        return
      }

      // Valida el nombre del modelo
      if (!nombre) {
        this.mostrarMensaje(
          'El nombre del modelo es obligatorio.',
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

      // Datos definidos en ProductModelRequestDto
      const cuerpo = {
        brandId: marcaId,
        name: nombre
      }

      try {
        if (editando) {
          // PUT: actualiza el modelo
          await axios.put(
            `${this.apiUrl}/${id}`,
            cuerpo
          )

        } else {
          // POST: registra el modelo
          await axios.post(this.apiUrl, cuerpo)
        }

        // Cierra el formulario después de guardar
        this.$refs.catalogo.cerrarFormulario()

        // Actualiza los modelos desde la API
        await this.cargarModelos(this.opciones)

        this.mostrarMensaje(
          editando
            ? 'Modelo actualizado correctamente.'
            : 'Modelo registrado correctamente.',
          'success'
        )

      } catch (error) {
        console.error('Error al guardar modelo:', error)

        this.mostrarMensaje(
          this.obtenerError(error),
          'error'
        )

      } finally {
        this.guardando = false
      }
    },

    // PATCH: activa o desactiva un modelo
    async cambiarEstado({ id, activo }) {
      this.limpiarMensaje()

      try {
        await axios.patch(
          `${this.apiUrl}/${id}/status`,
          {
            isActive: activo
          }
        )

        // Actualiza los registros
        await this.cargarModelos(this.opciones)

        this.mostrarMensaje(
          activo
            ? 'Modelo activado correctamente.'
            : 'Modelo desactivado correctamente.',
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
