<template>
  <v-container fluid class="pa-4">
    <!-- Notificaciones de éxito o error -->
    <v-snackbar
      v-model="mostrarNotificacion"
      :color="colorNotificacion"
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
        />
      </template>
    </v-snackbar>

    <!-- Encabezado -->
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
      <div>
        <h2 class="mb-1">
          Productos
        </h2>

        <div class="text-body-2 text-medium-emphasis">
          Catálogo de productos y existencias por presentación.
        </div>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="nuevoProducto"
      >
        Nuevo producto
      </v-btn>
    </div>

    <v-card elevation="2">
      <v-card-text>
        <!-- Búsqueda y filtros -->
        <v-row dense align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="busqueda"
              label="Buscar por nombre o código"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @keyup.enter="buscar"
              @click:clear="limpiarBusqueda"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              :model-value="filtros.categoryId"
              :items="opcionesCategorias"
              item-title="title"
              item-value="value"
              label="Categoría"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @update:model-value="cambiarFiltro('categoryId', $event)"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              :model-value="filtros.productTypeId"
              :items="opcionesTipos"
              item-title="title"
              item-value="value"
              label="Tipo"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @update:model-value="cambiarFiltro('productTypeId', $event)"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              :model-value="filtros.isActive"
              :items="opcionesEstado"
              item-title="title"
              item-value="value"
              label="Estado"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @update:model-value="cambiarFiltro('isActive', $event)"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-btn
              color="primary"
              variant="outlined"
              block
              prepend-icon="mdi-magnify"
              @click="buscar"
            >
              Buscar
            </v-btn>
          </v-col>
        </v-row>

        <!-- Tabla paginada desde el servidor -->
        <v-data-table-server
          :key="versionTabla"
          :headers="columnas"
          :items="productos"
          :items-length="totalRegistros"
          :loading="cargando"
          :page="pagina"
          :items-per-page="tamano"
          item-value="id"
          hide-default-footer
          class="mt-4"
        >
          <!-- Código -->
          <template #item.code="{ item }">
            <span class="font-weight-medium">{{ item.code }}</span>
          </template>

          <!-- Nombre y datos auxiliares -->
          <template #item.name="{ item }">
            <div class="font-weight-medium">
              {{ item.name }}
            </div>

            <div
              v-if="item.requiresExpiration"
              class="text-caption text-medium-emphasis d-flex align-center ga-1 mt-1"
            >
              <v-icon size="14">mdi-calendar-clock</v-icon>
              Requiere vencimiento
            </div>
          </template>

          <template #item.categoryName="{ item }">
            {{ item.categoryName || '—' }}
          </template>

          <template #item.productTypeName="{ item }">
            {{ item.productTypeName || '—' }}
          </template>

          <!-- Existencia de cada presentación, sin sumarlas entre sí -->
          <template #item.stockByPresentation="{ item }">
            <div
              v-if="item.stockByPresentation?.length"
              class="d-flex flex-column ga-1 py-1"
            >
              <div
                v-for="presentacion in item.stockByPresentation"
                :key="presentacion.productPresentationId"
                class="d-flex flex-wrap align-center ga-2"
              >
                <span class="text-body-2">
                  {{ presentacion.presentationName }}
                </span>

                <span class="font-weight-medium">
                  {{ formatearNumero(presentacion.stock) }}
                </span>

                <EstadoStockChip :status="presentacion.stockStatus" />
              </div>
            </div>

            <v-chip
              v-else
              size="small"
              variant="tonal"
              color="grey"
            >
              Sin presentaciones
            </v-chip>
          </template>

          <!-- Estado del producto -->
          <template #item.isActive="{ item }">
            <v-chip
              :color="item.isActive ? 'success' : 'error'"
              size="small"
            >
              {{ item.isActive ? 'Activo' : 'Inactivo' }}
            </v-chip>
          </template>

          <!-- Acciones -->
          <template #item.acciones="{ item }">
            <div class="d-flex flex-nowrap justify-end ga-1">
              <v-tooltip text="Ver detalle" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-eye"
                    color="info"
                    size="small"
                    variant="text"
                    aria-label="Ver detalle del producto"
                    @click="verDetalle(item)"
                  />
                </template>
              </v-tooltip>

              <v-tooltip text="Editar producto" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil"
                    color="primary"
                    size="small"
                    variant="text"
                    aria-label="Editar producto"
                    @click="editarProducto(item)"
                  />
                </template>
              </v-tooltip>

              <v-tooltip
                :text="item.isActive ? 'Desactivar producto' : 'Activar producto'"
                location="top"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :icon="item.isActive ? 'mdi-eye-off' : 'mdi-eye'"
                    :color="item.isActive ? 'warning' : 'success'"
                    size="small"
                    variant="text"
                    :aria-label="item.isActive ? 'Desactivar producto' : 'Activar producto'"
                    @click="solicitarCambioEstado(item)"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>

          <template #no-data>
            No se encontraron productos con los filtros seleccionados.
          </template>
        </v-data-table-server>

        <!-- Paginación controlada -->
        <div class="d-flex flex-wrap align-center justify-end ga-4 mt-3">
          <div class="d-flex align-center ga-2">
            <span class="text-body-2">
              Elementos por página:
            </span>

            <v-select
              :model-value="tamano"
              :items="[5, 10, 20, 50]"
              variant="outlined"
              density="compact"
              hide-details
              style="width: 85px"
              @update:model-value="cambiarTamano"
            />
          </div>

          <span class="text-body-2">
            {{ registroInicial }}-{{ registroFinal }}
            de {{ totalRegistros }}
          </span>

          <v-pagination
            :model-value="pagina"
            :length="totalPaginas"
            :total-visible="5"
            density="compact"
            size="small"
            @update:model-value="cambiarPagina"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Confirmación de cambio de estado -->
    <v-dialog
      v-model="dialogoEstado"
      max-width="440"
    >
      <v-card>
        <v-card-title>
          Confirmar cambio
        </v-card-title>

        <v-card-text>
          ¿Deseas
          {{ productoEstado?.isActive ? 'desactivar' : 'activar' }}
          el producto
          <strong>{{ productoEstado?.name }}</strong>
          ({{ productoEstado?.code }})?
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn
            variant="text"
            @click="dialogoEstado = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            @click="confirmarCambioEstado"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios'

import EstadoStockChip from '../components/EstadoStockChip.vue'
import {
  obtenerMensajeError
} from '../utils/apiError'
import {
  formatearNumero
} from '../utils/formatters'

export default {
  name: 'ProductosView',

  components: {
    EstadoStockChip
  },

  data() {
    return {
      // Rutas relativas mediante el proxy de Vue (8081 -> 8080).
      apiUrl: '/api/products',
      apiCategorias: '/api/categories/options',
      apiTipos: '/api/product-types/options',

      // Columnas de la tabla.
      columnas: [
        {
          title: 'Código',
          key: 'code',
          sortable: false,
          width: '120px'
        },
        {
          title: 'Nombre',
          key: 'name',
          sortable: false,
          width: '24%'
        },
        {
          title: 'Categoría',
          key: 'categoryName',
          sortable: false
        },
        {
          title: 'Tipo',
          key: 'productTypeName',
          sortable: false
        },
        {
          title: 'Existencias por presentación',
          key: 'stockByPresentation',
          sortable: false,
          width: '24%'
        },
        {
          title: 'Estado',
          key: 'isActive',
          sortable: false
        },
        {
          title: 'Acciones',
          key: 'acciones',
          sortable: false,
          align: 'end',
          width: '150px',
          minWidth: '150px'
        }
      ],

      // Datos del servidor.
      productos: [],
      totalRegistros: 0,
      versionTabla: 0,

      // Opciones de los filtros.
      opcionesCategorias: [],
      opcionesTipos: [],
      opcionesEstado: [
        { title: 'Activos', value: true },
        { title: 'Inactivos', value: false }
      ],

      // Búsqueda y filtros.
      busqueda: '',
      filtro: '',
      filtros: {
        categoryId: null,
        productTypeId: null,
        isActive: null
      },

      // Paginación.
      pagina: 1,
      tamano: 10,

      // Parámetros aplicados en la última consulta.
      opciones: {
        page: 1,
        size: 10,
        search: '',
        categoryId: null,
        productTypeId: null,
        isActive: null
      },

      // Estados de carga.
      cargando: false,

      // Confirmación de estado.
      dialogoEstado: false,
      productoEstado: null,

      // Notificaciones.
      mensaje: '',
      tipoMensaje: 'success',
      mostrarNotificacion: false
    }
  },

  computed: {
    totalPaginas() {
      return Math.max(
        1,
        Math.ceil(this.totalRegistros / this.tamano)
      )
    },

    registroInicial() {
      if (this.totalRegistros === 0) {
        return 0
      }

      return (this.pagina - 1) * this.tamano + 1
    },

    registroFinal() {
      if (this.totalRegistros === 0) {
        return 0
      }

      return Math.min(
        this.pagina * this.tamano,
        this.totalRegistros
      )
    },

    colorNotificacion() {
      if (this.tipoMensaje === 'error') {
        return 'error'
      }

      if (this.tipoMensaje === 'info') {
        return 'info'
      }

      if (this.tipoMensaje === 'warning') {
        return 'warning'
      }

      return 'success'
    }
  },

  watch: {
    // Si se reduce el total, evita quedar en una página inexistente.
    totalRegistros() {
      if (this.pagina > this.totalPaginas) {
        this.pagina = this.totalPaginas
        this.solicitarDatos()
      }
    }
  },

  mounted() {
    this.cargarOpciones()
    this.solicitarDatos()
  },

  methods: {
    formatearNumero,

    cerrarNotificacion() {
      this.mostrarNotificacion = false
    },

    limpiarMensaje() {
      this.mostrarNotificacion = false
      this.mensaje = ''
      this.tipoMensaje = 'success'
    },

    mostrarMensaje(texto, tipo = 'success') {
      this.mostrarNotificacion = false
      this.mensaje = texto
      this.tipoMensaje = tipo

      this.$nextTick(() => {
        this.mostrarNotificacion = true
      })
    },

    mapearOpciones(items) {
      return (items || []).map(item => ({
        title: item.name,
        value: item.id
      }))
    },

    // GET: categorías y tipos activos para los filtros.
    async cargarOpciones() {
      try {
        const [categorias, tipos] = await Promise.all([
          axios.get(this.apiCategorias),
          axios.get(this.apiTipos)
        ])

        this.opcionesCategorias = this.mapearOpciones(categorias.data)
        this.opcionesTipos = this.mapearOpciones(tipos.data)

      } catch (error) {
        console.error('Error al cargar filtros de productos:', error)

        this.mostrarMensaje(
          obtenerMensajeError(
            error,
            'No fue posible cargar las categorías y tipos para los filtros.'
          ),
          'error'
        )
      }
    },

    // Construye los parámetros que entiende el contrato 5.1.
    construirParametros(opciones) {
      const parametros = {
        page: Math.max(0, opciones.page - 1),
        size: opciones.size
      }

      const search = String(opciones.search || '').trim()

      if (search) {
        parametros.search = search
      }

      if (
        opciones.categoryId !== null &&
        opciones.categoryId !== undefined
      ) {
        parametros.categoryId = opciones.categoryId
      }

      if (
        opciones.productTypeId !== null &&
        opciones.productTypeId !== undefined
      ) {
        parametros.productTypeId = opciones.productTypeId
      }

      if (typeof opciones.isActive === 'boolean') {
        parametros.isActive = opciones.isActive
      }

      return parametros
    },

    // GET: listado paginado desde el servidor.
    async cargarProductos(opciones) {
      this.opciones = { ...opciones }
      this.cargando = true

      try {
        const respuesta = await axios.get(this.apiUrl, {
          params: this.construirParametros(opciones)
        })

        const resultado = respuesta.data

        this.productos = resultado.content || []
        this.totalRegistros = resultado.totalElements ?? 0
        this.versionTabla += 1

      } catch (error) {
        console.error('Error al cargar productos:', error)

        this.productos = []
        this.totalRegistros = 0
        this.versionTabla += 1

        this.mostrarMensaje(
          obtenerMensajeError(
            error,
            'No fue posible cargar los productos.'
          ),
          'error'
        )

      } finally {
        this.cargando = false
      }
    },

    solicitarDatos() {
      this.cargarProductos({
        page: this.pagina,
        size: this.tamano,
        search: this.filtro,
        categoryId: this.filtros.categoryId,
        productTypeId: this.filtros.productTypeId,
        isActive: this.filtros.isActive
      })
    },

    buscar() {
      this.filtro = String(this.busqueda || '').trim()
      this.pagina = 1
      this.solicitarDatos()
    },

    limpiarBusqueda() {
      this.busqueda = ''
      this.filtro = ''
      this.pagina = 1
      this.solicitarDatos()
    },

    cambiarFiltro(campo, valor) {
      this.filtros = {
        ...this.filtros,
        [campo]: valor
      }

      this.pagina = 1
      this.solicitarDatos()
    },

    cambiarPagina(nuevaPagina) {
      if (nuevaPagina === this.pagina) {
        return
      }

      this.pagina = nuevaPagina
      this.solicitarDatos()
    },

    cambiarTamano(nuevoTamano) {
      if (!nuevoTamano || nuevoTamano === this.tamano) {
        return
      }

      this.tamano = nuevoTamano
      this.pagina = 1
      this.solicitarDatos()
    },

    nuevoProducto() {
      this.$router.push({ name: 'producto-nuevo' })
    },

    verDetalle(item) {
      const producto = item.raw ?? item
      this.$router.push({
        name: 'producto-detalle',
        params: { id: producto.id }
      })
    },

    editarProducto(item) {
      const producto = item.raw ?? item
      this.$router.push({
        name: 'producto-editar',
        params: { id: producto.id }
      })
    },

    solicitarCambioEstado(item) {
      this.productoEstado = item.raw ?? item
      this.dialogoEstado = true
    },

    // PATCH: activar o desactivar el producto.
    async confirmarCambioEstado() {
      const producto = this.productoEstado

      if (!producto) {
        return
      }

      this.dialogoEstado = false

      try {
        await axios.patch(
          `${this.apiUrl}/${producto.id}/status`,
          {
            isActive: !producto.isActive
          }
        )

        await this.cargarProductos(this.opciones)

        this.mostrarMensaje(
          producto.isActive
            ? 'Producto desactivado correctamente.'
            : 'Producto activado correctamente.',
          'success'
        )

      } catch (error) {
        console.error('Error al cambiar estado del producto:', error)

        this.mostrarMensaje(
          obtenerMensajeError(
            error,
            'No fue posible cambiar el estado del producto.'
          ),
          'error'
        )
      }
    }
  }
}
</script>

<style scoped>
h2 {
  color: #004B87;
  font-weight: 600;
}
</style>
