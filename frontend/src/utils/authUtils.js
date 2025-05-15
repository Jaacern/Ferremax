import jwt_decode from 'jwt-decode';

/**
 * Verifica si el token JWT es válido y no ha expirado
 * @param {string} token - Token JWT
 * @returns {boolean} - Verdadero si el token es válido
 */
export const isValidToken = (token) => {
  if (!token) return false;
  
  try {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    
    // Verificar si el token no ha expirado
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return false;
  }
};

/**
 * Decodifica un token JWT y retorna su contenido
 * @param {string} token - Token JWT
 * @returns {object|null} - Contenido del token o null si es inválido
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    return jwt_decode(token);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

/**
 * Obtiene el rol del usuario desde el token
 * @param {string} token - Token JWT
 * @returns {string|null} - Rol del usuario o null si no se puede determinar
 */
export const getUserRole = (token) => {
  const decoded = decodeToken(token);
  return decoded ? decoded.role : null;
};

/**
 * Verifica si el usuario tiene cierto rol
 * @param {string} token - Token JWT
 * @param {string|string[]} roles - Rol o array de roles a verificar
 * @returns {boolean} - Verdadero si el usuario tiene alguno de los roles especificados
 */
export const hasRole = (token, roles) => {
  const userRole = getUserRole(token);
  if (!userRole) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  
  return userRole === roles;
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} - Verdadero si el usuario está autenticado
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return isValidToken(token);
};

/**
 * Obtiene el ID del usuario desde el token
 * @returns {number|null} - ID del usuario o null si no está autenticado
 */
export const getUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const decoded = jwt_decode(token);
    return decoded.sub || null; // sub es el standard para el subject (ID de usuario)
  } catch (error) {
    console.error('Error obteniendo ID de usuario:', error);
    return null;
  }
};

/**
 * Guarda el token JWT en el almacenamiento local
 * @param {string} token - Token JWT
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

/**
 * Obtiene el token JWT del almacenamiento local
 * @returns {string|null} - Token JWT o null si no existe
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Elimina el token y datos de sesión
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Comprueba si la contraseña cumple con los requisitos de seguridad
 * @param {string} password - Contraseña a validar
 * @returns {object} - Objeto con resultado y mensaje
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength) {
    return {
      isValid: false,
      message: `La contraseña debe tener al menos ${minLength} caracteres`
    };
  }
  
  if (!hasUpperCase || !hasLowerCase) {
    return {
      isValid: false,
      message: 'La contraseña debe incluir mayúsculas y minúsculas'
    };
  }
  
  if (!hasNumbers) {
    return {
      isValid: false,
      message: 'La contraseña debe incluir al menos un número'
    };
  }
  
  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: 'La contraseña debe incluir al menos un caracter especial'
    };
  }
  
  return {
    isValid: true,
    message: 'Contraseña válida'
  };
};

/**
 * Comprueba si el usuario requiere cambio de contraseña
 * @returns {boolean} - Verdadero si se requiere cambio de contraseña
 */
export const requiresPasswordChange = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const decoded = jwt_decode(token);
    return decoded.password_change_required === true;
  } catch (error) {
    return false;
  }
};