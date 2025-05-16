/**
 * Servicio para gestionar el inventario
 */
import api from './api';

/**
 * Servicio de stock
 */
class StockService {
  /**
   * Obtener lista de stock con filtros opcionales
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise} Promesa con la lista de stock
   */
  async getStocks(filters = {}) {
    const queryParams = new URLSearchParams();
    
    // Añadir filtros a la consulta
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    }
    
    const query = queryParams.toString() ? `?${queryParams}` : '';
    return api.get(`/stock${query}`);
  }

  /**
   * Actualizar cantidad de stock
   * @param {number} stockId - ID del registro de stock
   * @param {number} quantity - Nueva cantidad
   * @param {number} minStock - Stock mínimo (opcional)
   * @returns {Promise} Promesa con el resultado de la actualización
   */
  async updateStock(stockId, quantity, minStock = null) {
    const data = { quantity };
    if (minStock !== null) {
      data.min_stock = minStock;
    }
    
    return api.put(`/stock/update/${stockId}`, data);
  }

  /**
   * Transferir stock entre sucursales
   * @param {number} productId - ID del producto
   * @param {number} sourceBranchId - ID de la sucursal origen
   * @param {number} targetBranchId - ID de la sucursal destino
   * @param {number} quantity - Cantidad a transferir
   * @returns {Promise} Promesa con el resultado de la transferencia
   */
  async transferStock(productId, sourceBranchId, targetBranchId, quantity) {
    return api.post('/stock/transfer', {
      product_id: productId,
      source_branch_id: sourceBranchId,
      target_branch_id: targetBranchId,
      quantity
    });
  }

  /**
   * Actualización masiva de stock (solo admin)
   * @param {Array} updates - Lista de actualizaciones
   * @returns {Promise} Promesa con el resultado de las actualizaciones
   */
  async bulkUpdateStock(updates) {
    return api.post('/stock/bulk-update', updates);
  }

  /**
   * Obtener alertas de stock bajo
   * @param {number} branchId - ID de la sucursal (opcional)
   * @returns {Promise} Promesa con las alertas de stock bajo
   */
  async getStockAlerts(branchId = null) {
    let endpoint = '/stock/alerts';
    if (branchId) {
      endpoint += `?branch_id=${branchId}`;
    }
    return api.get(endpoint);
  }

  /**
   * Inicializar stock de un producto en todas las sucursales
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad inicial
   * @param {number} minStock - Stock mínimo (opcional)
   * @returns {Promise} Promesa con el resultado de la inicialización
   */
  async initializeStock(productId, quantity, minStock = 5) {
    return api.post('/stock/initialize', {
      product_id: productId,
      quantity,
      min_stock: minStock
    });
  }

  /**
   * Verificar si el stock está bajo el mínimo
   * @param {number} quantity - Cantidad actual
   * @param {number} minStock - Stock mínimo
   * @returns {boolean} true si el stock está bajo el mínimo
   */
  isLowStock(quantity, minStock) {
    return quantity <= minStock;
  }

  /**
   * Verificar si un producto está agotado
   * @param {number} quantity - Cantidad actual
   * @returns {boolean} true si el producto está agotado
   */
  isOutOfStock(quantity) {
    return quantity <= 0;
  }

  /**
   * Obtener clase CSS para indicador de nivel de stock
   * @param {number} quantity - Cantidad actual
   * @param {number} minStock - Stock mínimo
   * @returns {string} Clase CSS para el nivel de stock
   */
  getStockLevelClass(quantity, minStock) {
    if (this.isOutOfStock(quantity)) {
      return 'text-danger';
    } else if (this.isLowStock(quantity, minStock)) {
      return 'text-warning';
    } else {
      return 'text-success';
    }
  }

  /**
   * Obtener texto descriptivo del nivel de stock
   * @param {number} quantity - Cantidad actual
   * @param {number} minStock - Stock mínimo
   * @returns {string} Texto descriptivo del nivel de stock
   */
  getStockLevelText(quantity, minStock) {
    if (this.isOutOfStock(quantity)) {
      return 'Agotado';
    } else if (this.isLowStock(quantity, minStock)) {
      return 'Stock bajo';
    } else {
      return 'En stock';
    }
  }
}

// Exportar una instancia única del servicio
const stockService = new StockService();
export default stockService;