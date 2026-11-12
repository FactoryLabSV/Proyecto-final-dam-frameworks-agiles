<template>
  <v-chip
    :color="color"
    size="small"
    variant="flat"
    class="font-weight-bold"
  >
    {{ etiqueta }}
  </v-chip>
</template>

<script>
// Estados calculados por la API (StockStatusCalculator):
// OUT = agotado, LOW = bajo el mínimo, OK = existencia suficiente.
const ESTADOS = {
  OK: {
    etiqueta: 'OK',
    color: 'success'
  },
  LOW: {
    etiqueta: 'Bajo',
    color: 'warning'
  },
  OUT: {
    etiqueta: 'Agotado',
    color: 'error'
  }
}

export default {
  name: 'EstadoStockChip',

  props: {
    status: {
      type: String,
      default: ''
    }
  },

  computed: {
    estado() {
      return ESTADOS[this.status] || {
        etiqueta: 'Sin datos',
        color: 'grey'
      }
    },

    etiqueta() {
      return this.estado.etiqueta
    },

    color() {
      return this.estado.color
    }
  }
}
</script>
