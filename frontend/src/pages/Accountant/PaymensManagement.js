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
  Divider
} from '@mui/material';
import { 
  Search, Visibility, CheckCircle, 
  Cancel, MonetizationOn
} from '@mui/icons-material';

const PaymentsManagement = () => {
  const { user } = useSelector(state => state.auth);
  const [payments, setPayments] = useState([]);
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
  
  // Estado para modal de detalle de pago
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  
  // Estado para modal de confirmación de transferencia
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [confirmFormData, setConfirmFormData] = useState({
    payment_id: null,
    transaction_id: '',
    notes: ''
  });
  
  // Opciones de estado de pago
  const paymentStatuses = [
    { value: 'PENDING', label: 'Pendiente', color: 'warning' },
    { value: 'PROCESSING', label: 'Procesando', color: 'info' },
    { value: 'COMPLETED', label: 'Completado', color: 'success' },
    { value: 'FAILED', label: 'Fallido', color: 'error' },
    { value: 'REFUNDED', label: 'Reembolsado', color: 'secondary' },
    { value: 'CANCELLED', label: 'Cancelado', color: 'default' }
  ];
  
  // Opciones de método de pago
  const paymentMethods = [
    { value: 'CREDIT_CARD', label: 'Tarjeta de Crédito' },
    { value: 'DEBIT_CARD', label: 'Tarjeta de Débito' },
    { value: 'BANK_TRANSFER', label: 'Transferencia Bancaria' },
    { value: 'CASH', label: 'Efectivo' }
  ];

  useEffect(() => {
    fetchPayments();
  }, [page, rowsPerPage, statusFilter, dateFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Aquí se haría la llamada a la API para obtener los pagos
      // La ruta específica para listar todos los pagos no está clara en el backend
      // Podría ser necesario implementar un endpoint dedicado para esto
      
      // Por ahora, simularemos los datos
      setTimeout(() => {
        const mockPayments = [
          {
            id: 1,
            order_id: 1001,
            order_number: 'ORD-20240515-ABC123',
            payment_method: 'BANK_TRANSFER',
            status: 'PENDING',
            amount: 56990,
            currency: 'CLP',
            created_at: '2024-05-15T10:30:00Z'
          },
          {
            id: 2,
            order_id: 1002,
            order_number: 'ORD-20240514-DEF456',
            payment_method: 'CREDIT_CARD',
            status: 'COMPLETED',
            amount: 142500,
            currency: 'CLP',
            transaction_id: 'TX-122334455',
            payment_date: '2024-05-14T15:45:00Z',
            created_at: '2024-05-14T15:40:00Z'
          },
          {
            id: 3,
            order_id: 1003,
            order_number: 'ORD-20240513-GHI789',
            payment_method: 'DEBIT_CARD',
            status: 'FAILED',
            amount: 35990,
            currency: 'CLP',
            created_at: '2024-05-13T11:20:00Z'
          },
        ];
        
        setPayments(mockPayments);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error al cargar pagos:', err);
      setError('No se pudieron cargar los pagos. Intente nuevamente.');
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
    fetchPayments();
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter({
      ...dateFilter,
      [name]: value
    });
  };

  const handleViewPayment = (payment) => {
    setCurrentPayment(payment);
    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setCurrentPayment(null);
  };

  const handleOpenConfirmModal = (payment) => {
    setConfirmFormData({
      payment_id: payment.id,
      transaction_id: '',
      notes: ''
    });
    setOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
    setConfirmFormData({
      payment_id: null,
      transaction_id: '',
      notes: ''
    });
  };

  const handleConfirmFormChange = (e) => {
    const { name, value } = e.target;
    setConfirmFormData({
      ...confirmFormData,
      [name]: value
    });
  };

  const handleConfirmTransfer = async () => {
    if (!confirmFormData.payment_id || !confirmFormData.transaction_id) {
      setError('Debe ingresar el ID de transacción');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await api.post('/payments/confirm-transfer', confirmFormData);
      
      // Cerrar modal y actualizar lista
      handleCloseConfirmModal();
      fetchPayments();
      
    } catch (err) {
      console.error('Error al confirmar transferencia:', err);
      setError(err.response?.data?.error || 'Error al confirmar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = async (paymentId) => {
    if (!window.confirm('¿Está seguro que desea cancelar este pago?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await api.put(`/payments/cancel/${paymentId}`, {
        notes: 'Cancelado por el contador'
      });
      
      // Actualizar lista
      fetchPayments();
      
    } catch (err) {
      console.error('Error al cancelar pago:', err);
      setError('No se pudo cancelar el pago. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar chip de estado
  const renderStatusChip = (status) => {
    const statusInfo = paymentStatuses.find(s => s.value === status) || 
      { label: status, color: 'default' };
    
    return (
      <Chip 
        label={statusInfo.label} 
        color={statusInfo.color}
        size="small"
      />
    );
  };

  // Formatear método de pago
  const formatPaymentMethod = (method) => {
    const methodInfo = paymentMethods.find(m => m.value === method);
    return methodInfo ? methodInfo.label : method;
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
  const formatCurrency = (amount, currency = 'CLP') => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (!user || user.role !== 'accountant') {
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
        Gestión de Pagos
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
                label="Buscar pagos"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nº Pedido, ID Transacción"
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
                {paymentStatuses.map((status) => (
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
              onClick={fetchPayments}
            >
              Filtrar
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabla de pagos */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nº Pedido</TableCell>
                <TableCell>Método</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>ID Transacción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && page === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Cargando pagos...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron pagos
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.order_number}</TableCell>
                    <TableCell>{formatPaymentMethod(payment.payment_method)}</TableCell>
                    <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                    <TableCell>{formatDate(payment.created_at)}</TableCell>
                    <TableCell>{payment.transaction_id || '—'}</TableCell>
                    <TableCell>{renderStatusChip(payment.status)}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary"
                        onClick={() => handleViewPayment(payment)}
                        title="Ver detalles"
                      >
                        <Visibility />
                      </IconButton>
                      
                      {payment.payment_method === 'BANK_TRANSFER' && payment.status === 'PENDING' && (
                        <IconButton
                          color="success"
                          onClick={() => handleOpenConfirmModal(payment)}
                          title="Confirmar transferencia"
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                      
                      {payment.status === 'PENDING' && (
                        <IconButton
                          color="error"
                          onClick={() => handleCancelPayment(payment.id)}
                          title="Cancelar pago"
                        >
                          <Cancel />
                        </IconButton>
                      )}
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
      
      {/* Modal de detalle de pago */}
      <Dialog open={openDetailModal} onClose={handleCloseDetailModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Detalle del Pago
        </DialogTitle>
        <DialogContent>
          {!currentPayment ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              Cargando detalles...
            </Box>
          ) : (
            <List>
              <ListItem divider>
                <ListItemText primary="Nº Pedido" secondary={currentPayment.order_number} />
              </ListItem>
              <ListItem divider>
                <ListItemText primary="Método de Pago" secondary={formatPaymentMethod(currentPayment.payment_method)} />
              </ListItem>
              <ListItem divider>
                <ListItemText primary="Monto" secondary={formatCurrency(currentPayment.amount, currentPayment.currency)} />
              </ListItem>
              <ListItem divider>
                <ListItemText primary="Estado" secondary={renderStatusChip(currentPayment.status)} />
              </ListItem>
              <ListItem divider>
                <ListItemText primary="Fecha de Creación" secondary={formatDate(currentPayment.created_at)} />
              </ListItem>
              <ListItem divider>
                <ListItemText primary="Fecha de Pago" secondary={formatDate(currentPayment.payment_date) || '—'} />
              </ListItem>
              <ListItem divider>
                <ListItemText primary="ID de Transacción" secondary={currentPayment.transaction_id || '—'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Notas" secondary={currentPayment.notes || '—'} />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailModal}>Cerrar</Button>
          
          {currentPayment && currentPayment.payment_method === 'BANK_TRANSFER' && currentPayment.status === 'PENDING' && (
            <Button 
              variant="contained" 
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => {
                handleCloseDetailModal();
                handleOpenConfirmModal(currentPayment);
              }}
            >
              Confirmar Transferencia
            </Button>
          )}
          
          {currentPayment && currentPayment.status === 'PENDING' && (
            <Button 
              variant="contained" 
              color="error"
              startIcon={<Cancel />}
              onClick={() => {
                handleCloseDetailModal();
                handleCancelPayment(currentPayment.id);
              }}
            >
              Cancelar Pago
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Modal de confirmación de transferencia */}
      <Dialog open={openConfirmModal} onClose={handleCloseConfirmModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirmar Transferencia Bancaria
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="ID de Transacción"
              name="transaction_id"
              value={confirmFormData.transaction_id}
              onChange={handleConfirmFormChange}
              required
              margin="normal"
              placeholder="Ej: 123456789"
            />
            
            <TextField
              fullWidth
              label="Notas (opcional)"
              name="notes"
              value={confirmFormData.notes}
              onChange={handleConfirmFormChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Información adicional sobre la transferencia"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmModal}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<MonetizationOn />}
            onClick={handleConfirmTransfer}
            disabled={!confirmFormData.transaction_id || loading}
          >
            Confirmar Pago
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentsManagement;