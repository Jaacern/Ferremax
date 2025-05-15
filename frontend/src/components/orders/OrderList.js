import React, { useState } from 'react';
import { 
  Table, 
  Badge, 
  Button, 
  Form, 
  InputGroup, 
  Row, 
  Col, 
  Card, 
  Pagination 
} from 'react-bootstrap';

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

const OrderList = ({ 
  orders, 
  onSelectOrder, 
  pagination = null, 
  onPageChange = null,
  onSearch = null,
  onFilterChange = null,
  isLoading = false,
  userRole = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

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
      day: 'numeric'
    });
  };

  // Manejar selección de pedido
  const handleSelectOrder = (orderId) => {
    if (onSelectOrder) {
      onSelectOrder(orderId);
    }
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  // Manejar cambio de filtro de estado
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    if (onFilterChange) {
      onFilterChange({ ...dateFilter, status: e.target.value });
    }
  };

  // Manejar cambio de filtro de fecha
  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    const newDateFilter = { ...dateFilter, [name]: value };
    setDateFilter(newDateFilter);
    if (onFilterChange) {
      onFilterChange({ ...newDateFilter, status: statusFilter });
    }
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Renderizar paginación
  const renderPagination = () => {
    if (!pagination) return null;

    const { page, pages } = pagination;
    if (pages <= 1) return null;

    const items = [];

    // Primera página
    items.push(
      <Pagination.First
        key="first"
        onClick={() => handlePageChange(1)}
        disabled={page === 1}
      />
    );

    // Página anterior
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      />
    );

    // Mostrar un máximo de 5 páginas centradas alrededor de la página actual
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(pages, page + 2);

    // Añadir elipsis inicial si necesario
    if (startPage > 1) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }

    // Añadir páginas numeradas
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Añadir elipsis final si necesario
    if (endPage < pages) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }

    // Página siguiente
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === pages}
      />
    );

    // Última página
    items.push(
      <Pagination.Last
        key="last"
        onClick={() => handlePageChange(pages)}
        disabled={page === pages}
      />
    );

    return (
      <Pagination className="justify-content-center mt-4">
        {items}
      </Pagination>
    );
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Pedidos</h5>
      </Card.Header>

      {/* Filtros */}
      {(onSearch || onFilterChange) && (
        <Card.Body className="border-bottom">
          <Row>
            {/* Buscar por número de pedido */}
            {onSearch && (
              <Col md={6} className="mb-3">
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por número de pedido..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </InputGroup>
              </Col>
            )}

            {/* Filtrar por estado */}
            {onFilterChange && (
              <Col md={onSearch ? 6 : 4} className="mb-3">
                <Form.Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="en preparación">En preparación</option>
                  <option value="listo para entrega">Listo para entrega</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </Form.Select>
              </Col>
            )}

            {/* Filtrar por fecha */}
            {onFilterChange && !onSearch && (
              <>
                <Col md={4} className="mb-3">
                  <InputGroup>
                    <InputGroup.Text>Desde</InputGroup.Text>
                    <Form.Control
                      type="date"
                      name="from"
                      value={dateFilter.from}
                      onChange={handleDateFilterChange}
                    />
                  </InputGroup>
                </Col>
                <Col md={4} className="mb-3">
                  <InputGroup>
                    <InputGroup.Text>Hasta</InputGroup.Text>
                    <Form.Control
                      type="date"
                      name="to"
                      value={dateFilter.to}
                      onChange={handleDateFilterChange}
                    />
                  </InputGroup>
                </Col>
              </>
            )}
          </Row>
        </Card.Body>
      )}

      {/* Lista de pedidos */}
      <div className="table-responsive">
        <Table className="table-hover">
          <thead>
            <tr>
              <th>N° Pedido</th>
              <th>Fecha</th>
              {userRole === 'admin' && <th>Cliente</th>}
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={userRole === 'admin' ? 6 : 5} className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : orders && orders.length > 0 ? (
              orders.map(order => (
                <tr key={order.id} onClick={() => handleSelectOrder(order.id)} style={{ cursor: 'pointer' }}>
                  <td>{order.order_number}</td>
                  <td>{formatDate(order.created_at)}</td>
                  {userRole === 'admin' && (
                    <td>
                      {order.user ? (
                        `${order.user.first_name} ${order.user.last_name}`
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                  )}
                  <td>{formatPrice(order.final_amount || order.total_amount)}</td>
                  <td>
                    <Badge bg={statusColors[order.status] || 'secondary'}>
                      {order.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOrder(order.id);
                      }}
                    >
                      Ver detalles
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={userRole === 'admin' ? 6 : 5} className="text-center py-4">
                  No hay pedidos para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      {renderPagination()}
    </Card>
  );
};

export default OrderList;