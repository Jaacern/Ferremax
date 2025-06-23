import React from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectCartItems, 
  selectIsCartEmpty, 
  clearCart,
  selectCartTotal
} from '../../store/cart.slice';
import { selectCurrentCurrency } from '../../store/currency.slice';

import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';

const ShoppingCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const isEmpty = useSelector(selectIsCartEmpty);
  const cartTotal = useSelector(selectCartTotal);
  const currentCurrency = useSelector(selectCurrentCurrency);
  
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
                <CartItem 
                  key={item.id} 
                  item={item} 
                />
              ))}
            </div>
            
            {/* Botón para continuar comprando */}
            <div className="mt-4">
              <Button
                as={Link}
                to="/products"
                variant="outline-secondary"
                className="me-2"
              >
                <i className="bi bi-arrow-left me-1"></i> Continuar comprando
              </Button>
              
              {/* Botón redundante para checkout - Como respaldo por si hay problemas con CartSummary */}
              <Button
                as={Link}
                to="/checkout"
                variant="primary"
              >
                Proceder al pago <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </div>
          </Col>
          
          {/* Resumen del carrito */}
          <Col lg={4}>
            <CartSummary />
            
            {/* Información sobre moneda no predeterminada */}
            {currentCurrency !== 'CLP' && (
              <div className="mt-3 p-3 border rounded bg-light">
                <p className="mb-0 small">
                  <i className="bi bi-info-circle me-1"></i>
                  Total en moneda original: <strong><CurrencyDisplay amount={cartTotal} originalCurrency="CLP" /></strong>
                </p>
                <p className="mb-0 mt-1 small text-muted">
                  * Los precios se muestran en {currentCurrency} según la tasa de cambio actual.
                </p>
              </div>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ShoppingCart;