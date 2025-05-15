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
    
    try {
      // Simulación de envío de orden (en una app real, esto llamaría al backend)
      // const orderData = {
      //   items: cartItems,
      //   ...formData
      // };
      // const response = await orderService.createOrder(orderData);
      
      // Simular respuesta exitosa
      console.log('Datos del pedido:', {
        items: cartItems,
        ...formData
      });
      
      // Esperar un momento para simular la petición al servidor
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Limpiar carrito después de un pedido exitoso
      dispatch(clearCart());
      
      // Redirigir a página de éxito (aun no existe, pero la crearemos después)
      navigate('/payment-success');
      
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      setError('Ha ocurrido un error al procesar tu pedido. Por favor intenta nuevamente.');
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