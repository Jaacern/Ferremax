import React from 'react';
import { Row, Col, Form, Button, Image } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { updateCartItem, removeFromCart } from '../../store/cart.slice';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  
  // Calcular precio con descuento si aplica
  const price = item.discount_percentage > 0
    ? item.price * (1 - item.discount_percentage / 100)
    : item.price;
  
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };
  
  // Manejar cambio de cantidad
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity >= 0) {
      dispatch(updateCartItem({
        id: item.id,
        quantity: newQuantity
      }));
    }
  };
  
  // Eliminar ítem del carrito
  const handleRemove = () => {
    dispatch(removeFromCart(item.id));
  };
  
  return (
    <div className="cart-item mb-3 p-3 border rounded">
      <Row className="align-items-center">
        {/* Imagen del producto */}
        <Col xs={3} sm={2}>
          <Image 
            src={item.image_url || 'https://via.placeholder.com/80x80?text=FERREMAS'} 
            alt={item.name} 
            fluid 
            thumbnail
          />
        </Col>
        
        {/* Información del producto */}
        <Col xs={9} sm={4} md={5}>
          <h5 className="mb-1">{item.name}</h5>
          <div className="text-muted small mb-1">
            SKU: {item.sku} | {item.brand}
          </div>
          {item.discount_percentage > 0 && (
            <div className="badge bg-danger me-1">
              -{item.discount_percentage}%
            </div>
          )}
        </Col>
        
        {/* Controles de cantidad */}
        <Col xs={6} sm={3} md={2} className="mt-3 mt-sm-0">
          <Form.Group>
            <Form.Label className="d-block d-sm-none">Cantidad:</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="99"
              value={item.quantity}
              onChange={handleQuantityChange}
              className="cart-quantity-input"
            />
          </Form.Group>
        </Col>
        
        {/* Precio */}
        <Col xs={6} sm={3} className="text-end mt-3 mt-sm-0">
          <div className="fw-bold mb-1">
            {formatPrice(price * item.quantity)}
          </div>
          <div className="text-muted small">
            {formatPrice(price)} c/u
          </div>
          <Button 
            variant="link" 
            className="text-danger p-0 btn-sm mt-2"
            onClick={handleRemove}
          >
            <i className="bi bi-trash"></i> Eliminar
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default CartItem;