<template>
  <v-card elevation="2">
    <v-card-title class="d-flex flex-wrap align-center justify-space-between ga-2">
      <div class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-package-variant</v-icon>

        <span>Presentaciones</span>

        <v-chip
          size="small"
          variant="tonal"
          color="primary"
        >
          {{ presentaciones.length }}
        </v-chip>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="abrirCrear"
      >
        Agregar presentación
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text>
      <v-data-table
        :headers="columnas"
        :items="presentaciones"
        :loading="cargando"
        :items-per-page="-1"
        item-value="id"
        hide-default-footer
        density="comfortable"
        class="tabla-presentaciones"
        no-data-text="Este producto todavía no tiene presentaciones asignadas."
      >
        <!-- Presentación base y su equivalencia -->
        <template #item.presentation="{ item }">
          <div class="font-weight-medium">
            {{ item.presentation?.name || '—' }}
          </div>

          <div class="text-caption text-medium-emphasis">
            {{ describirPresentacion(item.presentation) }}
          </div>
        </template>

        <!-- Código de la presentación del producto -->
        <template #item.code="{ item }">
          <span class="font-weight-medium">{{ item.code }}</span>
        </template>

        <!-- Existencia real de esa presentación -->
        <template #item.stock="{ item }">
          <span class="font-weight-medium">
            {{ formatearNumero(item.stock) }}
          </span>
        </template>

        <!-- Stock mínimo configurado para esa presentación -->
        <template #item.minStock="{ item }">
          {{ formatearNumero(item.minStock) }}
        </template>

        <!-- Precio vigente; queda null si todavía no tiene precio -->
        <template #item.currentPrice="{ item }">
          <span
            v-if="item.currentPrice !== null && item.currentPrice !== undefined"
            class="font-weight-medium"
          >
            {{ formatearMoneda(item.currentPrice) }}
          </span>

          <v-chip
            v-else
            size="small"
            variant="text"
            color="grey"
          >
            Sin precio
          </v-chip>
        </template>

        <!-- Estado calculado por la API -->
        <template #item.stockStatus="{ item }">
          <EstadoStockChip :status="item.stockStatus" />
        </template>

        <!-- Estado del registro -->
        <template #item.isActive="{ item }">
          <v-chip
            :color="item.isActive ? 'success' : 'error'"
            size="small"
          >
            {{ item.isActive ? 'Activa' : 'Inactiva' }}
          </v-chip>
        </template>

        <!-- Acciones por presentación -->
        <template #item.acciones="{ item }">
          <div class="d-flex flex-nowrap justify-end ga-0">
            <v-tooltip text="Editar código y stock mínimo" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  color="primary"
                  size="small"
                  density="compact"
                  variant="text"
                  aria-label="Editar presentación"
                  @click="abrirEditar(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip
              :text="item.isActive ? 'Desactivar presentación' : 'Activar presentación'"
              location="top"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="item.isActive ? 'mdi-eye-off' : 'mdi-eye'"
                  :color="item.isActive ? 'warning' : 'success'"
                  size="small"
                  density="compact"
                  variant="text"
                  :aria-label="item.isActive ? 'Desactivar presentación' : 'Activar presentación'"
                  @click="solicitarCambioEstado(item)"
                />
              </template>
            </v-tooltip>

            <!-- Espacios reservados para S2-12b (precios e historial) -->
            <v-tooltip text="Cambiar precio (S2-12b)" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-currency-usd"
                  color="teal"
                  size="small"
                  density="compact"
                  variant="text"
                  aria-label="Cambiar precio"
                  @click="avisarPrecio(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Historial de precios (S2-12b)" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-history"
                  color="secondary"
                  size="small"
                  density="compact"
                  variant="text"
                  aria-label="Ver historial de precios"
                  @click="avisarHistorial(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Asignar o editar una presentación del producto -->
    <v-dialog
      v-model="dialogo"
      max-width="560"
      persistent
    >
      <v-card>
        <v-card-title class="pa-4">
          {{ editando ? 'Editar presentación' : 'Asignar presentación' }}
        </v-card-title>

        <v-card-text>
          <v-alert
            v-if="errorGeneral"
            type="error"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="errorGeneral = ''"
          >
            {{ errorGeneral }}
          </v-alert>

          <v-form
            ref="formularioRef"
            @submit.prevent="guardar"
          >
            <template v-if="editando">
              <v-text-field
                :model-value="registroEditando?.presentation?.name"
                label="Presentación"
                variant="outlined"
                readonly
                class="mb-2"
              />
            </template>

            <v-select
              v-else
              v-model="formulario.presentationId"
              :items="opcionesDisponibles"
              item-title="title"
              item-value="value"
              label="Presentación *"
              :rules="reglasPresentacion()"
              :error-messages="erroresCampo.presentationId"
              no-data-text="No hay presentaciones activas disponibles para asignar."
              variant="outlined"
              class="mb-2"
              @update:model-value="limpiarErrorCampo('presentationId')"
            />

            <v-text-field
              v-model="formulario.code"
              label="Código *"
              :rules="reglasCodigo()"
              :error-messages="erroresCampo.code"
              variant="outlined"
              :maxlength="50"
              :counter="50"
              hint="Código único en todo el sistema."
              persistent-hint
              class="mb-4"
              @update:model-value="limpiarErrorCampo('code')"
            />

            <v-text-field
              v-model="formulario.minStock"
              label="Stock mínimo *"
              type="number"
              min="0.01"
              step="0.01"
              :rules="reglasMinStock()"
              :error-messages="erroresCampo.minStock"
              variant="outlined"
              hint="Debe ser mayor que 0. Hasta 10 enteros y 2 decimales."
              persistent-hint
              @update:model-value="limpiarErrorCampo('minStock')"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn
            variant="text"
            :disabled="guardando"
            @click="cerrar"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            :loading="guardando"
            prepend-icon="mdi-content-save"
            @click="guardar"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmación para activar o desactivar -->
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
          {{ registroEstado?.isActive ? 'desactivar' : 'activar' }}
          la presentación
          <strong>{{ registroEstado?.presentation?.name }}</strong>
          ({{ registroEstado?.code }})?
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

    <!-- Asignar o editar el precio de una presentacion -->
    <v-dialog v-model="dialogoPrecio" max-width="450" persistent>
      <v-card>
        <v-card-title class="pa-4">
          {{ editando ? 'Actualizar Precio' : 'Nuevo Precio' }}
        </v-card-title>

        <v-card-text>
          <!-- Alerta de errores -->
          <v-alert
            v-if="errorGeneral"
            type="error"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="errorGeneral = ''"
          >
            {{ errorGeneral }}
          </v-alert>

          <v-form ref="formularioRef" @submit.prevent="GuardarPrecio">
            
            <!-- Único campo visible para el usuario -->
            <v-text-field
              v-model="formularioPrecio.price"
              label="Precio *"
              type="number"
              min="0.01"
              step="0.01"
              :rules="reglasPrice()"
              :error-messages="erroresCampo.price"
              variant="outlined"
              hint="La fecha y el usuario se registrarán automáticamente."
              persistent-hint
              class="mb-2"
              @update:model-value="limpiarErrorCampo('price')"
            />

          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" :disabled="guardando" @click="dialogoPrecio = false">
            Cancelar
          </v-btn>
          <v-btn color="primary" :loading="guardando" prepend-icon="mdi-content-save" @click="GuardarPrecio">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogoHistorial" max-width="700" persistent>
    <v-card>
      <v-card-title class="pa-4 d-flex justify-space-between align-center">
        <span>Historial de Precios: {{ presentationNombreActual }}</span>
        <v-btn icon="mdi-close" variant="text" @click="dialogoHistorial = false" />
      </v-card-title>

      <v-card-text>
        <v-alert v-if="errorHistorial" type="error" variant="tonal" class="mb-4">
          {{ errorHistorial }}
        </v-alert>

        <!-- Tabla para mostrar el historial -->
        <v-data-table
          :headers="headersHistorial"
          :items="listaHistorial"
          :loading="cargandoHistorial"
          no-data-text="No hay registros en el historial de precios."
          class="elevation-1"
        >
          <!-- Opcional: Formatear la columna de precio con símbolo de moneda -->
          <template v-slot:item.price="{ item }">
            ${{ Number(item.price).toFixed(2) }}
          </template>

          <!-- Columna Modificado por -->
          <template v-slot:item.user="{ item }">
            {{ item.changedBy?.fullName || 'Sistema' }}
          </template>

          <!-- Opcional: Formatear las fechas si vienen muy largas -->
          <template v-slot:item.start_date="{ item }">
            {{ (item.start_date || item.startDate) ? (item.start_date || item.startDate).split('T')[0] : 'No registrada' }}
          </template>
          <template v-slot:item.end_date="{ item }">
            {{ (item.end_date || item.endDate) ? (item.end_date || item.endDate).split('T')[0] : 'Vigente (Actual)' }}
          </template>
        </v-data-table>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" variant="text" @click="dialogoHistorial = false">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  </v-card>
</template>

<script>
import axios from 'axios'

import EstadoStockChip from './EstadoStockChip.vue'
import {
  obtenerErroresCampo,
  obtenerMensajeError
} from '../utils/apiError.js'
import {
  describirPresentacion,
  formatearMoneda,
  formatearNumero
} from '../utils/formatters.js'

export default {
  name: 'ProductoPresentaciones',

  components: {
    EstadoStockChip
  },

  props: {
    productId: {
      type: [Number, String],
      required: true
    },

    presentaciones: {
      type: Array,
      default: () => []
    },

    cargando: {
      type: Boolean,
      default: false
    }
  },

  emits: [
    'recargar',
    'notificar'
  ],

  data() {
    return {
      apiPresentaciones: '/api/presentations/options',

      //Columnas de la tabla datatable de Presentaciones

      columnas: [
        { title: 'Presentación', key: 'presentation', sortable: false },
        { title: 'Código', key: 'code', sortable: false },
        { title: 'Existencia', key: 'stock', align: 'end', sortable: false },
        { title: 'Stock mínimo', key: 'minStock', align: 'end', sortable: false },
        { title: 'Precio vigente', key: 'currentPrice', align: 'end', sortable: false },
        { title: 'Estado', key: 'stockStatus', sortable: false },
        { title: 'Activa', key: 'isActive', sortable: false, width: '80px' },
        { title: 'Acciones', key: 'acciones', align: 'end', sortable: false, minWidth: '150px' }
      ],

      //Listado Historial

      dialogoHistorial: false,
      cargandoHistorial: false,
      errorHistorial: '',
      presentationNombreActual: '',
      listaHistorial: [],
      headersHistorial: [
        { title: 'ID', key: 'id' },
        { title: 'Precio', key: 'price' },
        { title: 'Modificado por', key: 'user' },
        { title: 'Fecha Inicio', key: 'start_date' },
        { title: 'Fecha Fin', key: 'end_date' },
      ],

      opcionesPresentaciones: [],

      dialogoPrecio: false,
      dialogo: false,
      dialogoEstado: false,
      editando: false,
      guardando: false,

      registroEditando: null,
      registroEstado: null,

      formularioPrecio: {
        productPresentationId: null,
        userId: '',
        price: '',
        startDate: '',
        endDate: ''
      },

      formulario: {
        presentationId: null,
        code: '',
        minStock: ''
      },

      erroresCampo: {},
      errorGeneral: ''
    }
  },

  computed: {
    // No se ofrecen presentaciones que el producto ya tenga asignadas.
    opcionesDisponibles() {
      const asignadas = new Set(
        this.presentaciones
          .map(item => item.presentation?.id)
          .filter(Boolean)
      )

      return this.opcionesPresentaciones.filter(
        opcion => !asignadas.has(opcion.value)
      )
    }
  },

  mounted() {
    this.cargarOpciones()
  },

  methods: {
    formatearNumero,
    formatearMoneda,
    describirPresentacion,

    // GET: presentaciones activas para el combo.
    async cargarOpciones() {
      try {
        const respuesta = await axios.get(this.apiPresentaciones)

        this.opcionesPresentaciones = (respuesta.data || []).map(item => ({
          title: `${item.name} (${this.formatearNumero(item.quantity)} ${item.measureUnit?.name || ''})`.trim(),
          value: item.id
        }))

      } catch (error) {
        console.error('Error al cargar presentaciones:', error)

        this.opcionesPresentaciones = []

        this.$emit(
          'notificar',
          obtenerMensajeError(
            error,
            'No fue posible cargar las presentaciones disponibles.'
          ),
          'error'
        )
      }
    },

    limpiarErrorCampo(campo) {
      if (!this.erroresCampo[campo]) {
        return
      }

      const copia = { ...this.erroresCampo }
      delete copia[campo]
      this.erroresCampo = copia
    },

    reglasPresentacion() {
      return [
        valor =>
          (valor !== null && valor !== undefined && valor !== '') ||
          'Selecciona una presentación.'
      ]
    },

    reglasCodigo() {
      return [
        valor =>
          String(valor ?? '').trim() !== '' ||
          'El código es obligatorio.',
        valor =>
          String(valor ?? '').trim().length <= 50 ||
          'El código no puede superar los 50 caracteres.'
      ]
    },

    reglasMinStock() {
      return [
        valor =>
          String(valor ?? '').trim() !== '' ||
          'El stock mínimo es obligatorio.',
        valor => {
          const texto = String(valor ?? '').trim()

          if (!/^\d{1,10}(\.\d{1,2})?$/.test(texto)) {
            return 'Usa hasta 10 enteros y 2 decimales.'
          }

          return Number(texto) > 0 ||
            'El stock mínimo debe ser mayor que 0.'
        }
      ]
    },

    reglasPrice() {
      return [
        valor =>
          String(valor ?? '').trim() !== '' ||
          'El precio es obligatorio.',
        valor => {
          const texto = String(valor ?? '').trim()

          if (!/^-?\d{1,10}(\.\d{1,2})?$/.test(texto)) {
            return 'Usa hasta 10 enteros y 2 decimales.'
          }

          return Number(texto) > 0 ||
            'El precio debe ser mayor que 0.'
        }
      ]
    },

    abrirCrear() {
      this.editando = false
      this.registroEditando = null
      this.formulario = {
        presentationId: null,
        code: '',
        minStock: ''
      }

      this.erroresCampo = {}
      this.errorGeneral = ''
      this.dialogo = true

      this.$nextTick(() => {
        this.$refs.formularioRef?.resetValidation()
      })
    },

    abrirEditar(item) {
      const registro = item.raw ?? item

      this.editando = true
      this.registroEditando = registro
      this.formulario = {
        presentationId: registro.presentation?.id ?? null,
        code: registro.code || '',
        minStock: registro.minStock ?? ''
      }

      this.erroresCampo = {}
      this.errorGeneral = ''
      this.dialogo = true

      this.$nextTick(() => {
        this.$refs.formularioRef?.resetValidation()
      })
    },

    cerrar() {
      if (this.guardando) {
        return
      }

      this.dialogo = false
      this.registroEditando = null
      this.formulario = {
        presentationId: null,
        code: '',
        minStock: ''
      }
      this.erroresCampo = {}
      this.errorGeneral = ''
    },

    // POST o PUT según el modo del formulario.
    async guardar() {
      if (this.guardando) {
        return
      }

      const resultado = await this.$refs.formularioRef.validate()

      if (!resultado.valid) {
        return
      }

      this.erroresCampo = {}
      this.errorGeneral = ''
      this.guardando = true

      const cuerpo = {
        code: String(this.formulario.code || '').trim(),
        minStock: Number(this.formulario.minStock)
      }

      if (!this.editando) {
        cuerpo.presentationId = Number(this.formulario.presentationId)
      }

      try {
        if (this.editando) {
          await axios.put(
            `/api/products/${this.productId}/presentations/${this.registroEditando.id}`,
            cuerpo
          )
        } else {
          await axios.post(
            `/api/products/${this.productId}/presentations`,
            cuerpo
          )
        }

        const fueEdicion = this.editando

        this.dialogo = false
        this.registroEditando = null

        this.$emit('recargar')
        this.$emit(
          'notificar',
          fueEdicion
            ? 'Presentación actualizada correctamente.'
            : 'Presentación asignada correctamente.',
          'success'
        )

      } catch (error) {
        console.error('Error al guardar presentación:', error)

        const estado = error.response?.status
        const mensaje = obtenerMensajeError(
          error,
          'No fue posible guardar la presentación.'
        )
        const campos = obtenerErroresCampo(error)

        if (estado === 409) {
          if (/c[oó]digo/i.test(mensaje)) {
            campos.code = mensaje
          } else if (/presentaci[oó]n|asignada/i.test(mensaje)) {
            campos.presentationId = mensaje
          } else {
            this.errorGeneral = mensaje
          }
        }

        this.erroresCampo = campos

        if (!Object.keys(campos).length && !this.errorGeneral) {
          this.errorGeneral = mensaje
        }

      } finally {
        this.guardando = false
      }
    },

    solicitarCambioEstado(item) {
      this.registroEstado = item.raw ?? item
      this.dialogoEstado = true
    },

    // PATCH: activar o desactivar la presentación del producto.
    async confirmarCambioEstado() {
      const registro = this.registroEstado

      if (!registro) {
        return
      }

      this.dialogoEstado = false

      try {
        await axios.patch(
          `/api/products/${this.productId}/presentations/${registro.id}/status`,
          {
            isActive: !registro.isActive
          }
        )

        this.$emit('recargar')
        this.$emit(
          'notificar',
          registro.isActive
            ? 'Presentación desactivada correctamente.'
            : 'Presentación activada correctamente.',
          'success'
        )

      } catch (error) {
        console.error('Error al cambiar estado de la presentación:', error)

        this.$emit(
          'notificar',
          obtenerMensajeError(
            error,
            'No fue posible cambiar el estado de la presentación.'
          ),
          'error'
        )
      }
    },

    // S2-12b conectará el formulario de cambio de precio.
    avisarPrecio(item) {

      const registro = item.raw ?? item

      // Obtener fecha actual en formato YYYY-MM-DD de forma automática
      const fechaActual = new Date().toISOString().split('T')[0]

      // Obtener el ID del usuario logueado automáticamente (según tu sistema de auth)
      const idUsuarioLogueado = this.$auth?.user?.id ?? null


      this.editando = true
      this.registroEditando = registro
    
      this.formularioPrecio = {
        productPresentationId: registro.product_presentation?.id ?? null,
        userId: registro.user_id || idUsuarioLogueado,
        price: registro.price ?? '',
        start_date: registro.start_date || fechaActual,
        end_date: registro.end_date || null
      },

      this.erroresCampo = {}
      this.errorGeneral = ''
      this.dialogoPrecio = true

      this.$nextTick(() => {
        this.$refs.formularioRef?.resetValidation()
      })
    },

    async GuardarPrecio()
    {
      if (this.guardando) {
        return
      }

      const resultado = await this.$refs.formularioRef.validate()

      if (!resultado.valid) {
        return
      }

      this.erroresCampo = {}
      this.errorGeneral = ''
      this.guardando = true

      const cuerpo = {
        price: Number(this.formularioPrecio.price || ''),
        user_id: this.formularioPrecio.user_id,
        start_date: this.formularioPrecio.start_date,
        end_date: this.formularioPrecio.end_date
      }

      try {
        await axios.post(
          `/api/products/${this.productId}/presentations/${this.registroEditando.id}/prices`,
          cuerpo
        )

        this.dialogoPrecio = false
        this.registroEditando = null

        this.$emit('recargar')
        this.$emit(
          'notificar',
          'Precio actualizado correctamente.',
          'success'
        )

      } catch (error) {
        console.error('Error al guardar el precio:', error)

        const estado = error.response?.status
        const mensaje = obtenerMensajeError(
          error,
          'No fue posible guardar el precio.'
        )
        const campos = obtenerErroresCampo(error)

        this.erroresCampo = campos
        this.errorGeneral = mensaje

        if (!Object.keys(campos).length && !this.errorGeneral) {
          this.errorGeneral = mensaje
        }

      } finally {
        this.guardando = false
      }
    },

    // S2-12b conectará el historial de precios.
    async avisarHistorial(item) {
      const registro = item.raw ?? item
      const presentationId = registro.product_presentation?.id ?? registro.id
      
      this.presentationNombreActual = registro.presentation?.name || registro.code || 'Presentación'
      this.dialogoHistorial = true
      this.cargandoHistorial = true
      this.errorHistorial = ''
      this.listaHistorial = []

      try {
        // Petición GET a tu backend usando la ruta basada en tu estructura de base de datos
        const respuesta = await axios.get(
          `/api/products/${this.productId}/presentations/${presentationId}/prices`
        )
        
        // Asignamos los datos obtenidos de la BD a la lista de la tabla
        this.listaHistorial = respuesta.data
      } catch (error) {
        console.error('Error al cargar el historial de precios:', error)
        this.errorHistorial = 'No fue posible cargar el historial de precios.'
      } finally {
        this.cargandoHistorial = false
      }
    }
  }
}
</script>

<style scoped>
/* Menos relleno lateral en las celdas para que las acciones quepan sin scroll horizontal */
.tabla-presentaciones :deep(th),
.tabla-presentaciones :deep(td) {
  padding-left: 8px !important;
  padding-right: 8px !important;
}
</style>
