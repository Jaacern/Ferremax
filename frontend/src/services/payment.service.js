import api from './api';

/**
 * Servicio para gestionar operaciones relacionadas con pagos
 */
const paymentService = {
  /**
   * Inicia un proceso de pago para una orden
   * @param {Object} paymentData - Datos del pago
   * @param {number} paymentData.order_id - ID de la orden
   * @param {string} paymentData.payment_method - Método de pago (CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER)
   * @param {string} [paymentData.currency] - Moneda opcional (CLP, USD, EUR, etc.)
   * @param {string} [paymentData.notes] - Notas opcionales para el pago
   * @returns {Promise<Object>} - Respuesta con detalles del proceso de pago
   */
  initiatePayment: async (paymentData) => {
    const response = await api.post('/payments/initiate', paymentData);
    return response.data;
  },

  /**
   * Confirma un pago realizado por transferencia bancaria (solo para roles admin/contador)
   * @param {Object} confirmationData - Datos de confirmación
   * @param {number} confirmationData.payment_id - ID del pago
   * @param {string} confirmationData.transaction_id - ID de la transacción (comprobante)
   * @param {string} [confirmationData.payment_date] - Fecha del pago
   * @param {string} [confirmationData.notes] - Notas opcionales
   * @returns {Promise<Object>} - Respuesta con detalles del pago confirmado
   */
  confirmTransferPayment: async (confirmationData) => {
    const response = await api.post('/payments/confirm-transfer', confirmationData);
    return response.data;
  },

  /**
   * Obtiene los pagos asociados a una orden
   * @param {number} orderId - ID de la orden
   * @returns {Promise<Object>} - Respuesta con lista de pagos
   */
  getPaymentsByOrder: async (orderId) => {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  },

  /**
   * Obtiene detalles de un pago específico
   * @param {number} paymentId - ID del pago
   * @returns {Promise<Object>} - Respuesta con detalles del pago
   */
  getPayment: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  /**
   * Cancela un pago (solo para roles admin/contador)
   * @param {number} paymentId - ID del pago
   * @param {Object} [data] - Datos adicionales
   * @param {string} [data.notes] - Notas sobre la cancelación
   * @returns {Promise<Object>} - Respuesta con confirmación
   */
  cancelPayment: async (paymentId, data = {}) => {
    const response = await api.put(`/payments/cancel/${paymentId}`, data);
    return response.data;
  },

  /**
   * Convierte un monto entre diferentes monedas
   * @param {number} amount - Monto a convertir
   * @param {string} from - Moneda de origen (CLP, USD, EUR, etc.)
   * @param {string} to - Moneda destino
   * @returns {Promise<Object>} - Respuesta con la conversión
   */
  convertCurrency: async (amount, from, to) => {
    const response = await api.get('/payments/convert', {
      params: { amount, from, to }
    });
    return response.data;
  },

  /**
   * Obtiene tasas de cambio disponibles
   * @param {string} [from] - Moneda de origen opcional
   * @param {string} [to] - Moneda destino opcional
   * @returns {Promise<Object>} - Respuesta con tasas de cambio
   */
  getExchangeRates: async (from, to) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    
    const response = await api.get('/payments/exchange-rates', { params });
    return response.data;
  },

  /**
   * Procesa la respuesta de WebPay después de un pago
   * @param {string} token - Token WS de WebPay
   * @returns {Promise<Object>} - Respuesta con resultado del pago
   */
  processWebPayResponse: async (token) => {
    const response = await api.post('/payments/webpay-response', { token });
    return response.data;
  },

  /**
   * Formatea un precio según la moneda y localización
   * @param {number} price - Precio a formatear
   * @param {string} [currency='CLP'] - Código de moneda
   * @returns {string} - Precio formateado (ej: "$10.000")
   */
  formatPrice: (price, currency = 'CLP') => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency
    }).format(price);
  }
};

export default paymentService;