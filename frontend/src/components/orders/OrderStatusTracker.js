import React from 'react';
import { Row, Col } from 'react-bootstrap';
import './OrderStatusTracker.css'; // Este archivo lo crearemos después

// Definir la secuencia de estados de un pedido
const orderStatuses = [
  { 
    key: 'pendiente', 
    label: 'Pendiente', 
    icon: 'bi-hourglass-split',
    description: 'Pedido recibido y pendiente de aprobación'
  },
  { 
    key: 'aprobado', 
    label: 'Aprobado', 
    icon: 'bi-check-circle',
    description: 'Pedido confirmado y validado'
  },
  { 
    key: 'en preparación', 
    label: 'En preparación', 
    icon: 'bi-box-seam',
    description: 'Productos siendo preparados para envío'
  },
  { 
    key: 'listo para entrega', 
    label: 'Listo', 
    icon: 'bi-archive',
    description: 'Pedido empaquetado y listo para envío'
  },
  { 
    key: 'enviado', 
    label: 'Enviado', 
    icon: 'bi-truck',
    description: 'Pedido en ruta de entrega'
  },
  { 
    key: 'entregado', 
    label: 'Entregado', 
    icon: 'bi-house-check',
    description: 'Pedido entregado con éxito'
  }
];

// Estados que no siguen la secuencia normal
const specialStatuses = {
  'rechazado': { 
    label: 'Rechazado', 
    icon: 'bi-x-circle', 
    className: 'rejected',
    description: 'Pedido rechazado'
  },
  'cancelado': { 
    label: 'Cancelado', 
    icon: 'bi-slash-circle', 
    className: 'cancelled',
    description: 'Pedido cancelado'
  }
};

const OrderStatusTracker = ({ 
  currentStatus, 
  statusHistory = [],
  showLabels = true,
  showDates = true
}) => {
  // Si es un estado especial (rechazado o cancelado), mostrar indicador especial
  if (specialStatuses[currentStatus]) {
    const specialStatus = specialStatuses[currentStatus];
    
    return (
      <div className={`order-status-special ${specialStatus.className}`}>
        <i className={`bi ${specialStatus.icon}`}></i>
        <div className="status-text">
          <div className="status-label">{specialStatus.label}</div>
          <div className="status-description">{specialStatus.description}</div>
          {statusHistory.length > 0 && showDates && (
            <div className="status-date">
              {new Date(statusHistory[statusHistory.length - 1].created_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Encontrar el índice del estado actual en la secuencia
  const currentStatusIndex = orderStatuses.findIndex(status => status.key === currentStatus);
  
  // Si el estado no está en la secuencia, mostrar mensaje de error
  if (currentStatusIndex === -1) {
    return <div>Estado desconocido: {currentStatus}</div>;
  }

  // Crear un mapa de fechas para cada estado basado en el historial
  const statusDates = {};
  statusHistory.forEach(history => {
    statusDates[history.new_status] = new Date(history.created_at);
  });

  return (
    <div className="order-status-tracker">
      <Row className="justify-content-between">
        {orderStatuses.map((status, index) => {
          // Determinar el estado de este paso
          let stepStatus = '';
          if (index < currentStatusIndex) {
            stepStatus = 'completed';
          } else if (index === currentStatusIndex) {
            stepStatus = 'current';
          } else {
            stepStatus = 'pending';
          }
          
          return (
            <Col key={status.key} className="text-center status-step">
              <div className={`status-icon ${stepStatus}`}>
                <i className={`bi ${status.icon}`}></i>
              </div>
              
              {/* Línea conectora (excepto el último elemento) */}
              {index < orderStatuses.length - 1 && (
                <div className={`status-line ${index < currentStatusIndex ? 'completed' : ''}`}></div>
              )}
              
              {showLabels && (
                <div className="status-info">
                  <div className="status-label">{status.label}</div>
                  {showDates && statusDates[status.key] && (
                    <div className="status-date">
                      {statusDates[status.key].toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default OrderStatusTracker;