import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../store/product.slice';

/**
 * Componente de filtros para el catálogo de productos.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.filters - Filtros actualmente aplicados
 * @param {Function} props.onFilterChange - Función para manejar cambios en los filtros
 * @returns {React.ReactNode} - Componente de filtro
 */
const ProductFilter = ({ filters, onFilterChange }) => {
  const dispatch = useDispatch();
  const categories = useSelector(state => state.products.categories);
  const [expanded, setExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [priceRange, setPriceRange] = useState({
    min: filters?.min_price || '',
    max: filters?.max_price || ''
  });
  
  // Rangos de precios predefinidos
  const priceRanges = [
    { label: 'Hasta $10.000', min: 0, max: 10000 },
    { label: '$10.000 - $30.000', min: 10000, max: 30000 },
    { label: '$30.000 - $50.000', min: 30000, max: 50000 },
    { label: '$50.000 - $100.000', min: 50000, max: 100000 },
    { label: 'Más de $100.000', min: 100000, max: null }
  ];
  
  // Cargar categorías al montar el componente
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  // Actualizar filtros locales cuando cambian los filtros externos
  useEffect(() => {
    setLocalFilters(filters || {});
    setPriceRange({
      min: filters?.min_price || '',
      max: filters?.max_price || ''
    });
  }, [filters]);
  
  // Manejar cambio en los filtros
  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    
    // Si se deselecciona una categoría, eliminar también la subcategoría
    if (key === 'category' && !value) {
      delete updatedFilters.subcategory;
    }
    
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };
  
  // Manejar cambio en el rango de precios
  const handlePriceRangeChange = (min, max) => {
    const updatedFilters = { ...localFilters };
    
    if (min !== null) {
      updatedFilters.min_price = min;
    } else {
      delete updatedFilters.min_price;
    }
    
    if (max !== null) {
      updatedFilters.max_price = max;
    } else {
      delete updatedFilters.max_price;
    }
    
    setPriceRange({ min: min || '', max: max || '' });
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };
  
  // Manejar cambio en input de rango de precios
  const handlePriceInputChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({ ...prev, [name]: value }));
  };
  
  // Aplicar rango de precios personalizado
  const applyCustomPriceRange = () => {
    const min = priceRange.min !== '' ? parseInt(priceRange.min, 10) : null;
    const max = priceRange.max !== '' ? parseInt(priceRange.max, 10) : null;
    
    if ((min !== null && isNaN(min)) || (max !== null && isNaN(max))) {
      return; // No aplicar si hay valores inválidos
    }
    
    handlePriceRangeChange(min, max);
  };
  
  // Manejar colapso/expansión del filtro en móvil
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setLocalFilters({});
    setPriceRange({ min: '', max: '' });
    onFilterChange({});
  };
  
  return (
    <div className="card mb-4">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Filtros</h5>
        <button 
          className="btn btn-sm btn-link d-lg-none"
          onClick={toggleExpanded}
          aria-expanded={expanded}
        >
          <i className={`bi ${expanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
      </div>
      
      <div className={`card-body ${expanded ? '' : 'd-none d-lg-block'}`}>
        {/* Botón para limpiar filtros */}
        {Object.keys(localFilters).length > 0 && (
          <div className="mb-3">
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={clearAllFilters}
            >
              <i className="bi bi-x-circle me-1"></i>
              Limpiar Filtros
            </button>
          </div>
        )}
        
        {/* Filtro por categoría */}
        <div className="mb-4">
          <h6 className="mb-3">Categorías</h6>
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="radio"
              name="category"
              id="category-all"
              checked={!localFilters.category}
              onChange={() => handleFilterChange('category', '')}
            />
            <label className="form-check-label" htmlFor="category-all">
              Todas las categorías
            </label>
          </div>
          
          {categories.map(category => (
            <div className="form-check mb-2" key={category.id}>
              <input
                className="form-check-input"
                type="radio"
                name="category"
                id={`category-${category.id}`}
                checked={localFilters.category === category.id}
                onChange={() => handleFilterChange('category', category.id)}
              />
              <label className="form-check-label" htmlFor={`category-${category.id}`}>
                {category.name}
              </label>
            </div>
          ))}
        </div>
        
        {/* Filtro por precio */}
        <div className="mb-4">
          <h6 className="mb-3">Precio</h6>
          
          {/* Rangos predefinidos */}
          {priceRanges.map((range, index) => (
            <div className="form-check mb-2" key={index}>
              <input
                className="form-check-input"
                type="radio"
                name="priceRange"
                id={`price-range-${index}`}
                checked={
                  localFilters.min_price === range.min && 
                  (localFilters.max_price === range.max || 
                   (range.max === null && !localFilters.max_price))
                }
                onChange={() => handlePriceRangeChange(range.min, range.max)}
              />
              <label className="form-check-label" htmlFor={`price-range-${index}`}>
                {range.label}
              </label>
            </div>
          ))}
          
          {/* Rango personalizado */}
          <div className="mt-3">
            <p className="mb-2">Rango personalizado:</p>
            <div className="row g-2">
              <div className="col-6">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Mínimo"
                  name="min"
                  value={priceRange.min}
                  onChange={handlePriceInputChange}
                  min="0"
                />
              </div>
              <div className="col-6">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Máximo"
                  name="max"
                  value={priceRange.max}
                  onChange={handlePriceInputChange}
                  min="0"
                />
              </div>
            </div>
            <button 
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={applyCustomPriceRange}
            >
              Aplicar
            </button>
          </div>
        </div>
        
        {/* Filtro por estado (nuevo, destacado) */}
        <div className="mb-4">
          <h6 className="mb-3">Estado</h6>
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="new-products"
              checked={localFilters.new === true}
              onChange={() => handleFilterChange('new', !localFilters.new)}
            />
            <label className="form-check-label" htmlFor="new-products">
              Productos Nuevos
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="featured-products"
              checked={localFilters.featured === true}
              onChange={() => handleFilterChange('featured', !localFilters.featured)}
            />
            <label className="form-check-label" htmlFor="featured-products">
              Productos Destacados
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;