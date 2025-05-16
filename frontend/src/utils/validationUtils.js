/**
 * Utilidades para validación de datos
 */

/**
 * Validar dirección de correo electrónico
 * @param {string} email - Correo electrónico a validar
 * @returns {boolean} true si es válido
 */
export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validar RUT chileno
 * @param {string} rut - RUT a validar
 * @returns {boolean} true si es válido
 */
export const validateRut = (rut) => {
  if (!rut) return false;
  
  // Eliminar puntos y guiones
  rut = rut.replace(/\./g, '').replace(/-/g, '');
  
  // Verificar formato básico
  if (!/^(\d{1,8})([0-9K])$/.test(rut)) {
    return false;
  }
  
  // Separar cuerpo y dígito verificador
  const rutDigits = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  // Recorrer dígitos de derecha a izquierda
  for (let i = rutDigits.length - 1; i >= 0; i--) {
    sum += parseInt(rutDigits[i]) * multiplier;
    multiplier = multiplier < 7 ? multiplier + 1 : 2;
  }
  
  // Calcular dígito esperado
  const expectedDV = 11 - (sum % 11);
  let expectedDVStr;
  
  if (expectedDV === 11) {
    expectedDVStr = '0';
  } else if (expectedDV === 10) {
    expectedDVStr = 'K';
  } else {
    expectedDVStr = expectedDV.toString();
  }
  
  // Comparar con dígito proporcionado
  return expectedDVStr === dv;
};

/**
 * Validar número de teléfono chileno
 * @param {string} phone - Número a validar
 * @returns {boolean} true si es válido
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  
  // Eliminar espacios, guiones y paréntesis
  const cleaned = phone.replace(/[\s\(\)-]/g, '');
  
  // Validar formato chileno
  // +56 9 XXXX XXXX (celular)
  // +56 X XXXX XXXX (fijo con código de área)
  // 9 XXXX XXXX (celular nacional)
  // X XXXX XXXX (fijo nacional)
  
  // Formato internacional
  if (cleaned.startsWith('+56') && (cleaned.length === 11 || cleaned.length === 10)) {
    return true;
  }
  
  // Formato nacional
  if (cleaned.length === 9 && (/^9\d{8}$/.test(cleaned) || /^\d{9}$/.test(cleaned))) {
    return true;
  }
  
  return false;
};

/**
 * Validar contraseña
 * @param {string} password - Contraseña a validar
 * @returns {Object} Resultado de validación con éxito y mensaje
 */
export const validatePassword = (password) => {
  if (!password) {
    return { success: false, message: 'La contraseña es requerida' };
  }
  
  if (password.length < 8) {
    return { success: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  
  // Verificar requisitos de complejidad
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const missing = [];
  if (!hasUpperCase) missing.push('una letra mayúscula');
  if (!hasLowerCase) missing.push('una letra minúscula');
  if (!hasDigit) missing.push('un número');
  if (!hasSpecialChar) missing.push('un carácter especial');
  
  if (missing.length > 0) {
    return {
      success: false,
      message: `La contraseña debe incluir al menos ${missing.join(', ')}`
    };
  }
  
  return { success: true, message: 'Contraseña válida' };
};

/**
 * Validar si un campo es requerido
 * @param {*} value - Valor a validar
 * @returns {boolean} true si es válido
 */
export const validateRequired = (value) => {
  if (value === undefined || value === null) return false;
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  return true;
};

/**
 * Validar longitud mínima
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima
 * @returns {boolean} true si es válido
 */
export const validateMinLength = (value, minLength) => {
  if (!value) return false;
  return value.length >= minLength;
};

/**
 * Validar longitud máxima
 * @param {string} value - Valor a validar
 * @param {number} maxLength - Longitud máxima
 * @returns {boolean} true si es válido
 */
export const validateMaxLength = (value, maxLength) => {
  if (!value) return true; // Campo vacío se considera válido para maxLength
  return value.length <= maxLength;
};

/**
 * Validar que un valor sea numérico
 * @param {*} value - Valor a validar
 * @returns {boolean} true si es numérico
 */
export const validateNumeric = (value) => {
  if (value === undefined || value === null || value === '') return false;
  return !isNaN(Number(value));
};

/**
 * Validar que un valor sea numérico y mayor a cero
 * @param {*} value - Valor a validar
 * @returns {boolean} true si es válido
 */
export const validatePositiveNumber = (value) => {
  if (!validateNumeric(value)) return false;
  return Number(value) > 0;
};

/**
 * Validar fecha en formato ISO
 * @param {string} date - Fecha a validar
 * @returns {boolean} true si es válida
 */
export const validateDate = (date) => {
  if (!date) return false;
  
  const isoDate = new Date(date);
  return !isNaN(isoDate.getTime());
};

/**
 * Validar un SKU de producto
 * @param {string} sku - SKU a validar
 * @returns {boolean} true si es válido
 */
export const validateSku = (sku) => {
  if (!sku) return false;
  
  // Formato FER-XXXXX o similar
  return /^[A-Z]{3}-\d{5}$/.test(sku);
};

/**
 * Validar un número de orden
 * @param {string} orderNumber - Número de orden a validar
 * @returns {boolean} true si es válido
 */
export const validateOrderNumber = (orderNumber) => {
  if (!orderNumber) return false;
  
  // Formato ORD-YYYYMMDD-XXXXXX
  return /^ORD-\d{8}-[A-Z0-9]{6}$/.test(orderNumber);
};