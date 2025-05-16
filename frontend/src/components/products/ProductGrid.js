import React from 'react';
import ProductCard from './ProductCard';
import Loading from '../common/Loading';

/**
 * Componente que muestra una cuadrícula de productos.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.products - Lista de productos a mostrar
 * @param {boolean} props.loading - Indica si está cargando
 * @param {Object} props.pagination - Información de paginación
 * @param {Function} props.onPageChange - Función para cambiar de página
 * @returns {React.ReactNode} - Cuadrícula de productos
 */
const ProductGrid = ({ products, loading, pagination, onPageChange }) => {
  // Si está cargando, mostrar indicador de carga
  if (loading) {
    return <Loading message="Cargando productos..." />;
  }
  
  // Si no hay productos, mostrar mensaje
  if (!products || products.length === 0) {
    return (
      <div className="alert alert-info text-center p-5">
        <i className="bi bi-search fs-1 d-block mb-3"></i>
        <h4>No se encontraron productos</h4>
        <p className="mb-0">Intente con otros filtros o categorías.</p>
      </div>
    );
  }
  
  // Crear paginador
  const renderPagination = () => {
    if (!pagination || pagination.pages <= 1) return null;
    
    const { page, pages } = pagination;
    const pageItems = [];
    
    // Determinar qué páginas mostrar
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(pages, page + 2);
    
    // Ajustar para mostrar siempre 5 páginas si es posible
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(pages, startPage + 4);
      } else if (endPage === pages) {
        startPage = Math.max(1, endPage - 4);
      }
    }
    
    // Agregar primera página
    if (startPage > 1) {
      pageItems.push(
        <li className="page-item" key="first">
          <button className="page-link" onClick={() => onPageChange(1)}>
            1
          </button>
        </li>
      );
      
      // Agregar elipsis si hay más páginas antes
      if (startPage > 2) {
        pageItems.push(
          <li className="page-item disabled" key="ellipsis-start">
            <span className="page-link">...</span>
          </li>
        );
      }
    }
    
    // Agregar páginas intermedias
    for (let i = startPage; i <= endPage; i++) {
      pageItems.push(
        <li className={`page-item ${i === page ? 'active' : ''}`} key={i}>
          <button className="page-link" onClick={() => onPageChange(i)}>
            {i}
          </button>
        </li>
      );
    }
    
    // Agregar última página
    if (endPage < pages) {
      // Agregar elipsis si hay más páginas después
      if (endPage < pages - 1) {
        pageItems.push(
          <li className="page-item disabled" key="ellipsis-end">
            <span className="page-link">...</span>
          </li>
        );
      }
      
      pageItems.push(
        <li className="page-item" key="last">
          <button className="page-link" onClick={() => onPageChange(pages)}>
            {pages}
          </button>
        </li>
      );
    }
    
    return (
      <nav aria-label="Paginación de productos">
        <ul className="pagination justify-content-center">
          {/* Botón anterior */}
          <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>
          
          {/* Páginas */}
          {pageItems}
          
          {/* Botón siguiente */}
          <li className={`page-item ${page >= pages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };
  
  return (
    <div>
      {/* Cuadrícula de productos */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mb-4">
        {products.map(product => (
          <div className="col" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      {/* Paginación */}
      {renderPagination()}
    </div>
  );
};

export default ProductGrid;