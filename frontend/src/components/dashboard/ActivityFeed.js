import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatOrderStatus } from '../../utils/formatUtils';

/**
 * Componente que muestra feed de actividad reciente para el dashboard.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.activities - Lista de actividades recientes
 * @param {boolean} props.loading - Indica si está cargando
 * @returns {React.ReactNode} - Feed de actividad
 */
const ActivityFeed = ({ activities = [], loading = false }) => {
  // Obtener icono según tipo de actividad
  const getActivityIcon = (type) => {
    switch (type) {
      case 'order_created':
        return <i className="bi bi-bag-plus text-primary"></i>;
      case 'order_status':
        return <i className="bi bi-arrow-repeat text-info"></i>;
      case 'order_cancelled':
        return <i className="bi bi-x-circle text-danger"></i>;
      case 'payment_completed':
        return <i className="bi bi-credit-card text-success"></i>;
      case 'payment_failed':
        return <i className="bi bi-exclamation-triangle text-warning"></i>;
      case 'stock_low':
        return <i className="bi bi-archive text-warning"></i>;
      case 'stock_updated':
        return <i className="bi bi-box-seam text-primary"></i>;
      case 'user_registered':
        return <i className="bi bi-person-plus text-success"></i>;
      default:
        return <i className="bi bi-bell text-secondary"></i>;
    }
  };
  
  // Mostrar placeholder si está cargando
  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header bg-light">
          <h5 className="mb-0">Actividad Reciente</h5>
        </div>
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
  
  // Si no hay actividades, mostrar mensaje
  if (!activities || activities.length === 0) {
    return (
      <div className="card h-100">
        <div className="card-header bg-light">
          <h5 className="mb-0">Actividad Reciente</h5>
        </div>
        <div className="card-body d-flex justify-content-center align-items-center">
          <div className="text-center text-muted">
            <i className="bi bi-clock-history fs-1"></i>
            <p className="mt-2">No hay actividad reciente.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card h-100">
      <div className="card-header bg-light">
        <h5 className="mb-0">Actividad Reciente</h5>
      </div>
      <div className="card-body p-0">
        <div className="list-group list-group-flush">
          {activities.map((activity, index) => {
            // Preparar datos según el tipo de actividad
            let title = '';
            let description = '';
            let linkTo = '';
            
            switch (activity.type) {
              case 'order_created':
                title = 'Nuevo Pedido';
                description = `Pedido #${activity.order_number} creado por ${activity.user_name || 'Cliente'}`;
                linkTo = `/orders/${activity.order_id}`;
                break;
              case 'order_status':
                title = 'Cambio de Estado';
                description = `Pedido #${activity.order_number} cambió de ${formatOrderStatus(activity.old_status).text} a ${formatOrderStatus(activity.new_status).text}`;
                linkTo = `/orders/${activity.order_id}`;
                break;
              case 'order_cancelled':
                title = 'Pedido Cancelado';
                description = `Pedido #${activity.order_number} cancelado: ${activity.notes || 'Sin motivo especificado'}`;
                linkTo = `/orders/${activity.order_id}`;
                break;
              case 'payment_completed':
                title = 'Pago Completado';
                description = `Pago recibido por $${activity.amount.toLocaleString()} para pedido #${activity.order_number}`;
                linkTo = `/orders/${activity.order_id}`;
                break;
              case 'stock_low':
                title = 'Stock Bajo';
                description = `${activity.product_name} está bajo el stock mínimo en ${activity.branch_name}`;
                linkTo = `/stock?product_id=${activity.product_id}`;
                break;
              case 'user_registered':
                title = 'Nuevo Usuario';
                description = `${activity.user_name} se ha registrado en el sistema`;
                linkTo = activity.user_id ? `/users/${activity.user_id}` : '';
                break;
              default:
                title = 'Actividad';
                description = activity.description || 'Sin descripción';
                break;
            }
            
            return (
              <Link 
                key={index} 
                to={linkTo || '#'} 
                className="list-group-item list-group-item-action"
                onClick={(e) => !linkTo && e.preventDefault()}
              >
                <div className="d-flex">
                  <div className="activity-icon me-3">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{title}</h6>
                      <small className="text-muted">
                        {formatDate(activity.timestamp, true)}
                      </small>
                    </div>
                    <p className="mb-0 text-secondary">
                      {description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="card-footer bg-white text-center">
        <button className="btn btn-sm btn-outline-primary">
          Ver Más Actividad
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;