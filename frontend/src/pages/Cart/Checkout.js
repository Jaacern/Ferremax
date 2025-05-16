import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Button, 
  Stepper, Step, StepLabel, Alert,
  Divider
} from '@mui/material';
import api from '../../services/api';
import CheckoutForm from '../../components/cart/CheckoutForm';
import CartSummary from '../../components/cart/CartSummary';
import { clearCart } from '../../store/cart.slice';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [orderData, setOrderData] = useState({
    branch_id: '',
    delivery_method: 'PICKUP',
    delivery_address: '',
    delivery_cost: 0,
    notes: '',
    items: []
  });
  const [paymentData, setPaymentData] = useState({
    payment_method: 'CREDIT_CARD',
    order_id: null
  });
  const [orderCreated, setOrderCreated] = useState(null);
  const [paymentRedirect, setPaymentRedirect] = useState(null);
  
  // Valores calculados
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  // Pasos del checkout
  const steps = ['Detalles de entrega', 'Confirmar pedido', 'Pago'];

  useEffect(() => {
    // Redirigir si no hay productos en el carrito
    if (items.length === 0 && !orderCreated) {
      navigate('/cart');
      return;
    }
    
    // Redirigir si no está autenticado
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    // Obtener sucursales
    fetchBranches();
    
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
    
    // Configurar items para la orden
    setOrderData(prev => ({
      ...prev,
      items: items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity
      }))
    }));
  }, [items, user, navigate, orderCreated]);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/products/branches');
      setBranches(response.data.branches);
      
      // Configurar sucursal por defecto
      if (response.data.branches.length > 0) {
        const mainBranch = response.data.branches.find(b => b.is_main) || response.data.branches[0];
        setOrderData(prev => ({
          ...prev,
          branch_id: mainBranch.id
        }));
      }
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
      setError('No se pudieron cargar las sucursales. Intente nuevamente.');
    }
  };

  const handleOrderDataChange = (e) => {
    const { name, value } = e.target;
    
    // Actualizar costo de envío si cambia el método de entrega
    if (name === 'delivery_method') {
      setOrderData(prev => ({
        ...prev,
        [name]: value,
        delivery_cost: value === 'DELIVERY' ? 5000 : 0
      }));
    } else {
      setOrderData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePaymentDataChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    // Validar según el paso actual
    if (activeStep === 0) {
      // Validar detalles de entrega
      if (!orderData.branch_id) {
        setError('Debe seleccionar una sucursal');
        return;
      }
      
      if (orderData.delivery_method === 'DELIVERY' && !orderData.delivery_address) {
        setError('Debe ingresar una dirección de entrega');
        return;
      }
    }
    
    if (activeStep === 1) {
      // Crear la orden
      createOrder();
      return;
    }
    
    if (activeStep === 2) {
      // Iniciar el pago
      initiatePayment();
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/orders', orderData);
      setOrderCreated(response.data.order);
      setPaymentData(prev => ({
        ...prev,
        order_id: response.data.order.id
      }));
      
      // Avanzar al siguiente paso
      setActiveStep(2);
    } catch (err) {
      console.error('Error al crear la orden:', err);
      setError(err.response?.data?.error || 'Error al crear la orden. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/payments/initiate', paymentData);
      
      // Si es tarjeta, redirigir a WebPay
      if (['CREDIT_CARD', 'DEBIT_CARD'].includes(paymentData.payment_method)) {
        setPaymentRedirect(response.data.payment_details.redirect_url);
        
        // Redirigir automáticamente
        window.location.href = response.data.payment_details.redirect_url;
      } else if (paymentData.payment_method === 'BANK_TRANSFER') {
        // Si es transferencia, mostrar detalles de la cuenta
        setPaymentRedirect(response.data.payment_details.account_info);
        
        // Limpiar carrito
        dispatch(clearCart());
        
        // Redirigir a página de éxito
        navigate('/cart/payment-success', { 
          state: { 
            payment: response.data.payment,
            payment_details: response.data.payment_details,
            order: orderCreated
          } 
        });
      }
    } catch (err) {
      console.error('Error al iniciar el pago:', err);
      setError(err.response?.data?.error || 'Error al procesar el pago. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Formatear montos en pesos chilenos
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  // Método para obtener el contenido según el paso actual
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <CheckoutForm 
            orderData={orderData} 
            onChange={handleOrderDataChange}
            branches={branches}
          />
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resumen del Pedido
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4} sm={3}>
                <Typography variant="subtitle2">Sucursal:</Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                <Typography>
                  {branches.find(b => b.id === parseInt(orderData.branch_id))?.name || ''}
                </Typography>
              </Grid>
              
              <Grid item xs={4} sm={3}>
                <Typography variant="subtitle2">Método de entrega:</Typography>
              </Grid>
              <Grid item xs={8} sm={9}>
                <Typography>
                  {orderData.delivery_method === 'PICKUP' ? 'Retiro en tienda' : 'Despacho a domicilio'}
                </Typography>
              </Grid>
              
              {orderData.delivery_method === 'DELIVERY' && (
                <>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="subtitle2">Dirección:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={9}>
                    <Typography>{orderData.delivery_address}</Typography>
                  </Grid>
                  
                  <Grid item xs={4} sm={3}>
                    <Typography variant="subtitle2">Costo de envío:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={9}>
                    <Typography>{formatCurrency(orderData.delivery_cost)}</Typography>
                  </Grid>
                </>
              )}
              
              {orderData.notes && (
                <>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="subtitle2">Notas:</Typography>
                  </Grid>
                  <Grid item xs={8} sm={9}>
                    <Typography>{orderData.notes}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Productos
            </Typography>
            
            {items.map((item) => (
              <Grid container key={item.productId} spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={6}>
                  <Typography>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cantidad: {item.quantity}
                  </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography>{formatCurrency(item.price * item.quantity)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(item.price)} c/u
                  </Typography>
                </Grid>
              </Grid>
            ))}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Método de Pago
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        Seleccione su método de pago:
                      </Typography>
                    </Box>
                    
                    <Box>
                      <label>
                        <input
                          type="radio"
                          name="payment_method"
                          value="CREDIT_CARD"
                          checked={paymentData.payment_method === 'CREDIT_CARD'}
                          onChange={handlePaymentDataChange}
                        />
                        {' '}Tarjeta de Crédito
                      </label>
                    </Box>
                    
                    <Box>
                      <label>
                        <input
                          type="radio"
                          name="payment_method"
                          value="DEBIT_CARD"
                          checked={paymentData.payment_method === 'DEBIT_CARD'}
                          onChange={handlePaymentDataChange}
                        />
                        {' '}Tarjeta de Débito
                      </label>
                    </Box>
                    
                    <Box>
                      <label>
                        <input
                          type="radio"
                          name="payment_method"
                          value="BANK_TRANSFER"
                          checked={paymentData.payment_method === 'BANK_TRANSFER'}
                          onChange={handlePaymentDataChange}
                        />
                        {' '}Transferencia Bancaria
                      </label>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              {paymentData.payment_method === 'BANK_TRANSFER' ? (
                'Al finalizar, se le mostrarán los datos bancarios para realizar la transferencia.'
              ) : (
                'Al finalizar, será redirigido a la plataforma de pago WebPay.'
              )}
            </Alert>
          </Box>
        );
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom component="h1">
        Proceso de Compra
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Grid container spacing={3}>
        {/* Formulario según paso */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
              >
                Atrás
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={loading}
              >
                {activeStep === steps.length - 1 ? 'Realizar Pago' : 'Siguiente'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Resumen de compra */}
        <Grid item xs={12} md={4}>
          <CartSummary 
            subtotal={subtotal}
            discount={discount}
            deliveryCost={orderData.delivery_cost}
            formatCurrency={formatCurrency}
            showCheckoutButton={false}
            isCheckout={true}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Checkout;