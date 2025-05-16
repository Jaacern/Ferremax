import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, Typography, Paper, Grid, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Alert, Collapse,
  IconButton, Divider, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  CheckCircle, Cancel, Visibility, 
  KeyboardArrowDown, KeyboardArrowUp 
} from '@mui/icons-material';
import api from '../../services/api';
import OrderStatusTracker from '../../components/orders/OrderStatusTracker';

const OrdersToApprove = () => {
  const { user } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Estado para diálogo de aprobación/rechazo
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [statusAction, setStatusAction] = useState(''); // 'approve' o 'reject'
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchPendingOrders();
    }
  }, [user]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener branch_id del vendedor (en una implementación real, podría estar asociado al usuario)
      // Para este ejemplo, usaremos el ID 1
      const branch_id = 1;
      
      // Obtener órdenes pendientes de la sucursal asignada al vendedor
      const response = await api.get(`/orders?status=PENDING&branch_id=${branch_id}`);
      setOrders(response.data.orders);
      
    } catch (err) {
      console.error('Error al cargar órdenes pendientes:', err);
      setError('No se pudieron cargar las órdenes pendientes. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusDialog = (order, action) => {
    setCurrentOrder(order);
    setStatusAction(action);
    setStatusNotes('');
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setCurrentOrder(null);
    setStatusAction('');
    setStatusNotes('');
  };

  const handleChangeOrderStatus = async () => {
    if (!currentOrder) return;
    
    try {
      setLoading(true);
      
      const newStatus = statusAction === 'approve' ? 'APPROVED' : 'REJECTED';
      
      // Actualizar estado de la orden
      await api.put(`/orders/${currentOrder.id}/status`, {
        status: newStatus,
        notes: statusNotes
      });
      
      // Cerrar diálogo y actualizar lista
      handleCloseStatusDialog();
      fetchPendingOrders();
      
    } catch (err) {
      console.error('Error al actualizar estado de la orden:', err);
      setError(err.response?.data?.error || 'Error al actualizar el estado de la orden');
    } finally {
      setLoading(false);
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

  if (!user || user.role !== 'vendor') {
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
        Pedidos Pendientes de Aprobación
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
            No hay pedidos pendientes de aprobación
          </Typography>
          <Typography variant="body2">
            Todos los pedidos han sido procesados.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Número de Pedido</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado Pago</TableCell>
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
                    <TableCell>
                      {order.user ? `${order.user.first_name || ''} ${order.user.last_name || ''} (${order.user.username})` : 'Usuario no disponible'}
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{formatCurrency(order.final_amount)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.payments && order.payments.length > 0 ? order.payments[0].status : 'Sin pago'}
                        color={order.payments && order.payments.length > 0 && order.payments[0].status === 'COMPLETED' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        title="Ver detalles"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        color="success"
                        title="Aprobar"
                        onClick={() => handleOpenStatusDialog(order, 'approve')}
                      >
                        <CheckCircle />
                      </IconButton>
                      <IconButton
                        color="error"
                        title="Rechazar"
                        onClick={() => handleOpenStatusDialog(order, 'reject')}
                      >
                        <Cancel />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  
                  {/* Detalles expandibles del pedido */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
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
                              
                              <Box mt={2}>
                                <Button
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircle />}
                                  onClick={() => handleOpenStatusDialog(order, 'approve')}
                                  sx={{ mr: 2 }}
                                >
                                  Aprobar
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  startIcon={<Cancel />}
                                  onClick={() => handleOpenStatusDialog(order, 'reject')}
                                >
                                  Rechazar
                                </Button>
                              </Box>
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
      
      {/* Diálogo para aprobar/rechazar orden */}
      <Dialog
        open={openStatusDialog}
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {statusAction === 'approve' ? 'Aprobar Pedido' : 'Rechazar Pedido'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body1" paragraph>
              {statusAction === 'approve' 
                ? '¿Está seguro que desea aprobar este pedido? Una vez aprobado, se enviará a bodega para su preparación.'
                : '¿Está seguro que desea rechazar este pedido? Esta acción no se puede deshacer.'}
            </Typography>
            
            <TextField
              fullWidth
              label="Notas (opcional)"
              multiline
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder={statusAction === 'approve' 
                ? 'Agregar instrucciones especiales para bodega (opcional)'
                : 'Indicar motivo del rechazo (opcional)'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color={statusAction === 'approve' ? 'success' : 'error'}
            onClick={handleChangeOrderStatus}
            disabled={loading}
          >
            {statusAction === 'approve' ? 'Aprobar' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersToApprove;