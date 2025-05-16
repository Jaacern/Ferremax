import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { 
  Box, Typography, Paper, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, 
  Dialog, DialogActions, DialogContent, 
  DialogTitle, FormControl, InputLabel,
  Select, MenuItem, Alert, IconButton,
  Grid
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';

const ProductManagement = () => {
  const { user } = useSelector(state => state.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para paginación y filtros
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Estado para modal de producto
  const [openModal, setOpenModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    brand: '',
    brand_code: '',
    discount_percentage: '0',
    is_featured: false,
    is_new: false,
    image_url: ''
  });
  
  // Categorías disponibles (desde el enum del backend)
  const productCategories = [
    { value: 'MANUAL_TOOLS', label: 'Herramientas Manuales' },
    { value: 'POWER_TOOLS', label: 'Herramientas Eléctricas' },
    { value: 'CONSTRUCTION_MATERIALS', label: 'Materiales de Construcción' },
    { value: 'FINISHES', label: 'Acabados' },
    { value: 'SAFETY_EQUIPMENT', label: 'Equipos de Seguridad' },
    { value: 'FASTENERS', label: 'Tornillos y Anclajes' },
    { value: 'ADHESIVES', label: 'Fijaciones y Adhesivos' },
    { value: 'MEASURING_TOOLS', label: 'Equipos de Medición' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        page: page + 1,  // API usa base 1 para páginas
        per_page: rowsPerPage
      });
      
      if (categoryFilter) {
        params.append('category', categoryFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products);
      
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudieron cargar los productos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      // Editar producto existente
      setCurrentProduct(product);
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category: product.category,
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        brand_code: product.brand_code || '',
        discount_percentage: product.discount_percentage?.toString() || '0',
        is_featured: product.is_featured || false,
        is_new: product.is_new || false,
        image_url: product.image_url || ''
      });
    } else {
      // Nuevo producto
      setCurrentProduct(null);
      setFormData({
        sku: '',
        name: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        brand: '',
        brand_code: '',
        discount_percentage: '0',
        is_featured: false,
        is_new: false,
        image_url: ''
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Crear o actualizar producto
      if (currentProduct) {
        // Actualizar producto existente
        await api.put(`/products/${currentProduct.id}`, formData);
      } else {
        // Crear nuevo producto
        await api.post('/products', formData);
      }
      
      // Cerrar modal y actualizar lista
      handleCloseModal();
      fetchProducts();
      
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setError(err.response?.data?.error || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Está seguro que desea eliminar este producto?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/products/${productId}`);
      
      // Actualizar lista
      fetchProducts();
      
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError('No se pudo eliminar el producto. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Box p={3}>
        <Alert severity="error">
          No tiene permisos para acceder a esta página
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom component="h1">
        Gestión de Productos
      </Typography>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Filtros y búsqueda */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                label="Buscar productos"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton type="submit" edge="end">
                      <Search />
                    </IconButton>
                  ),
                }}
              />
            </form>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoría</InputLabel>
              <Select
                value={categoryFilter}
                label="Categoría"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {productCategories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={5} textAlign="right">
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleOpenModal()}
            >
              Nuevo Producto
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabla de productos */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="center">Destacado</TableCell>
                <TableCell align="center">Nuevo</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && page === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell align="right">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP'
                      }).format(product.current_price)}
                    </TableCell>
                    <TableCell align="center">
                      {product.is_featured ? 'Sí' : 'No'}
                    </TableCell>
                    <TableCell align="center">
                      {product.is_new ? 'Sí' : 'No'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary"
                        onClick={() => handleOpenModal(product)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={-1} // No conocemos el total exacto desde la API
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to }) => `${from}-${to}`}
        />
      </Paper>
      
      {/* Modal de producto */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent>
          <form id="product-form" onSubmit={handleSubmitProduct}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  helperText="Formato: FER-XXXXX"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Precio"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <Box component="span" mr={0.5}>$</Box>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Descuento (%)"
                  name="discount_percentage"
                  type="number"
                  value={formData.discount_percentage}
                  onChange={handleInputChange}
                  InputProps={{
                    inputProps: { min: 0, max: 100 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Categoría"
                    onChange={handleInputChange}
                  >
                    {productCategories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Subcategoría"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Marca"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Código de Marca"
                  name="brand_code"
                  value={formData.brand_code}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL de Imagen"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="/img/products/ejemplo.jpg"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl>
                  <label>
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                    />
                    {' '}Producto Destacado
                  </label>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl>
                  <label>
                    <input
                      type="checkbox"
                      name="is_new"
                      checked={formData.is_new}
                      onChange={handleInputChange}
                    />
                    {' '}Marcar como Nuevo
                  </label>
                </FormControl>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button 
            type="submit" 
            form="product-form"
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;