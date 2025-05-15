import React, { useEffect, useState } from 'react';
import { Nav, Accordion, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  selectCategories,
  selectIsLoading
} from '../../store/product.slice';

const CategoryNav = ({ vertical = false, showAll = true }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const categories = useSelector(selectCategories);
  const isLoading = useSelector(selectIsLoading);
  const [activeCategory, setActiveCategory] = useState(null);

  // Cargar categorías cuando se monta el componente
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Agrupar categorías por subcategorías (simulado)
  // En una implementación real, esto vendría del backend ya estructurado
  const subcategories = {
    'MANUAL_TOOLS': ['Martillos', 'Destornilladores', 'Llaves', 'Alicates'],
    'POWER_TOOLS': ['Taladros', 'Sierras', 'Lijadoras', 'Fresadoras'],
    'CONSTRUCTION_MATERIALS': ['Cemento', 'Arena', 'Ladrillos', 'Madera'],
    'FINISHES': ['Pinturas', 'Barnices', 'Cerámicos', 'Revestimientos'],
    'SAFETY_EQUIPMENT': ['Cascos', 'Guantes', 'Lentes', 'Arneses']
  };

  // Detectar categoría activa a partir de la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    setActiveCategory(categoryParam);
  }, [location.search]);

  // Si está cargando, mostrar un esqueleto
  if (isLoading) {
    return (
      <div className={`category-nav ${vertical ? 'category-nav-vertical' : ''}`}>
        {Array(5).fill(0).map((_, index) => (
          <div key={index} className="skeleton-item my-2" style={{ height: '24px', width: '80%' }}></div>
        ))}
      </div>
    );
  }

  // Si no hay categorías, mostrar mensaje
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center p-3 bg-light rounded">
        No hay categorías disponibles
      </div>
    );
  }

  // Renderizar barra de navegación vertical
  if (vertical) {
    return (
      <div className="category-nav-vertical">
        <h5 className="mb-3">Categorías</h5>
        
        {showAll && (
          <Nav.Link 
            as={Link} 
            to="/products" 
            className={`${!activeCategory ? 'active font-weight-bold' : ''}`}
            active={!activeCategory}
          >
            Todas las categorías
          </Nav.Link>
        )}
        
        <Accordion defaultActiveKey={activeCategory || ''} alwaysOpen>
          {categories.map(category => (
            <Accordion.Item key={category.id} eventKey={category.id}>
              <Accordion.Header>
                <Nav.Link 
                  as={Link} 
                  to={`/products?category=${category.id}`}
                  className={`p-0 ${activeCategory === category.id ? 'active font-weight-bold' : ''}`}
                  onClick={(e) => e.stopPropagation()}
                  active={activeCategory === category.id}
                >
                  {category.name}
                </Nav.Link>
              </Accordion.Header>
              <Accordion.Body className="p-0">
                <Nav className="flex-column">
                  {subcategories[category.id]?.map(sub => (
                    <Nav.Link 
                      key={sub} 
                      as={Link} 
                      to={`/products?category=${category.id}&subcategory=${sub}`}
                      className="ps-4 py-2"
                    >
                      {sub}
                    </Nav.Link>
                  ))}
                </Nav>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    );
  }

  // Renderizar barra de navegación horizontal
  return (
    <div className="category-nav mb-4">
      <Nav className="justify-content-center category-nav-horizontal">
        {showAll && (
          <Nav.Item>
            <Nav.Link 
              as={Link} 
              to="/products"
              active={!activeCategory}
            >
              Todas
            </Nav.Link>
          </Nav.Item>
        )}
        
        {categories.map(category => (
          <Nav.Item key={category.id}>
            <Nav.Link 
              as={Link} 
              to={`/products?category=${category.id}`}
              active={activeCategory === category.id}
            >
              {category.name}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
};

export default CategoryNav;