import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  updateOrderStatus, 
  cancelOrder,
  selectOrdersLoading
} from '../../store/order.slice';
import { initiatePayment } from '../../store/order.slice';
import { selectUserRole } from '../../store/auth.slice';
import { ROLES, ORDER_STATUS, PAYMENT_METHODS } from '../../config';
import { formatDate, formatPrice, formatOrderStatus } from '../../utils/formatUtils';
import OrderStatusTracker from './OrderStatusTracker';

/**
 * Componente que muestra los detalles de una orden.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.order - Datos de la orden
 * @param {Array} props.payments - Pagos asociados a la orden
 * @returns {React.ReactNode} - Detalle de orden
 */
const OrderDetail = ({ order, payments }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectOrdersLoading);
  const userRole = useSelector(selectUserRole);
  
  const [statusNotes, setStatusNotes] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS.BANK_TRANSFER);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  // Verificar si el usuario puede cancelar la orden
  const canCancelOrder = () => {
    // Solo se puede cancelar si está pendiente o aprobada
    const cancelableStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.APPROVED];
    
    // Cliente solo puede cancelar sus propias órdenes
    if (userRole === ROLES.CUSTOMER) {
      return cancelableStatuses.includes(order.status);
    }
    
    // Admin puede cancelar en más estados
    if (userRole === ROLES.ADMIN) {
      return [ORDER_STATUS.PENDING, ORDER_STATUS.APPROVED, ORDER_STATUS.PREPARING].includes(order.status);
    }
    
    return false;
  };
  
  // Verificar si se puede iniciar un pago
  const canInitiatePayment = () => {
    // Verificar si ya hay un pago completado
    const hasCompletedPayment = payments && payments.some(payment => 
      payment.status === 'completado'
    );
    
    // Solo se puede pagar si está pendiente o aprobada y no tiene pagos completados
    return [ORDER_STATUS.PENDING, ORDER_STATUS.APPROVED].includes(order.status) && 
           !hasCompletedPayment;
  };
  
  // Verificar si el usuario puede cambiar el estado de la orden
  const canChangeStatus = () => {
    if (userRole === ROLES.ADMIN) {
      return true;
    }
    
    if (userRole === ROLES.VENDOR) {
      return [ORDER_STATUS.PENDING, ORDER_STATUS.READY].includes(order.status);
    }
    
    if (userRole === ROLES.WAREHOUSE) {
      return [ORDER_STATUS.APPROVED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY].includes(order.status);
    }
    
    return false;
  };
  
  // Obtener estados disponibles según el rol y estado actual
  const getAvailableStatuses = () => {
    const currentStatus = order.status;
    
    if (userRole === ROLES.ADMIN) {
      // Admin puede cambiar a cualquier estado
      return Object.values(ORDER_STATUS).filter(status => 
        status !== currentStatus && status !== ORDER_STATUS.CANCELLED
      );
    }
    
    if (userRole === ROLES.VENDOR) {
      if (currentStatus === ORDER_STATUS.PENDING) {
        return [ORDER_STATUS.APPROVED, ORDER_STATUS.REJECTED];
      }
      if (currentStatus === ORDER_STATUS.READY) {
        return [ORDER_STATUS.DELIVERED];
      }
    }
    
    if (userRole === ROLES.WAREHOUSE) {
      if (currentStatus === ORDER_STATUS.APPROVED) {
        return [ORDER_STATUS.PREPARING];
      }
      if (currentStatus === ORDER_STATUS.PREPARING) {
        return [ORDER_STATUS.READY];
      }
      if (currentStatus === ORDER_STATUS.READY && order.delivery_method === 'despacho a domicilio') {
        return [ORDER_STATUS.SHIPPED];
      }
    }
    
    return [];
  };
  
  // Manejar cancelación de orden
  const handleCancelOrder = () => {
    dispatch(cancelOrder({ 
      orderId: order.id, 
      notes: cancelReason || 'Cancelado por el usuario'
    }));
    setShowCancelModal(false);
  };
  
  // Manejar cambio de estado
  const handleStatusChange = () => {
    if (!newStatus) return;
    
    dispatch(updateOrderStatus({ 
      orderId: order.id, 
      status: newStatus, 
      notes: statusNotes
    }));
    setShowStatusModal(false);
  };
  
  // Manejar inicio de pago
  const handleInitiatePayment = () => {
    dispatch(initiatePayment({
      orderId: order.id,
      paymentMethod: selectedPaymentMethod,
      currency: 'CLP',
      notes: 'Pago iniciado por el usuario'
    }));
    setShowPaymentModal(false);
  };
  
  return (
    <div className="card mb-4">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          Pedido #{order.order_number}
        </h5>
        <span className={`badge bg-${formatOrderStatus(order.status).color}`}>
          {formatOrderStatus(order.status).text}
        </span>
      </div>
      
      <div className="card-body">
        {/* Seguimiento de estado */}
        <OrderStatusTracker status={order.status} />
        
        <div className="row mt-4">
          {/* Información general */}
          <div className="col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Información General</h6>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between">
                <span>Fecha de Pedido:</span>
                <span>{formatDate(order.created_at, true)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Cliente:</span>
                <span>
                  {order.user ? (
                    `${order.user.first_name || ''} ${order.user.last_name || ''} ${!order.user.first_name && !order.user.last_name ? order.user.username : ''}`
                  ) : 'No disponible'}
                </span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Sucursal:</span>
                <span>{order.branch ? order.branch.name : 'No disponible'}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Método de Entrega:</span>
                <span className="text-capitalize">{order.delivery_method}</span>
              </li>
              {order.delivery_method === 'despacho a domicilio' && order.delivery_address && (
                <li className="list-group-item">
                  <span className="fw-bold">Dirección de Entrega:</span>
                  <p className="mb-0 mt-1">{order.delivery_address}</p>
                </li>
              )}
              {order.notes && (
                <li className="list-group-item">
                  <span className="fw-bold">Notas:</span>
                  <p className="mb-0 mt-1">{order.notes}</p>
                </li>
              )}
            </ul>
          </div>
          
          {/* Resumen de pagos */}
          <div className="col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Resumen de Pagos</h6>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between">
                <span>Subtotal:</span>
                <span>{formatPrice(order.total_amount)}</span>
              </li>
              {order.discount_amount > 0 && (
                <li className="list-group-item d-flex justify-content-between text-success">
                  <span>Descuento:</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </li>
              )}
              {order.delivery_cost > 0 && (
                <li className="list-group-item d-flex justify-content-between">
                  <span>Costo de Envío:</span>
                  <span>{formatPrice(order.delivery_cost)}</span>
                </li>
              )}
              <li className="list-group-item d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>{formatPrice(order.final_amount)}</span>
              </li>
              <li className="list-group-item">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">Estado de Pago:</span>
                  <span>
                    {payments && payments.length > 0 ? (
                      payments.some(payment => payment.status === 'completado') ? (
                        <span className="badge bg-success">Pagado</span>
                      ) : (
                        <span className="badge bg-warning">Pendiente</span>
                      )
                    ) : (
                      <span className="badge bg-warning">Pendiente</span>
                    )}
                  </span>
                </div>
                {/* Botón de pago si está pendiente */}
                {canInitiatePayment() && (
                  <button 
                    className="btn btn-primary btn-sm w-100"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <i className="bi bi-credit-card me-2"></i>
                    Realizar Pago
                  </button>
                )}
              </li>
            </ul>
          </div>
          
          {/* Productos */}
          <div className="col-12 mb-4">
            <h6 className="fw-bold mb-3">Productos</h6>
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Precio Unitario</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.map(item => (
                    <tr key={item.id}>
                      <td>
                        {item.product ? item.product.name : `Producto #${item.product_id}`}
                      </td>
                      <td>{formatPrice(item.unit_price)}</td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.total_price || (item.unit_price * item.quantity))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Historial de estados */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="col-12 mb-4">
              <h6 className="fw-bold mb-3">Historial de Estados</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Estado Anterior</th>
                      <th>Nuevo Estado</th>
                      <th>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.status_history.map((history, index) => (
                      <tr key={index}>
                        <td>{formatDate(history.date, true)}</td>
                        <td>
                          <span className={`badge bg-${formatOrderStatus(history.old_status).color}`}>
                            {formatOrderStatus(history.old_status).text}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${formatOrderStatus(history.new_status).color}`}>
                            {formatOrderStatus(history.new_status).text}
                          </span>
                        </td>
                        <td>{history.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Pagos */}
          {payments && payments.length > 0 && (
            <div className="col-12 mb-4">
              <h6 className="fw-bold mb-3">Pagos</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Método</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment.id}>
                        <td>{payment.id}</td>
                        <td className="text-capitalize">{payment.payment_method}</td>
                        <td>{formatPrice(payment.amount)}</td>
                        <td>
                          <span className={`badge bg-${
                            payment.status === 'completado' ? 'success' : 
                            payment.status === 'pendiente' ? 'warning' :
                            payment.status === 'procesando' ? 'info' :
                            payment.status === 'fallido' ? 'danger' :
                            payment.status === 'reembolsado' ? 'secondary' :
                            'danger'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td>
                          {payment.payment_date ? formatDate(payment.payment_date, true) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Botones de acción */}
          <div className="col-12">
            <div className="d-flex flex-wrap gap-2 justify-content-end mt-3">
              {/* Cambiar estado */}
              {canChangeStatus() && (
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setShowStatusModal(true)}
                  disabled={loading || getAvailableStatuses().length === 0}
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Cambiar Estado
                </button>
              )}
              
              {/* Cancelar orden */}
              {canCancelOrder() && (
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => setShowCancelModal(true)}
                  disabled={loading}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar Pedido
                </button>
              )}
              
              {/* Imprimir */}
              <button 
                className="btn btn-outline-secondary"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-2"></i>
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de cancelación */}
      {showCancelModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cancelar Pedido</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCancelModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>¿Está seguro que desea cancelar este pedido?</p>
                <div className="mb-3">
                  <label htmlFor="cancelReason" className="form-label">Motivo de cancelación</label>
                  <textarea
                    id="cancelReason"
                    className="form-control"
                    rows="3"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ingrese el motivo de la cancelación"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCancelModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleCancelOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Procesando...
                    </>
                  ) : 'Confirmar Cancelación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de cambio de estado */}
      {showStatusModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cambiar Estado del Pedido</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowStatusModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="newStatus" className="form-label">Nuevo Estado</label>
                  <select
                    id="newStatus"
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="">Seleccione un estado</option>
                    {getAvailableStatuses().map(status => (
                      <option key={status} value={status}>
                        {formatOrderStatus(status).text}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="statusNotes" className="form-label">Notas (Opcional)</label>
                  <textarea
                    id="statusNotes"
                    className="form-control"
                    rows="3"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Ingrese notas adicionales"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleStatusChange}
                  disabled={loading || !newStatus}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Procesando...
                    </>
                  ) : 'Cambiar Estado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de pago */}
      {showPaymentModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Realizar Pago</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="paymentMethod" className="form-label">Método de Pago</label>
                  <select
                    id="paymentMethod"
                    className="form-select"
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  >
                    <option value={PAYMENT_METHODS.CREDIT_CARD}>Tarjeta de Crédito</option>
                    <option value={PAYMENT_METHODS.DEBIT_CARD}>Tarjeta de Débito</option>
                    <option value={PAYMENT_METHODS.BANK_TRANSFER}>Transferencia Bancaria</option>
                  </select>
                </div>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Total a pagar: <strong>{formatPrice(order.final_amount)}</strong>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleInitiatePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Procesando...
                    </>
                  ) : 'Continuar al Pago'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;