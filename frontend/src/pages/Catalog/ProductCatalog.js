import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { 
  Box, Typography, Grid, Pagination, 
  CircularProgress, Alert, Container
} from '@mui/material';
import api from '../../services/api';
import ProductCard from '../../components/products/ProductCard';
import ProductFilter from '../../components/products/ProductFilter';
import CategoryNav from '../../components/products/CategoryNav';
import { addToCart } from '../../store/cart.slice';

const ProductCatalog = () => {
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector(state => state.cart);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Parámetros de filtrado y paginación
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    brand: searchParams.get('brand') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    featured: searchParams.get('featured') === 'true',
    new: searchParams.get('new') === 'true',
  });
  
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    perPage: parseInt(searchParams.get('per_page') || '12'),
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    
    // Actualizar URL con filtros
    const params = new URLSearchParams();
    
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.search) params.set('search', filters.search);
    if (filters.minPrice) params.set('min_price', filters.minPrice);
    if (filters.maxPrice) params.set('max_price', filters.maxPrice);
    if (filters.featured) params.set('featured', 'true');
    if (filters.new) params.set('new', 'true');
    if (pagination.page > 1) params.set('page', pagination.page.toString());
    if (pagination.perPage !== 12) params.set('per_page', pagination.perPage.toString());
    
    setSearchParams(params);
  }, [filters, pagination.page, pagination.perPage]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('No se pudieron cargar las categorías');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        page: pagination.page,
        per_page: pagination.perPage
      });
      
      if (filters.category) params.append('category', filters.category);
      if (filters.subcategory) params.append('subcategory', filters.subcategory);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('min_price', filters.minPrice);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);
      if (filters.featured) params.append('featured', 'true');
      if (filters.new) params.append('new', 'true');
      
      const response = await api.get(`/products?${params.toString()}`);
      
      setProducts(response.data.products);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.pages
      }));
      
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudieron cargar los productos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    // Resetear página al cambiar filtros
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    
    setFilters(newFilters);
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      productId: product.id,
      name: product.name,
      price: product.current_price,
      image: product.image_url,
      quantity: 1
    }));
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.productId === productId);
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Grid container spacing={3}>
          {/* Barra lateral con filtros */}
          <Grid item xs={12} md={3}>
            <Box mb={3}>
              <CategoryNav 
                categories={categories} 
                currentCategory={filters.category}
                onSelectCategory={(category) => handleFilterChange({
                  ...filters,
                  category,
                  subcategory: ''
                })}
              />
            </Box>
            
            <ProductFilter 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </Grid>
          
          {/* Lista de productos */}
          <Grid item xs={12} md={9}>
            <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" component="h1">
                {filters.category 
                  ? categories.find(c => c.id === filters.category)?.name || 'Productos'
                  : 'Todos los Productos'}
              </Typography>
              
              <Typography variant="body2" color="textSecondary">
                {loading 
                  ? 'Cargando...' 
                  : products.length === 0 
                    ? 'No se encontraron productos' 
                    : `Mostrando ${products.length} producto(s)`}
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {loading ? (
              <Box display="flex" justifyContent="center" my={5}>
                <CircularProgress />
              </Box>
            ) : products.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No se encontraron productos con los filtros seleccionados.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {products.map(product => (
                  <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                    <ProductCard 
                      product={product}
                      isInCart={isInCart(product.id)}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
            
            {pagination.totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination 
                  count={pagination.totalPages} 
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProductCatalog;