/**
 * Servicio para gestionar autenticación y usuarios
 */
import api from './api';
import { TOKEN_DURATION } from '../config';

/**
 * Servicio de autenticación
 */
class AuthService {
  /**
   * Iniciar sesión
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise} Promesa con datos del usuario y token
   */
  async login(username, password) {
    try {
      const data = await api.post('/auth/login', { username, password }, false);
      
      if (data.access_token) {
        // Guardar token y datos del usuario
        this.setToken(data.access_token);
        this.setUser(data.user);
        return data;
      }
      
      throw new Error('Error en la autenticación');
    } catch (error) {
      console.error('Error de login:', error);
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario (cliente)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} Promesa con datos del usuario y token
   */
  async register(userData) {
    try {
      const data = await api.post('/auth/register', userData, false);
      
      if (data.access_token) {
        // Guardar token y datos del usuario
        this.setToken(data.access_token);
        this.setUser(data.user);
        return data;
      }
      
      return data;
    } catch (error) {
      console.error('Error de registro:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
  }

  /**
   * Cambiar contraseña
   * @param {string} current_password - Contraseña actual
   * @param {string} new_password - Nueva contraseña
   * @returns {Promise} Promesa con resultado
   */
  async changePassword(current_password, new_password) {
    return api.post('/auth/change-password', { 
      current_password, 
      new_password 
    });
  }

  /**
   * Obtener perfil del usuario actual
   * @returns {Promise} Promesa con datos del usuario
   */
  async getProfile() {
    return api.get('/auth/profile');
  }

  /**
   * Actualizar perfil del usuario
   * @param {Object} profileData - Datos del perfil
   * @returns {Promise} Promesa con datos actualizados
   */
  async updateProfile(profileData) {
    return api.put('/auth/profile', profileData);
  }

  /**
   * Guardar token en localStorage
   * @param {string} token - Token JWT
   */
  setToken(token) {
    localStorage.setItem('token', token);
    // Guardar tiempo de expiración (24 horas por defecto)
    const expiry = new Date().getTime() + TOKEN_DURATION;
    localStorage.setItem('tokenExpiry', expiry);
  }

  /**
   * Guardar datos del usuario en localStorage
   * @param {Object} user - Datos del usuario
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Obtener usuario actual desde localStorage
   * @returns {Object|null} Datos del usuario o null
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }

  /**
   * Verificar si el usuario está autenticado y si el token es válido
   * @returns {boolean} true si está autenticado
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Verificar si el token ha expirado
    const expiry = localStorage.getItem('tokenExpiry');
    if (expiry && new Date().getTime() > parseInt(expiry, 10)) {
      this.logout(); // Token expirado, cerrar sesión
      return false;
    }
    
    return true;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string|Array} roles - Rol o roles a verificar
   * @returns {boolean} true si tiene el rol
   */
  hasRole(roles) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  }
  
  /**
   * Verificar si se requiere cambio de contraseña
   * @returns {boolean} true si se requiere cambio
   */
  isPasswordChangeRequired() {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Verificar si el objeto user tiene la propiedad password_change_required
    return user.password_change_required === true;
  }

  /**
   * Obtener todos los usuarios (solo admin)
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise} Promesa con lista de usuarios
   */
  async getUsers(filters = {}) {
    const queryParams = new URLSearchParams();
    
    // Añadir filtros a la consulta
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    }
    
    const query = queryParams.toString() ? `?${queryParams}` : '';
    return api.get(`/auth/users${query}`);
  }

  /**
   * Obtener usuario por ID (solo admin)
   * @param {number} userId - ID del usuario
   * @returns {Promise} Promesa con datos del usuario
   */
  async getUserById(userId) {
    return api.get(`/auth/users/${userId}`);
  }

  /**
   * Crear nuevo usuario (solo admin)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} Promesa con resultado
   */
  async createUser(userData) {
    return api.post('/auth/users', userData);
  }

  /**
   * Actualizar usuario por ID (solo admin)
   * @param {number} userId - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise} Promesa con resultado
   */
  async updateUser(userId, userData) {
    return api.put(`/auth/users/${userId}`, userData);
  }

  /**
   * Eliminar usuario por ID (solo admin)
   * @param {number} userId - ID del usuario
   * @returns {Promise} Promesa con resultado
   */
  async deleteUser(userId) {
    return api.delete(`/auth/users/${userId}`);
  }
}

// Exportar una instancia única del servicio
const authService = new AuthService();
export default authService;