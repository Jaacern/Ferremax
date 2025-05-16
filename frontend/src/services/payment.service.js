/**
 * Servicio para gestionar pagos
 */
import api from './api';
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../config';

/**
 * Servicio de pagos
 */
class PaymentService {
  /**
   * Iniciar proceso de pago para una orden
   * @param {number} orderId - ID de la orden
   * @param {string} paymentMethod - Método de pago
   * @param {string} currency - Moneda (opcional)
   * @param {string} notes - Notas adicionales (opcional)
   * @returns {Promise} Promesa con resultado de la inicialización del pago
   */
  async initiatePayment(orderId, paymentMethod, currency = 'CLP', notes = '') {
    return api.post('/payments/initiate', {
      order_id: orderId,
      payment_method: paymentMethod,
      currency,
      notes
    });
  }

  /**
   * Confirmar pago por transferencia (solo admin/contador)
   * @param {number} paymentId - ID del pago
   * @param {string} transactionId - ID de transacción
   * @param {string} notes - Notas adicionales (opcional)
   * @returns {Promise} Promesa con resultado de la confirmación
   */
  async confirmTransferPayment(paymentId, transactionId, notes = '') {
    return api.post('/payments/confirm-transfer', {
      payment_id: paymentId,
      transaction_id: transactionId,
      notes
    });
  }

  /**
   * Obtener pagos por ID de orden
   * @param {number} orderId - ID de la orden
   * @returns {Promise} Promesa con lista de pagos
   */
  async getPaymentsByOrder(orderId) {
    return api.get(`/payments/order/${orderId}`);
  }

  /**
   * Obtener detalles de un pago por ID
   * @param {number} paymentId - ID del pago
   * @returns {Promise} Promesa con detalles del pago
   */
  async getPaymentById(paymentId) {
    return api.get(`/payments/${paymentId}`);
  }

  /**
   * Cancelar un pago (solo admin/contador)
   * @param {number} paymentId - ID del pago
   * @param {string} notes - Motivo de cancelación (opcional)
   * @returns {Promise} Promesa con resultado de la cancelación
   */
  async cancelPayment(paymentId, notes = '') {
    return api.put(`/payments/cancel/${paymentId}`, { notes });
  }

  /**
   * Obtener tasas de cambio disponibles
   * @param {string} fromCurrency - Moneda origen (opcional)
   * @param {string} toCurrency - Moneda destino (opcional)
   * @returns {Promise} Promesa con tasas de cambio
   */
  async getExchangeRates(fromCurrency = 'CLP', toCurrency = null) {
    let endpoint = `/payments/exchange-rates?from=${fromCurrency}`;
    if (toCurrency) {
      endpoint += `&to=${toCurrency}`;
    }
    return api.get(endpoint);
  }

  /**
   * Convertir monto entre monedas
   * @param {number} amount - Monto a convertir
   * @param {string} fromCurrency - Moneda origen
   * @param {string} toCurrency - Moneda destino
   * @returns {Promise} Promesa con resultado de la conversión
   */
  async convertAmount(amount, fromCurrency = 'CLP', toCurrency = 'USD') {
    return api.get(`/payments/convert?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
  }

  /**
   * Actualizar tasas de cambio (solo admin)
   * @returns {Promise} Promesa con resultado de la actualización
   */
  async updateExchangeRates() {
    return api.post('/payments/update-rates');
  }

  /**
   * Obtener información y color de un estado de pago para UI
   * @param {string} status - Estado del pago
   * @returns {Object} Objeto con texto formateado y color
   */
  getPaymentStatusInfo(status) {
    const statusMap = {
      'pendiente': { text: 'Pendiente', color: 'warning' },
      'procesando': { text: 'Procesando', color: 'info' },
      'completado': { text: 'Completado', color: 'success' },
      'fallido': { text: 'Fallido', color: 'danger' },
      'reembolsado': { text: 'Reembolsado', color: 'secondary' },
      'cancelado': { text: 'Cancelado', color: 'danger' }
    };
    
    return statusMap[status] || { text: status, color: 'secondary' };
  }

  /**
   * Obtener información de método de pago para UI
   * @param {string} method - Método de pago
   * @returns {Object} Objeto con texto formateado e icono
   */
  getPaymentMethodInfo(method) {
    const methodMap = {
      'tarjeta de crédito': { text: 'Tarjeta de Crédito', icon: 'credit-card' },
      'tarjeta de débito': { text: 'Tarjeta de Débito', icon: 'credit-card' },
      'transferencia bancaria': { text: 'Transferencia Bancaria', icon: 'bank' },
      'efectivo': { text: 'Efectivo', icon: 'cash' }
    };
    
    return methodMap[method] || { text: method, icon: 'credit-card' };
  }

  /**
   * Verificar si un pago puede ser gestionado (cancelado/confirmado)
   * @param {string} status - Estado del pago
   * @returns {boolean} true si el pago puede ser gestionado
   */
  isPaymentManageable(status) {
    return [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PROCESSING].includes(status);
  }

  /**
   * Formatear monto con símbolo de moneda
   * @param {number} amount - Monto
   * @param {string} currency - Código de moneda
   * @returns {string} Monto formateado
   */
  formatCurrency(amount, currency = 'CLP') {
    const formatter = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'CLP' ? 0 : 2
    });
    
    return formatter.format(amount);
  }
}

// Exportar una instancia única del servicio
const paymentService = new PaymentService();
export default paymentService;