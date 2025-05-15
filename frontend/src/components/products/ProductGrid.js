import React from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, isLoading, error }) => {
  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando productos...</span>
        </Spinner>
        <p className="mt-3">Cargando productos...</p>
      </div>
    );
  }
  
  // Si hay un error, mostrar mensaje de error
  if (error) {
    return (
      <Alert variant="danger" className="my-3">
        <Alert.Heading>Error al cargar productos</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }
  
  // Si no hay productos, mostrar mensaje
  if (!products || products.length === 0) {
    return (
      <Alert variant="info" className="my-3">
        <p className="mb-0">No se encontraron productos con los filtros seleccionados.</p>
      </Alert>
    );
  }
  
  // Renderizar la cuadrícula de productos
  return (
    <Row>
      {products.map(product => (
        <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid;