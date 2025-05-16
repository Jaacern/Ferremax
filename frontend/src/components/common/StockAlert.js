import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectStockNotification, clearStockNotification } from '../../store/stock.slice';

/**
 * Componente para mostrar alertas de stock en tiempo real.
 * Se muestra cuando hay notificaciones de stock bajo o agotado.
 */
const StockAlert = () => {
  const dispatch = useDispatch();
  const notification = useSelector(selectStockNotification);
  
  // Cerrar la notificación después de un tiempo
  useEffect(() => {
    let timeoutId;
    
    if (notification) {
      timeoutId = setTimeout(() => {
        dispatch(clearStockNotification());
      }, 10000); // 10 segundos
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [notification, dispatch]);
  
  // Si no hay notificación, no mostrar nada
  if (!notification) return null;
  
  // Determinar estilo según el estado del stock
  const isOutOfStock = notification.current_stock <= 0;
  const alertStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1050,
    maxWidth: '350px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  };
  
  return (
    <div 
      className={`alert ${isOutOfStock ? 'alert-danger' : 'alert-warning'} d-flex align-items-center`} 
      role="alert"
      style={alertStyle}
    >
      <div className="d-flex w-100 justify-content-between align-items-center">
        <div>
          <i className={`bi ${isOutOfStock ? 'bi-exclamation-triangle-fill' : 'bi-exclamation-circle'} me-2`}></i>
          <strong>{isOutOfStock ? 'Stock Agotado' : 'Stock Bajo'}</strong>
          <div className="mt-1">
            <span className="fw-bold">{notification.product_name}</span>
            <div>
              <small>
                <span className="fw-bold">Sucursal:</span> {notification.branch_name}
              </small>
            </div>
            <div>
              <small>
                <span className="fw-bold">Stock actual:</span> {notification.current_stock} unidades
                {!isOutOfStock && notification.min_stock && (
                  <> (Mínimo: {notification.min_stock})</>
                )}
              </small>
            </div>
          </div>
          <div className="mt-2">
            <Link 
              to={`/warehouse/stock?product_id=${notification.product_id}`} 
              className="btn btn-sm btn-outline-dark me-2"
            >
              Ver Detalle
            </Link>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => dispatch(clearStockNotification())}
            >
              Cerrar
            </button>
          </div>
        </div>
        <button 
          type="button" 
          className="btn-close ms-3" 
          onClick={() => dispatch(clearStockNotification())}
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
};

export default StockAlert;