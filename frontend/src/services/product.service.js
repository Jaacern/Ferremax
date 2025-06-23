import api from './api';

const productService = {
  // Obtener todos los productos con paginación y filtros
  getProducts: async (page = 1, filters = {}) => {
    const params = {
      page,
      per_page: filters.per_page || 12,
      ...filters
    };
    
    // Convertir objeto de parámetros a query string
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const response = await api.get(`/products?${queryString}`);
    return response.data;
  },
  
  // Obtener un producto por su ID
  getProductById: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data.product;
  },
  
  // Obtener todas las categorías
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data.categories;
  },
  
  // Obtener todas las sucursales
  getBranches: async () => {
    const response = await api.get('/products/branches');
    return response.data.branches;
  },
  
  // Para administración - Crear producto
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  // Para administración - Actualizar producto
  updateProduct: async (productId, productData) => {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  },
  
  // Para administración - Eliminar producto
  deleteProduct: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },
  
  // Obtener stock de productos
  getStock: async (filters = {}) => {
    const queryString = Object.keys(filters)
      .filter(key => filters[key] !== undefined && filters[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
      .join('&');
    
    const response = await api.get(`/stock?${queryString}`);
    return response.data;
  },
  
  // Actualizar stock (para administradores y bodegueros)
  updateStock: async (stockId, stockData) => {
    const response = await api.put(`/stock/update/${stockId}`, stockData);
    return response.data;
  },
  
  // Transferir stock entre sucursales
  transferStock: async (transferData) => {
    const response = await api.post('/stock/transfer', transferData);
    return response.data;
  }
};

export default productService;