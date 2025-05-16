import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../../store/product.slice';

/**
 * Componente para navegación por categorías de productos.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.activeCategory - Categoría actualmente seleccionada
 * @param {Function} props.onCategorySelect - Función para manejar selección de categoría
 * @returns {React.ReactNode} - Navegación de categorías
 */
const CategoryNav = ({ activeCategory, onCategorySelect }) => {
  const dispatch = useDispatch();
  const categories = useSelector(state => state.products.categories);
  const loading = useSelector(state => state.products.loading);
  
  // Cargar categorías al montar el componente
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  // Íconos para cada categoría
  const categoryIcons = {
    'Herramientas Manuales': 'bi-wrench',
    'Herramientas Eléctricas': 'bi-tools',
    'Materiales de Construcción': 'bi-bricks',
    'Acabados': 'bi-palette',
    'Equipos de Seguridad': 'bi-shield-check',
    'Tornillos y Anclajes': 'bi-screwdriver',
    'Fijaciones y Adhesivos': 'bi-bandaid',
    'Equipos de Medición': 'bi-rulers'
  };
  
  // Función para obtener ícono según categoría
  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || 'bi-box';
  };
  
  // Manejar clic en categoría
  const handleCategoryClick = (categoryId) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };
  
  // Si está cargando, mostrar placeholder
  if (loading && categories.length === 0) {
    return (
      <div className="card mb-4">
        <div className="card-body">
          <div className="placeholder-glow">
            <span className="placeholder col-12"></span>
            <span className="placeholder col-6"></span>
            <span className="placeholder col-8"></span>
            <span className="placeholder col-10"></span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">Categorías</h5>
      </div>
      <div className="card-body p-0">
        <div className="list-group list-group-flush">
          <Link 
            to="/products"
            className={`list-group-item list-group-item-action d-flex align-items-center ${!activeCategory ? 'active' : ''}`}
            onClick={() => handleCategoryClick('')}
          >
            <i className="bi bi-grid me-3"></i>
            <span>Todos los Productos</span>
          </Link>
          
          {categories.map(category => (
            <Link 
              key={category.id}
              to={`/products?category=${category.id}`}
              className={`list-group-item list-group-item-action d-flex align-items-center ${activeCategory === category.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick(category.id);
              }}
            >
              <i className={`${getCategoryIcon(category.name)} me-3`}></i>
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;