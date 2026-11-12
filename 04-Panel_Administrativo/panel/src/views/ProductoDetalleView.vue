<template>
  <v-container fluid class="pa-4">
    <!-- Notificaciones de éxito, error o información -->
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
        <div class="text-caption text-medium-emphasis">
          Productos / Detalle
        </div>

        <h2 class="mb-1">
          {{ producto?.name || 'Detalle del producto' }}
        </h2>

        <div
          v-if="producto"
          class="text-body-2 text-medium-emphasis"
        >
          Código {{ producto.code }}
        </div>
      </div>

      <div class="d-flex flex-wrap ga-2">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          @click="volver"
        >
          Volver
        </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-pencil"
          :disabled="!producto"
          @click="editar"
        >
          Editar producto
        </v-btn>
      </div>
    </div>

    <v-progress-linear
      v-if="cargando"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <v-alert
      v-if="errorCarga"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ errorCarga }}
    </v-alert>

    <v-row v-if="producto">
      <!-- Datos generales -->
      <v-col cols="12" lg="4">
        <v-card elevation="2" class="h-100">
          <v-card-title class="d-flex align-center ga-2">
            <v-icon color="primary">mdi-information-outline</v-icon>
            Información general
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">
                  Código
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ producto.code }}
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis mb-1">
                  Estado
                </div>
                <v-chip
                  :color="producto.isActive ? 'success' : 'error'"
                  size="small"
                >
                  {{ producto.isActive ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">
                  Categoría
                </div>
                <div>{{ producto.category?.name || '—' }}</div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">
                  Tipo
                </div>
                <div>{{ producto.productType?.name || '—' }}</div>
              </v-col>

              <v-col cols="12">
                <div class="text-caption text-medium-emphasis">
                  Marca / Modelo
                </div>
                <div>{{ marcaModelo }}</div>
              </v-col>

              <v-col cols="12">
                <div class="text-caption text-medium-emphasis">
                  Descripción
                </div>
                <div class="text-body-2 descripcion-producto">
                  {{ producto.description || 'Sin descripción' }}
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">
                  Requiere vencimiento
                </div>
                <div>{{ producto.requiresExpiration ? 'Sí' : 'No' }}</div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis mb-1">
                  Estado de existencias
                </div>

                <EstadoStockChip
                  v-if="estadoExistencias"
                  :status="estadoExistencias"
                />

                <v-chip
                  v-else
                  size="small"
                  variant="tonal"
                  color="grey"
                >
                  Sin presentaciones activas
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Presentaciones y stock mínimo -->
      <v-col cols="12" lg="8">
        <ProductoPresentaciones
          :product-id="producto.id"
          :presentaciones="producto.presentations || []"
          :cargando="cargando"
          @recargar="cargarProducto"
          @notificar="mostrarMensaje"
        />
      </v-col>
    </v-row>

    <v-card
      v-else-if="!cargando && !errorCarga"
      elevation="2"
    >
      <v-card-text class="text-center py-8">
        No se encontró el producto solicitado.

        <div class="mt-4">
          <v-btn
            color="primary"
            prepend-icon="mdi-arrow-left"
            @click="volver"
          >
            Volver al listado
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios'

import EstadoStockChip from '../components/EstadoStockChip.vue'
import ProductoPresentaciones from '../components/ProductoPresentaciones.vue'
import {
  obtenerMensajeError
} from '../utils/apiError'

export default {
  name: 'ProductoDetalleView',

  components: {
    EstadoStockChip,
    ProductoPresentaciones
  },

  data() {
    return {
      apiProductos: '/api/products',

      producto: null,
      cargando: false,
      errorCarga: '',

      mensaje: '',
      tipoMensaje: 'success',
      mostrarNotificacion: false
    }
  },

  computed: {
    idProducto() {
      const id = Number(this.$route.params.id)
      return Number.isInteger(id) && id > 0 ? id : null
    },

    marcaModelo() {
      if (!this.producto?.productModel) {
        return 'Sin modelo'
      }

      const marca = this.producto.productModel.brand?.name || 'Sin marca'
      return `${marca} / ${this.producto.productModel.name}`
    },

    // Peor estado entre las presentaciones activas, sin sumar existencias.
    estadoExistencias() {
      const estados = (this.producto?.presentations || [])
        .filter(presentacion => presentacion.isActive)
        .map(presentacion => presentacion.stockStatus)

      if (!estados.length) {
        return null
      }

      if (estados.includes('OUT')) {
        return 'OUT'
      }

      if (estados.includes('LOW')) {
        return 'LOW'
      }

      return 'OK'
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

  mounted() {
    this.inicializar()
  },

  methods: {
    async inicializar() {
      await this.cargarProducto()
      this.procesarMensajeGuardado()
    },

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

    // GET: detalle del producto con todas sus presentaciones.
    async cargarProducto() {
      if (!this.idProducto) {
        this.errorCarga = 'El producto solicitado no es válido.'
        return
      }

      this.cargando = true
      this.errorCarga = ''

      try {
        const respuesta = await axios.get(
          `${this.apiProductos}/${this.idProducto}`
        )

        this.producto = respuesta.data

      } catch (error) {
        console.error('Error al cargar producto:', error)

        this.producto = null
        this.errorCarga = obtenerMensajeError(
          error,
          'No fue posible cargar el detalle del producto.'
        )

      } finally {
        this.cargando = false
      }
    },

    // Muestra el mensaje que dejó el formulario al guardar.
    procesarMensajeGuardado() {
      const guardado = this.$route.query.guardado

      if (guardado === 'creado') {
        this.mostrarMensaje('Producto registrado correctamente.', 'success')
      } else if (guardado === 'editado') {
        this.mostrarMensaje('Producto actualizado correctamente.', 'success')
      } else {
        return
      }

      this.$router.replace({ query: {} })
    },

    editar() {
      if (!this.producto) {
        return
      }

      this.$router.push({
        name: 'producto-editar',
        params: { id: this.producto.id }
      })
    },

    volver() {
      this.$router.push({ name: 'productos' })
    }
  }
}
</script>

<style scoped>
h2 {
  color: #004B87;
  font-weight: 600;
}

.descripcion-producto {
  white-space: pre-line;
  overflow-wrap: anywhere;
}
</style>
