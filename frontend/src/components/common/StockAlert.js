import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/auth.slice';
import notificationService from '../../services/notification.service';
import config from '../../config';

const StockAlert = () => {
  const [alerts, setAlerts] = useState([]);
  const [showToasts, setShowToasts] = useState({});
  const userRole = useSelector(selectUserRole);
  
  // Determinar si el usuario debe recibir alertas según su rol
  const shouldReceiveAlerts = ['admin', 'warehouse', 'vendor'].includes(userRole);
  
  useEffect(() => {
    // Solo configurar SSE si el usuario tiene un rol que debe recibir alertas
    if (!shouldReceiveAlerts) return;
    
    // Suscribirse a alertas de stock usando el servicio de notificaciones
    const unsubscribe = notificationService.subscribe('stock_alert', (data) => {
      try {
        // Generar ID único para la alerta
        const alertId = `stock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Añadir nueva alerta al inicio del array
        setAlerts(prevAlerts => [
          { id: alertId, data, timestamp: new Date() },
          ...prevAlerts
        ].slice(0, 10)); // Mantener solo las 10 alertas más recientes
        
        // Mostrar toast para esta alerta
        setShowToasts(prev => ({ ...prev, [alertId]: true }));
        
        // Ocultar toast automáticamente después de 8 segundos
        setTimeout(() => {
          setShowToasts(prev => ({ ...prev, [alertId]: false }));
        }, 8000);
      } catch (error) {
        console.error('Error al procesar alerta de stock:', error);
      }
    });
    
    // Limpiar al desmontar
    return () => {
      unsubscribe();
    };
  }, [shouldReceiveAlerts]);
  
  // Si el usuario no debe recibir alertas, no renderizar nada
  if (!shouldReceiveAlerts) return null;
  
  // Renderizar contenedor de toasts
  return (
    <ToastContainer className="p-3" position="bottom-end">
      {alerts.map(alert => (
        <Toast 
          key={alert.id}
          show={showToasts[alert.id] || false}
          onClose={() => setShowToasts(prev => ({ ...prev, [alert.id]: false }))}
          delay={8000}
          autohide
        >
          <Toast.Header closeButton={true}>
            <Badge 
              bg={alert.data.current_stock <= 0 ? 'danger' : 'warning'} 
              className="me-2"
            >
              {alert.data.current_stock <= 0 ? 'Agotado' : 'Stock bajo'}
            </Badge>
            <strong className="me-auto">Alerta de stock</strong>
            <small className="text-muted">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </small>
          </Toast.Header>
          <Toast.Body>
            <p className="mb-1"><strong>{alert.data.product_name}</strong></p>
            <p className="mb-0">
              Sucursal: {alert.data.branch_name}<br />
              Stock actual: {alert.data.current_stock} unidades<br />
              {alert.data.min_stock && `Stock mínimo: ${alert.data.min_stock} unidades`}
            </p>
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default StockAlert;