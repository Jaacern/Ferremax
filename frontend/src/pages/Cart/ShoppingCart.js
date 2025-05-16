import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Button, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Alert, Divider, TextField
} from '@mui/material';
import { Add, Remove, Delete, ShoppingBag } from '@mui/icons-material';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import { updateQuantity, removeFromCart, clearCart } from '../../store/cart.slice';

const ShoppingCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { items, loading, error } = useSelector(state => state.cart);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  useEffect(() => {
    // Calcular subtotal
    const newSubtotal = items.reduce((total, item) => 
      total + (item.quantity * item.price), 0);
    setSubtotal(newSubtotal);
    
    // Calcular descuento (si hay más de 4 artículos diferentes)
    if (items.length >= 4 && user?.role === 'customer') {
      setDiscount(newSubtotal * 0.05); // 5% de descuento
    } else {
      setDiscount(0);
    }
  }, [items, user]);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    if (window.confirm('¿Está seguro que desea vaciar el carrito?')) {
      dispatch(clearCart());
    }
  };

  const handleCheckout = () => {
    // Redirigir a la página de checkout
    navigate('/cart/checkout');
  };

  // Formatear montos en pesos chilenos
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom component="h1">
        Carrito de Compras
      </Typography>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {items.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Tu carrito está vacío
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Parece que aún no has agregado productos a tu carrito.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            component={Link}
            to="/catalog"
            sx={{ mt: 2 }}
          >
            Explorar productos
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Lista de productos */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="center">Precio</TableCell>
                      <TableCell align="center">Cantidad</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <CartItem 
                        key={item.productId}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemoveItem}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  component={Link}
                  to="/catalog"
                >
                  Seguir comprando
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={handleClearCart}
                  disabled={loading}
                >
                  Vaciar carrito
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Resumen y checkout */}
          <Grid item xs={12} md={4}>
            <CartSummary 
              subtotal={subtotal}
              discount={discount}
              formatCurrency={formatCurrency}
              onCheckout={handleCheckout}
              loading={loading}
              isLoggedIn={!!user}
              loginUrl="/auth/login"
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ShoppingCart;