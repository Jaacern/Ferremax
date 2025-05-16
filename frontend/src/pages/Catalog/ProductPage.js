import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Typography, Grid, Button, CircularProgress, 
  Alert, Paper, Chip, Divider, IconButton, Rating,
  Table, TableBody, TableCell, TableContainer, TableRow
} from '@mui/material';
import { 
  AddShoppingCart, Remove, Add, Storefront, 
  LocalShipping, ArrowBack 
} from '@mui/icons-material';
import api from '../../services/api';
import { addToCart, updateQuantity } from '../../store/cart.slice';

import StockAlert from '../../components/common/StockAlert';

const ProductPage = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector(state => state.cart);
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data.product);
      
      // Seleccionar la primera sucursal con stock por defecto
      if (response.data.product.stocks && response.data.product.stocks.length > 0) {
        const availableStock = response.data.product.stocks.find(stock => stock.is_available);
        if (availableStock) {
          setSelectedBranch(availableStock.branch_id);
        }
      }
      
      // Si el producto ya está en el carrito, actualizar la cantidad
      const cartItem = cartItems.find(item => item.productId === parseInt(productId));
      if (cartItem) {
        setQuantity(cartItem.quantity);
      }
      
    } catch (err) {
      console.error('Error al cargar producto:', err);
      setError('No se pudo cargar la información del producto. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    // Asegurar que la cantidad sea al menos 1
    const validQuantity = Math.max(1, newQuantity);
    setQuantity(validQuantity);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = cartItems.find(item => item.productId === product.id);
    
    if (cartItem) {
      // Actualizar cantidad si ya existe en el carrito
      dispatch(updateQuantity({
        productId: product.id,
        quantity
      }));
    } else {
      // Agregar nuevo item al carrito
      dispatch(addToCart({
        productId: product.id,
        name: product.name,
        price: product.current_price,
        image: product.image_url,
        quantity
      }));
    }
  };

  // Formatear precio en pesos chilenos
  const formatCurrency = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  // Obtener stock disponible en la sucursal seleccionada
  const getSelectedBranchStock = () => {
    if (!product || !product.stocks || !selectedBranch) return null;
    
    return product.stocks.find(stock => stock.branch_id === selectedBranch);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button 
          component={Link} 
          to="/catalog"
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Volver al catálogo
        </Button>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box p={3}>
        <Alert severity="info">Producto no encontrado</Alert>
        <Button 
          component={Link} 
          to="/catalog"
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Volver al catálogo
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Button 
        component={Link} 
        to="/catalog"
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
      >
        Volver al catálogo
      </Button>
      
      <Grid container spacing={4}>
        {/* Imagen del producto */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Box 
              component="img"
              src={product.image_url || '/img/placeholder-product.jpg'}
              alt={product.name}
              sx={{ 
                width: '100%', 
                height: 'auto',
                maxHeight: 400,
                objectFit: 'contain'
              }}
            />
          </Paper>
        </Grid>
        
        {/* Información del producto */}
        <Grid item xs={12} md={7}>
          <Box mb={2}>
            <Box display="flex" alignItems="center" mb={1}>
              {product.is_new && (
                <Chip 
                  label="Nuevo" 
                  color="primary" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
              )}
              {product.is_featured && (
                <Chip 
                  label="Destacado" 
                  color="secondary" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
              )}
              <Typography variant="body2" color="textSecondary">
                SKU: {product.sku}
              </Typography>
            </Box>
            
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
                Marca: {product.brand || 'No especificada'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Categoría: {product.category}
                {product.subcategory && ` > ${product.subcategory}`}
              </Typography>
            </Box>
          </Box>
          
          <Box mb={3}>
            {product.discount_percentage > 0 ? (
              <Box>
                <Typography 
                  variant="body1" 
                  color="textSecondary" 
                  sx={{ textDecoration: 'line-through' }}
                >
                  {formatCurrency(product.price)}
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="h4" color="primary" sx={{ mr: 2 }}>
                    {formatCurrency(product.current_price)}
                  </Typography>
                  <Chip 
                    label={`-${product.discount_percentage}%`} 
                    color="error" 
                    size="small"
                  />
                </Box>
              </Box>
            ) : (
              <Typography variant="h4" color="primary">
                {formatCurrency(product.current_price)}
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Disponibilidad en sucursales */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Disponibilidad
            </Typography>
            
            {product.stocks && product.stocks.length > 0 ? (
              <Box>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableBody>
                      {product.stocks.map((stock) => (
                        <TableRow 
                          key={stock.branch_id}
                          onClick={() => setSelectedBranch(stock.branch_id)}
                          hover
                          selected={selectedBranch === stock.branch_id}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Typography variant="body2">
                              {stock.branch_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {stock.is_available ? (
                              <Chip 
                                label="Disponible" 
                                color="success" 
                                size="small"
                                icon={<Storefront />}
                              />
                            ) : (
                              <Chip 
                                label="Sin stock" 
                                color="error" 
                                size="small"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {getSelectedBranchStock()?.is_available ? (
                  <Box display="flex" alignItems="center" mb={3}>
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                      Cantidad:
                    </Typography>
                    <IconButton 
                      size="small"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Remove />
                    </IconButton>
                    <Typography sx={{ mx: 2 }}>
                      {quantity}
                    </Typography>
                    <IconButton 
                      size="small"
                      onClick={() => handleQuantityChange(quantity + 1)}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                ) : (
                  <StockAlert 
                    productName={product.name}
                    branchName={product.stocks.find(s => s.branch_id === selectedBranch)?.branch_name || ''}
                  />
                )}
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddShoppingCart />}
                  fullWidth
                  disabled={!getSelectedBranchStock()?.is_available}
                  onClick={handleAddToCart}
                  size="large"
                >
                  {cartItems.some(item => item.productId === product.id)
                    ? 'Actualizar en carrito'
                    : 'Agregar al carrito'}
                </Button>
                
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    <LocalShipping fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Disponible para despacho a domicilio y retiro en tienda
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Alert severity="warning">
                No hay información de disponibilidad para este producto
              </Alert>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Descripción del producto */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Descripción
            </Typography>
            <Typography variant="body2" paragraph>
              {product.description || 'No hay descripción disponible para este producto.'}
            </Typography>
          </Box>
          
          {/* Especificaciones del producto */}
          {product.brand_code && (
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Especificaciones
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" width="40%">
                        Marca
                      </TableCell>
                      <TableCell>{product.brand}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Código de fabricante
                      </TableCell>
                      <TableCell>{product.brand_code}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Categoría
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                    </TableRow>
                    {product.subcategory && (
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Subcategoría
                        </TableCell>
                        <TableCell>{product.subcategory}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductPage;