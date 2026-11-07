
<template>
  <v-container fluid class="pa-4">

    <!-- Encabezado del catálogo -->
    <div class="d-flex align-center justify-space-between mb-4">
      <h2>{{ titulo }}</h2>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="abrirCrear"
      >
        Nuevo registro
      </v-btn>
    </div>

    <v-card elevation="2">
      <v-card-text>

        <!-- Búsqueda -->
        <v-row align="center">
          <v-col cols="12" sm="8" md="5">
            <v-text-field
              v-model="busqueda"
              label="Buscar registros"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @keyup.enter="buscar"
              @click:clear="limpiarBusqueda"
            />
          </v-col>

          <v-col cols="12" sm="4" md="2">
            <v-btn
              color="primary"
              variant="outlined"
              block
              @click="buscar"
            >
              Buscar
            </v-btn>
          </v-col>
        </v-row>

        <!-- Tabla de datos del servidor -->
        <v-data-table-server
          :key="versionTabla"
          :headers="columnasTabla"
          :items="registros"
          :items-length="totalRegistros"
          :loading="cargando"
          :page="pagina"
          :items-per-page="tamano"
          item-value="id"
          hide-default-footer
          class="mt-4"
        >

          <!-- Estado de los registros -->
          <template #item.estado="{ item }">
            <v-chip
              :color="estadoRegistro(item) ? 'success' : 'error'"
              size="small"
            >
              {{
                estadoRegistro(item) === null
                  ? 'Sin estado'
                  : estadoRegistro(item)
                    ? 'Activo'
                    : 'Inactivo'
              }}
            </v-chip>
          </template>

          <!-- Acciones -->
          <template #item.acciones="{ item }">
            <v-btn
              icon="mdi-pencil"
              color="primary"
              size="small"
              variant="text"
              title="Editar registro"
              @click="abrirEditar(item)"
            />

            <v-btn
              v-if="mostrarEstado"
              :icon="estadoRegistro(item) ? 'mdi-eye-off' : 'mdi-eye'"
              :color="estadoRegistro(item) ? 'warning' : 'success'"
              :disabled="estadoRegistro(item) === null"
              size="small"
              variant="text"
              :title="estadoRegistro(item) ? 'Desactivar' : 'Activar'"
              @click="solicitarCambioEstado(item)"
            />
          </template>

          <template #no-data>
            No se encontraron registros.
          </template>

        </v-data-table-server>

        <!-- Paginación controlada -->
        <div
          class="d-flex flex-wrap align-center justify-end ga-4 mt-3"
        >

          <!-- Cantidad por página -->
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

          <!-- Contador de registros -->
          <span class="text-body-2">
            {{ registroInicial }}-{{ registroFinal }}
            de {{ totalRegistros }}
          </span>

          <!-- Navegación entre páginas -->
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

    <!-- Formulario para crear y editar -->
    <v-dialog
      v-model="dialogoFormulario"
      max-width="550"
      persistent
    >
      <v-card>
        <v-card-title class="pa-4">
          {{ editando ? 'Editar registro' : 'Nuevo registro' }}
        </v-card-title>

        <v-card-text>
          <v-form
            ref="formularioRef"
            @submit.prevent="guardar"
          >

            <!-- Campos configurables -->
            <template
              v-for="campo in campos"
              :key="campo.key"
            >

              <v-textarea
                v-if="campo.type === 'textarea'"
                v-model="formulario[campo.key]"
                :label="campo.label"
                :rules="reglas(campo)"
                variant="outlined"
                rows="3"
                class="mb-2"
              />

              <v-select
                v-else-if="campo.type === 'select'"
                v-model="formulario[campo.key]"
                :label="campo.label"
                :items="campo.options || []"
                :rules="reglas(campo)"
                variant="outlined"
                class="mb-2"
              />

              <v-text-field
                v-else
                v-model="formulario[campo.key]"
                :label="campo.label"
                :type="campo.type === 'number' ? 'number' : 'text'"
                :rules="reglas(campo)"
                variant="outlined"
                class="mb-2"
              />

            </template>

            <!-- Botones del formulario -->
            <div class="d-flex justify-end ga-2">
              <v-btn
                variant="text"
                :disabled="guardando"
                @click="cerrarFormulario"
              >
                Cancelar
              </v-btn>

              <v-btn
                color="primary"
                type="submit"
                :loading="guardando"
              >
                Guardar
              </v-btn>
            </div>

          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Confirmación de cambio de estado -->
    <v-dialog
      v-model="dialogoEstado"
      max-width="420"
    >
      <v-card>
        <v-card-title>
          Confirmar cambio
        </v-card-title>

        <v-card-text>
          ¿Deseas
          {{ estadoRegistro(registroEstado) ? 'desactivar' : 'activar' }}
          este registro?
        </v-card-text>

        <v-card-actions>
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
export default {
  name: 'CatalogoGenerico',

  props: {
    titulo: {
      type: String,
      default: 'Catálogo'
    },

    columnas: {
      type: Array,
      default: () => []
    },

    campos: {
      type: Array,
      default: () => []
    },

    registros: {
      type: Array,
      default: () => []
    },

    totalRegistros: {
      type: Number,
      default: 0
    },

    versionTabla: {
      type: Number,
      default: 0
    },

    cargando: {
      type: Boolean,
      default: false
    },

    guardando: {
      type: Boolean,
      default: false
    },

    mostrarEstado: {
      type: Boolean,
      default: true
    },

    campoEstado: {
      type: String,
      default: 'isActive'
    }
  },

  emits: [
    'cargar',
    'guardar',
    'cambiar-estado'
  ],

  data() {
    return {
      // Búsqueda
      busqueda: '',
      filtro: '',

      // Paginación
      pagina: 1,
      tamano: 10,

      // Formularios
      dialogoFormulario: false,
      dialogoEstado: false,

      editando: false,
      idEdicion: null,
      formulario: {},
      registroEstado: null
    }
  },

  computed: {
    // Construye las columnas reutilizables.
    columnasTabla() {
      const resultado = [...this.columnas]

      if (this.mostrarEstado) {
        resultado.push({
          title: 'Estado',
          key: 'estado',
          sortable: false
        })
      }

      resultado.push({
        title: 'Acciones',
        key: 'acciones',
        sortable: false
      })

      return resultado
    },

    // Calcula la cantidad de páginas.
    totalPaginas() {
      return Math.max(
        1,
        Math.ceil(this.totalRegistros / this.tamano)
      )
    },

    // Primer registro de la página actual.
    registroInicial() {
      if (this.totalRegistros === 0) {
        return 0
      }

      return (this.pagina - 1) * this.tamano + 1
    },

    // Último registro de la página actual.
    registroFinal() {
      if (this.totalRegistros === 0) {
        return 0
      }

      return Math.min(
        this.pagina * this.tamano,
        this.totalRegistros
      )
    }
  },

  watch: {
    // Si se reduce el total, evita una página inexistente.
    totalRegistros() {
      if (this.pagina > this.totalPaginas) {
        this.pagina = this.totalPaginas
        this.solicitarDatos()
      }
    }
  },

  mounted() {
    // Solicita los primeros datos al iniciar.
    this.solicitarDatos()
  },

  methods: {
    // Solicita registros al componente padre.
    solicitarDatos() {
      this.$emit('cargar', {
        page: this.pagina,
        size: this.tamano,
        search: this.filtro
      })
    },

    // Cambia la página actual.
    cambiarPagina(nuevaPagina) {
      if (nuevaPagina === this.pagina) {
        return
      }

      this.pagina = nuevaPagina
      this.solicitarDatos()
    },

    // Cambia la cantidad de registros por página.
    cambiarTamano(nuevoTamano) {
      if (!nuevoTamano || nuevoTamano === this.tamano) {
        return
      }

      this.tamano = nuevoTamano
      this.pagina = 1

      this.solicitarDatos()
    },

    // Ejecuta la búsqueda.
    buscar() {
      this.filtro = (this.busqueda || '').trim()
      this.pagina = 1

      this.solicitarDatos()
    },

    limpiarBusqueda() {
      this.busqueda = ''
      this.buscar()
    },

    // Prepara un formulario vacío.
    abrirCrear() {
      this.editando = false
      this.idEdicion = null
      this.formulario = {}

      this.campos.forEach(campo => {
        this.formulario[campo.key] = ''
      })

      this.dialogoFormulario = true
      this.limpiarValidacion()
    },

    // Carga los datos del registro seleccionado.
    abrirEditar(item) {
      const registro = item.raw ?? item

      this.editando = true
      this.idEdicion = registro.id
      this.formulario = {}

      this.campos.forEach(campo => {
        this.formulario[campo.key] =
          registro[campo.key] ?? ''
      })

      this.dialogoFormulario = true
      this.limpiarValidacion()
    },

    // Limpia los mensajes de validación anteriores.
    limpiarValidacion() {
      this.$nextTick(() => {
        this.$refs.formularioRef?.resetValidation()
      })
    },

    // Valida campos obligatorios.
    reglas(campo) {
      if (!campo.required) {
        return []
      }

      return [
        valor =>
          String(valor ?? '').trim() !== '' ||
          'Este campo es obligatorio'
      ]
    },

    // Envía los datos del formulario al componente padre.
    async guardar() {
      const resultado =
        await this.$refs.formularioRef.validate()

      if (!resultado.valid) {
        return
      }

      this.$emit('guardar', {
        id: this.idEdicion,
        editando: this.editando,
        datos: { ...this.formulario }
      })
    },

    // Cierra el formulario.
    cerrarFormulario() {
      this.dialogoFormulario = false
    },

    // Obtiene el estado del registro.
    estadoRegistro(item) {
      if (!item) {
        return null
      }

      const registro = item.raw ?? item
      const valor = registro[this.campoEstado]

      return typeof valor === 'boolean'
        ? valor
        : null
    },

    // Solicita confirmación para cambiar estado.
    solicitarCambioEstado(item) {
      this.registroEstado = item.raw ?? item
      this.dialogoEstado = true
    },

    // Envía el cambio de estado al componente padre.
    confirmarCambioEstado() {
      const item = this.registroEstado

      if (!item) {
        return
      }

      const estado = this.estadoRegistro(item)

      if (estado === null) {
        return
      }

      this.$emit('cambiar-estado', {
        id: item.id,
        activo: !estado,
        registro: item
      })

      this.dialogoEstado = false
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
