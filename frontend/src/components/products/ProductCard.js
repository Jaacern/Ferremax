import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cart.slice';
import { formatPrice } from '../../utils/formatUtils';

/**
 * Componente que muestra una tarjeta de producto.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.product - Datos del producto
 * @returns {React.ReactNode} - Tarjeta de producto
 */
const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  
  // Calcular precio final con descuento
  const hasDiscount = product.discount_percentage > 0;
  const currentPrice = product.current_price || product.price;
  const originalPrice = product.price;
  
  // Agregar al carrito
  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product, quantity: 1 }));
  };
  
  return (
    <div className="card h-100 product-card">
      {/* Etiquetas de nuevo o descuento */}
      {(product.is_new || hasDiscount) && (
        <div className="position-absolute top-0 start-0 p-2">
          {product.is_new && (
            <span className="badge bg-primary me-1">Nuevo</span>
          )}
          {hasDiscount && (
            <span className="badge bg-danger">-{product.discount_percentage}%</span>
          )}
        </div>
      )}
      
      {/* Imagen del producto */}
      <Link to={`/products/${product.id}`}>
        <div className="product-image-container">
          <img 
            src={product.image_url || '/placeholder-image.jpg'} 
            className="card-img-top product-image" 
            alt={product.name}
            style={{ height: '200px', objectFit: 'contain', padding: '1rem' }}
          />
        </div>
      </Link>
      
      <div className="card-body d-flex flex-column">
        {/* Categoría */}
        <p className="text-muted small mb-1">
          {product.category}
          {product.subcategory && ` > ${product.subcategory}`}
        </p>
        
        {/* Nombre del producto */}
        <h5 className="card-title">
          <Link to={`/products/${product.id}`} className="text-decoration-none text-dark">
            {product.name}
          </Link>
        </h5>
        
        {/* Marca */}
        {product.brand && (
          <p className="text-muted small mb-1">
            <strong>Marca:</strong> {product.brand}
          </p>
        )}
        
        {/* Precio y descuento */}
        <div className="mt-auto">
          <div className="mb-2">
            {hasDiscount ? (
              <>
                <span className="text-danger fs-5 fw-bold me-2">
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-decoration-line-through text-muted">
                  {formatPrice(originalPrice)}
                </span>
              </>
            ) : (
              <span className="fs-5 fw-bold">
                {formatPrice(currentPrice)}
              </span>
            )}
          </div>
          
          {/* Botón de agregar al carrito */}
          <button
            className="btn btn-primary w-100"
            onClick={handleAddToCart}
          >
            <i className="bi bi-cart-plus me-2"></i>
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;