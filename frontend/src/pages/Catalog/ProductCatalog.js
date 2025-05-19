import React, { useEffect, useState} from 'react';
import { Container, Row, Col, Pagination, Form, Toast, ToastContainer } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import ProductGrid from '../../components/products/ProductGrid';
import ProductFilter from '../../components/products/ProductFilter';
import { 
  fetchProducts, 
  selectProducts, 
  selectPagination, 
  selectIsLoading, 
  selectError,
  selectFilters,
  setFilters
} from '../../store/product.slice';

const ProductCatalog = () => {

  const defaultPagination = {
    page: 1,
    pages: 1,
    total: 0,
    per_page: 12,
    has_next: false,
    has_prev: false,
  };

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  const products = useSelector(selectProducts);
  const pagination = useSelector(selectPagination) || defaultPagination;
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const filters = useSelector(selectFilters);
  const lastAddedItem = useSelector((state) => state.cart.lastAddedItem);
  const [showToast, setShowToast] = useState(false);

  // Parsear parámetros de URL para filtros iniciales
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlFilters = {};
    
    // Extraer filtros de la URL
    if (params.has('category')) urlFilters.category = params.get('category');
    if (params.has('search')) urlFilters.search = params.get('search');
    if (params.has('min_price')) urlFilters.min_price = parseInt(params.get('min_price'));
    if (params.has('max_price')) urlFilters.max_price = parseInt(params.get('max_price'));
    if (params.has('brand')) urlFilters.brand = params.get('brand');
    if (params.has('featured')) urlFilters.featured = params.get('featured') === 'true';
    if (params.has('new')) urlFilters.new = params.get('new') === 'true';
    if (params.has('page')) urlFilters.page = parseInt(params.get('page'));
    
    // Aplicar filtros de URL si existen
    if (Object.keys(urlFilters).length > 0) {
      dispatch(setFilters(urlFilters));
    }
  }, [location.search, dispatch]);
  
  // Cargar productos cuando cambian los filtros
  useEffect(() => {
    dispatch(fetchProducts({ 
      page: pagination.page, 
      filters 
    }));
    
    // Actualizar URL con los filtros
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== '' && key !== 'page') {
        params.append(key, value);
      }
    });
    
    // Añadir página si es diferente de 1
    if (pagination.page && pagination.page !== 1) {
      params.append('page', pagination.page);
    }
    
    // Actualizar URL sin recargar la página
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    navigate(`/products${newUrl}`, { replace: true });
    
  }, [filters, pagination.page, dispatch, navigate]);
  
  useEffect(() => {
  if (lastAddedItem) {
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 2000);
    return () => clearTimeout(timer);
  }
  }, [lastAddedItem]);


  // Manejar cambio de página
  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };
  
  // Manejar cambio en items por página
  const handlePerPageChange = (e) => {
    dispatch(setFilters({ 
      per_page: parseInt(e.target.value),
      page: 1 // Resetear a primera página
    }));
  };
  
  // Renderizar paginación
  const renderPagination = () => {
    const { page, pages } = pagination;
    
    // No mostrar si solo hay una página
    if (pages <= 1) return null;
    
    // Crear items de paginación
    const items = [];
    
    // Primera página
    items.push(
      <Pagination.First 
        key="first" 
        onClick={() => handlePageChange(1)}
        disabled={page === 1}
      />
    );
    
    // Página anterior
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      />
    );
    
    // Mostrar un máximo de 5 páginas centradas alrededor de la página actual
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(pages, page + 2);
    
    // Añadir elipsis inicial si necesario
    if (startPage > 1) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }
    
    // Añadir páginas numeradas
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // Añadir elipsis final si necesario
    if (endPage < pages) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }
    
    // Página siguiente
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(page + 1)}
        disabled={page === pages}
      />
    );
    
    // Última página
    items.push(
      <Pagination.Last 
        key="last" 
        onClick={() => handlePageChange(pages)}
        disabled={page === pages}
      />
    );
    
    return (
      <Pagination className="justify-content-center mt-4">
        {items}
      </Pagination>
    );
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Catálogo de productos</h1>
      
      <Row>
        {/* Filtros */}
        <Col lg={3} md={4} className="mb-4">
          <ProductFilter />
        </Col>
        
        {/* Productos */}
        <Col lg={9} md={8}>
          {/* Controles de visualización */}
          <Row className="mb-3 align-items-center">
            <Col>
              <p className="mb-0">
                {!isLoading && products.length > 0 ? (
                  <>Mostrando {products.length} de {pagination.total} productos</>
                ) : (
                  <>Productos</>
                )}
              </p>
            </Col>
            
            <Col xs="auto">
              <Form.Group className="d-flex align-items-center">
                <Form.Label className="me-2 mb-0">
                  Mostrar:
                </Form.Label>
                <Form.Select 
                  size="sm"
                  value={pagination.per_page}
                  onChange={handlePerPageChange}
                >
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          {/* Cuadrícula de productos */}
          <ProductGrid 
            products={products} 
            isLoading={isLoading} 
            error={error}
          />
          
          {/* Paginación */}
          {renderPagination()}
        </Col>
      </Row>              
        <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={2000} autohide bg="success">
          <Toast.Body className="text-white">
            {lastAddedItem ? `"${lastAddedItem.name}" añadido al carrito` : 'Producto añadido al carrito'}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default ProductCatalog;