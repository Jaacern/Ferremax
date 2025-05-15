/**
 * Utilidades para formateo de diferentes tipos de datos en la aplicación
 */

/**
 * Formatea un precio en formato moneda chilena
 * @param {number} price - Precio a formatear
 * @param {boolean} includeSymbol - Si debe incluir el símbolo $ (por defecto true)
 * @returns {string} Precio formateado
 */
export const formatPrice = (price, includeSymbol = true) => {
  if (price === undefined || price === null) return '-';
  
  return new Intl.NumberFormat('es-CL', {
    style: includeSymbol ? 'currency' : 'decimal',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Formatea una fecha en formato local chileno
 * @param {string|Date} date - Fecha a formatear (string ISO o objeto Date)
 * @param {boolean} includeTime - Si debe incluir la hora (por defecto false)
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '-';
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  return dateObj.toLocaleDateString('es-CL', options);
};

/**
 * Formatea un timestamp en formato relativo (e.g., "hace 5 minutos")
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Tiempo relativo
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '-';
  
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.floor((dateObj - now) / 1000);
  
  // Convertir a la unidad más apropiada
  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInMonth = secondsInDay * 30;
  const secondsInYear = secondsInDay * 365;
  
  if (Math.abs(diffInSeconds) < secondsInMinute) {
    return rtf.format(Math.round(diffInSeconds), 'second');
  } else if (Math.abs(diffInSeconds) < secondsInHour) {
    return rtf.format(Math.round(diffInSeconds / secondsInMinute), 'minute');
  } else if (Math.abs(diffInSeconds) < secondsInDay) {
    return rtf.format(Math.round(diffInSeconds / secondsInHour), 'hour');
  } else if (Math.abs(diffInSeconds) < secondsInMonth) {
    return rtf.format(Math.round(diffInSeconds / secondsInDay), 'day');
  } else if (Math.abs(diffInSeconds) < secondsInYear) {
    return rtf.format(Math.round(diffInSeconds / secondsInMonth), 'month');
  } else {
    return rtf.format(Math.round(diffInSeconds / secondsInYear), 'year');
  }
};

/**
 * Formatea un número de teléfono en formato chileno
 * @param {string} phone - Número telefónico a formatear
 * @returns {string} Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  
  // Eliminar caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formato para teléfonos chilenos
  if (cleaned.length === 9) {
    // Celular: +56 9 1234 5678
    return `+56 ${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 8) {
    // Fijo: +56 2 1234 5678 (asumiendo código de área 2 para Santiago)
    return `+56 2 ${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  } else {
    // Devolver sin formato si no coincide con patrones conocidos
    return phone;
  }
};

/**
 * Formatea un RUT chileno (agrega puntos y guión)
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado
 */
export const formatRut = (rut) => {
  if (!rut) return '-';
  
  // Eliminar puntos y guión
  let rutClean = rut.replace(/\./g, '').replace('-', '');
  
  // Separar cuerpo y dígito verificador
  const dv = rutClean.slice(-1);
  const rutBody = rutClean.slice(0, -1);
  
  // Formatear con puntos
  let formatted = '';
  for (let i = rutBody.length - 1, j = 0; i >= 0; i--, j++) {
    formatted = rutBody.charAt(i) + formatted;
    if ((j + 1) % 3 === 0 && i !== 0) {
      formatted = '.' + formatted;
    }
  }
  
  // Agregar dígito verificador
  return `${formatted}-${dv}`;
};

/**
 * Formatea un texto para mostrar una versión truncada con ellipsis
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima (por defecto 100)
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
export const formatNumber = (number) => {
  if (number === undefined || number === null) return '-';
  
  return new Intl.NumberFormat('es-CL').format(number);
};