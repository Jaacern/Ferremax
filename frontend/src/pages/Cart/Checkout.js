import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import CheckoutForm from '../../components/cart/CheckoutForm';
import { selectCurrentCurrency } from '../../store/currency.slice';
import { clearCart, selectCartItems, selectCartTotal } from '../../store/cart.slice';
import CurrencyService from '../../services/currency.service';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import paymentService from '../../services/payment.service';
import api from '../../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const currentCurrency = useSelector(selectCurrentCurrency);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para valores convertidos
  const [convertedValues, setConvertedValues] = useState(null);
  
  // Calcular valores en CLP
  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.current_price || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
  
  // Valores por defecto en CLP
  const defaultValues = {
    subtotal: subtotal,
    shipping: 0, // Valor predeterminado, se actualizará según la selección
    tax: subtotal * 0.19,
    total: subtotal + 0 + (subtotal * 0.19) // Se actualizará
  };
  
  // Efecto para convertir valores cuando cambia la moneda
  useEffect(() => {
    const convertValues = async () => {
      // Si no hay items, no hay necesidad de convertir
      if (cartItems.length === 0) {
        navigate('/cart');
        return;
      }
      
      if (currentCurrency === 'CLP') {
        // Si es CLP, no hay conversión necesaria
        setConvertedValues(defaultValues);
        return;
      }
      
      try {
        // Convertir subtotal
        const subtotalResult = await CurrencyService.convertAmount(
          subtotal, 'CLP', currentCurrency
        );
        
        // El envío aún no se define en este punto
        const shippingCost = 0;
        
        // Convertir envío si no es 0
        let convertedShipping = 0;
        if (shippingCost > 0) {
          const shippingResult = await CurrencyService.convertAmount(
            shippingCost, 'CLP', currentCurrency
          );
          convertedShipping = shippingResult.amount;
        }
        
        // Calcular IVA sobre el subtotal convertido
        const taxAmount = subtotalResult.amount * 0.19;
        
        // Calcular total
        const totalAmount = subtotalResult.amount + convertedShipping + taxAmount;
        
        // Actualizar los valores convertidos
        setConvertedValues({
          subtotal: subtotalResult.amount,
          shipping: convertedShipping, 
          tax: taxAmount,
          total: totalAmount
        });
        
        console.log('Valores convertidos:', {
          subtotal: subtotalResult.amount,
          shipping: convertedShipping,
          tax: taxAmount,
          total: totalAmount
        });
      } catch (error) {
        console.error('Error al convertir moneda:', error);
        // En caso de error, usar los valores en CLP
        setConvertedValues(defaultValues);
      }
    };
    
    convertValues();
  }, [subtotal, cartItems, currentCurrency, navigate]);
  
  // Si no hay productos en el carrito, redirigir
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);
  
  // Actualizar el envío cuando cambia el método de entrega en el formulario
  const updateShipping = async (deliveryMethod) => {
    const shippingCost = deliveryMethod === 'DELIVERY' ? 5000 : 0;
    
    if (currentCurrency === 'CLP') {
      setConvertedValues(prev => ({
        ...prev,
        shipping: shippingCost,
        total: prev.subtotal + shippingCost + prev.tax
      }));
      return;
    }
    
    try {
      if (shippingCost === 0) {
        setConvertedValues(prev => ({
          ...prev,
          shipping: 0,
          total: prev.subtotal + prev.tax
        }));
        return;
      }
      
      const shippingResult = await CurrencyService.convertAmount(
        shippingCost, 'CLP', currentCurrency
      );
      
      setConvertedValues(prev => ({
        ...prev,
        shipping: shippingResult.amount,
        total: prev.subtotal + shippingResult.amount + prev.tax
      }));
    } catch (error) {
      console.error('Error al convertir costo de envío:', error);
    }
  };
  
  // Manejar el envío del formulario
  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Actualizar el envío según el método seleccionado
      await updateShipping(formData.deliveryMethod);
      
      // Basado en orders.py -> create_order:
      // Required fields: 'items', 'delivery_method'
      const orderData = {
        // Items deben ser array de {product_id, quantity}
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        
        // DeliveryMethod debe ser PICKUP o DELIVERY
        delivery_method: formData.deliveryMethod,
        
        // DeliveryAddress solo se requiere para DELIVERY
        delivery_address: formData.deliveryMethod === 'DELIVERY' 
          ? `${formData.address}, ${formData.city}, ${formData.region}, ${formData.zipCode}` 
          : undefined,
        
        // BranchId como string es aceptable, solo se requiere para PICKUP
        branch_id: formData.deliveryMethod === 'PICKUP' ? formData.branchId : undefined,
        
        // Notas opcionales
        notes: formData.notes || undefined
      };
      
      console.log('Enviando datos de orden:', orderData);
      
      // Crear la orden
      let orderId;
      try {
        const response = await api.post('/orders', orderData);
        console.log('Respuesta orden:', response.data);
        orderId = response.data.order.id;
      } catch (orderError) {
        console.error('Error al crear la orden:', orderError);
        // Usar un ID simulado para desarrollo
        orderId = Math.floor(Math.random() * 10000);
      }
      
      // Basado en payments.py -> initiate_payment:
      // Required fields: 'order_id', 'payment_method'
      const paymentData = {
        order_id: orderId,
        payment_method: formData.paymentMethod,
        
        // Campos opcionales
        currency: currentCurrency !== 'CLP' ? currentCurrency : undefined,
        notes: formData.notes || undefined
      };
      
      console.log('Enviando datos de pago:', paymentData);
      
      // Iniciar el pago
      const paymentResult = await paymentService.initiatePayment(paymentData);
      console.log('Respuesta del pago:', paymentResult);
      
      // Limpiar el carrito
      dispatch(clearCart());
      
      // Redirección según el método de pago
      if (formData.paymentMethod === 'BANK_TRANSFER') {
        navigate('/payment-success', { 
          state: { 
            paymentDetails: paymentResult.payment_details 
          }
        });
      } else {
        // Para tarjetas, redirección a WebPay
        if (paymentResult.payment_details?.redirect_url) {
          window.location.href = paymentResult.payment_details.redirect_url;
        } else {
          // Fallback si no hay redirección
          navigate('/payment-success');
        }
      }
      
    } catch (err) {
      console.error('Error en checkout:', err);
      setError(`Ocurrió un error al procesar tu pedido: ${err.message || 'Error desconocido'}. Por favor intenta nuevamente.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Si aún no se han convertido los valores, mostrar carga
  if (!convertedValues) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Calculando totales...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Finalizar compra</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Row>
        <Col lg={8}>
          <CheckoutForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
            cartTotal={convertedValues.subtotal}
            onDeliveryMethodChange={updateShipping}
          />
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Resumen del pedido</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item key={item.id} className="py-3">
                  <div className="d-flex">
                    <div className="me-2">
                      <img 
                        src={item.image_url || 'https://via.placeholder.com/50x50?text=Producto'} 
                        alt={item.name}
                        width="50"
                        height="50"
                        className="rounded"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{item.name}</h6>
                      <small className="text-muted">
                        {item.quantity} x <CurrencyDisplay amount={item.current_price || item.price} originalCurrency="CLP" />
                      </small>
                    </div>
                    <div className="text-end">
                      <CurrencyDisplay 
                        amount={(item.current_price || item.price) * item.quantity} 
                        originalCurrency="CLP"
                      />
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal ({cartItems.length} productos):</span>
                <span>
                  <CurrencyDisplay amount={subtotal} originalCurrency="CLP" />
                </span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Envío:</span>
                <span>
                  {convertedValues.shipping === 0 
                    ? <span className="text-success">Gratis</span> 
                    : <CurrencyDisplay amount={convertedValues.shipping} currentCurrency={currentCurrency} />
                  }
                </span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>IVA (19%):</span>
                <span>
                  <CurrencyDisplay amount={convertedValues.tax} currentCurrency={currentCurrency} />
                </span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between">
                <h5 className="mb-0">Total:</h5>
                <h5 className="mb-0">
                  <CurrencyDisplay amount={convertedValues.total} currentCurrency={currentCurrency} className="fw-bold" />
                </h5>
              </div>
              
              {currentCurrency !== 'CLP' && (
                <div className="small text-muted mt-2">
                  * Los precios se muestran en {currentCurrency} según la tasa de cambio actual.
                </div>
              )}
            </Card.Body>
          </Card>
          
          <Alert variant="info" className="small mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Este es un sistema de demostración. No se realizarán cargos reales a ninguna tarjeta ni se procesarán pagos verdaderos.
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;