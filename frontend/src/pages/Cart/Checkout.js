import React, { useState } from 'react';
import { Container, Row, Col, Alert, Breadcrumb } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectCartItems, 
  selectIsCartEmpty, 
  clearCart 
} from '../../store/cart.slice';

import CheckoutForm from '../../components/cart/CheckoutForm';
import CartSummary from '../../components/cart/CartSummary';
import api from '../../services/api';

// Este servicio aún no existe, pero lo crearemos después
// import orderService from '../../services/order.service';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const isEmpty = useSelector(selectIsCartEmpty);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Manejar envío del formulario de checkout
  const handleCheckout = async (formData) => {
    if (isEmpty) {
      setError('No hay productos en el carrito');
      return;
    }

    setIsLoading(true);
    setError(null);

    const branchId = Number(formData.branchId);
    const deliveryMethod = formData.deliveryMethod === 'PICKUP'
    ? 'retiro en tienda'
    : 'despacho a domicilio';

    if (deliveryMethod === 'pickup' && !branchId) {
      setError("Por favor selecciona una sucursal válida.");
      setIsLoading(false);
      return;
    }


    try {
      // Paso 1: Crear orden
      const orderPayload = {
        branch_id: deliveryMethod === 'retiro en tienda' ? Number(formData.branchId) : null,
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === 'despacho a domicilio' ? formData.address : null,
        notes: formData.notes || '',
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      console.log("Payload a enviar:", orderPayload);
      const orderResponse = await api.post('/orders', orderPayload);
      const createdOrder = orderResponse.data.order;

      const paymentMethodMap = {
        CREDIT_CARD: 'tarjeta de crédito',
        DEBIT_CARD: 'tarjeta de débito',
        BANK_TRANSFER: 'transferencia bancaria',
        CASH: 'efectivo'
        };

      const paymentPayload = {
        order_id: createdOrder.id,
        payment_method: paymentMethodMap[formData.paymentMethod] || 'tarjeta de crédito'
      };
      
      const paymentResponse = await api.post('/payments/initiate', paymentPayload);
      const redirectUrl = paymentResponse.data.payment_details.redirect_url;

      // Paso 3: Redirigir a Webpay
      window.location.href = redirectUrl;

    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      const msg = error.response?.data?.error || 'Ocurrió un error al crear el pedido o iniciar el pago.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Si el carrito está vacío, redirigir al carrito
  if (isEmpty) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <h4>No hay productos en tu carrito</h4>
          <p>Debes agregar productos al carrito antes de proceder al pago.</p>
          <Link to="/cart" className="btn btn-primary mt-2">
            Ir al carrito
          </Link>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/cart' }}>Carrito</Breadcrumb.Item>
        <Breadcrumb.Item active>Checkout</Breadcrumb.Item>
      </Breadcrumb>
      
      <h1 className="mb-4">Finalizar compra</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Row>
        {/* Formulario de checkout */}
        <Col lg={8} className="mb-4">
          <CheckoutForm onSubmit={handleCheckout} isLoading={isLoading} />
        </Col>
        
        {/* Resumen del pedido */}
        <Col lg={4}>
          <CartSummary showCheckoutButton={false} />
          
          <Alert variant="info" className="mt-3">
            <strong>Nota:</strong> Este es un sistema de demostración. 
            No se realizarán cargos reales a ninguna tarjeta ni se procesarán pagos verdaderos.
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;