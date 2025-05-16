/**
 * Configuración global de la aplicación
 */

// URL base de la API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Duración del token en milisegundos (24 horas)
const TOKEN_DURATION = 24 * 60 * 60 * 1000;

// Configuración de roles
const ROLES = {
  ADMIN: 'admin',
  VENDOR: 'vendor',
  WAREHOUSE: 'warehouse',
  ACCOUNTANT: 'accountant',
  CUSTOMER: 'customer'
};

// Estados de pedidos
const ORDER_STATUS = {
  PENDING: 'pendiente',
  APPROVED: 'aprobado',
  REJECTED: 'rechazado',
  PREPARING: 'en preparación',
  READY: 'listo para entrega',
  SHIPPED: 'enviado',
  DELIVERED: 'entregado',
  CANCELLED: 'cancelado'
};

// Métodos de entrega
const DELIVERY_METHODS = {
  PICKUP: 'retiro en tienda',
  DELIVERY: 'despacho a domicilio'
};

// Métodos de pago
const PAYMENT_METHODS = {
  CREDIT_CARD: 'tarjeta de crédito',
  DEBIT_CARD: 'tarjeta de débito',
  BANK_TRANSFER: 'transferencia bancaria',
  CASH: 'efectivo'
};

// Estados de pago
const PAYMENT_STATUS = {
  PENDING: 'pendiente',
  PROCESSING: 'procesando',
  COMPLETED: 'completado',
  FAILED: 'fallido',
  REFUNDED: 'reembolsado',
  CANCELLED: 'cancelado'
};

// Categorías de productos
const PRODUCT_CATEGORIES = {
  MANUAL_TOOLS: 'Herramientas Manuales',
  POWER_TOOLS: 'Herramientas Eléctricas',
  CONSTRUCTION_MATERIALS: 'Materiales de Construcción',
  FINISHES: 'Acabados',
  SAFETY_EQUIPMENT: 'Equipos de Seguridad',
  FASTENERS: 'Tornillos y Anclajes',
  ADHESIVES: 'Fijaciones y Adhesivos',
  MEASURING_TOOLS: 'Equipos de Medición'
};

// Tipos de moneda
const CURRENCY_TYPES = {
  CLP: 'CLP',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  ARS: 'ARS',
  BRL: 'BRL',
  MXN: 'MXN'
};

// Configuración de notificaciones en tiempo real (SSE)
const SSE_URL = process.env.REACT_APP_SSE_URL || 'http://localhost:5000/stream';

// Configuración de paginación por defecto
const DEFAULT_PAGINATION = {
  page: 1,
  per_page: 10
};

// Exportar configuraciones
export {
  API_URL,
  TOKEN_DURATION,
  ROLES,
  ORDER_STATUS,
  DELIVERY_METHODS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PRODUCT_CATEGORIES,
  CURRENCY_TYPES,
  SSE_URL,
  DEFAULT_PAGINATION
};