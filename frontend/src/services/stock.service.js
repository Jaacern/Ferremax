import api from './api';

const stockService = {
  /**
   * Obtener lista de stock con filtros opcionales
   * @param {Object} filters - Filtros opcionales (branch_id, product_id, low_stock, out_of_stock, search, etc)
   * @returns {Promise} - Promesa con los datos de stock
   */
  getStock: async (filters = {}) => {
    try {
      const response = await api.get('/stock', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock:', error);
      throw error;
    }
  },

  /**
   * Obtener stock de un producto específico en una sucursal
   * @param {number} productId - ID del producto
   * @param {number} branchId - ID de la sucursal
   * @returns {Promise} - Promesa con los datos de stock
   */
  getProductStock: async (productId, branchId) => {
    try {
      const response = await api.get('/stock', { 
        params: { 
          product_id: productId,
          branch_id: branchId
        } 
      });
      return response.data.stocks.length > 0 ? response.data.stocks[0] : null;
    } catch (error) {
      console.error('Error fetching product stock:', error);
      throw error;
    }
  },

  /**
   * Actualizar stock de un producto
   * @param {number} stockId - ID del registro de stock
   * @param {Object} stockData - Datos a actualizar (quantity, min_stock)
   * @returns {Promise} - Promesa con los datos actualizados
   */
  updateStock: async (stockId, stockData) => {
    try {
      const response = await api.put(`/stock/update/${stockId}`, stockData);
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  /**
   * Transferir stock entre sucursales
   * @param {Object} transferData - Datos de la transferencia
   * @param {number} transferData.product_id - ID del producto
   * @param {number} transferData.source_branch_id - ID de la sucursal origen
   * @param {number} transferData.target_branch_id - ID de la sucursal destino
   * @param {number} transferData.quantity - Cantidad a transferir
   * @returns {Promise} - Promesa con los datos de la transferencia
   */
  transferStock: async (transferData) => {
    try {
      const response = await api.post('/stock/transfer', transferData);
      return response.data;
    } catch (error) {
      console.error('Error transferring stock:', error);
      throw error;
    }
  },

  /**
   * Obtener alertas de stock bajo
   * @param {number} branchId - ID de la sucursal (opcional)
   * @returns {Promise} - Promesa con las alertas de stock
   */
  getStockAlerts: async (branchId = null) => {
    try {
      const params = branchId ? { branch_id: branchId } : {};
      const response = await api.get('/stock/alerts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      throw error;
    }
  },

  /**
   * Inicializar stock de un producto en todas las sucursales
   * @param {Object} stockData - Datos del stock a inicializar
   * @param {number} stockData.product_id - ID del producto
   * @param {number} stockData.quantity - Cantidad inicial
   * @param {number} stockData.min_stock - Stock mínimo (opcional)
   * @returns {Promise} - Promesa con los resultados de la inicialización
   */
  initializeStock: async (stockData) => {
    try {
      const response = await api.post('/stock/initialize', stockData);
      return response.data;
    } catch (error) {
      console.error('Error initializing stock:', error);
      throw error;
    }
  },

  /**
   * Actualizar stock en masa para varios productos
   * @param {Array} updates - Array de actualizaciones de stock
   * @returns {Promise} - Promesa con los resultados de la actualización
   */
  bulkUpdateStock: async (updates) => {
    try {
      const response = await api.post('/stock/bulk-update', updates);
      return response.data;
    } catch (error) {
      console.error('Error bulk updating stock:', error);
      throw error;
    }
  }
};

export default stockService;