import React, { useEffect, useRef } from 'react';
import { ORDER_STATUS } from '../../config';
import './OrderStatusTracker.css';

/**
 * Componente para visualizar el seguimiento del estado de una orden.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.status - Estado actual de la orden
 * @returns {React.ReactNode} - Visualización del seguimiento de estado
 */
const OrderStatusTracker = ({ status }) => {
  const trackerRef = useRef(null);
  
  // Estados de seguimiento predefinidos
  const trackingSteps = [
    { key: ORDER_STATUS.PENDING, label: 'Pendiente', icon: 'bi-clock' },
    { key: ORDER_STATUS.APPROVED, label: 'Aprobado', icon: 'bi-check-circle' },
    { key: ORDER_STATUS.PREPARING, label: 'En Preparación', icon: 'bi-box' },
    { key: ORDER_STATUS.READY, label: 'Listo', icon: 'bi-check2-all' },
    { key: ORDER_STATUS.DELIVERED, label: 'Entregado', icon: 'bi-truck' }
  ];
  
  // Estados especiales (cancelado, rechazado, enviado)
  const specialStatuses = {
    [ORDER_STATUS.CANCELLED]: { label: 'Cancelado', icon: 'bi-x-circle' },
    [ORDER_STATUS.REJECTED]: { label: 'Rechazado', icon: 'bi-x-circle' },
    [ORDER_STATUS.SHIPPED]: { label: 'Enviado', icon: 'bi-truck' }
  };
  
  // Obtener índice del estado actual
  const getCurrentStepIndex = () => {
    if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REJECTED) {
      return -1; // Estados especiales no tienen índice
    }
    
    // Si es estado de envío, considerarlo como "listo"
    if (status === ORDER_STATUS.SHIPPED) {
      return trackingSteps.findIndex(step => step.key === ORDER_STATUS.READY);
    }
    
    return trackingSteps.findIndex(step => step.key === status);
  };
  
  // Establecer ancho de la línea de progreso
  useEffect(() => {
    if (!trackerRef.current) return;
    
    const currentIndex = getCurrentStepIndex();
    
    // Si es un estado especial (cancelado o rechazado), no mostrar progreso
    if (currentIndex === -1) {
      trackerRef.current.style.setProperty('--progress-height', '0%');
      return;
    }
    
    // Calcular el porcentaje de progreso
    const stepCount = trackingSteps.length - 1;
    const progressPercent = currentIndex >= stepCount 
      ? 100 
      : (currentIndex / stepCount) * 100;
    
    // Aplicar estilo CSS
    if (window.innerWidth <= 768) {
      // Vista móvil (vertical)
      trackerRef.current.style.setProperty('--progress-height', `${progressPercent}%`);
    } else {
      // Vista desktop (horizontal)
      trackerRef.current.style.setProperty('width', `${progressPercent}%`);
    }
  }, [status]);
  
  // Función para determinar la clase de cada paso
  const getStepClass = (stepKey) => {
    // Si es un estado especial (cancelado o rechazado)
    if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REJECTED) {
      return stepKey === ORDER_STATUS.PENDING ? 'completed' : '';
    }
    
    // Si es estado de envío, considerarlo como "listo" y "activo"
    if (status === ORDER_STATUS.SHIPPED && stepKey === ORDER_STATUS.READY) {
      return 'completed active';
    }
    
    const currentIndex = trackingSteps.findIndex(step => step.key === status);
    const stepIndex = trackingSteps.findIndex(step => step.key === stepKey);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return '';
  };
  
  // Si es un estado especial (cancelado o rechazado), mostrar una versión modificada
  if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.REJECTED) {
    const specialStatus = specialStatuses[status];
    
    return (
      <div className="order-status-tracker" ref={trackerRef}>
        {/* Primer paso: Pendiente */}
        <div className="status-step completed">
          <div className="status-circle">
            <i className="bi bi-clock"></i>
          </div>
          <div className="status-text">Pendiente</div>
        </div>
        
        {/* Estado especial: Cancelado o Rechazado */}
        <div className={`status-step ${status === ORDER_STATUS.CANCELLED ? 'cancelled' : 'rejected'}`}>
          <div className="status-circle">
            <i className={specialStatus.icon}></i>
          </div>
          <div className="status-text">{specialStatus.label}</div>
        </div>
        
        {/* Mostrar pasos restantes deshabilitados */}
        {trackingSteps.slice(1).map((step) => (
          <div className="status-step" key={step.key}>
            <div className="status-circle">
              <i className={step.icon}></i>
            </div>
            <div className="status-text">{step.label}</div>
          </div>
        ))}
      </div>
    );
  }
  
  // Si es estado de envío, mostrarlo como un paso adicional entre listo y entregado
  if (status === ORDER_STATUS.SHIPPED) {
    const shippedIndex = trackingSteps.findIndex(step => step.key === ORDER_STATUS.READY) + 0.5;
    const shippedStep = specialStatuses[ORDER_STATUS.SHIPPED];
    
    const modifiedSteps = [...trackingSteps];
    modifiedSteps.splice(shippedIndex, 0, { 
      key: ORDER_STATUS.SHIPPED, 
      label: shippedStep.label, 
      icon: shippedStep.icon 
    });
    
    return (
      <div className="order-status-tracker" ref={trackerRef}>
        {modifiedSteps.map((step, index) => {
          // Determinar la clase para cada paso
          let stepClass = '';
          
          if (step.key === ORDER_STATUS.SHIPPED) {
            stepClass = 'active';
          } else if (index < shippedIndex) {
            stepClass = 'completed';
          }
          
          return (
            <div className={`status-step ${stepClass}`} key={step.key}>
              <div className="status-circle">
                <i className={`bi ${step.icon}`}></i>
              </div>
              <div className="status-text">{step.label}</div>
            </div>
          );
        })}
      </div>
    );
  }
  
  // Visualización normal
  return (
    <div className="order-status-tracker" ref={trackerRef}>
      {trackingSteps.map((step) => (
        <div className={`status-step ${getStepClass(step.key)}`} key={step.key}>
          <div className="status-circle">
            <i className={`bi ${step.icon}`}></i>
          </div>
          <div className="status-text">{step.label}</div>
        </div>
      ))}
    </div>
  );
};

export default OrderStatusTracker;