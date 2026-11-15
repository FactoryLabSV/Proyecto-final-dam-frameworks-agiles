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
        <div class="text-caption text-medium-emphasis">
          Productos / {{ esEdicion ? 'Editar' : 'Nuevo' }}
        </div>

        <h2 class="mb-1">
          {{ esEdicion ? 'Editar producto' : 'Registrar producto' }}
        </h2>

        <div class="text-body-2 text-medium-emphasis">
          {{
            esEdicion
              ? 'Actualiza los datos generales del producto.'
              : 'Registra un producto y asígnalo a una categoría y tipo.'
          }}
        </div>
      </div>

      <v-btn
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        @click="volver"
      >
        Volver
      </v-btn>
    </div>

    <v-progress-linear
      v-if="cargandoCatalogos || cargandoProducto"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <v-card
      elevation="2"
      max-width="1000"
    >
      <v-card-title>
        Datos del producto
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-skeleton-loader
          v-if="cargandoProducto"
          type="article, actions"
        />

        <template v-else>
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
            <v-row dense>
              <!-- Código y nombre -->
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formulario.code"
                  label="Código / SKU *"
                  :rules="reglasCodigo()"
                  :error-messages="erroresCampo.code"
                  variant="outlined"
                  :maxlength="50"
                  :counter="50"
                  hint="Código único en todo el sistema."
                  persistent-hint
                  @update:model-value="limpiarErrorCampo('code')"
                />
              </v-col>

              <v-col cols="12" md="8">
                <v-text-field
                  v-model="formulario.name"
                  label="Nombre *"
                  :rules="reglasNombre()"
                  :error-messages="erroresCampo.name"
                  variant="outlined"
                  :maxlength="150"
                  :counter="150"
                  @update:model-value="limpiarErrorCampo('name')"
                />
              </v-col>

              <!-- Clasificación -->
              <v-col cols="12" md="4">
                <v-select
                  :model-value="formulario.categoryId"
                  :items="opcionesCategorias"
                  item-title="title"
                  item-value="value"
                  label="Categoría *"
                  :rules="reglasSeleccion('una categoría')"
                  :error-messages="erroresCampo.categoryId"
                  :loading="cargandoCatalogos"
                  variant="outlined"
                  @update:model-value="actualizarSeleccion('categoryId', $event)"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-select
                  :model-value="formulario.productTypeId"
                  :items="opcionesTipos"
                  item-title="title"
                  item-value="value"
                  label="Tipo *"
                  :rules="reglasSeleccion('un tipo de producto')"
                  :error-messages="erroresCampo.productTypeId"
                  :loading="cargandoCatalogos"
                  variant="outlined"
                  @update:model-value="actualizarSeleccion('productTypeId', $event)"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-switch
                  :model-value="formulario.requiresExpiration"
                  label="Requiere vencimiento"
                  color="primary"
                  inset
                  class="mt-2"
                  :error-messages="erroresCampo.requiresExpiration"
                  @update:model-value="actualizarBooleano('requiresExpiration', $event)"
                />
              </v-col>

              <!-- Marca y modelo: el modelo se filtra por marca -->
              <v-col cols="12" md="6">
                <v-select
                  :model-value="formulario.brandId"
                  :items="opcionesMarcas"
                  item-title="title"
                  item-value="value"
                  label="Marca"
                  :loading="cargandoCatalogos"
                  variant="outlined"
                  clearable
                  hint="Opcional. Si eliges un modelo, primero selecciona la marca."
                  persistent-hint
                  @update:model-value="cambiarMarca"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  :model-value="formulario.productModelId"
                  :items="modelos"
                  item-title="title"
                  item-value="value"
                  label="Modelo"
                  :disabled="!formulario.brandId"
                  :loading="cargandoModelos"
                  :no-data-text="textoModelos"
                  variant="outlined"
                  clearable
                  hint="Opcional. Se filtran los modelos de la marca elegida."
                  persistent-hint
                  @update:model-value="actualizarModelo"
                />
              </v-col>

              <!-- Descripción -->
              <v-col cols="12">
                <v-textarea
                  v-model="formulario.description"
                  label="Descripción"
                  :rules="reglasDescripcion()"
                  :error-messages="erroresCampo.description"
                  variant="outlined"
                  rows="3"
                  :maxlength="255"
                  :counter="255"
                  auto-grow
                  @update:model-value="limpiarErrorCampo('description')"
                />
              </v-col>
            </v-row>

            <div class="d-flex flex-wrap justify-end ga-2 mt-4">
              <v-btn
                variant="text"
                :disabled="guardando"
                @click="volver"
              >
                Cancelar
              </v-btn>

              <v-btn
                color="primary"
                type="submit"
                :loading="guardando"
                prepend-icon="mdi-content-save"
              >
                Guardar
              </v-btn>
            </div>
          </v-form>
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios'

import {
  obtenerErroresCampo,
  obtenerMensajeError
} from '../utils/apiError'

function crearFormularioVacio() {
  return {
    code: '',
    name: '',
    description: '',
    categoryId: null,
    productTypeId: null,
    brandId: null,
    productModelId: null,
    requiresExpiration: false
  }
}

export default {
  name: 'ProductoFormularioView',

  data() {
    return {
      apiProductos: '/api/products',
      apiCategorias: '/api/categories/options',
      apiTipos: '/api/product-types/options',
      apiMarcas: '/api/brands/options',
      apiModelos: '/api/models/options',

      opcionesCategorias: [],
      opcionesTipos: [],
      opcionesMarcas: [],
      modelos: [],

      formulario: crearFormularioVacio(),

      erroresCampo: {},
      errorGeneral: '',

      cargandoCatalogos: false,
      cargandoProducto: false,
      cargandoModelos: false,
      guardando: false,

      mensaje: '',
      tipoMensaje: 'success',
      mostrarNotificacion: false
    }
  },

  computed: {
    esEdicion() {
      return this.$route.name === 'producto-editar'
    },

    idProducto() {
      const id = Number(this.$route.params.id)
      return Number.isInteger(id) && id > 0 ? id : null
    },

    textoModelos() {
      if (!this.formulario.brandId) {
        return 'Selecciona una marca para ver sus modelos.'
      }

      return 'La marca seleccionada no tiene modelos activos.'
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

    // Agrega la opción actual si el catálogo de activos no la incluye.
    agregarOpcionSiFalta(propiedad, entidad) {
      if (!entidad?.id) {
        return
      }

      if (this[propiedad].some(opcion => opcion.value === entidad.id)) {
        return
      }

      this[propiedad] = [
        ...this[propiedad],
        {
          title: `${entidad.name} (actual)`,
          value: entidad.id
        }
      ]
    },

    async inicializar() {
      this.cargandoCatalogos = true

      try {
        await this.cargarCatalogos()
      } catch (error) {
        console.error('Error al cargar catálogos:', error)

        this.errorGeneral = obtenerMensajeError(
          error,
          'No fue posible cargar las categorías, tipos y marcas.'
        )
      } finally {
        this.cargandoCatalogos = false
      }

      if (this.esEdicion) {
        await this.cargarProducto()
      } else {
        this.formulario = crearFormularioVacio()
      }
    },

    // GET: opciones activas para los combos.
    async cargarCatalogos() {
      const [categorias, tipos, marcas] = await Promise.all([
        axios.get(this.apiCategorias),
        axios.get(this.apiTipos),
        axios.get(this.apiMarcas)
      ])

      this.opcionesCategorias = this.mapearOpciones(categorias.data)
      this.opcionesTipos = this.mapearOpciones(tipos.data)
      this.opcionesMarcas = this.mapearOpciones(marcas.data)
    },

    // GET: detalle del producto para editar.
    async cargarProducto() {
      if (!this.idProducto) {
        this.errorGeneral = 'El producto solicitado no es válido.'
        return
      }

      this.cargandoProducto = true

      try {
        const respuesta = await axios.get(
          `${this.apiProductos}/${this.idProducto}`
        )

        const producto = respuesta.data

        this.agregarOpcionSiFalta('opcionesCategorias', producto.category)
        this.agregarOpcionSiFalta('opcionesTipos', producto.productType)

        if (producto.productModel?.brand) {
          this.agregarOpcionSiFalta('opcionesMarcas', producto.productModel.brand)
        }

        this.formulario = {
          code: producto.code || '',
          name: producto.name || '',
          description: producto.description || '',
          categoryId: producto.category?.id ?? null,
          productTypeId: producto.productType?.id ?? null,
          brandId: producto.productModel?.brand?.id ?? null,
          productModelId: producto.productModel?.id ?? null,
          requiresExpiration: Boolean(producto.requiresExpiration)
        }

        if (producto.productModel?.brand?.id) {
          await this.cargarModelos(
            producto.productModel.brand.id,
            producto.productModel
          )
        }

      } catch (error) {
        console.error('Error al cargar producto:', error)

        this.errorGeneral = obtenerMensajeError(
          error,
          'No fue posible cargar el producto solicitado.'
        )

      } finally {
        this.cargandoProducto = false
      }
    },

    // GET: modelos activos de la marca seleccionada.
    async cargarModelos(marcaId, modeloActual = null) {
      if (!marcaId) {
        this.modelos = []
        return
      }

      this.cargandoModelos = true

      try {
        const respuesta = await axios.get(this.apiModelos, {
          params: {
            brandId: marcaId
          }
        })

        this.modelos = (respuesta.data || []).map(modelo => ({
          title: modelo.name,
          value: modelo.id
        }))

        // Si el producto ya tenía un modelo que no está activo,
        // se conserva para no borrarlo al guardar.
        if (
          modeloActual &&
          !this.modelos.some(opcion => opcion.value === modeloActual.id)
        ) {
          this.modelos.push({
            title: `${modeloActual.name} (no disponible)`,
            value: modeloActual.id
          })
        }

        if (modeloActual) {
          this.formulario.productModelId = modeloActual.id
        }

      } catch (error) {
        console.error('Error al cargar modelos:', error)

        this.modelos = []

        this.mostrarMensaje(
          obtenerMensajeError(
            error,
            'No fue posible cargar los modelos de la marca.'
          ),
          'error'
        )

      } finally {
        this.cargandoModelos = false
      }
    },

    cambiarMarca(marcaId) {
      this.formulario.brandId = marcaId
      this.formulario.productModelId = null
      this.modelos = []

      if (marcaId) {
        this.cargarModelos(marcaId)
      }
    },

    actualizarSeleccion(campo, valor) {
      this.formulario = {
        ...this.formulario,
        [campo]: valor
      }

      this.limpiarErrorCampo(campo)
    },

    actualizarModelo(valor) {
      this.formulario.productModelId = valor
    },

    actualizarBooleano(campo, valor) {
      this.formulario = {
        ...this.formulario,
        [campo]: Boolean(valor)
      }

      this.limpiarErrorCampo(campo)
    },

    limpiarErrorCampo(campo) {
      if (!this.erroresCampo[campo]) {
        return
      }

      const copia = { ...this.erroresCampo }
      delete copia[campo]
      this.erroresCampo = copia
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

    reglasNombre() {
      return [
        valor =>
          String(valor ?? '').trim() !== '' ||
          'El nombre es obligatorio.',
        valor =>
          String(valor ?? '').trim().length <= 150 ||
          'El nombre no puede superar los 150 caracteres.'
      ]
    },

    reglasDescripcion() {
      return [
        valor =>
          String(valor ?? '').trim().length <= 255 ||
          'La descripción no puede superar los 255 caracteres.'
      ]
    },

    reglasSeleccion(descripcion) {
      return [
        valor =>
          (valor !== null && valor !== undefined && valor !== '') ||
          `Selecciona ${descripcion}.`
      ]
    },

    // POST o PUT: registrar o actualizar el producto.
    async guardar() {
      if (this.guardando) {
        return
      }

      const resultado = await this.$refs.formularioRef.validate()

      if (!resultado.valid) {
        return
      }

      if (this.formulario.productModelId && !this.formulario.brandId) {
        this.errorGeneral = 'Selecciona una marca antes de elegir el modelo.'
        return
      }

      this.erroresCampo = {}
      this.errorGeneral = ''

      const cuerpo = {
        code: String(this.formulario.code || '').trim(),
        name: String(this.formulario.name || '').trim(),
        description: String(this.formulario.description || '').trim() || null,
        categoryId: Number(this.formulario.categoryId),
        productTypeId: Number(this.formulario.productTypeId),
        productModelId: this.formulario.productModelId
          ? Number(this.formulario.productModelId)
          : null,
        requiresExpiration: Boolean(this.formulario.requiresExpiration)
      }

      this.guardando = true

      try {
        let respuesta

        if (this.esEdicion) {
          respuesta = await axios.put(
            `${this.apiProductos}/${this.idProducto}`,
            cuerpo
          )
        } else {
          respuesta = await axios.post(
            this.apiProductos,
            cuerpo
          )
        }

        const id = this.esEdicion
          ? this.idProducto
          : respuesta.data?.id

        if (!id) {
          this.errorGeneral = 'La API no devolvió el producto guardado.'
          return
        }

        this.mostrarMensaje(
          this.esEdicion
            ? 'Producto actualizado correctamente.'
            : 'Producto registrado correctamente.',
          'success'
        )

        this.$router.push({
          name: 'producto-detalle',
          params: { id },
          query: {
            guardado: this.esEdicion ? 'editado' : 'creado'
          }
        })

      } catch (error) {
        console.error('Error al guardar producto:', error)

        const estado = error.response?.status
        const mensaje = obtenerMensajeError(
          error,
          'No fue posible guardar el producto.'
        )
        const campos = obtenerErroresCampo(error)

        if (estado === 409) {
          if (/c[oó]digo/i.test(mensaje)) {
            campos.code = mensaje
          } else {
            this.errorGeneral = mensaje
          }
        }

        this.erroresCampo = campos

        if (!Object.keys(campos).length && !this.errorGeneral) {
          this.errorGeneral = mensaje
        }

        if (Object.keys(campos).length) {
          this.mostrarMensaje('Revisa los campos marcados.', 'error')
        }

      } finally {
        this.guardando = false
      }
    },

    volver() {
      if (this.esEdicion && this.idProducto) {
        this.$router.push({
          name: 'producto-detalle',
          params: { id: this.idProducto }
        })
        return
      }

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
</style>
