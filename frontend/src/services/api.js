/**
 * Servicio base para comunicación con la API
 */
import { API_URL } from '../config';

/**
 * Clase para gestionar las llamadas a la API
 */
class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  /**
   * Obtener token de autenticación del almacenamiento
   * @returns {string|null} Token JWT
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Configurar cabeceras por defecto para las solicitudes
   * @param {boolean} includeAuth - Indica si incluir token de autenticación
   * @returns {Object} Objeto con las cabeceras configuradas
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Realizar solicitud GET a la API
   * @param {string} endpoint - Ruta de la API
   * @param {boolean} includeAuth - Indica si incluir token de autenticación
   * @returns {Promise} Promesa con la respuesta de la API
   */
  async get(endpoint, includeAuth = true) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
    });

    return this.handleResponse(response);
  }

  /**
   * Realizar solicitud POST a la API
   * @param {string} endpoint - Ruta de la API
   * @param {Object} data - Datos a enviar
   * @param {boolean} includeAuth - Indica si incluir token de autenticación
   * @returns {Promise} Promesa con la respuesta de la API
   */
  async post(endpoint, data, includeAuth = true) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  /**
   * Realizar solicitud PUT a la API
   * @param {string} endpoint - Ruta de la API
   * @param {Object} data - Datos a enviar
   * @param {boolean} includeAuth - Indica si incluir token de autenticación
   * @returns {Promise} Promesa con la respuesta de la API
   */
  async put(endpoint, data, includeAuth = true) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  /**
   * Realizar solicitud DELETE a la API
   * @param {string} endpoint - Ruta de la API
   * @param {boolean} includeAuth - Indica si incluir token de autenticación
   * @returns {Promise} Promesa con la respuesta de la API
   */
  async delete(endpoint, includeAuth = true) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
    });

    return this.handleResponse(response);
  }

  /**
   * Manejar respuesta de la API
   * @param {Response} response - Respuesta de fetch
   * @returns {Promise} Promesa con los datos o error
   */
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      // Si la respuesta incluye un mensaje de error, lo usamos
      const errorMessage = data.error || 'Ha ocurrido un error';
      
      // Si es error de autenticación (401), limpiar token
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      // Crear error personalizado con detalles
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      
      throw error;
    }

    return data;
  }
}

// Exportar una instancia única del servicio
const apiService = new ApiService();
export default apiService;