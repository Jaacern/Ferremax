import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { 
  Box, Typography, Paper, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, 
  Alert, IconButton, Grid, FormControl,
  InputLabel, Select, MenuItem, Chip,
  Dialog, DialogActions, DialogContent, 
  DialogTitle, List, ListItem, ListItemText,
  Divider, Accordion, AccordionSummary, 
  AccordionDetails
} from '@mui/material';
import { 
  Search, Visibility, LocalShipping,
  ExpandMore, Done, Close, Approval
} from '@mui/icons-material';

const OrderManagement = () => {
  const { user } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para paginación y filtros
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  });
  
  // Estado para modal de detalle de orden
  const [openModal, setOpenModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  
  // Estado para cambio de estado
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  
  // Opciones de estado de orden
  const orderStatuses = [
    { value: 'PENDING', label: 'Pendiente', color: 'warning' },
    { value: 'APPROVED', label: 'Aprobado', color: 'info' },
    { value: 'REJECTED', label: 'Rechazado', color: 'error' },
    { value: 'PREPARING', label: 'En preparación', color: 'primary' },
    { value: 'READY', label: 'Listo para entrega', color: 'success' },
    { value: 'SHIPPED', label: 'Enviado', color: 'secondary' },
    { value: 'DELIVERED', label: 'Entregado', color: 'success' },
    { value: 'CANCELLED', label: 'Cancelado', color: 'default' }
  ];

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        page: page + 1,  // API usa base 1 para páginas
        per_page: rowsPerPage
      });
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      if (dateFilter.from) {
        params.append('from_date', dateFilter.from);
      }
      
      if (dateFilter.to) {
        params.append('to_date', dateFilter.to);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data.orders);
      
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError('No se pudieron cargar las órdenes. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/orders/${orderId}`);
      setOrderDetail(response.data.order);
      
    } catch (err) {
      console.error('Error al cargar detalle de orden:', err);
      setError('No se pudo cargar el detalle de la orden. Intente nuevamente.');
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
    fetchOrders();
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter({
      ...dateFilter,
      [name]: value
    });
  };

  const handleViewOrder = (order) => {
    setCurrentOrder(order);
    fetchOrderDetail(order.id);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentOrder(null);
    setOrderDetail(null);
  };

  const handleOpenStatusChange = (order) => {
    setCurrentOrder(order);
    setNewStatus('');
    setStatusNotes('');
    setStatusChangeOpen(true);
  };

  const handleCloseStatusChange = () => {
    setStatusChangeOpen(false);
    setCurrentOrder(null);
    setNewStatus('');
    setStatusNotes('');
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || !currentOrder) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await api.put(`/orders/${currentOrder.id}/status`, {
        status: newStatus,
        notes: statusNotes
      });
      
      // Cerrar modal y actualizar listas
      handleCloseStatusChange();
      fetchOrders();
      
      // Si el detalle está abierto, actualizarlo
      if (openModal && orderDetail) {
        fetchOrderDetail(currentOrder.id);
      }
      
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError(err.response?.data?.error || 'Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar chip de estado
  const renderStatusChip = (status) => {
    const statusInfo = orderStatuses.find(s => s.value === status) || 
      { label: status, color: 'default' };
    
    return (
      <Chip 
        label={statusInfo.label} 
        color={statusInfo.color}
        size="small"
      />
    );
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

  // Formatear monto
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
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
        Gestión de Pedidos
      </Typography>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Filtros y búsqueda */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                label="Buscar pedidos"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nº Pedido, Cliente"
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
          
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {orderStatuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <TextField
              fullWidth
              label="Desde"
              type="date"
              name="from"
              value={dateFilter.from}
              onChange={handleDateFilterChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <TextField
              fullWidth
              label="Hasta"
              type="date"
              name="to"
              value={dateFilter.to}
              onChange={handleDateFilterChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={3} textAlign="right">
            <Button
              variant="contained"
              color="primary"
              onClick={fetchOrders}
            >
              Filtrar
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabla de órdenes */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nº Pedido</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Sucursal</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && page === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Cargando pedidos...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron pedidos
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>
                      {order.user ? `${order.user.first_name || ''} ${order.user.last_name || ''} (${order.user.username})` : 'Usuario no disponible'}
                    </TableCell>
                    <TableCell>
                      {order.branch ? order.branch.name : 'Sucursal no disponible'}
                    </TableCell>
                    <TableCell>
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(order.final_amount)}
                    </TableCell>
                    <TableCell>
                      {renderStatusChip(order.status)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary"
                        onClick={() => handleViewOrder(order)}
                        title="Ver detalles"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleOpenStatusChange(order)}
                        title="Cambiar estado"
                      >
                        <LocalShipping />
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
      
      {/* Modal de detalle de orden */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalle del Pedido {currentOrder?.order_number}
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              Cargando detalles...
            </Box>
          ) : !orderDetail ? (
            <Alert severity="error">
              No se pudo cargar la información del pedido
            </Alert>
          ) : (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Cliente</Typography>
                  <Typography>
                    {orderDetail.user ? 
                      `${orderDetail.user.first_name || ''} ${orderDetail.user.last_name || ''} (${orderDetail.user.username})` : 
                      'Usuario no disponible'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Fecha</Typography>
                  <Typography>{formatDate(orderDetail.created_at)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Sucursal</Typography>
                  <Typography>
                    {orderDetail.branch ? orderDetail.branch.name : 'Sucursal no disponible'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Estado</Typography>
                  <Typography>{renderStatusChip(orderDetail.status)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Método de entrega</Typography>
                  <Typography>
                    {orderDetail.delivery_method === 'PICKUP' 
                      ? 'Retiro en tienda' 
                      : 'Despacho a domicilio'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Dirección de entrega</Typography>
                  <Typography>
                    {orderDetail.delivery_address || 'No especificada'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Productos
              </Typography>
              
              <List>
                {orderDetail.items.map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText 
                      primary={item.product_name || `Producto ID: ${item.product_id}`}
                      secondary={`Cantidad: ${item.quantity} · Precio unitario: ${formatCurrency(item.unit_price)}`}
                    />
                    <Typography variant="body1">
                      {formatCurrency(item.total_price)}
                    </Typography>
                  </ListItem>
                ))}
                
                <ListItem>
                  <ListItemText>Subtotal</ListItemText>
                  <Typography variant="body1">
                    {formatCurrency(orderDetail.total_amount)}
                  </Typography>
                </ListItem>
                
                {orderDetail.discount_amount > 0 && (
                  <ListItem>
                    <ListItemText>Descuento</ListItemText>
                    <Typography variant="body1" color="error">
                      - {formatCurrency(orderDetail.discount_amount)}
                    </Typography>
                  </ListItem>
                )}
                
                {orderDetail.delivery_cost > 0 && (
                  <ListItem>
                    <ListItemText>Costo de envío</ListItemText>
                    <Typography variant="body1">
                      {formatCurrency(orderDetail.delivery_cost)}
                    </Typography>
                  </ListItem>
                )}
                
                <ListItem>
                  <ListItemText primary="Total" primaryTypographyProps={{ variant: 'h6' }} />
                  <Typography variant="h6">
                    {formatCurrency(orderDetail.final_amount)}
                  </Typography>
                </ListItem>
              </List>
              
              {orderDetail.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2">Notas:</Typography>
                  <Typography>{orderDetail.notes}</Typography>
                </>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Historial de estados</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {orderDetail.status_history && orderDetail.status_history.length > 0 ? (
                    <List dense>
                      {orderDetail.status_history.map((history, index) => (
                        <ListItem key={index} divider={index < orderDetail.status_history.length - 1}>
                          <ListItemText
                            primary={`${renderStatusChip(history.new_status)} (desde ${history.old_status})`}
                            secondary={`${formatDate(history.date)}${history.notes ? ` - ${history.notes}` : ''}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2">No hay historial disponible</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Información de pago</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {orderDetail.payments && orderDetail.payments.length > 0 ? (
                    <List dense>
                      {orderDetail.payments.map((payment, index) => (
                        <ListItem key={index} divider={index < orderDetail.payments.length - 1}>
                          <ListItemText
                            primary={`${payment.payment_method} - ${payment.status}`}
                            secondary={`Monto: ${formatCurrency(payment.amount)} · ID Transacción: ${payment.transaction_id || 'N/A'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2">No hay información de pago disponible</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cerrar</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => handleOpenStatusChange(currentOrder)}
          >
            Cambiar Estado
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de cambio de estado */}
      <Dialog open={statusChangeOpen} onClose={handleCloseStatusChange} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cambiar Estado del Pedido {currentOrder?.order_number}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={newStatus}
                label="Nuevo Estado"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value="">Seleccione un estado</MenuItem>
                {orderStatuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Notas (opcional)"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseStatusChange}
            startIcon={<Close />}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleUpdateStatus}
            disabled={!newStatus || loading}
            startIcon={<Done />}
          >
            Actualizar Estado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderManagement;