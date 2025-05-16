/**
 * Servicio para gestionar productos
 */
import api from './api';

/**
 * Servicio de productos
 */
class ProductService {
  /**
   * Obtener lista de productos con filtros opcionales
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise} Promesa con la lista de productos
   */
  async getProducts(filters = {}) {
    const queryParams = new URLSearchParams();
    
    // Añadir filtros a la consulta
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    }
    
    const query = queryParams.toString() ? `?${queryParams}` : '';
    return api.get(`/products${query}`, false); // No requiere autenticación
  }

  /**
   * Obtener un producto por ID
   * @param {number} productId - ID del producto
   * @returns {Promise} Promesa con los detalles del producto
   */
  async getProductById(productId) {
    return api.get(`/products/${productId}`, false); // No requiere autenticación
  }

  /**
   * Obtener lista de categorías
   * @returns {Promise} Promesa con la lista de categorías
   */
  async getCategories() {
    return api.get('/products/categories', false); // No requiere autenticación
  }

  /**
   * Obtener lista de sucursales
   * @returns {Promise} Promesa con la lista de sucursales
   */
  async getBranches() {
    return api.get('/products/branches', false); // No requiere autenticación
  }

  /**
   * Crear un nuevo producto (solo admin)
   * @param {Object} productData - Datos del producto
   * @returns {Promise} Promesa con el producto creado
   */
  async createProduct(productData) {
    return api.post('/products', productData);
  }

  /**
   * Actualizar un producto (solo admin)
   * @param {number} productId - ID del producto
   * @param {Object} productData - Datos a actualizar
   * @returns {Promise} Promesa con el producto actualizado
   */
  async updateProduct(productId, productData) {
    return api.put(`/products/${productId}`, productData);
  }

  /**
   * Eliminar un producto (solo admin)
   * @param {number} productId - ID del producto
   * @returns {Promise} Promesa con el resultado
   */
  async deleteProduct(productId) {
    return api.delete(`/products/${productId}`);
  }

  /**
   * Obtener stock de productos
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise} Promesa con información de stock
   */
  async getStock(filters = {}) {
    const queryParams = new URLSearchParams();
    
    // Añadir filtros a la consulta
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    }
    
    const query = queryParams.toString() ? `?${queryParams}` : '';
    return api.get(`/products/stock${query}`);
  }

  /**
   * Actualizar stock de un producto (admin, bodeguero)
   * @param {number} stockId - ID del registro de stock
   * @param {Object} stockData - Datos de stock a actualizar
   * @returns {Promise} Promesa con el resultado
   */
  async updateStock(stockId, stockData) {
    return api.put(`/products/stock/${stockId}`, stockData);
  }

  /**
   * Crear una nueva sucursal (solo admin)
   * @param {Object} branchData - Datos de la sucursal
   * @returns {Promise} Promesa con la sucursal creada
   */
  async createBranch(branchData) {
    return api.post('/products/branches', branchData);
  }

  /**
   * Actualizar una sucursal (solo admin)
   * @param {number} branchId - ID de la sucursal
   * @param {Object} branchData - Datos a actualizar
   * @returns {Promise} Promesa con la sucursal actualizada
   */
  async updateBranch(branchId, branchData) {
    return api.put(`/products/branches/${branchId}`, branchData);
  }

  /**
   * Eliminar una sucursal (solo admin)
   * @param {number} branchId - ID de la sucursal
   * @returns {Promise} Promesa con el resultado
   */
  async deleteBranch(branchId) {
    return api.delete(`/products/branches/${branchId}`);
  }

  /**
   * Formatear precio con descuento
   * @param {number} price - Precio original
   * @param {number} discountPercentage - Porcentaje de descuento
   * @returns {Object} Precios formateados y descuento aplicado
   */
  calculatePriceWithDiscount(price, discountPercentage = 0) {
    const originalPrice = parseFloat(price);
    if (discountPercentage <= 0) {
      return {
        finalPrice: originalPrice,
        discountAmount: 0,
        hasDiscount: false,
        originalPrice
      };
    }
    
    const discountAmount = (originalPrice * discountPercentage) / 100;
    const finalPrice = originalPrice - discountAmount;
    
    return {
      finalPrice,
      discountAmount,
      hasDiscount: true,
      originalPrice
    };
  }
  
  /**
   * Formatear precio para mostrar
   * @param {number} price - Precio a formatear
   * @returns {string} Precio formateado
   */
  formatPrice(price) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  }
}

// Exportar una instancia única del servicio
const productService = new ProductService();
export default productService;