import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Button, 
  Alert, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { CheckCircle, Assignment, Receipt } from '@mui/icons-material';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Datos recibidos del proceso de pago
  const { payment, payment_details, order } = location.state || {};
  
  useEffect(() => {
    // Si no hay datos de pago, redirigir al carrito
    if (!payment && !order) {
      navigate('/cart');
    }
  }, [payment, order, navigate]);

  // Formatear montos en pesos chilenos
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
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

  if (!payment && !order) {
    return null; // Se redirigirá en el useEffect
  }

  return (
    <Box p={3}>
      <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
        <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
        
        <Typography variant="h4" gutterBottom>
          ¡Gracias por tu compra!
        </Typography>
        
        <Typography variant="subtitle1" paragraph>
          {payment?.payment_method === 'BANK_TRANSFER' 
            ? 'Tu pedido ha sido recibido y se confirmará cuando se verifique tu transferencia.' 
            : 'Tu pago ha sido procesado exitosamente y tu pedido está en proceso.'}
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3} sx={{ textAlign: 'left', mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              <Assignment fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Detalles del Pedido
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Número de Pedido" 
                  secondary={order?.order_number || payment?.webpay_buyorder || '#'}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Fecha" 
                  secondary={formatDate(order?.created_at || payment?.created_at)}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Estado del Pedido" 
                  secondary={order?.status || 'Pendiente'}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Total" 
                  secondary={formatCurrency(order?.final_amount || payment?.amount)}
                />
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              <Receipt fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Detalles del Pago
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Método de Pago" 
                  secondary={payment?.payment_method === 'CREDIT_CARD' 
                    ? 'Tarjeta de Crédito' 
                    : payment?.payment_method === 'DEBIT_CARD' 
                      ? 'Tarjeta de Débito' 
                      : 'Transferencia Bancaria'}
                />
              </ListItem>
              
              {payment?.transaction_id && (
                <ListItem>
                  <ListItemText 
                    primary="ID de Transacción" 
                    secondary={payment.transaction_id}
                  />
                </ListItem>
              )}
              
              {payment?.payment_method === 'BANK_TRANSFER' && payment_details?.account_info && (
                <>
                  <ListItem>
                    <ListItemText 
                      primary="Banco" 
                      secondary={payment_details.account_info.bank}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Número de Cuenta" 
                      secondary={`${payment_details.account_info.account_type} ${payment_details.account_info.account_number}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="RUT" 
                      secondary={payment_details.account_info.rut}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Correo para Comprobante" 
                      secondary={payment_details.account_info.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Referencia" 
                      secondary={payment_details.account_info.reference}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                      secondaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                  </ListItem>
                </>
              )}
            </List>
          </Grid>
        </Grid>
        
        {payment?.payment_method === 'BANK_TRANSFER' && (
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Instrucciones para la transferencia:
            </Typography>
            <Typography variant="body2">
              1. Realiza una transferencia bancaria por el monto total de {formatCurrency(payment.amount)}.
            </Typography>
            <Typography variant="body2">
              2. Usa como referencia el código: <strong>{payment_details?.account_info.reference}</strong>
            </Typography>
            <Typography variant="body2">
              3. Envía el comprobante al correo: <strong>{payment_details?.account_info.email}</strong>
            </Typography>
            <Typography variant="body2">
              4. Tu pedido será procesado una vez que se verifique el pago.
            </Typography>
          </Alert>
        )}
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary"
            component={Link}
            to="/user/orders"
            sx={{ mr: 2 }}
          >
            Ver mis pedidos
          </Button>
          
          <Button 
            variant="outlined"
            component={Link}
            to="/catalog"
          >
            Seguir comprando
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentSuccess;