import api from './api';

const orderService = {
  // Obtener todos los pedidos con filtros opcionales
  getOrders: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Añadir filtros a los parámetros de consulta
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/orders?${queryParams.toString()}`);
    return response.data;
  },
  
  // Obtener un pedido por su ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.order;
  },
  
  // Crear un nuevo pedido
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  // Actualizar el estado de un pedido
  updateOrderStatus: async (orderId, status, notes = '') => {
    const response = await api.put(`/orders/${orderId}/status`, {
      status,
      notes
    });
    return response.data;
  },
  
  // Cancelar un pedido
  cancelOrder: async (orderId, reason = '') => {
    const response = await api.put(`/orders/${orderId}/cancel`, {
      notes: reason
    });
    return response.data;
  },
  
  // Obtener órdenes pendientes para vendedor
  getPendingOrders: async (branchId) => {
    const params = branchId ? `?branch_id=${branchId}&status=PENDING` : '?status=PENDING';
    const response = await api.get(`/orders${params}`);
    return response.data;
  },
  
  // Obtener órdenes para bodeguero
  getWarehouseOrders: async (branchId) => {
    // Obtener órdenes aprobadas o en preparación
    const params = branchId ? 
      `?branch_id=${branchId}&status=APPROVED,PREPARING` : 
      '?status=APPROVED,PREPARING';
    
    const response = await api.get(`/orders${params}`);
    return response.data;
  },
  
  // Órdenes para preparar (bodeguero)
  getOrdersToProcess: async (branchId) => {
    const params = branchId ? `?branch_id=${branchId}&status=APPROVED` : '?status=APPROVED';
    const response = await api.get(`/orders${params}`);
    return response.data;
  },
  
  // Marcar pedido como en preparación
  markOrderAsPreparing: async (orderId) => {
    return await orderService.updateOrderStatus(orderId, 'PREPARING');
  },
  
  // Marcar pedido como listo para entrega
  markOrderAsReady: async (orderId) => {
    return await orderService.updateOrderStatus(orderId, 'READY');
  },
  
  // Marcar pedido como enviado
  markOrderAsShipped: async (orderId) => {
    return await orderService.updateOrderStatus(orderId, 'SHIPPED');
  },
  
  // Marcar pedido como entregado
  markOrderAsDelivered: async (orderId) => {
    return await orderService.updateOrderStatus(orderId, 'DELIVERED');
  },
  
  // Para contadores: confirmar entrega y pago
  confirmDeliveryAndPayment: async (orderId) => {
    // Este método podría primero confirmar el pago y luego actualizar el estado
    // En un caso real, habría más lógica aquí
    return await orderService.updateOrderStatus(orderId, 'DELIVERED', 'Entrega y pago confirmados');
  },
  
  // Órdenes por cliente
  getCustomerOrders: async (customerId) => {
    const response = await api.get(`/orders?user_id=${customerId}`);
    return response.data;
  },
  
  // Generar reporte de pedidos (para administrador o contador)
  generateOrderReport: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Añadir filtros a los parámetros de consulta
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/orders/report?${queryParams.toString()}`);
    return response.data;
  }
};

export default orderService;