/**
 * Servicio para manejar notificaciones en tiempo real con Server-Sent Events (SSE)
 */

let eventSource = null;
let eventHandlers = {};
let reconnectTimeout = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 3000;

const notificationService = {
  /**
   * Inicializar la conexión SSE
   */
  init() {
    this.connect();
    
    // Gestionar cierre al recargar/cerrar la página
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  },
  
  /**
   * Establecer conexión con el servidor de eventos
   */
  connect() {
    if (eventSource) {
      return; // Ya está conectado
    }
    
    try {
      // Crear conexión SSE con el backend
      eventSource = new EventSource('http://localhost:5000/stream', { withCredentials: true });
      reconnectAttempts = 0;
      
      // Gestionar apertura de conexión
      eventSource.onopen = () => {
        console.log('SSE connection established');
        this.triggerEvent('connection', { status: 'connected' });
      };
      
      // Gestionar mensajes genéricos
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.triggerEvent('message', data);
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };
      
      // Gestionar errores de conexión
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        this.triggerEvent('error', { error });
        
        // Reintentar conexión
        this.disconnect();
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`Reconnecting SSE (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
          
          reconnectTimeout = setTimeout(() => {
            this.connect();
          }, RECONNECT_DELAY_MS);
        } else {
          console.error('Max SSE reconnect attempts reached');
          this.triggerEvent('connection', { 
            status: 'failed', 
            message: 'No se pudo establecer la conexión para notificaciones en tiempo real.' 
          });
        }
      };
      
      // Suscribirse a eventos específicos
      this.setupEventListeners();
      
    } catch (err) {
      console.error('Error setting up SSE connection:', err);
    }
  },
  
  /**
   * Configurar listeners para tipos específicos de eventos
   */
  setupEventListeners() {
    if (!eventSource) return;
    
    // Alertas de stock
    eventSource.addEventListener('stock_alert', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.triggerEvent('stock_alert', data);
      } catch (err) {
        console.error('Error parsing stock alert event:', err);
      }
    });
    
    // Notificaciones de órdenes
    eventSource.addEventListener('order_notification', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.triggerEvent('order_notification', data);
      } catch (err) {
        console.error('Error parsing order notification event:', err);
      }
    });
    
    // Notificaciones de pagos
    eventSource.addEventListener('payment_notification', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.triggerEvent('payment_notification', data);
      } catch (err) {
        console.error('Error parsing payment notification event:', err);
      }
    });
    
    // Notificaciones del sistema
    eventSource.addEventListener('system_notification', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.triggerEvent('system_notification', data);
      } catch (err) {
        console.error('Error parsing system notification event:', err);
      }
    });
  },
  
  /**
   * Cerrar la conexión SSE
   */
  disconnect() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  },
  
  /**
   * Suscribirse a un tipo específico de evento
   * 
   * @param {string} eventName - Nombre del evento a suscribir
   * @param {function} handler - Función callback al recibir el evento
   * @returns {function} - Función para cancelar la suscripción
   */
  subscribe(eventName, handler) {
    if (!eventHandlers[eventName]) {
      eventHandlers[eventName] = [];
    }
    
    eventHandlers[eventName].push(handler);
    
    // Si no hay conexión activa, iniciarla
    if (!eventSource) {
      this.connect();
    }
    
    // Retornar función para cancelar la suscripción
    return () => {
      this.unsubscribe(eventName, handler);
    };
  },
  
  /**
   * Cancelar suscripción a un evento
   * 
   * @param {string} eventName - Nombre del evento
   * @param {function} handler - Handler a remover
   */
  unsubscribe(eventName, handler) {
    if (!eventHandlers[eventName]) return;
    
    eventHandlers[eventName] = eventHandlers[eventName].filter(h => h !== handler);
    
    // Si no quedan handlers para ningún evento, cerrar la conexión
    const hasHandlers = Object.values(eventHandlers).some(handlers => handlers.length > 0);
    if (!hasHandlers) {
      this.disconnect();
    }
  },
  
  /**
   * Disparar evento a todos los manejadores suscritos
   * 
   * @param {string} eventName - Nombre del evento
   * @param {object} data - Datos del evento
   */
  triggerEvent(eventName, data) {
    if (!eventHandlers[eventName]) return;
    
    eventHandlers[eventName].forEach(handler => {
      try {
        handler(data);
      } catch (err) {
        console.error(`Error in ${eventName} event handler:`, err);
      }
    });
  },
  
  /**
   * Obtener estado de la conexión
   * 
   * @returns {boolean} - true si está conectado
   */
  isConnected() {
    return eventSource !== null && eventSource.readyState === EventSource.OPEN;
  }
};

export default notificationService;