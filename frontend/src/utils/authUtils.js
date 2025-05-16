/**
 * Utilidades para autenticación y manejo de tokens
 */
import { jwtDecode } from 'jwt-decode';
import { ROLES } from '../config';

/**
 * Verificar si un token JWT es válido
 * @param {string} token - Token JWT
 * @returns {boolean} true si el token es válido y no ha expirado
 */
export const isValidToken = (token) => {
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Verificar si el token ha expirado
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return false;
  }
};

/**
 * Decodificar token JWT
 * @param {string} token - Token JWT
 * @returns {Object|null} Contenido decodificado del token o null si es inválido
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
};

/**
 * Obtener rol del usuario desde un token JWT
 * @param {string} token - Token JWT
 * @returns {string|null} Rol del usuario o null si es inválido
 */
export const getUserRole = (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    console.error('Error al obtener rol:', error);
    return null;
  }
};

/**
 * Verificar si un usuario tiene un rol específico
 * @param {string|Array} allowedRoles - Rol o roles permitidos
 * @param {string} userRole - Rol del usuario
 * @returns {boolean} true si el usuario tiene el rol permitido
 */
export const hasRole = (allowedRoles, userRole) => {
  if (!userRole) return false;
  
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(userRole);
  }
  
  return allowedRoles === userRole;
};

/**
 * Verificar si un usuario es administrador
 * @param {string} userRole - Rol del usuario
 * @returns {boolean} true si el usuario es administrador
 */
export const isAdmin = (userRole) => {
  return userRole === ROLES.ADMIN;
};

/**
 * Verificar si se requiere cambio de contraseña
 * @param {string} token - Token JWT
 * @returns {boolean} true si se requiere cambio de contraseña
 */
export const isPasswordChangeRequired = (token) => {
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.password_change_required === true;
  } catch (error) {
    console.error('Error al verificar cambio de contraseña:', error);
    return false;
  }
};

/**
 * Obtener ID del usuario desde un token JWT
 * @param {string} token - Token JWT
 * @returns {number|null} ID del usuario o null si es inválido
 */
export const getUserId = (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.sub; // sub contiene el ID del usuario
  } catch (error) {
    console.error('Error al obtener ID de usuario:', error);
    return null;
  }
};

/**
 * Obtener tiempo restante de validez del token en segundos
 * @param {string} token - Token JWT
 * @returns {number} Segundos restantes de validez, 0 si expiró
 */
export const getTokenRemainingTime = (token) => {
  if (!token) return 0;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const expiryTime = decoded.exp;
    
    const remainingTime = expiryTime - currentTime;
    return remainingTime > 0 ? Math.floor(remainingTime) : 0;
  } catch (error) {
    console.error('Error al obtener tiempo restante:', error);
    return 0;
  }
};