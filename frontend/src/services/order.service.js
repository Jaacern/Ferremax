/**
 * Servicio para gestionar órdenes
 */
import api from './api';

/**
 * Servicio de órdenes
 */
class OrderService {
  /**
   * Crear una nueva orden
   * @param {Object} orderData - Datos de la orden
   * @returns {Promise} Promesa con la información de la orden creada
   */
  async createOrder(orderData) {
    return api.post('/orders', orderData);
  }

  /**
   * Obtener lista de órdenes con filtros opcionales
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise} Promesa con la lista de órdenes
   */
  async getOrders(filters = {}) {
    const queryParams = new URLSearchParams();
    
    // Añadir filtros a la consulta
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    }
    
    const query = queryParams.toString() ? `?${queryParams}` : '';
    return api.get(`/orders${query}`);
  }

  /**
   * Obtener detalles de una orden por ID
   * @param {number} orderId - ID de la orden
   * @returns {Promise} Promesa con los detalles de la orden
   */
  async getOrderById(orderId) {
    return api.get(`/orders/${orderId}`);
  }

  /**
   * Actualizar el estado de una orden
   * @param {number} orderId - ID de la orden
   * @param {string} status - Nuevo estado
   * @param {string} notes - Notas adicionales (opcional)
   * @returns {Promise} Promesa con el resultado de la actualización
   */
  async updateOrderStatus(orderId, status, notes = '') {
    return api.put(`/orders/${orderId}/status`, { status, notes });
  }

  /**
   * Cancelar una orden
   * @param {number} orderId - ID de la orden
   * @param {string} notes - Motivo de cancelación (opcional)
   * @returns {Promise} Promesa con el resultado de la cancelación
   */
  async cancelOrder(orderId, notes = 'Cancelado por el usuario') {
    return api.put(`/orders/${orderId}/cancel`, { notes });
  }

  /**
   * Generar un número de pedido para presentación
   * @param {string} orderNumber - Número de pedido completo (ej: ORD-20230101-ABCDEF)
   * @returns {string} Número formateado para presentación
   */
  formatOrderNumber(orderNumber) {
    if (!orderNumber) return 'N/A';
    
    // Extraer las partes del número de pedido
    const parts = orderNumber.split('-');
    if (parts.length !== 3) return orderNumber;
    
    // Formatear la fecha (YYYYMMDD -> DD/MM/YYYY)
    const dateStr = parts[1];
    const dateFormatted = `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`;
    
    return `#${parts[2]} (${dateFormatted})`;
  }

  /**
   * Convertir estado de orden a formato legible y obtener color para UI
   * @param {string} status - Estado de la orden
   * @returns {Object} Objeto con texto formateado y color
   */
  getOrderStatusInfo(status) {
    const statusMap = {
      'pendiente': { text: 'Pendiente', color: 'warning' },
      'aprobado': { text: 'Aprobado', color: 'info' },
      'rechazado': { text: 'Rechazado', color: 'danger' },
      'en preparación': { text: 'En preparación', color: 'primary' },
      'listo para entrega': { text: 'Listo para entrega', color: 'success' },
      'enviado': { text: 'Enviado', color: 'info' },
      'entregado': { text: 'Entregado', color: 'success' },
      'cancelado': { text: 'Cancelado', color: 'danger' }
    };
    
    return statusMap[status] || { text: status, color: 'secondary' };
  }

  /**
   * Verificar si una orden está en un estado cancelable por el cliente
   * @param {string} status - Estado actual de la orden
   * @returns {boolean} true si la orden puede ser cancelada
   */
  isOrderCancelableByCustomer(status) {
    return ['pendiente', 'aprobado'].includes(status);
  }

  /**
   * Calcular subtotal de una orden (sin descuentos ni envío)
   * @param {Array} items - Lista de items de la orden
   * @returns {number} Subtotal calculado
   */
  calculateSubtotal(items) {
    if (!items || !items.length) return 0;
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  }
}

// Exportar una instancia única del servicio
const orderService = new OrderService();
export default orderService;