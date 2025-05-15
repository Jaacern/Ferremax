import React from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectCartItems, 
  selectIsCartEmpty, 
  clearCart 
} from '../../store/cart.slice';

import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';

const ShoppingCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const isEmpty = useSelector(selectIsCartEmpty);
  
  // Limpiar carrito
  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      dispatch(clearCart());
    }
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Carrito de compras</h1>
      
      {isEmpty ? (
        <div className="text-center py-5">
          <Alert variant="info">
            <h4>Tu carrito está vacío</h4>
            <p className="mb-0">
              No tienes productos en tu carrito de compras.
              ¡Explora nuestro catálogo para encontrar lo que necesitas!
            </p>
          </Alert>
          <Button
            as={Link}
            to="/products"
            variant="primary"
            className="mt-3"
            size="lg"
          >
            Ir al catálogo
          </Button>
        </div>
      ) : (
        <Row>
          {/* Lista de productos */}
          <Col lg={8} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Productos en tu carrito</h4>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleClearCart}
              >
                Vaciar carrito
              </Button>
            </div>
            
            {/* Items del carrito */}
            <div className="cart-items">
              {cartItems.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </Col>
          
          {/* Resumen del carrito */}
          <Col lg={4}>
            <CartSummary />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ShoppingCart;