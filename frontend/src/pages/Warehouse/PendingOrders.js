import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, Typography, Paper, Grid, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Alert, Collapse,
  IconButton, Divider, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, List, ListItem, ListItemText
} from '@mui/material';
import { 
  LocalShipping, Done, Visibility, 
  KeyboardArrowDown, KeyboardArrowUp 
} from '@mui/icons-material';
import api from '../../services/api';
import OrderStatusTracker from '../../components/orders/OrderStatusTracker';

const PendingOrders = () => {
  const { user } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Estado para diálogo de actualización de estado
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [branchId, setBranchId] = useState(null);
  
  useEffect(() => {
    // En un caso real, obtendríamos el branch_id del usuario desde el backend
    // Para este ejemplo, usaremos el ID 1
    setBranchId(1);
  }, []);
  
  useEffect(() => {
    if (branchId) {
      fetchOrders();
    }
  }, [branchId, tabValue]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Determinar el estado a filtrar según la pestaña
      let statusFilter;
      switch(tabValue) {
        case 0:
          statusFilter = 'APPROVED'; // Pendientes de preparación
          break;
        case 1:
          statusFilter = 'PREPARING'; // En preparación
          break;
        case 2:
          statusFilter = 'READY'; // Listos para entrega
          break;
        default:
          statusFilter = 'APPROVED';
      }
      
      // Consultar órdenes en el backend
      const response = await api.get(`/orders?status=${statusFilter}&branch_id=${branchId}`);
      setOrders(response.data.orders);
      
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError('No se pudieron cargar las órdenes. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenStatusDialog = (order, status) => {
    setCurrentOrder(order);
    setNewStatus(status);
    setStatusNotes('');
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setCurrentOrder(null);
    setNewStatus('');
    setStatusNotes('');
  };

  const handleUpdateStatus = async () => {
    if (!currentOrder || !newStatus) return;
    
    try {
      setLoading(true);
      
      // Actualizar estado de la orden
      await api.put(`/orders/${currentOrder.id}/status`, {
        status: newStatus,
        notes: statusNotes
      });
      
      // Cerrar diálogo y actualizar lista
      handleCloseStatusDialog();
      fetchOrders();
      
    } catch (err) {
      console.error('Error al actualizar estado de la orden:', err);
      setError(err.response?.data?.error || 'Error al actualizar el estado de la orden');
    } finally {
      setLoading(false);
    }
  };

  // Obtener el texto del siguiente estado según el estado actual
  const getNextStatusAction = (currentStatus) => {
    switch(currentStatus) {
      case 'aprobado':
        return { status: 'PREPARING', label: 'Iniciar preparación' };
      case 'en preparación':
        return { status: 'READY', label: 'Marcar como listo' };
      case 'listo para entrega':
        return { status: 'SHIPPED', label: 'Marcar como enviado' };
      default:
        return { status: '', label: '' };
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

  if (!user || user.role !== 'warehouse') {
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
        Gestión de Pedidos
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Pestañas para filtrar pedidos por estado */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Pendientes" />
          <Tab label="En Preparación" />
          <Tab label="Listos para Entrega" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Cargando pedidos...</Typography>
        </Paper>
      ) : orders.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No hay pedidos {tabValue === 0 ? 'pendientes' : tabValue === 1 ? 'en preparación' : 'listos'}
          </Typography>
          <Typography variant="body2">
            {tabValue === 0 
              ? 'No hay pedidos pendientes para procesar.' 
              : tabValue === 1 
                ? 'No hay pedidos en proceso de preparación.' 
                : 'No hay pedidos listos para entrega.'}
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
                <TableCell>Entrega</TableCell>
                <TableCell>Total</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const nextStatusAction = getNextStatusAction(order.status);
                
                return (
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
                      <TableCell>
                        <Chip 
                          label={order.delivery_method === 'PICKUP' ? 'Retiro en tienda' : 'Despacho a domicilio'}
                          color={order.delivery_method === 'PICKUP' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(order.final_amount)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          title="Ver detalles"
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          <Visibility />
                        </IconButton>
                        {nextStatusAction.status && (
                          <IconButton
                            color="success"
                            title={nextStatusAction.label}
                            onClick={() => handleOpenStatusDialog(order, nextStatusAction.status)}
                          >
                            {nextStatusAction.status === 'SHIPPED' ? <LocalShipping /> : <Done />}
                          </IconButton>
                        )}
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
                                
                                {/* Historial de estados */}
                                <Typography variant="subtitle1" gutterBottom>
                                  Historial de Estados
                                </Typography>
                                <List dense>
                                  {order.status_history && order.status_history.map((history, index) => (
                                    <ListItem key={index} divider={index < (order.status_history.length - 1)}>
                                      <ListItemText
                                        primary={`${history.new_status} (desde ${history.old_status})`}
                                        secondary={`${formatDate(history.date)}${history.notes ? ` - ${history.notes}` : ''}`}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                                
                                <Box mt={2}>
                                  {nextStatusAction.status && (
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      startIcon={nextStatusAction.status === 'SHIPPED' ? <LocalShipping /> : <Done />}
                                      onClick={() => handleOpenStatusDialog(order, nextStatusAction.status)}
                                    >
                                      {nextStatusAction.label}
                                    </Button>
                                  )}
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Diálogo para actualizar estado */}
      <Dialog
        open={openStatusDialog}
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {newStatus === 'PREPARING' ? 'Iniciar Preparación de Pedido' : 
           newStatus === 'READY' ? 'Marcar Pedido como Listo para Entrega' :
           newStatus === 'SHIPPED' ? 'Marcar Pedido como Enviado' : 'Actualizar Estado'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body1" paragraph>
              {newStatus === 'PREPARING' ? 'El pedido pasará a estado "En Preparación". ¿Desea continuar?' : 
               newStatus === 'READY' ? 'El pedido será marcado como "Listo para Entrega". ¿Desea continuar?' :
               newStatus === 'SHIPPED' ? 'El pedido será marcado como "Enviado". ¿Desea continuar?' : 
               '¿Desea actualizar el estado del pedido?'}
            </Typography>
            
            <TextField
              fullWidth
              label="Notas (opcional)"
              multiline
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Agregar información adicional sobre el cambio de estado (opcional)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleUpdateStatus}
            disabled={loading}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingOrders;