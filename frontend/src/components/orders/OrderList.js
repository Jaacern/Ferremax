import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatOrderNumber, formatOrderStatus } from '../../utils/formatUtils';
import { formatPrice } from '../../utils/formatUtils';

/**
 * Componente que muestra una lista de órdenes.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.orders - Lista de órdenes a mostrar
 * @param {boolean} props.loading - Indica si está cargando
 * @param {Object} props.pagination - Información de paginación
 * @param {Function} props.onPageChange - Función para cambiar de página
 * @param {boolean} props.showUser - Indica si mostrar información del usuario
 * @param {boolean} props.showBranch - Indica si mostrar información de la sucursal
 * @returns {React.ReactNode} - Lista de órdenes
 */
const OrderList = ({ 
  orders, 
  loading, 
  pagination, 
  onPageChange, 
  showUser = false,
  showBranch = false
}) => {
  // Renderizar estado de la orden con color
  const renderStatus = (status) => {
    const statusInfo = formatOrderStatus(status);
    return (
      <span className={`badge bg-${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };
  
  // Si está cargando, mostrar placeholder
  if (loading) {
    return (
      <div className="card">
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
  
  // Si no hay órdenes, mostrar mensaje
  if (!orders || orders.length === 0) {
    return (
      <div className="alert alert-info text-center p-5">
        <i className="bi bi-inbox fs-1 d-block mb-3"></i>
        <h4>No hay pedidos para mostrar</h4>
        <p className="mb-0">No se encontraron pedidos con los filtros seleccionados.</p>
      </div>
    );
  }
  
  // Crear paginador
  const renderPagination = () => {
    if (!pagination || pagination.pages <= 1) return null;
    
    return (
      <nav aria-label="Paginación de pedidos" className="mt-4">
        <ul className="pagination justify-content-center">
          {/* Botón anterior */}
          <li className={`page-item ${pagination.page <= 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>
          
          {/* Primera página */}
          {pagination.page > 3 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => onPageChange(1)}>1</button>
              </li>
              {pagination.page > 4 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}
          
          {/* Páginas anteriores */}
          {pagination.page > 1 && (
            <li className="page-item">
              <button className="page-link" onClick={() => onPageChange(pagination.page - 1)}>
                {pagination.page - 1}
              </button>
            </li>
          )}
          
          {/* Página actual */}
          <li className="page-item active">
            <span className="page-link">{pagination.page}</span>
          </li>
          
          {/* Páginas siguientes */}
          {pagination.page < pagination.pages && (
            <li className="page-item">
              <button className="page-link" onClick={() => onPageChange(pagination.page + 1)}>
                {pagination.page + 1}
              </button>
            </li>
          )}
          
          {/* Última página */}
          {pagination.page < pagination.pages - 2 && (
            <>
              {pagination.page < pagination.pages - 3 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item">
                <button className="page-link" onClick={() => onPageChange(pagination.pages)}>
                  {pagination.pages}
                </button>
              </li>
            </>
          )}
          
          {/* Botón siguiente */}
          <li className={`page-item ${pagination.page >= pagination.pages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };
  
  return (
    <div className="card">
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">Nº Pedido</th>
                <th scope="col">Fecha</th>
                {showUser && <th scope="col">Cliente</th>}
                {showBranch && <th scope="col">Sucursal</th>}
                <th scope="col">Estado</th>
                <th scope="col">Total</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{formatOrderNumber(order.order_number)}</td>
                  <td>{formatDate(order.created_at, true)}</td>
                  {showUser && (
                    <td>
                      {order.user ? (
                        <span>
                          {order.user.first_name && order.user.last_name 
                            ? `${order.user.first_name} ${order.user.last_name}`
                            : order.user.username}
                        </span>
                      ) : (
                        <span className="text-muted">- No disponible -</span>
                      )}
                    </td>
                  )}
                  {showBranch && (
                    <td>
                      {order.branch ? order.branch.name : 'N/A'}
                    </td>
                  )}
                  <td>{renderStatus(order.status)}</td>
                  <td>{formatPrice(order.final_amount)}</td>
                  <td>
                    <Link 
                      to={`/orders/${order.id}`} 
                      className="btn btn-sm btn-outline-primary"
                    >
                      Ver Detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {renderPagination()}
      </div>
    </div>
  );
};

export default OrderList;