import React from 'react';
import { useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../../store/cart.slice';
import { formatPrice } from '../../utils/formatUtils';

/**
 * Componente que representa un elemento en el carrito de compras.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.item - Datos del producto en el carrito
 * @returns {React.ReactNode} - Elemento del carrito
 */
const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  
  // Calcular subtotal del item
  const subtotal = item.price * item.quantity;
  
  // Calcular descuento si el precio original es mayor que el precio actual
  const hasDiscount = item.originalPrice > item.price;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - (item.price / item.originalPrice)) * 100) 
    : 0;
  
  // Manejar eliminación del producto
  const handleRemove = () => {
    if (window.confirm('¿Está seguro que desea eliminar este producto del carrito?')) {
      dispatch(removeFromCart(item.id));
    }
  };
  
  // Manejar cambio de cantidad
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0) {
      dispatch(updateQuantity({ productId: item.id, quantity: newQuantity }));
    }
  };
  
  // Incrementar cantidad
  const incrementQuantity = () => {
    dispatch(updateQuantity({ productId: item.id, quantity: item.quantity + 1 }));
  };
  
  // Decrementar cantidad
  const decrementQuantity = () => {
    if (item.quantity > 1) {
      dispatch(updateQuantity({ productId: item.id, quantity: item.quantity - 1 }));
    }
  };
  
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row align-items-center">
          {/* Imagen del producto */}
          <div className="col-md-2 col-sm-3 mb-3 mb-md-0">
            <img 
              src={item.image_url || '/placeholder-image.jpg'} 
              alt={item.name} 
              className="img-fluid rounded" 
              style={{ maxHeight: '80px', objectFit: 'contain' }}
            />
          </div>
          
          {/* Información del producto */}
          <div className="col-md-5 col-sm-9 mb-3 mb-md-0">
            <h5 className="card-title mb-1">{item.name}</h5>
            <p className="card-text text-muted mb-1">SKU: {item.sku}</p>
            <div>
              {hasDiscount ? (
                <div>
                  <span className="text-danger fw-bold">{formatPrice(item.price)}</span>
                  <span className="text-decoration-line-through text-muted ms-2">
                    {formatPrice(item.originalPrice)}
                  </span>
                  <span className="badge bg-danger ms-2">-{discountPercentage}%</span>
                </div>
              ) : (
                <span className="fw-bold">{formatPrice(item.price)}</span>
              )}
            </div>
          </div>
          
          {/* Control de cantidad */}
          <div className="col-md-3 col-sm-6 mb-3 mb-sm-0">
            <div className="input-group">
              <button 
                className="btn btn-outline-secondary" 
                type="button"
                onClick={decrementQuantity}
                disabled={item.quantity <= 1}
              >
                <i className="bi bi-dash"></i>
              </button>
              <input 
                type="number" 
                className="form-control text-center"
                value={item.quantity}
                onChange={handleQuantityChange}
                min="1"
              />
              <button 
                className="btn btn-outline-secondary" 
                type="button"
                onClick={incrementQuantity}
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>
          </div>
          
          {/* Subtotal y botón de eliminar */}
          <div className="col-md-2 col-sm-6 text-end">
            <div className="mb-2 fw-bold">{formatPrice(subtotal)}</div>
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={handleRemove}
            >
              <i className="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;