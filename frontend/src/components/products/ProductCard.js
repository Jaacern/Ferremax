import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cart.slice';
import CurrencyDisplay from '../common/CurrencyDisplay'; // Nuevo componente

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  
  // Calcular precio con descuento si existe
  const hasDiscount = product.discount_percentage > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount_percentage / 100)
    : null;
  
  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    console.log('Agregado al carrito:', product);
  };
  
  return (
    <Card className="product-card h-100">
      {/* Badges de ofertas o productos nuevos */}
      <div className="position-absolute top-0 start-0 mt-2 ms-2">
        {hasDiscount && (
          <Badge bg="danger" className="me-1">
            -{product.discount_percentage}%
          </Badge>
        )}
        
        {product.is_new && (
          <Badge bg="primary" className="me-1">
            Nuevo
          </Badge>
        )}
        
        {product.is_featured && (
          <Badge bg="warning" text="dark">
            Destacado
          </Badge>
        )}
      </div>
      
      {/* Imagen del producto */}
      <Link to={`/products/${product.id}`}>
        <Card.Img 
          variant="top" 
          src={product.image_url || 'https://via.placeholder.com/300x300?text=FERREMAS'} 
          alt={product.name}
          className="product-card-img"
        />
      </Link>
      
      <Card.Body className="d-flex flex-column">
        {/* Categoría */}
        <small className="text-muted mb-1">
          {product.category}
          {product.subcategory && ` > ${product.subcategory}`}
        </small>
        
        {/* Nombre del producto */}
        <Card.Title as="h5" className="mb-1">
          <Link 
            to={`/products/${product.id}`} 
            className="text-decoration-none text-dark"
          >
            {product.name}
          </Link>
        </Card.Title>
        
        {/* Marca */}
        <small className="text-muted mb-2">
          {product.brand}
        </small>
        
        {/* Precios - Ahora con CurrencyDisplay */}
        <div className="mb-3">
          {hasDiscount ? (
            <>
              <span className="product-card-price me-2">
                <CurrencyDisplay amount={discountedPrice} originalCurrency="CLP" />
              </span>
              <span className="product-card-original-price text-muted text-decoration-line-through">
                <CurrencyDisplay amount={product.price} originalCurrency="CLP" />
              </span>
            </>
          ) : (
            <span className="product-card-price">
              <CurrencyDisplay amount={product.price} originalCurrency="CLP" />
            </span>
          )}
        </div>
        
        {/* Botón de compra */}
        <Button 
          variant="primary" 
          className="mt-auto w-100"
          onClick={handleAddToCart}
        >
          Agregar al carrito
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;