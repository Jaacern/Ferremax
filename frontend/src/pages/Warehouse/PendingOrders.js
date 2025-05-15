import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert, Card, Form, Modal, Tabs, Tab, Row, Col, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PendingOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('approved');
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Cargar órdenes aprobadas
      const approvedResponse = await api.get('/orders?status=APPROVED');
      setOrders(approvedResponse.data.orders);
      
      // Cargar órdenes en preparación
      const preparingResponse = await api.get('/orders?status=PREPARING');
      setPreparingOrders(preparingResponse.data.orders);
      
      // Cargar órdenes listas para entrega
      const readyResponse = await api.get('/orders?status=READY');
      setReadyOrders(readyResponse.data.orders);
      
    } catch (err) {
      setError('Error al cargar las órdenes. Por favor, intenta de nuevo.');
      console.error('Error loading orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPreparing = async (orderId) => {
    setActionLoading(true);
    
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: 'PREPARING',
        notes: 'Pedido en preparación por bodega'
      });
      
      // Actualizar la lista de pedidos
      fetchOrders();
    } catch (err) {
      setError('Error al actualizar el estado del pedido. Por favor, intenta de nuevo.');
      console.error('Error updating order status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetReady = async (orderId) => {
    setActionLoading(true);
    
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: 'READY',
        notes: 'Pedido listo para entrega/envío'
      });
      
      // Actualizar la lista de pedidos
      fetchOrders();
    } catch (err) {
      setError('Error al actualizar el estado del pedido. Por favor, intenta de nuevo.');
      console.error('Error updating order status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetShipped = async (orderId) => {
    setActionLoading(true);
    
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: 'SHIPPED',
        notes: 'Pedido enviado/entregado a despacho'
      });
      
      // Actualizar la lista de pedidos
      fetchOrders();
    } catch (err) {
      setError('Error al actualizar el estado del pedido. Por favor, intenta de nuevo.');
      console.error('Error updating order status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const showOrderDetails = async (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
    setItemsLoading(true);
    
    try {
      const response = await api.get(`/orders/${order.id}`);
      setOrderItems(response.data.order.items);
    } catch (err) {
      console.error('Error loading order details:', err);
    } finally {
      setItemsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge bg="warning">Pendiente</Badge>;
      case 'APPROVED':
        return <Badge bg="success">Aprobado</Badge>;
      case 'PREPARING':
        return <Badge bg="info">En preparación</Badge>;
      case 'READY':
        return <Badge bg="primary">Listo para entrega</Badge>;
      case 'SHIPPED':
        return <Badge bg="secondary">Enviado</Badge>;
      case 'DELIVERED':
        return <Badge bg="dark">Entregado</Badge>;
      case 'REJECTED':
        return <Badge bg="danger">Rechazado</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getDeliveryMethodBadge = (method) => {
    switch (method) {
      case 'PICKUP':
        return <Badge bg="info">Retiro en tienda</Badge>;
      case 'DELIVERY':
        return <Badge bg="primary">Despacho a domicilio</Badge>;
      default:
        return <Badge bg="secondary">{method}</Badge>;
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

  const renderOrdersList = (ordersList, status) => {
    if (ordersList.length === 0) {
      return (
        <Alert variant="info">
          No hay pedidos {status === 'APPROVED' ? 'aprobados' : status === 'PREPARING' ? 'en preparación' : 'listos'} en este momento.
        </Alert>
      );
    }

    return (
      <Table responsive hover>
        <thead>
          <tr>
            <th>N° Orden</th>
            <th>Cliente</th>
            <th>Método de entrega</th>
            <th>Fecha aprobación</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordersList.map(order => (
            <tr key={order.id}>
              <td>{order.order_number}</td>
              <td>
                {order.user?.first_name} {order.user?.last_name}
                <div className="small text-muted">{order.user?.email}</div>
              </td>
              <td>{getDeliveryMethodBadge(order.delivery_method)}</td>
              <td>{formatDate(order.updated_at)}</td>
              <td>{getStatusBadge(order.status)}</td>
              <td>
                {status === 'APPROVED' && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-1"
                    onClick={() => handleSetPreparing(order.id)}
                    disabled={actionLoading}
                  >
                    <i className="bi bi-box-seam me-1"></i>
                    Preparar
                  </Button>
                )}
                
                {status === 'PREPARING' && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-1"
                    onClick={() => handleSetReady(order.id)}
                    disabled={actionLoading}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    Marcar listo
                  </Button>
                )}
                
                {status === 'READY' && (
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="me-1"
                    onClick={() => handleSetShipped(order.id)}
                    disabled={actionLoading}
                  >
                    <i className="bi bi-truck me-1"></i>
                    Enviar
                  </Button>
                )}
                
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => showOrderDetails(order)}
                >
                  <i className="bi bi-eye"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Gestión de Pedidos</h1>
      
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
                  {orders.length} pedidos por preparar | {preparingOrders.length} en preparación | {readyOrders.length} listos
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
              <p className="mt-2">Cargando pedidos...</p>
            </div>
          ) : (
            <Tabs
              activeKey={activeTab}
              onSelect={(key) => setActiveTab(key)}
              className="mb-3"
            >
              <Tab eventKey="approved" title={`Por preparar (${orders.length})`}>
                {renderOrdersList(orders, 'APPROVED')}
              </Tab>
              <Tab eventKey="preparing" title={`En preparación (${preparingOrders.length})`}>
                {renderOrdersList(preparingOrders, 'PREPARING')}
              </Tab>
              <Tab eventKey="ready" title={`Listos para envío (${readyOrders.length})`}>
                {renderOrdersList(readyOrders, 'READY')}
              </Tab>
            </Tabs>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de detalles del pedido */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Detalles del Pedido {selectedOrder?.order_number}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Información del cliente</h5>
                  <p className="mb-1">
                    <strong>Nombre:</strong> {selectedOrder.user?.first_name} {selectedOrder.user?.last_name}
                  </p>
                  <p className="mb-1">
                    <strong>Email:</strong> {selectedOrder.user?.email}
                  </p>
                  <p className="mb-1">
                    <strong>Teléfono:</strong> {selectedOrder.user?.phone || 'No especificado'}
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Información del pedido</h5>
                  <p className="mb-1">
                    <strong>Número:</strong> {selectedOrder.order_number}
                  </p>
                  <p className="mb-1">
                    <strong>Fecha de creación:</strong> {formatDate(selectedOrder.created_at)}
                  </p>
                  <p className="mb-1">
                    <strong>Estado:</strong> {getStatusBadge(selectedOrder.status)}
                  </p>
                  <p className="mb-1">
                    <strong>Método de entrega:</strong> {getDeliveryMethodBadge(selectedOrder.delivery_method)}
                  </p>
                </Col>
              </Row>
              
              {selectedOrder.delivery_method === 'DELIVERY' && selectedOrder.delivery_address && (
                <div className="mb-4">
                  <h5>Dirección de envío</h5>
                  <p className="mb-0">{selectedOrder.delivery_address}</p>
                </div>
              )}
              
              <h5>Productos</h5>
              {itemsLoading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Cargando productos...</span>
                </div>
              ) : (
                <ListGroup className="mb-3">
                  {orderItems.map(item => (
                    <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">{item.product?.name}</div>
                        <div className="small text-muted">SKU: {item.product?.sku}</div>
                      </div>
                      <div className="d-flex align-items-center">
                        <Badge bg="secondary" className="me-3">
                          x{item.quantity}
                        </Badge>
                        <span>{formatPrice(item.unit_price)}</span>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              
              <div className="d-flex justify-content-between border-top pt-3">
                <h5>Total</h5>
                <h5>{formatPrice(selectedOrder.final_amount || selectedOrder.total_amount)}</h5>
              </div>
              
              {selectedOrder.notes && (
                <div className="mt-3">
                  <h5>Notas</h5>
                  <Alert variant="light">
                    {selectedOrder.notes}
                  </Alert>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Cerrar
          </Button>
          
          {selectedOrder && selectedOrder.status === 'APPROVED' && (
            <Button
              variant="primary"
              onClick={() => {
                handleSetPreparing(selectedOrder.id);
                setShowDetailsModal(false);
              }}
              disabled={actionLoading}
            >
              Iniciar preparación
            </Button>
          )}
          
          {selectedOrder && selectedOrder.status === 'PREPARING' && (
            <Button
              variant="success"
              onClick={() => {
                handleSetReady(selectedOrder.id);
                setShowDetailsModal(false);
              }}
              disabled={actionLoading}
            >
              Marcar como listo
            </Button>
          )}
          
          {selectedOrder && selectedOrder.status === 'READY' && (
            <Button
              variant="info"
              onClick={() => {
                handleSetShipped(selectedOrder.id);
                setShowDetailsModal(false);
              }}
              disabled={actionLoading}
            >
              Marcar como enviado
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PendingOrders;