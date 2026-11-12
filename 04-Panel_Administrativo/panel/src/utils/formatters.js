// Formatos compartidos por las pantallas de productos y presentaciones.

export function formatearNumero(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return '—'
  }

  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return '—'
  }

  return numero.toLocaleString('es-SV', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

export function formatearMoneda(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return 'Sin precio'
  }

  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return 'Sin precio'
  }

  return numero.toLocaleString('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Ejemplo: "Caja · 25 Libra"
export function describirPresentacion(presentacion) {
  if (!presentacion) {
    return '—'
  }

  const nombre = presentacion.name || 'Presentación'
  const cantidad = Number(presentacion.quantity)

  if (
    presentacion.measureUnit &&
    Number.isFinite(cantidad) &&
    cantidad > 0
  ) {
    return `${nombre} · ${formatearNumero(cantidad)} ${presentacion.measureUnit}`
  }

  return nombre
}
