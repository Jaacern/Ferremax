/**
 * Servicio para gestionar notificaciones en tiempo real
 */
import { SSE_URL } from '../config';
import authService from './auth.service';

/**
 * Servicio de notificaciones
 */
class NotificationService {
  constructor() {
    this.sseConnections = {};
    this.listeners = {
      stock_alert: [],
      order_notification: [],
      payment_notification: [],
      system_notification: []
    };
  }

  /**
   * Iniciar conexión SSE
   * @param {string} channel - Canal a suscribirse
   * @returns {EventSource} Instancia de EventSource
   */
  connectToEventSource(channel) {
    if (this.sseConnections[channel]) {
      return this.sseConnections[channel];
    }

    // Verificar si hay token de autenticación
    const token = authService.getToken();
    const url = `${SSE_URL}/${channel}`;
    
    // Crear conexión SSE
    const eventSource = new EventSource(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      withCredentials: !!token
    });

    // Manejar eventos de conexión
    eventSource.onopen = () => {
      console.log(`Connected to SSE channel: ${channel}`);
    };

    eventSource.onerror = (error) => {
      console.error(`SSE connection error on channel ${channel}:`, error);
      
      // Intentar reconectar después de un error
      if (eventSource.readyState === EventSource.CLOSED) {
        setTimeout(() => {
          this.closeConnection(channel);
          this.connectToEventSource(channel);
        }, 5000); // Intentar reconectar después de 5 segundos
      }
    };

    // Guardar conexión
    this.sseConnections[channel] = eventSource;
    return eventSource;
  }

  /**
   * Cerrar conexión SSE
   * @param {string} channel - Canal a cerrar
   */
  closeConnection(channel) {
    if (this.sseConnections[channel]) {
      this.sseConnections[channel].close();
      delete this.sseConnections[channel];
    }
  }

  /**
   * Cerrar todas las conexiones SSE
   */
  closeAllConnections() {
    for (const channel in this.sseConnections) {
      this.closeConnection(channel);
    }
  }

  /**
   * Suscribirse a alertas de stock
   * @param {Function} callback - Función a llamar cuando llegue una alerta
   * @returns {Function} Función para cancelar la suscripción
   */
  subscribeToStockAlerts(callback) {
    const channel = 'stock_alert';
    const eventSource = this.connectToEventSource(channel);
    
    const onMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Error parsing stock alert:', error);
      }
    };
    
    eventSource.addEventListener('message', onMessage);
    this.listeners[channel].push(onMessage);
    
    // Retornar función para cancelar suscripción
    return () => {
      eventSource.removeEventListener('message', onMessage);
      this.listeners[channel] = this.listeners[channel].filter(listener => listener !== onMessage);
      
      // Cerrar conexión si no hay más listeners
      if (this.listeners[channel].length === 0) {
        this.closeConnection(channel);
      }
    };
  }

  /**
   * Suscribirse a notificaciones de órdenes
   * @param {Function} callback - Función a llamar cuando llegue una notificación
   * @param {number} userId - ID de usuario para notificaciones específicas (opcional)
   * @param {number} branchId - ID de sucursal para notificaciones específicas (opcional)
   * @returns {Function} Función para cancelar la suscripción
   */
  subscribeToOrderNotifications(callback, userId = null, branchId = null) {
    // Determinar canal según parámetros
    let channel = 'order_notifications';
    
    if (userId) {
      channel = `user_${userId}`;
    } else if (branchId) {
      channel = `branch_${branchId}`;
    }
    
    const eventSource = this.connectToEventSource(channel);
    
    const onMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Error parsing order notification:', error);
      }
    };
    
    eventSource.addEventListener('message', onMessage);
    
    // Crear una entrada para este canal si no existe
    if (!this.listeners[channel]) {
      this.listeners[channel] = [];
    }
    
    this.listeners[channel].push(onMessage);
    
    // Retornar función para cancelar suscripción
    return () => {
      eventSource.removeEventListener('message', onMessage);
      this.listeners[channel] = this.listeners[channel].filter(listener => listener !== onMessage);
      
      // Cerrar conexión si no hay más listeners
      if (this.listeners[channel].length === 0) {
        this.closeConnection(channel);
      }
    };
  }

  /**
   * Suscribirse a notificaciones de pagos
   * @param {Function} callback - Función a llamar cuando llegue una notificación
   * @param {number} userId - ID de usuario para notificaciones específicas (opcional)
   * @returns {Function} Función para cancelar la suscripción
   */
  subscribeToPaymentNotifications(callback, userId = null) {
    // Determinar canal según parámetros
    let channel = 'payment_notifications';
    
    if (userId) {
      channel = `user_${userId}`;
    }
    
    const eventSource = this.connectToEventSource(channel);
    
    const onMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Error parsing payment notification:', error);
      }
    };
    
    eventSource.addEventListener('message', onMessage);
    
    // Crear una entrada para este canal si no existe
    if (!this.listeners[channel]) {
      this.listeners[channel] = [];
    }
    
    this.listeners[channel].push(onMessage);
    
    // Retornar función para cancelar suscripción
    return () => {
      eventSource.removeEventListener('message', onMessage);
      this.listeners[channel] = this.listeners[channel].filter(listener => listener !== onMessage);
      
      // Cerrar conexión si no hay más listeners
      if (this.listeners[channel].length === 0) {
        this.closeConnection(channel);
      }
    };
  }

  /**
   * Suscribirse a notificaciones del sistema
   * @param {Function} callback - Función a llamar cuando llegue una notificación
   * @param {string} role - Rol para notificaciones específicas (opcional)
   * @returns {Function} Función para cancelar la suscripción
   */
  subscribeToSystemNotifications(callback, role = null) {
    // Determinar canal según parámetros
    let channel = 'system_notifications';
    
    if (role) {
      channel = `role_${role}`;
    }
    
    const eventSource = this.connectToEventSource(channel);
    
    const onMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Error parsing system notification:', error);
      }
    };
    
    eventSource.addEventListener('message', onMessage);
    
    // Crear una entrada para este canal si no existe
    if (!this.listeners[channel]) {
      this.listeners[channel] = [];
    }
    
    this.listeners[channel].push(onMessage);
    
    // Retornar función para cancelar suscripción
    return () => {
      eventSource.removeEventListener('message', onMessage);
      this.listeners[channel] = this.listeners[channel].filter(listener => listener !== onMessage);
      
      // Cerrar conexión si no hay más listeners
      if (this.listeners[channel].length === 0) {
        this.closeConnection(channel);
      }
    };
  }

  /**
   * Crear una notificación local (no conectada al servidor)
   * @param {string} title - Título de la notificación
   * @param {string} message - Mensaje de la notificación
   * @param {string} type - Tipo de notificación (success, info, warning, error)
   * @returns {Object} Objeto con la notificación creada
   */
  createLocalNotification(title, message, type = 'info') {
    return {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString()
    };
  }
}

// Exportar una instancia única del servicio
const notificationService = new NotificationService();
export default notificationService;