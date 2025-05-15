import api from './api';
import { jwtDecode } from 'jwt-decode';  // Cambio aquí - importamos jwtDecode en lugar de jwt_decode

const authService = {
  // Iniciar sesión
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Registrar nuevo usuario
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    return await api.post('/auth/change-password', passwordData);
  },

  // Obtener usuario actual desde localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);  // Cambio aquí - usamos jwtDecode en lugar de jwt_decode
      const currentTime = Date.now() / 1000;
      
      // Verificar si el token no ha expirado
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // Obtener rol del usuario actual
  getUserRole: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);  // Cambio aquí - usamos jwtDecode en lugar de jwt_decode
      return decoded.role;
    } catch (error) {
      return null;
    }
  }
};

export default authService;