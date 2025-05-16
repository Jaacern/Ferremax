/**
 * Utilidades para formateo de datos
 */

/**
 * Formatear precio con simbolo de moneda
 * @param {number} price - Precio a formatear
 * @param {string} currency - Código de moneda (por defecto CLP)
 * @returns {string} Precio formateado
 */
export const formatPrice = (price, currency = 'CLP') => {
  if (price === undefined || price === null) return '';
  
  const formatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'CLP' ? 0 : 2
  });
  
  return formatter.format(price);
};

/**
 * Formatear fecha
 * @param {string} dateString - Fecha en formato ISO
 * @param {boolean} includeTime - Incluir hora
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && { hour: '2-digit', minute: '2-digit' })
    };
    
    return date.toLocaleDateString('es-CL', options);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return dateString;
  }
};

/**
 * Formatear RUT chileno
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado
 */
export const formatRut = (rut) => {
  if (!rut) return '';
  
  // Eliminar puntos y guiones existentes
  const cleanRut = rut.replace(/[.-]/g, '');
  
  // Separar cuerpo y dígito verificador
  const dv = cleanRut.slice(-1);
  const body = cleanRut.slice(0, -1);
  
  // Formatear con puntos
  let formatted = '';
  for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
    formatted = body[i] + formatted;
    if (j > 0 && j % 3 === 0 && i > 0) {
      formatted = '.' + formatted;
    }
  }
  
  // Añadir guión y dígito verificador
  return `${formatted}-${dv}`;
};

/**
 * Formatear número de teléfono chileno
 * @param {string} phone - Número de teléfono
 * @returns {string} Número formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Eliminar espacios, paréntesis y guiones
  const cleaned = phone.replace(/[\s\(\)-]/g, '');
  
  if (cleaned.startsWith('+56')) {
    // Formato internacional
    if (cleaned.length === 11) {
      // +56 9 1234 5678
      return `+56 ${cleaned.substring(3, 4)} ${cleaned.substring(4, 8)} ${cleaned.substring(8)}`;
    } else if (cleaned.length === 10) {
      // +56 2 2123 4567
      return `+56 ${cleaned.substring(3, 4)} ${cleaned.substring(4, 8)} ${cleaned.substring(8)}`;
    }
  } else if (cleaned.startsWith('9') && cleaned.length === 9) {
    // Celular nacional: 9 1234 5678
    return `${cleaned.substring(0, 1)} ${cleaned.substring(1, 5)} ${cleaned.substring(5)}`;
  } else if (cleaned.length === 9) {
    // Fijo con código de área: 2 2123 4567
    return `${cleaned.substring(0, 1)} ${cleaned.substring(1, 5)} ${cleaned.substring(5)}`;
  }
  
  // Devolver sin formato si no coincide con los patrones
  return phone;
};

/**
 * Truncar texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Formatear número de orden para mostrar
 * @param {string} orderNumber - Número de orden (ORD-YYYYMMDD-XXXXXX)
 * @returns {string} Número formateado
 */
export const formatOrderNumber = (orderNumber) => {
  if (!orderNumber) return '';
  
  const parts = orderNumber.split('-');
  if (parts.length !== 3) return orderNumber;
  
  const dateStr = parts[1];
  const reference = parts[2];
  
  if (dateStr.length === 8) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    
    return `#${reference} (${day}/${month}/${year})`;
  }
  
  return orderNumber;
};

/**
 * Convertir primera letra a mayúscula
 * @param {string} text - Texto a convertir
 * @returns {string} Texto con primera letra en mayúscula
 */
export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formatear estado de orden para visualización
 * @param {string} status - Estado de la orden
 * @returns {Object} Objeto con texto y color para UI
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    'pendiente': { text: 'Pendiente', color: 'warning' },
    'aprobado': { text: 'Aprobado', color: 'info' },
    'rechazado': { text: 'Rechazado', color: 'danger' },
    'en preparación': { text: 'En preparación', color: 'primary' },
    'listo para entrega': { text: 'Listo para entrega', color: 'success' },
    'enviado': { text: 'Enviado', color: 'info' },
    'entregado': { text: 'Entregado', color: 'success' },
    'cancelado': { text: 'Cancelado', color: 'danger' }
  };
  
  return statusMap[status] || { text: capitalizeFirst(status), color: 'secondary' };
};

/**
 * Formatear método de pago para visualización
 * @param {string} method - Método de pago
 * @returns {Object} Objeto con texto e icono para UI
 */
export const formatPaymentMethod = (method) => {
  const methodMap = {
    'tarjeta de crédito': { text: 'Tarjeta de Crédito', icon: 'credit-card' },
    'tarjeta de débito': { text: 'Tarjeta de Débito', icon: 'credit-card' },
    'transferencia bancaria': { text: 'Transferencia Bancaria', icon: 'bank' },
    'efectivo': { text: 'Efectivo', icon: 'cash' }
  };
  
  return methodMap[method] || { text: capitalizeFirst(method), icon: 'credit-card' };
};

/**
 * Formatear estado de pago para visualización
 * @param {string} status - Estado del pago
 * @returns {Object} Objeto con texto y color para UI
 */
export const formatPaymentStatus = (status) => {
  const statusMap = {
    'pendiente': { text: 'Pendiente', color: 'warning' },
    'procesando': { text: 'Procesando', color: 'info' },
    'completado': { text: 'Completado', color: 'success' },
    'fallido': { text: 'Fallido', color: 'danger' },
    'reembolsado': { text: 'Reembolsado', color: 'secondary' },
    'cancelado': { text: 'Cancelado', color: 'danger' }
  };
  
  return statusMap[status] || { text: capitalizeFirst(status), color: 'secondary' };
};