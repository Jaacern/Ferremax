import React from 'react';
import { Card, Row, Col, Badge, ListGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Mapa de estados de la orden y sus colores correspondientes
const statusColors = {
  'pendiente': 'warning',
  'aprobado': 'info',
  'rechazado': 'danger',
  'en preparación': 'primary',
  'listo para entrega': 'primary',
  'enviado': 'info',
  'entregado': 'success',
  'cancelado': 'danger'
};

const OrderDetail = ({ order, showActions = false, onStatusChange = null }) => {
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Manejar cambio de estado
  const handleStatusChange = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(order.id, newStatus);
    }
  };

  // Si no hay orden, mostrar mensaje
  if (!order) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center py-5">
          <div className="text-muted">No se ha seleccionado ningún pedido</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="order-detail-card mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">Pedido #{order.order_number}</h5>
          <div className="text-muted small">
            Fecha: {formatDate(order.created_at)}
          </div>
        </div>
        <Badge bg={statusColors[order.status] || 'secondary'} className="fs-6">
          {order.status}
        </Badge>
      </Card.Header>

      <Card.Body>
        <Row>
          {/* Información del cliente */}
          <Col md={6} className="mb-4">
            <h6>Información del cliente</h6>
            <Card className="h-100">
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Nombre:</strong> {order.user?.first_name} {order.user?.last_name}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Email:</strong> {order.user?.email}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Teléfono:</strong> {order.user?.phone || 'No especificado'}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>

          {/* Información de entrega */}
          <Col md={6} className="mb-4">
            <h6>Información de entrega</h6>
            <Card className="h-100">
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Método:</strong> {order.delivery_method}
                </ListGroup.Item>
                {order.delivery_method === 'despacho a domicilio' ? (
                  <ListGroup.Item>
                    <strong>Dirección:</strong> {order.delivery_address || 'No especificada'}
                  </ListGroup.Item>
                ) : (
                  <ListGroup.Item>
                    <strong>Sucursal:</strong> {order.branch?.name || 'No especificada'}
                  </ListGroup.Item>
                )}
                <ListGroup.Item>
                  <strong>Costo de envío:</strong> {formatPrice(order.delivery_cost || 0)}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>

        {/* Productos */}
        <h6>Productos</h6>
        <Card className="mb-4">
          <ListGroup variant="flush">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">
                      {item.product_name || `Producto #${item.product_id}`}
                    </div>
                    <div className="text-muted small">
                      Cantidad: {item.quantity} × {formatPrice(item.unit_price)}
                    </div>
                  </div>
                  <div className="fw-bold">
                    {formatPrice(item.total_price)}
                  </div>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item className="text-center py-3">
                No hay productos para mostrar
              </ListGroup.Item>
            )}
          </ListGroup>
        </Card>

        {/* Resumen de costos */}
        <Row className="mb-4">
          <Col md={6} className="ms-auto">
            <Card>
              <Card.Header>
                <h6 className="mb-0">Resumen</h6>
              </Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.total_amount || 0)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Descuento:</span>
                  <span>-{formatPrice(order.discount_amount || 0)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Envío:</span>
                  <span>{formatPrice(order.delivery_cost || 0)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between fw-bold">
                  <span>Total:</span>
                  <span>{formatPrice(order.final_amount || (order.total_amount - order.discount_amount + order.delivery_cost))}</span>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>

        {/* Notas */}
        {order.notes && (
          <div className="mb-4">
            <h6>Notas</h6>
            <Card body>{order.notes}</Card>
          </div>
        )}

        {/* Historial de estado */}
        {order.status_history && order.status_history.length > 0 && (
          <div className="mb-4">
            <h6>Historial de estado</h6>
            <ListGroup>
              {order.status_history.map((history, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between">
                  <div>
                    <Badge bg={statusColors[history.new_status] || 'secondary'}>
                      {history.new_status}
                    </Badge>
                    {history.notes && <span className="ms-2">{history.notes}</span>}
                  </div>
                  <small className="text-muted">
                    {formatDate(history.created_at)}
                  </small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}

        {/* Acciones (para staff) */}
        {showActions && onStatusChange && (
          <div className="mt-4">
            <h6>Acciones</h6>
            <Card body>
              <div className="d-flex flex-wrap gap-2">
                {order.status === 'pendiente' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleStatusChange('aprobado')}
                    >
                      Aprobar pedido
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleStatusChange('rechazado')}
                    >
                      Rechazar pedido
                    </Button>
                  </>
                )}

                {order.status === 'aprobado' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusChange('en preparación')}
                  >
                    Iniciar preparación
                  </Button>
                )}

                {order.status === 'en preparación' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusChange('listo para entrega')}
                  >
                    Marcar como listo
                  </Button>
                )}

                {order.status === 'listo para entrega' && (
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleStatusChange('enviado')}
                  >
                    Marcar como enviado
                  </Button>
                )}

                {order.status === 'enviado' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleStatusChange('entregado')}
                  >
                    Confirmar entrega
                  </Button>
                )}

                {['pendiente', 'aprobado'].includes(order.status) && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleStatusChange('cancelado')}
                  >
                    Cancelar pedido
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </Card.Body>

      <Card.Footer className="text-end">
        <Button as={Link} to="/orders" variant="outline-secondary" size="sm">
          Volver a pedidos
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default OrderDetail;