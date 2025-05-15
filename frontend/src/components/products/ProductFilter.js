import React, { useState, useEffect } from 'react';
import { Form, Button, Accordion, Row, Col, RangeSlider, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setFilters, 
  clearFilters, 
  selectFilters, 
  fetchCategories,
  selectCategories
} from '../../store/product.slice';

const ProductFilter = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const categories = useSelector(selectCategories);
  
  // Estado local para los filtros que se aplicarán al hacer clic en "Aplicar filtros"
  const [localFilters, setLocalFilters] = useState({ ...filters });
  
  // Estado adicional para el rango de precios
  const [priceRange, setPriceRange] = useState([
    localFilters.min_price || 0,
    localFilters.max_price || 100000
  ]);
  
  // Cargar categorías al montar el componente
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  // Actualizar estado local cuando cambian los filtros globales
  useEffect(() => {
    setLocalFilters({ ...filters });
    setPriceRange([
      filters.min_price || 0,
      filters.max_price || 100000
    ]);
  }, [filters]);
  
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Para checkbox usamos el valor checked
    if (type === 'checkbox') {
      setLocalFilters({
        ...localFilters,
        [name]: checked
      });
    } else {
      setLocalFilters({
        ...localFilters,
        [name]: value || null // Convertir cadenas vacías a null
      });
    }
  };
  
  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
    setLocalFilters({
      ...localFilters,
      min_price: newRange[0],
      max_price: newRange[1]
    });
  };
  
  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
  };
  
  const handleClearFilters = () => {
    dispatch(clearFilters());
  };
  
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };
  
  // Verificar si hay filtros activos
  const hasActiveFilters = () => {
    return Object.keys(filters).some(key => 
      filters[key] !== null && 
      filters[key] !== '' && 
      key !== 'page'
    );
  };
  
  return (
    <div className="catalog-filters">
      <h5 className="mb-3">Filtros</h5>
      
      {/* Filtros activos */}
      {hasActiveFilters() && (
        <div className="mb-3">
          <small className="text-muted d-block mb-2">Filtros activos:</small>
          <div className="d-flex flex-wrap">
            {filters.category && (
              <Badge bg="light" text="dark" className="me-1 mb-1">
                Categoría: {filters.category}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 ms-1"
                  onClick={() => dispatch(setFilters({ category: null }))}
                >
                  &times;
                </Button>
              </Badge>
            )}
            
            {filters.search && (
              <Badge bg="light" text="dark" className="me-1 mb-1">
                Búsqueda: {filters.search}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 ms-1"
                  onClick={() => dispatch(setFilters({ search: '' }))}
                >
                  &times;
                </Button>
              </Badge>
            )}
            
            {(filters.min_price || filters.max_price) && (
              <Badge bg="light" text="dark" className="me-1 mb-1">
                Precio: {formatPrice(filters.min_price || 0)} - {formatPrice(filters.max_price || 100000)}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 ms-1"
                  onClick={() => dispatch(setFilters({ min_price: null, max_price: null }))}
                >
                  &times;
                </Button>
              </Badge>
            )}
            
            <Button
              variant="outline-secondary"
              size="sm"
              className="mb-1"
              onClick={handleClearFilters}
            >
              Limpiar todos
            </Button>
          </div>
        </div>
      )}
      
      <Accordion defaultActiveKey="0">
        {/* Búsqueda */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>Búsqueda</Accordion.Header>
          <Accordion.Body>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Buscar productos..."
                name="search"
                value={localFilters.search || ''}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
        
        {/* Categorías */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Categorías</Accordion.Header>
          <Accordion.Body>
            <Form.Group className="mb-3">
              <Form.Select 
                name="category"
                value={localFilters.category || ''}
                onChange={handleFilterChange}
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option 
                    key={category.id} 
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
        
        {/* Rango de precios */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Rango de precios</Accordion.Header>
          <Accordion.Body>
            <Form.Group className="mb-3">
              <Row>
                <Col xs={6}>
                  <small>Mínimo: {formatPrice(priceRange[0])}</small>
                </Col>
                <Col xs={6} className="text-end">
                  <small>Máximo: {formatPrice(priceRange[1])}</small>
                </Col>
              </Row>
              <Form.Range
                min={0}
                max={100000}
                step={1000}
                value={priceRange[0]}
                onChange={(e) => handlePriceChange([parseInt(e.target.value), priceRange[1]])}
              />
              <Form.Range
                min={0}
                max={100000}
                step={1000}
                value={priceRange[1]}
                onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
              />
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
        
        {/* Filtros adicionales */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>Filtros adicionales</Accordion.Header>
          <Accordion.Body>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Productos destacados"
                name="featured"
                checked={localFilters.featured || false}
                onChange={handleFilterChange}
              />
              <Form.Check
                type="checkbox"
                label="Nuevos productos"
                name="new"
                checked={localFilters.new || false}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      
      <div className="d-grid gap-2 mt-3">
        <Button 
          variant="primary" 
          onClick={handleApplyFilters}
        >
          Aplicar filtros
        </Button>
        
        {hasActiveFilters() && (
          <Button 
            variant="outline-secondary" 
            onClick={handleClearFilters}
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductFilter;