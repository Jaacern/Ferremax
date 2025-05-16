import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cart.slice';
import { formatPrice } from '../../utils/formatUtils';

/**
 * Componente que muestra los detalles completos de un producto.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.product - Datos completos del producto
 * @returns {React.ReactNode} - Detalles del producto
 */
const ProductDetail = ({ product }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  
  // Verificar si el producto tiene descuento
  const hasDiscount = product.discount_percentage > 0;
  const currentPrice = product.current_price || product.price;
  const originalPrice = product.price;
  
  // Calcular disponibilidad en sucursales
  const totalAvailableStock = product.stocks ? 
    product.stocks.reduce((sum, stock) => sum + stock.quantity, 0) : 0;
  
  // Manejar cambio de cantidad
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  // Incrementar cantidad
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  // Decrementar cantidad
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  // Agregar al carrito
  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
  };
  
  return (
    <div className="card">
      <div className="card-body">
        <div className="row">
          {/* Imagen del producto */}
          <div className="col-md-5 mb-4 mb-md-0">
            <div className="product-image-container text-center">
              <img 
                src={product.image_url || '/placeholder-image.jpg'} 
                className="img-fluid rounded" 
                alt={product.name}
                style={{ maxHeight: '350px', objectFit: 'contain' }}
              />
            </div>
            {/* Etiquetas de nuevo o descuento */}
            <div className="mt-3">
              {product.is_new && (
                <span className="badge bg-primary me-2">Nuevo</span>
              )}
              {hasDiscount && (
                <span className="badge bg-danger">-{product.discount_percentage}% Descuento</span>
              )}
            </div>
          </div>
          
          {/* Información del producto */}
          <div className="col-md-7">
            <h2 className="mb-3">{product.name}</h2>
            
            {/* SKU y marca */}
            <div className="mb-3">
              <p className="mb-1">
                <strong>SKU:</strong> {product.sku}
              </p>
              {product.brand && (
                <p className="mb-1">
                  <strong>Marca:</strong> {product.brand}
                </p>
              )}
              <p className="mb-0">
                <strong>Categoría:</strong> {product.category}
                {product.subcategory && ` > ${product.subcategory}`}
              </p>
            </div>
            
            {/* Precios */}
            <div className="mb-4">
              {hasDiscount ? (
                <div>
                  <span className="text-danger fs-3 fw-bold me-2">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="text-decoration-line-through text-muted fs-5">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="badge bg-danger ms-2">-{product.discount_percentage}%</span>
                </div>
              ) : (
                <span className="fs-3 fw-bold">
                  {formatPrice(currentPrice)}
                </span>
              )}
            </div>
            
            {/* Disponibilidad */}
            <div className="mb-4">
              <p className="mb-2">
                <strong>Disponibilidad:</strong>{' '}
                {totalAvailableStock > 0 ? (
                  <span className="text-success">En stock</span>
                ) : (
                  <span className="text-danger">Agotado</span>
                )}
              </p>
              
              {/* Mostrar disponibilidad por sucursal */}
              {product.stocks && product.stocks.length > 0 && (
                <div>
                  <p className="mb-2"><strong>Disponibilidad por sucursal:</strong></p>
                  <ul className="list-group mb-3">
                    {product.stocks.map(stock => (
                      <li key={stock.branch_id} className="list-group-item d-flex justify-content-between align-items-center">
                        {stock.branch_name}
                        {stock.quantity > 0 ? (
                          <span className="badge bg-success rounded-pill">{stock.quantity} unidades</span>
                        ) : (
                          <span className="badge bg-danger rounded-pill">Agotado</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Cantidad y botón de agregar al carrito */}
            <div className="mb-4">
              <label htmlFor="quantity" className="form-label">Cantidad</label>
              <div className="input-group mb-3" style={{ maxWidth: '200px' }}>
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <i className="bi bi-dash"></i>
                </button>
                <input 
                  type="number" 
                  className="form-control text-center"
                  id="quantity"
                  value={quantity}
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
              
              <button 
                className="btn btn-primary btn-lg"
                onClick={handleAddToCart}
                disabled={totalAvailableStock <= 0}
              >
                <i className="bi bi-cart-plus me-2"></i>
                Agregar al Carrito
              </button>
            </div>
            
            {/* Descripción */}
            {product.description && (
              <div className="mt-4">
                <h4>Descripción</h4>
                <p className="product-description">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;