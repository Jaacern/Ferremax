import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ActivityFeed = ({ activities = [], limit = 10, showHeader = true, title = "Actividad reciente" }) => {
  const [displayActivities, setDisplayActivities] = useState([]);
  
  // Procesar actividades cuando cambian
  useEffect(() => {
    setDisplayActivities(activities.slice(0, limit));
  }, [activities, limit]);
  
  // Determinar icono según tipo de actividad
  const getActivityIcon = (type) => {
    switch (type) {
      case 'order_created':
        return <i className="bi bi-cart-plus text-success"></i>;
      case 'order_updated':
        return <i className="bi bi-cart-check text-primary"></i>;
      case 'order_cancelled':
        return <i className="bi bi-cart-x text-danger"></i>;
      case 'payment_received':
        return <i className="bi bi-credit-card text-success"></i>;
      case 'stock_updated':
        return <i className="bi bi-box-seam text-primary"></i>;
      case 'stock_alert':
        return <i className="bi bi-exclamation-triangle text-warning"></i>;
      case 'user_registered':
        return <i className="bi bi-person-plus text-info"></i>;
      case 'product_created':
        return <i className="bi bi-plus-circle text-success"></i>;
      case 'product_updated':
        return <i className="bi bi-pencil text-primary"></i>;
      default:
        return <i className="bi bi-activity text-secondary"></i>;
    }
  };
  
  // Formatear tiempo relativo (ej: "hace 5 minutos")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'hace menos de un minuto';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    }
    
    // Para fechas más antiguas, mostrar la fecha completa
    return date.toLocaleDateString();
  };
  
  // Determinar enlace según tipo de actividad
  const getActivityLink = (activity) => {
    switch (activity.type) {
      case 'order_created':
      case 'order_updated':
      case 'order_cancelled':
        return `/admin/orders/${activity.entity_id}`;
      case 'payment_received':
        return `/admin/payments/${activity.entity_id}`;
      case 'stock_updated':
      case 'stock_alert':
        return `/admin/stock?product_id=${activity.entity_id}`;
      case 'user_registered':
        return `/admin/users/${activity.entity_id}`;
      case 'product_created':
      case 'product_updated':
        return `/admin/products/${activity.entity_id}`;
      default:
        return '#';
    }
  };
  
  // Si no hay actividades, mostrar mensaje
  if (displayActivities.length === 0) {
    return (
      <Card className="h-100">
        {showHeader && <Card.Header as="h5">{title}</Card.Header>}
        <Card.Body className="text-center text-muted py-5">
          <i className="bi bi-calendar3 fs-1 mb-3 d-block"></i>
          <p>No hay actividad reciente para mostrar.</p>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className="h-100">
      {showHeader && <Card.Header as="h5">{title}</Card.Header>}
      <ListGroup variant="flush">
        {displayActivities.map((activity) => (
          <ListGroup.Item key={activity.id} className="d-flex align-items-start py-3">
            <div className="me-3 fs-4">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Link 
                  to={getActivityLink(activity)} 
                  className="fw-bold text-decoration-none"
                >
                  {activity.title}
                </Link>
                <small className="text-muted">
                  {formatRelativeTime(activity.timestamp)}
                </small>
              </div>
              <p className="mb-1 text-muted">{activity.description}</p>
              {activity.meta && activity.meta.status && (
                <Badge 
                  bg={
                    activity.meta.status === 'completed' ? 'success' :
                    activity.meta.status === 'pending' ? 'warning' :
                    activity.meta.status === 'cancelled' ? 'danger' : 'secondary'
                  }
                >
                  {activity.meta.status}
                </Badge>
              )}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
      {activities.length > limit && (
        <Card.Footer className="text-center">
          <Link to="/admin/activities" className="text-decoration-none">
            Ver todas las actividades
          </Link>
        </Card.Footer>
      )}
    </Card>
  );
};

export default ActivityFeed;