/**
 * Configuración global para la aplicación FERREMAS
 */

// Entorno de ejecución (desarrollo, producción, etc.)
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuración basada en entorno
const config = {
  // Entorno de desarrollo (localhost)
  development: {
    // URL base de la API backend
    API_URL: 'http://localhost:5000/api',
    // URL para eventos SSE (Server-Sent Events) - notificaciones en tiempo real
    SSE_URL: 'http://localhost:5000/stream',
    // Tiempo de vida del token JWT en milisegundos (24 horas)
    TOKEN_EXPIRY: 86400000,
    // Tiempo de espera para peticiones API en milisegundos
    API_TIMEOUT: 30000,
    // Intervalo para refrescar datos en tiempo real (milisegundos)
    REFRESH_INTERVAL: 60000,
    // Habilitar logs detallados
    VERBOSE_LOGGING: true
  },

  // Entorno de producción (servidor real)
  production: {
    // En producción, usamos rutas relativas para que funcione en cualquier dominio
    API_URL: '/api',
    SSE_URL: '/stream',
    TOKEN_EXPIRY: 86400000,
    API_TIMEOUT: 30000,
    REFRESH_INTERVAL: 120000,
    VERBOSE_LOGGING: false
  },

  // Entorno de pruebas
  test: {
    API_URL: 'http://localhost:5000/api',
    SSE_URL: 'http://localhost:5000/stream',
    TOKEN_EXPIRY: 3600000, // 1 hora para pruebas
    API_TIMEOUT: 5000,
    REFRESH_INTERVAL: 30000,
    VERBOSE_LOGGING: true
  }
};

// Exportar configuración según el entorno actual
export default {
  // Valores por defecto y comunes
  APP_NAME: 'FERREMAS',
  APP_VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'es-CL',
  DEFAULT_CURRENCY: 'CLP',
  DEFAULT_CURRENCY_SYMBOL: '$',

  // Categorías de productos (para filtrado y navegación)
  PRODUCT_CATEGORIES: {
    MANUAL_TOOLS: 'Herramientas Manuales',
    POWER_TOOLS: 'Herramientas Eléctricas',
    CONSTRUCTION_MATERIALS: 'Materiales de Construcción',
    FINISHES: 'Acabados',
    SAFETY_EQUIPMENT: 'Equipos de Seguridad',
    FASTENERS: 'Tornillos y Anclajes',
    ADHESIVES: 'Fijaciones y Adhesivos',
    MEASURING_TOOLS: 'Equipos de Medición'
  },

  // Estados de pedidos
  ORDER_STATUS: {
    PENDING: 'pendiente',
    APPROVED: 'aprobado',
    REJECTED: 'rechazado',
    PREPARING: 'en preparación',
    READY: 'listo para entrega',
    SHIPPED: 'enviado',
    DELIVERED: 'entregado',
    CANCELLED: 'cancelado'
  },

  // Roles de usuario
  USER_ROLES: {
    ADMIN: 'admin',
    VENDOR: 'vendor',
    WAREHOUSE: 'warehouse',
    ACCOUNTANT: 'accountant',
    CUSTOMER: 'customer'
  },

  // Métodos de pago
  PAYMENT_METHODS: {
    CREDIT_CARD: 'tarjeta de crédito',
    DEBIT_CARD: 'tarjeta de débito',
    BANK_TRANSFER: 'transferencia bancaria'
  },

  // Métodos de entrega
  DELIVERY_METHODS: {
    PICKUP: 'retiro en tienda',
    DELIVERY: 'despacho a domicilio'
  },

  // Merge con la configuración específica del entorno
  ...config[NODE_ENV]
};