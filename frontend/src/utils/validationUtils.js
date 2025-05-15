/**
 * Utilidades de validación para el frontend de FERREMAS
 */

/**
 * Valida si una dirección de correo electrónico tiene formato correcto
 * @param {string} email - Correo electrónico a validar
 * @returns {boolean} true si el correo es válido
 */
export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Valida si un número telefónico tiene formato correcto (Chile)
 * @param {string} phone - Número telefónico a validar
 * @returns {boolean} true si el número es válido
 */
export const validatePhone = (phone) => {
  // Formato chileno: +56 9 1234 5678 o cualquier variante
  const re = /^(\+?56)?(\s*|\-)?(\d{1,2})(\s*|\-)?(\d{3,4})(\s*|\-)?(\d{4})$/;
  return re.test(String(phone));
};

/**
 * Valida si un RUT chileno tiene formato y dígito verificador correcto
 * @param {string} rut - RUT a validar (con o sin puntos y guión)
 * @returns {boolean} true si el RUT es válido
 */
export const validateRut = (rut) => {
  if (!rut) return false;
  
  // Eliminar puntos y guiones
  rut = rut.replace(/\./g, '').replace('-', '');
  
  // Verificar formato básico
  if (!/^(\d{1,8})([0-9K])$/.test(rut)) return false;
  
  // Separar número y dígito verificador
  const body = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();
  
  // Convertir dígito verificador
  let dvValue = dv === 'K' ? 10 : parseInt(dv);
  
  // Calcular dígito verificador
  let suma = 0;
  let multiplo = 2;
  
  // Recorrer el cuerpo desde atrás hacia adelante
  for (let i = body.length - 1; i >= 0; i--) {
    suma += parseInt(body.charAt(i)) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  
  // Calcular dígito esperado
  const resultado = 11 - (suma % 11);
  const dvCalculado = resultado === 11 ? 0 : resultado === 10 ? 'K' : resultado;
  
  // Comparar
  return dvCalculado.toString() === dvValue.toString();
};

/**
 * Valida si una contraseña cumple con los requisitos mínimos de seguridad
 * @param {string} password - Contraseña a validar
 * @returns {Object} Objeto con resultado y mensaje de error si aplica
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'La contraseña es requerida' };
  }
  
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength) {
    return { isValid: false, message: `La contraseña debe tener al menos ${minLength} caracteres` };
  }
  
  if (!hasUpperCase) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra mayúscula' };
  }
  
  if (!hasLowerCase) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra minúscula' };
  }
  
  if (!hasNumbers) {
    return { isValid: false, message: 'La contraseña debe contener al menos un número' };
  }
  
  if (!hasSpecialChar) {
    return { isValid: false, message: 'La contraseña debe contener al menos un carácter especial' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password - Contraseña original
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {Object} Objeto con resultado y mensaje de error si aplica
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Las contraseñas no coinciden' };
  }
  return { isValid: true, message: '' };
};

/**
 * Valida si una fecha tiene formato correcto (YYYY-MM-DD)
 * @param {string} date - Fecha a validar
 * @returns {boolean} true si la fecha es válida
 */
export const validateDate = (date) => {
  // Verificar formato YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  
  // Verificar que sea una fecha válida
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Valida si un número es positivo y está dentro de un rango específico
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo (opcional)
 * @param {number} max - Valor máximo (opcional)
 * @returns {boolean} true si el valor es válido
 */
export const validateNumber = (value, min = null, max = null) => {
  // Verificar que sea un número
  if (isNaN(value) || value === '') return false;
  
  // Convertir a número
  const numValue = Number(value);
  
  // Verificar mínimo si se especifica
  if (min !== null && numValue < min) return false;
  
  // Verificar máximo si se especifica
  if (max !== null && numValue > max) return false;
  
  return true;
};

/**
 * Valida si una cadena tiene una longitud dentro de un rango específico
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima (opcional)
 * @param {number} maxLength - Longitud máxima (opcional)
 * @returns {boolean} true si la longitud es válida
 */
export const validateLength = (value, minLength = null, maxLength = null) => {
  if (value === null || value === undefined) return false;
  
  // Convertir a cadena
  const strValue = String(value);
  
  // Verificar longitud mínima
  if (minLength !== null && strValue.length < minLength) return false;
  
  // Verificar longitud máxima
  if (maxLength !== null && strValue.length > maxLength) return false;
  
  return true;
};

/**
 * Valida si un valor está dentro de un conjunto de valores permitidos
 * @param {*} value - Valor a validar
 * @param {Array} allowedValues - Valores permitidos
 * @returns {boolean} true si el valor está permitido
 */
export const validateEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

/**
 * Elimina caracteres especiales de una cadena (útil para sanitizar inputs)
 * @param {string} value - Cadena a sanitizar
 * @returns {string} Cadena sanitizada
 */
export const sanitizeString = (value) => {
  if (!value) return '';
  return value.replace(/[<>"'&;]/g, '');
};

/**
 * Formatea un RUT con puntos y guión (XX.XXX.XXX-X)
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado
 */
export const formatRut = (rut) => {
  if (!rut) return '';
  
  // Eliminar puntos y guiones
  rut = rut.replace(/\./g, '').replace('-', '');
  
  // Separar número y dígito verificador
  const body = rut.slice(0, -1);
  const dv = rut.slice(-1);
  
  // Agregar puntos
  let formatted = '';
  let count = 0;
  
  for (let i = body.length - 1; i >= 0; i--) {
    formatted = body.charAt(i) + formatted;
    count++;
    
    if (count === 3 && i !== 0) {
      formatted = '.' + formatted;
      count = 0;
    }
  }
  
  // Agregar guión y dígito verificador
  return `${formatted}-${dv}`;
};