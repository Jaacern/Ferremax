import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { updateCartItem, removeFromCart } from '../../store/cart.slice';
import CurrencyDisplay from '../common/CurrencyDisplay'; // Importar componente

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0) {
      dispatch(updateCartItem({ id: item.id, quantity: newQuantity }));
    }
  };
  
  const handleRemoveItem = () => {
    dispatch(removeFromCart(item.id));
  };
  
  return (
    <div className="cart-item border rounded p-3 mb-3">
      <Row className="align-items-center">
        <Col xs={3} md={2}>
          <img 
            src={item.image_url || "https://via.placeholder.com/100?text=Producto"} 
            alt={item.name} 
            className="img-fluid rounded"
          />
        </Col>
        
        <Col xs={9} md={5}>
          <h5 className="mb-1">{item.name}</h5>
          <p className="mb-0 text-muted">
            {item.brand} | SKU: {item.sku}
          </p>
          {item.discount_percentage > 0 && (
            <span className="badge bg-danger">-{item.discount_percentage}%</span>
          )}
        </Col>
        
        <Col xs={6} md={2} className="mt-3 mt-md-0">
          <Form.Control
            type="number"
            min="1"
            value={item.quantity}
            onChange={handleQuantityChange}
            className="form-control-sm"
          />
        </Col>
        
        <Col xs={6} md={2} className="text-end mt-3 mt-md-0">
          <div className="fw-bold">
            <CurrencyDisplay 
              amount={(item.current_price || item.price) * item.quantity} 
              originalCurrency="CLP" 
            />
          </div>
          <div className="text-muted small">
            <CurrencyDisplay 
              amount={item.current_price || item.price} 
              originalCurrency="CLP" 
            /> c/u
          </div>
        </Col>
        
        <Col xs={12} md={1} className="text-center text-md-end mt-2 mt-md-0">
          <Button 
            variant="link" 
            className="text-danger p-0"
            onClick={handleRemoveItem}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default CartItem;