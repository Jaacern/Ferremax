import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, Typography, Paper, Grid, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Alert, Collapse,
  IconButton, Divider, TextField
} from '@mui/material';
import { 
  KeyboardArrowDown, KeyboardArrowUp, 
  Receipt, LocalShipping, Cancel
} from '@mui/icons-material';
import api from '../../services/api';
import OrderStatusTracker from '../../components/orders/OrderStatusTracker';

const Orders = () => {
  const { user } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellationNotes, setCancellationNotes] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/orders');
      setOrders(response.data.orders);
      
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError('No se pudieron cargar los pedidos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Está seguro que desea cancelar este pedido?')) {
      return;
    }
    
    try {
      setCancelLoading(true);
      
      await api.put(`/orders/${orderId}/cancel`, {
        notes: cancellationNotes || 'Cancelado por el cliente'
      });
      
      // Actualizar lista de pedidos
      fetchOrders();
      
      // Limpiar notas y cerrar el pedido expandido
      setCancellationNotes('');
      setExpandedOrder(null);
      
    } catch (err) {
      console.error('Error al cancelar pedido:', err);
      setError('No se pudo cancelar el pedido. Intente nuevamente.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  // Formatear monto en pesos chilenos
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  // Obtener color para estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'warning';
      case 'aprobado':
        return 'info';
      case 'en preparación':
        return 'primary';
      case 'listo para entrega':
      case 'entregado':
        return 'success';
      case 'rechazado':
      case 'cancelado':
        return 'error';
      case 'enviado':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (!user) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Debe iniciar sesión para acceder a esta página
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom component="h1">
        Mis Pedidos
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Cargando pedidos...</Typography>
        </Paper>
      ) : orders.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No tienes pedidos
          </Typography>
          <Typography variant="body2" paragraph>
            Aún no has realizado ningún pedido. Explora nuestro catálogo para comenzar a comprar.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            href="/catalog"
          >
            Explorar productos
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Número de Pedido</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Total</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        {expandedOrder === order.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{formatCurrency(order.final_amount)}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        title="Ver comprobante"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        <Receipt />
                      </IconButton>
                      
                      {/* Botón para cancelar (solo si está pendiente o aprobada) */}
                      {['pendiente', 'aprobado'].includes(order.status) && (
                        <IconButton
                          color="error"
                          title="Cancelar pedido"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancelLoading}
                        >
                          <Cancel />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {/* Detalles expandibles del pedido */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                      <Collapse in={expandedOrder === order.id} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            Detalles del Pedido
                          </Typography>
                          
                          <OrderStatusTracker currentStatus={order.status} />
                          
                          <Grid container spacing={3} sx={{ mt: 1 }}>
                            {/* Datos del pedido */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle1" gutterBottom>
                                Información de Entrega
                              </Typography>
                              
                              <Box mb={2}>
                                <Typography variant="body2">
                                  <strong>Método de entrega:</strong> {order.delivery_method === 'PICKUP' ? 'Retiro en tienda' : 'Despacho a domicilio'}
                                </Typography>
                                
                                <Typography variant="body2">
                                  <strong>Sucursal:</strong> {order.branch?.name || 'No especificada'}
                                </Typography>
                                
                                {order.delivery_method === 'DELIVERY' && (
                                  <Typography variant="body2">
                                    <strong>Dirección de entrega:</strong> {order.delivery_address || 'No especificada'}
                                  </Typography>
                                )}
                                
                                {order.notes && (
                                  <Typography variant="body2">
                                    <strong>Notas:</strong> {order.notes}
                                  </Typography>
                                )}
                              </Box>
                              
                              {/* Formulario para cancelar pedido */}
                              {['pendiente', 'aprobado'].includes(order.status) && (
                                <Box mt={2}>
                                  <Divider sx={{ mb: 2 }} />
                                  <Typography variant="subtitle2" gutterBottom>
                                    Cancelar Pedido
                                  </Typography>
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    size="small"
                                    placeholder="Motivo de la cancelación (opcional)"
                                    value={cancellationNotes}
                                    onChange={(e) => setCancellationNotes(e.target.value)}
                                    sx={{ mb: 1 }}
                                  />
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Cancel />}
                                    onClick={() => handleCancelOrder(order.id)}
                                    disabled={cancelLoading}
                                  >
                                    Cancelar Pedido
                                  </Button>
                                </Box>
                              )}
                            </Grid>
                            
                            {/* Productos del pedido */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle1" gutterBottom>
                                Productos
                              </Typography>
                              
                              {order.items.map((item) => (
                                <Box 
                                  key={item.id} 
                                  sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    mb: 1,
                                    pb: 1,
                                    borderBottom: '1px solid #eee'
                                  }}
                                >
                                  <Box>
                                    <Typography variant="body2">
                                      {item.product_name || `Producto ID: ${item.product_id}`}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      {item.quantity} x {formatCurrency(item.unit_price)}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2">
                                    {formatCurrency(item.total_price || (item.quantity * item.unit_price))}
                                  </Typography>
                                </Box>
                              ))}
                              
                              <Divider sx={{ my: 1 }} />
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Subtotal:</Typography>
                                <Typography variant="body2">{formatCurrency(order.total_amount)}</Typography>
                              </Box>
                              
                              {order.discount_amount > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2">Descuento:</Typography>
                                  <Typography variant="body2" color="error">
                                    -{formatCurrency(order.discount_amount)}
                                  </Typography>
                                </Box>
                              )}
                              
                              {order.delivery_cost > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2">Costo de envío:</Typography>
                                  <Typography variant="body2">{formatCurrency(order.delivery_cost)}</Typography>
                                </Box>
                              )}
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="subtitle2">Total:</Typography>
                                <Typography variant="subtitle2">{formatCurrency(order.final_amount)}</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Orders;