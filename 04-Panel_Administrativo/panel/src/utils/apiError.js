// Utilidades compartidas para interpretar las respuestas de error de Spring Boot.
// El contrato de la API devuelve { message, errors: [{ field, message }] }.

export function obtenerMensajeError(
  error,
  mensajePorDefecto = 'No fue posible completar la operación.'
) {
  const respuesta = error?.response?.data
  const estado = error?.response?.status

  // Errores de validación de campos.
  if (Array.isArray(respuesta?.errors) && respuesta.errors.length) {
    const detalles = respuesta.errors
      .map(item => item.message || item.defaultMessage)
      .filter(Boolean)
      .join(', ')

    if (detalles) {
      return detalles
    }
  }

  // Mensaje específico enviado por la API.
  if (
    typeof respuesta?.message === 'string' &&
    respuesta.message.trim()
  ) {
    return respuesta.message
  }

  // Mensajes alternativos según el estado HTTP.
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
    return 'No se encontró el recurso solicitado.'
  }

  if (estado === 409) {
    return 'La operación entra en conflicto con los datos existentes.'
  }

  if (estado >= 500) {
    return 'Ocurrió un error en el servidor.'
  }

  if (error?.request) {
    return 'No fue posible conectar con la API. Verifica que esté en ejecución.'
  }

  return mensajePorDefecto
}

// Convierte errors[] en un objeto { campo: mensaje } para mostrarlo en el formulario.
export function obtenerErroresCampo(error) {
  const errores = error?.response?.data?.errors

  if (!Array.isArray(errores)) {
    return {}
  }

  return errores.reduce((acumulado, item) => {
    if (item?.field && item?.message) {
      acumulado[item.field] = item.message
    }

    return acumulado
  }, {})
}
