<template>
  <v-container fluid class="pa-4">
    <!-- Notificaciones de error -->
    <v-snackbar
      v-model="mostrarNotificacion"
      color="error"
      :timeout="5000"
      location="top right"
      rounded="lg"
    >
      {{ mensaje }}

      <template #actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          @click="mostrarNotificacion = false"
        />
      </template>
    </v-snackbar>

    <!-- Encabezado -->
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
      <div>
        <h2 class="mb-1">
          Dashboard
        </h2>

        <div class="text-body-2 text-medium-emphasis">
          Resumen del inventario, productos con stock bajo y lotes por vencer.
        </div>
      </div>

      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-refresh"
        :loading="cargando"
        @click="cargarDashboard"
      >
        Actualizar
      </v-btn>
    </div>

    <!-- Aviso general: sin sesión o API apagada -->
    <v-alert
      v-if="errorGeneral"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ errorGeneral }}
    </v-alert>

    <!-- Aviso para Compras: la API solo le permite ver el bajo stock -->
    <v-alert
      v-if="soloBajoStock"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      Tu rol solo puede consultar los productos con stock bajo.
    </v-alert>

    <!-- Tarjetas del resumen (GET /api/dashboard/summary) -->
    <v-row v-if="mostrarResumen" class="mb-2">
      <v-col
        v-for="tarjeta in tarjetas"
        :key="tarjeta.clave"
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card elevation="2" class="tarjeta-resumen h-100">
          <v-card-text class="d-flex align-center ga-4">
            <v-avatar
              :color="tarjeta.color"
              rounded="lg"
              size="56"
            >
              <v-icon
                :icon="tarjeta.icono"
                :color="tarjeta.colorIcono"
                size="30"
              />
            </v-avatar>

            <div class="flex-grow-1">
              <div class="text-body-2 text-medium-emphasis">
                {{ tarjeta.titulo }}
              </div>

              <v-skeleton-loader
                v-if="cargandoResumen"
                type="text"
                width="60"
              />

              <div v-else class="text-h4 font-weight-bold">
                {{ tarjeta.valor }}
              </div>

              <div
                v-if="tarjeta.detalle"
                class="text-caption font-weight-medium"
                :style="{ color: tarjeta.colorDetalle }"
              >
                {{ tarjeta.detalle }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!errorGeneral">
      <!-- Productos con stock bajo (GET /api/dashboard/low-stock) -->
      <v-col cols="12" :lg="mostrarLotes ? 6 : 12">
        <v-card elevation="2" class="h-100">
          <v-card-title class="d-flex align-center ga-2 pa-4">
            <v-icon icon="mdi-alert" :color="COLORES.amarillo" />
            Productos con stock bajo
          </v-card-title>

          <v-divider />

          <v-data-table-server
            :headers="columnasBajoStock"
            :items="bajoStock"
            :items-length="totalBajoStock"
            :loading="cargandoBajoStock"
            :page="paginaBajoStock"
            :items-per-page="tamanoBajoStock"
            :items-per-page-options="[5, 10, 20, 50]"
            items-per-page-text="Elementos por página:"
            page-text="{0}-{1} de {2}"
            loading-text="Cargando productos..."
            density="comfortable"
            @update:options="cambiarOpcionesBajoStock"
          >
            <!-- Producto con su código -->
            <template #item.productName="{ item }">
              <div class="font-weight-medium">
                {{ item.productName }}
              </div>

              <div class="text-caption text-medium-emphasis">
                {{ item.productCode }}
              </div>
            </template>

            <!-- Stock actual en rojo -->
            <template #item.currentStock="{ item }">
              <span
                class="font-weight-bold"
                :style="{ color: COLORES.rojo }"
              >
                {{ formatearNumero(item.currentStock) }}
              </span>
            </template>

            <template #item.minStock="{ item }">
              {{ formatearNumero(item.minStock) }}
            </template>

            <template #item.missing="{ item }">
              {{ formatearNumero(item.missing) }}
            </template>

            <template #no-data>
              No hay productos con stock bajo.
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>

      <!-- Lotes vencidos y por vencer (GET /api/dashboard/expiring-lots) -->
      <v-col v-if="mostrarLotes" cols="12" lg="6">
        <v-card elevation="2" class="h-100">
          <v-card-title class="d-flex align-center ga-2 pa-4">
            <v-icon icon="mdi-calendar-alert" :color="COLORES.rojo" />
            Lotes próximos a vencer
          </v-card-title>

          <v-divider />

          <v-data-table
            :headers="columnasLotes"
            :items="lotes"
            :loading="cargandoLotes"
            :items-per-page="10"
            :items-per-page-options="[5, 10, 20, 50]"
            items-per-page-text="Elementos por página:"
            page-text="{0}-{1} de {2}"
            loading-text="Cargando lotes..."
            item-value="lotId"
            density="comfortable"
          >
            <!-- Número de lote en una sola línea -->
            <template #item.lotNumber="{ item }">
              <span class="text-no-wrap">{{ item.lotNumber }}</span>
            </template>

            <!-- Fecha de vencimiento con el color de la alerta -->
            <template #item.expirationDate="{ item }">
              <span
                class="font-weight-bold text-no-wrap"
                :style="{ color: colorTextoSeveridad(item.severity) }"
              >
                {{ formatearFecha(item.expirationDate) }}
              </span>
            </template>

            <template #item.daysRemaining="{ item }">
              {{ describirDias(item.daysRemaining) }}
            </template>

            <!-- Estado calculado por la API (regla D-04) -->
            <template #item.label="{ item }">
              <v-chip
                :color="colorSeveridad(item.severity)"
                variant="flat"
                size="small"
                class="font-weight-bold"
              >
                {{ item.label }}
              </v-chip>
            </template>

            <template #no-data>
              No hay lotes vencidos ni por vencer en los próximos 30 días.
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
import { obtenerMensajeError } from '../utils/apiError'
import { formatearNumero } from '../utils/formatters'

// Colores de la guía de estilo (01-Documentacion/Wireframes/Guía de estilo.docx).
const COLORES = {
  azul: '#0873C4',
  amarillo: '#FBCD00',
  rojo: '#FF5252',
  verde: '#4CAF50',
  // Amarillo oscuro para texto: el #FBCD00 casi no se lee sobre blanco.
  amarilloTexto: '#9A7B00'
}

export default {
  name: 'DashboardView',

  data() {
    return {
      // Rutas relativas mediante el proxy de Vue (8081 → 8080).
      apiUrl: '/api/dashboard',

      COLORES,

      // Resumen: { activeProducts, lowStockProducts, activeLots, expiringLots, expiredLots }
      resumen: null,
      cargandoResumen: false,

      // Bajo stock (paginado por la API).
      bajoStock: [],
      totalBajoStock: 0,
      paginaBajoStock: 1,
      tamanoBajoStock: 10,
      cargandoBajoStock: false,

      // Lotes vencidos y por vencer (lista sin paginar).
      lotes: [],
      cargandoLotes: false,

      // Permisos según la respuesta de la API.
      // Compras (PURCHASING) recibe 403 en summary y expiring-lots.
      soloBajoStock: false,
      errorGeneral: '',

      // Notificaciones.
      mensaje: '',
      mostrarNotificacion: false,

      columnasBajoStock: [
        { title: 'Producto', key: 'productName', sortable: false },
        { title: 'Presentación', key: 'presentationName', sortable: false },
        { title: 'Stock', key: 'currentStock', sortable: false, align: 'end' },
        { title: 'Mínimo', key: 'minStock', sortable: false, align: 'end' },
        { title: 'Faltan', key: 'missing', sortable: false, align: 'end' }
      ],

      columnasLotes: [
        { title: 'Producto', key: 'productName', sortable: false },
        { title: 'Presentación', key: 'presentationName', sortable: false },
        { title: 'Lote', key: 'lotNumber', sortable: false },
        { title: 'Vence', key: 'expirationDate', sortable: false },
        { title: 'Días', key: 'daysRemaining', sortable: false },
        { title: 'Estado', key: 'label', sortable: false }
      ]
    }
  },

  computed: {
    cargando() {
      return this.cargandoResumen || this.cargandoBajoStock || this.cargandoLotes
    },

    mostrarResumen() {
      return !this.soloBajoStock && !this.errorGeneral
    },

    mostrarLotes() {
      return !this.soloBajoStock
    },

    // Cuatro tarjetas, como el wireframe A-03.
    tarjetas() {
      const resumen = this.resumen || {}
      const vencidos = resumen.expiredLots ?? 0

      return [
        {
          clave: 'activeProducts',
          titulo: 'Productos activos',
          valor: resumen.activeProducts ?? '—',
          icono: 'mdi-package-variant-closed',
          color: '#DCEBF8',
          colorIcono: COLORES.azul
        },
        {
          clave: 'lowStockProducts',
          titulo: 'Bajo stock',
          valor: resumen.lowStockProducts ?? '—',
          icono: 'mdi-alert',
          color: '#FFF5CC',
          colorIcono: COLORES.amarilloTexto
        },
        {
          // expiringLots cuenta RED + YELLOW; los vencidos van aparte.
          clave: 'expiringLots',
          titulo: 'Vencen en 30 días',
          valor: resumen.expiringLots ?? '—',
          icono: 'mdi-calendar-remove',
          color: '#FFE0E0',
          colorIcono: COLORES.rojo,
          detalle: vencidos > 0
            ? `+ ${vencidos} ${vencidos === 1 ? 'vencido' : 'vencidos'}`
            : '',
          colorDetalle: COLORES.rojo
        },
        {
          clave: 'activeLots',
          titulo: 'Lotes activos',
          valor: resumen.activeLots ?? '—',
          icono: 'mdi-layers-triple',
          color: '#E3F4E4',
          colorIcono: COLORES.verde
        }
      ]
    }
  },

  mounted() {
    this.cargarDashboard()
  },

  methods: {
    formatearNumero,

    mostrarMensaje(texto) {
      this.mostrarNotificacion = false
      this.mensaje = texto

      this.$nextTick(() => {
        this.mostrarNotificacion = true
      })
    },

    // Carga las tres partes a la vez; si una falla, las demás se muestran igual.
    async cargarDashboard() {
      this.errorGeneral = ''
      this.soloBajoStock = false

      await Promise.all([
        this.cargarResumen(),
        this.cargarBajoStock(),
        this.cargarLotes()
      ])
    },

    // GET /api/dashboard/summary (ADMIN, WAREHOUSE)
    async cargarResumen() {
      this.cargandoResumen = true

      try {
        const respuesta = await axios.get(`${this.apiUrl}/summary`)
        this.resumen = respuesta.data

      } catch (error) {
        this.resumen = null
        this.manejarError(error, 'resumen')

      } finally {
        this.cargandoResumen = false
      }
    },

    // GET /api/dashboard/low-stock (ADMIN, WAREHOUSE, PURCHASING)
    async cargarBajoStock() {
      this.cargandoBajoStock = true

      try {
        const respuesta = await axios.get(`${this.apiUrl}/low-stock`, {
          params: {
            // Spring Boot utiliza páginas desde cero.
            page: this.paginaBajoStock - 1,
            size: this.tamanoBajoStock
          }
        })

        // Estructura definida en PageResponseDto.java.
        this.bajoStock = respuesta.data.content || []
        this.totalBajoStock = respuesta.data.totalElements ?? 0

      } catch (error) {
        this.bajoStock = []
        this.totalBajoStock = 0
        this.manejarError(error, 'bajo stock')

      } finally {
        this.cargandoBajoStock = false
      }
    },

    // GET /api/dashboard/expiring-lots (ADMIN, WAREHOUSE)
    async cargarLotes() {
      this.cargandoLotes = true

      try {
        const respuesta = await axios.get(`${this.apiUrl}/expiring-lots`)
        this.lotes = Array.isArray(respuesta.data) ? respuesta.data : []

      } catch (error) {
        this.lotes = []
        this.manejarError(error, 'lotes por vencer')

      } finally {
        this.cargandoLotes = false
      }
    },

    // Cambio de página o de tamaño en la tabla de bajo stock.
    cambiarOpcionesBajoStock({ page, itemsPerPage }) {
      if (
        page === this.paginaBajoStock &&
        itemsPerPage === this.tamanoBajoStock
      ) {
        return
      }

      this.paginaBajoStock = page
      this.tamanoBajoStock = itemsPerPage
      this.cargarBajoStock()
    },

    manejarError(error, parte) {
      const estado = error?.response?.status

      // 403: el rol no tiene permiso (Compras en summary y expiring-lots).
      if (estado === 403) {
        this.soloBajoStock = true
        return
      }

      // 401 o API apagada: un solo aviso en la pantalla.
      if (estado === 401 || !error?.response) {
        this.errorGeneral = obtenerMensajeError(error)
        return
      }

      console.error(`Error al cargar ${parte}:`, error)
      this.mostrarMensaje(obtenerMensajeError(error))
    },

    // "2026-11-20" → "20/11/2026" sin usar Date (evita el desfase de zona horaria).
    formatearFecha(fecha) {
      if (!fecha) {
        return '—'
      }

      const [anio, mes, dia] = String(fecha).split('-')
      return `${dia}/${mes}/${anio}`
    },

    describirDias(dias) {
      const numero = Number(dias)

      if (!Number.isFinite(numero)) {
        return '—'
      }

      if (numero < 0) {
        const pasados = Math.abs(numero)
        return `Venció hace ${pasados} ${pasados === 1 ? 'día' : 'días'}`
      }

      if (numero === 0) {
        return 'Vence hoy'
      }

      return `${numero} ${numero === 1 ? 'día' : 'días'}`
    },

    // EXPIRED y RED en rojo; YELLOW en amarillo (regla D-04).
    colorSeveridad(severidad) {
      return severidad === 'YELLOW' ? COLORES.amarillo : COLORES.rojo
    },

    colorTextoSeveridad(severidad) {
      return severidad === 'YELLOW' ? COLORES.amarilloTexto : COLORES.rojo
    }
  }
}
</script>

<style scoped>
h2 {
  color: #004B87;
  font-weight: 600;
}

.tarjeta-resumen {
  border-radius: 12px;
}
</style>
