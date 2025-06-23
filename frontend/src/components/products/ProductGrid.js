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
    console.error('ProductGrid - Error recibido:', error);
    return (
      <Alert variant="danger" className="my-3">
        <Alert.Heading>Error al cargar productos</Alert.Heading>
        <p><strong>Mensaje de error:</strong> {error}</p>
        <hr />
        <p className="mb-0">
          <strong>Posibles soluciones:</strong>
          <ul className="mb-0 mt-2">
            <li>Verifica que el servidor backend esté funcionando</li>
            <li>Revisa la consola del navegador para más detalles</li>
            <li>Intenta recargar la página</li>
            <li>Verifica tu conexión a internet</li>
          </ul>
        </p>
      </Alert>
    );
  }
  
  // Si no hay productos, mostrar mensaje
  if (!products || products.length === 0) {
    return (
      <Alert variant="info" className="my-3">
        <Alert.Heading>No se encontraron productos</Alert.Heading>
        <p className="mb-0">
          No se encontraron productos con los filtros seleccionados. 
          Intenta cambiar los filtros o buscar con términos diferentes.
        </p>
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