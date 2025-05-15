import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert, Card, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const OrdersToApprove = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Obtener pedidos pendientes de aprobación
      const response = await api.get('/orders?status=PENDING');
      setOrders(response.data.orders);
    } catch (err) {
      setError('Error al cargar los pedidos pendientes. Por favor, intenta de nuevo.');
      console.error('Error loading orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveOrder = async (orderId) => {
    setActionLoading(true);
    
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: 'APPROVED'
      });
      
      // Actualizar la lista de pedidos
      fetchOrders();
    } catch (err) {
      setError('Error al aprobar el pedido. Por favor, intenta de nuevo.');
      console.error('Error approving order:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (order) => {
    setSelectedOrder(order);
    setRejectReason('');
    setShowModal(true);
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;
    
    setActionLoading(true);
    
    try {
      await api.put(`/orders/${selectedOrder.id}/status`, {
        status: 'REJECTED',
        notes: rejectReason
      });
      
      // Cerrar modal y actualizar lista
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      setError('Error al rechazar el pedido. Por favor, intenta de nuevo.');
      console.error('Error rejecting order:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge bg="warning">Pendiente</Badge>;
      case 'APPROVED':
        return <Badge bg="success">Aprobado</Badge>;
      case 'REJECTED':
        return <Badge bg="danger">Rechazado</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CL');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Pedidos por Aprobar</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span>
              {!isLoading && (
                <span className="text-muted">
                  {orders.length} pedidos pendientes
                </span>
              )}
            </span>
            
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => fetchOrders()}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Actualizar
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <p className="mt-2">Cargando pedidos pendientes...</p>
            </div>
          ) : orders.length === 0 ? (
            <Alert variant="info">
              <p className="mb-0">No hay pedidos pendientes de aprobación en este momento.</p>
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>N° Orden</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>
                      {order.user?.first_name} {order.user?.last_name}
                      <div className="small text-muted">{order.user?.email}</div>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>{formatPrice(order.final_amount)}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-1"
                        onClick={() => handleApproveOrder(order.id)}
                        disabled={actionLoading}
                      >
                        <i className="bi bi-check-lg"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="me-1"
                        onClick={() => openRejectModal(order)}
                        disabled={actionLoading}
                      >
                        <i className="bi bi-x-lg"></i>
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate(`/vendor/orders/${order.id}`)}
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de rechazo */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rechazar Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Estás a punto de rechazar el pedido <strong>{selectedOrder?.order_number}</strong>.
            Por favor, indica la razón del rechazo:
          </p>
          <Form.Group>
            <Form.Label>Motivo del rechazo</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Indica el motivo del rechazo"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleRejectOrder}
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Procesando...
              </>
            ) : (
              'Confirmar Rechazo'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrdersToApprove;