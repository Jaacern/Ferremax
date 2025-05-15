import React from 'react';
import { Card, ListGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartTotal, selectCartItemCount } from '../../store/cart.slice';

const CartSummary = ({ showCheckoutButton = true }) => {
  const cartTotal = useSelector(selectCartTotal);
  const itemCount = useSelector(selectCartItemCount);
  
  // Valores ficticios para envío e impuestos (en una aplicación real vendrían del backend)
  const shipping = itemCount > 0 ? 5000 : 0; // Costo de envío fijo
  const tax = cartTotal * 0.19; // IVA en Chile (19%)
  
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };
  
  return (
    <Card className="cart-summary">
      <Card.Header as="h5">Resumen del pedido</Card.Header>
      <ListGroup variant="flush">
        <ListGroup.Item className="d-flex justify-content-between">
          <span>Subtotal ({itemCount} productos)</span>
          <span>{formatPrice(cartTotal)}</span>
        </ListGroup.Item>
        
        <ListGroup.Item className="d-flex justify-content-between">
          <span>Envío</span>
          <span>{shipping > 0 ? formatPrice(shipping) : 'Gratis'}</span>
        </ListGroup.Item>
        
        <ListGroup.Item className="d-flex justify-content-between">
          <span>IVA (19%)</span>
          <span>{formatPrice(tax)}</span>
        </ListGroup.Item>
        
        <ListGroup.Item className="d-flex justify-content-between fw-bold">
          <span>Total</span>
          <span>{formatPrice(cartTotal + shipping)}</span>
        </ListGroup.Item>
      </ListGroup>
      
      <Card.Body>
        {showCheckoutButton && (
          <Button
            as={Link}
            to="/checkout"
            variant="primary"
            size="lg"
            className="w-100"
            disabled={itemCount === 0}
          >
            Proceder al pago
          </Button>
        )}
        
        <Button
          as={Link}
          to="/products"
          variant="outline-secondary"
          className="w-100 mt-2"
        >
          Continuar comprando
        </Button>
      </Card.Body>
    </Card>
  );
};

export default CartSummary;