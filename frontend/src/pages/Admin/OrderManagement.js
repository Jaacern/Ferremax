import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Form, 
  Badge, 
  Pagination, 
  Modal, 
  Spinner, 
  Alert 
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Este servicio aún no existe, pero lo crearemos más adelante
// import orderService from '../../services/order.service';

const OrderManagement = () => {
  // Estados para la gestión de pedidos
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  
  // Estados para los filtros
  const [filters, setFilters] = useState({
    orderNumber: '',
    customerName: '',
    status: '',
    fromDate: '',
    toDate: '',
    minAmount: '',
    maxAmount: ''
  });
  
  // Estados para el modal de detalles del pedido
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Estados para el modal de cambio de estado
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Cargar datos de pedidos al montar el componente
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // En una aplicación real, esto sería una llamada a la API
        // const response = await orderService.getAllOrders();
        // setOrders(response.data);
        
        // Simular datos de pedidos para desarrollo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockOrders = Array.from({ length: 50 }, (_, index) => ({
          id: index + 1,
          orderNumber: `ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
          customer: {
            id: Math.floor(Math.random() * 100),
            name: ['Juan Pérez', 'María López', 'Carlos Rodríguez', 'Ana Martínez', 'Pedro Sánchez'][Math.floor(Math.random() * 5)]
          },
          date: new Date(2025, 4, Math.floor(Math.random() * 14) + 1).toLocaleDateString('es-CL'),
          createdAt: new Date(2025, 4, Math.floor(Math.random() * 14) + 1).toISOString(),
          status: ['Pendiente', 'Aprobado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado'][Math.floor(Math.random() * 6)],
          total: Math.floor(Math.random() * 500000) + 10000,
          items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
            id: i + 1,
            productId: Math.floor(Math.random() * 100),
            productName: [
              'Taladro Percutor Bosch', 
              'Martillo Stanley', 
              'Sierra Circular Dewalt', 
              'Juego de Destornilladores Makita', 
              'Pintura Látex Sipa 20L'
            ][Math.floor(Math.random() * 5)],
            quantity: Math.floor(Math.random() * 5) + 1,
            unitPrice: Math.floor(Math.random() * 100000) + 5000,
            totalPrice: 0
          })).map(item => ({
            ...item,
            totalPrice: item.quantity * item.unitPrice
          })),
          deliveryMethod: Math.random() > 0.5 ? 'Retiro en tienda' : 'Despacho a domicilio',
          branch: Math.random() > 0.5 ? 'Casa Matriz Santiago' : 'Sucursal Providencia',
          shippingAddress: Math.random() > 0.5 ? 'Av. Libertador O\'Higgins 1111, Santiago' : null,
          paymentMethod: ['Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia bancaria'][Math.floor(Math.random() * 3)],
          paymentStatus: Math.random() > 0.3 ? 'Pagado' : 'Pendiente'
        }));
        
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
        setError('Error al cargar los pedidos. Por favor, intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Filtrar pedidos cuando cambian los filtros
  useEffect(() => {
    const result = orders.filter(order => {
      const matchesOrderNumber = 
        !filters.orderNumber || 
        order.orderNumber.toLowerCase().includes(filters.orderNumber.toLowerCase());
      
      const matchesCustomerName = 
        !filters.customerName || 
        order.customer.name.toLowerCase().includes(filters.customerName.toLowerCase());
      
      const matchesStatus = 
        !filters.status || 
        order.status === filters.status;
      
      const orderDate = new Date(order.createdAt);
      
      const matchesFromDate = 
        !filters.fromDate || 
        orderDate >= new Date(filters.fromDate);
      
      const matchesToDate = 
        !filters.toDate || 
        orderDate <= new Date(filters.toDate);
      
      const matchesMinAmount = 
        !filters.minAmount || 
        order.total >= parseFloat(filters.minAmount);
      
      const matchesMaxAmount = 
        !filters.maxAmount || 
        order.total <= parseFloat(filters.maxAmount);
      
      return (
        matchesOrderNumber &&
        matchesCustomerName &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate &&
        matchesMinAmount &&
        matchesMaxAmount
      );
    });
    
    setFilteredOrders(result);
    setCurrentPage(1); // Resetear a la primera página al filtrar
  }, [filters, orders]);
  
  // Obtener pedidos de la página actual
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  
  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      orderNumber: '',
      customerName: '',
      status: '',
      fromDate: '',
      toDate: '',
      minAmount: '',
      maxAmount: ''
    });
  };
  
  // Abrir modal de detalles del pedido
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };
  
  // Abrir modal para cambiar estado
  const handleChangeStatus = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setShowStatusModal(true);
  };
  
  // Guardar cambio de estado
  const handleSaveStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    setIsUpdatingStatus(true);
    
    try {
      // En una aplicación real, esto sería una llamada a la API
      // await orderService.updateOrderStatus(selectedOrder.id, { status: newStatus, notes: statusNote });
      
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizar el estado localmente
      const updatedOrders = orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: newStatus }
          : order
      );
      
      setOrders(updatedOrders);
      setShowStatusModal(false);
      
      // Mostrar notificación de éxito (en una app real usaríamos un toast o similar)
      alert(`Estado del pedido ${selectedOrder.orderNumber} actualizado a "${newStatus}"`);
      
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('Error al actualizar el estado del pedido. Por favor, intenta nuevamente.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };
  
  // Renderizar paginación
  const renderPagination = () => {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    
    if (totalPages <= 1) return null;
    
    const items = [];
    
    // Primera página
    items.push(
      <Pagination.First
        key="first"
        onClick={() => paginate(1)}
        disabled={currentPage === 1}
      />
    );
    
    // Página anterior
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );
    
    // Mostrar un máximo de 5 páginas centradas en la página actual
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    // Añadir elipsis inicial si necesario
    if (startPage > 1) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }
    
    // Añadir páginas numeradas
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => paginate(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // Añadir elipsis final si necesario
    if (endPage < totalPages) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }
    
    // Página siguiente
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );
    
    // Última página
    items.push(
      <Pagination.Last
        key="last"
        onClick={() => paginate(totalPages)}
        disabled={currentPage === totalPages}
      />
    );
    
    return (
      <Pagination className="justify-content-center mt-4">
        {items}
      </Pagination>
    );
  };
  
  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Gestión de Pedidos</h1>
      
      {/* Filtros */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Filtros</h5>
          <Row className="g-3">
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Número de pedido</Form.Label>
                <Form.Control
                  type="text"
                  name="orderNumber"
                  value={filters.orderNumber}
                  onChange={handleFilterChange}
                  placeholder="Buscar por número"
                />
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Cliente</Form.Label>
                <Form.Control
                  type="text"
                  name="customerName"
                  value={filters.customerName}
                  onChange={handleFilterChange}
                  placeholder="Nombre del cliente"
                />
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="En preparación">En preparación</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Desde</Form.Label>
                <Form.Control
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Hasta</Form.Label>
                <Form.Control
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Monto mínimo</Form.Label>
                <Form.Control
                  type="number"
                  name="minAmount"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  placeholder="Monto mínimo"
                />
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Monto máximo</Form.Label>
                <Form.Control
                  type="number"
                  name="maxAmount"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  placeholder="Monto máximo"
                />
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3} className="d-flex align-items-end">
              <Button 
                variant="secondary" 
                className="w-100"
                onClick={handleClearFilters}
              >
                Limpiar filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Lista de pedidos */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Cargando pedidos...</span>
              </Spinner>
              <p className="mt-3">Cargando pedidos...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : filteredOrders.length === 0 ? (
            <Alert variant="info">
              No se encontraron pedidos con los filtros aplicados.
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Nº Pedido</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Método de Pago</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.orderNumber}</td>
                        <td>{order.customer.name}</td>
                        <td>{order.date}</td>
                        <td>{formatPrice(order.total)}</td>
                        <td>
                          <Badge bg={
                            order.status === 'Pendiente' ? 'warning' :
                            order.status === 'Aprobado' ? 'info' :
                            order.status === 'En preparación' ? 'primary' :
                            order.status === 'Enviado' ? 'secondary' :
                            order.status === 'Entregado' ? 'success' :
                            'danger'
                          }>
                            {order.status}
                          </Badge>
                        </td>
                        <td>{order.paymentMethod}</td>
                        <td>
                          <Button
                            variant="link"
                            className="p-0 me-2 text-primary"
                            onClick={() => handleViewDetails(order)}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="link"
                            className="p-0 text-success"
                            onClick={() => handleChangeStatus(order)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {/* Información de resultados y paginación */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3">
                <div className="mb-3 mb-md-0">
                  Mostrando {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrders.length)} de {filteredOrders.length} pedidos
                </div>
                {renderPagination()}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de detalles del pedido */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Información del Pedido</h5>
                  <p><strong>Número:</strong> {selectedOrder.orderNumber}</p>
                  <p><strong>Fecha:</strong> {selectedOrder.date}</p>
                  <p><strong>Estado:</strong> 
                    <Badge 
                      bg={
                        selectedOrder.status === 'Pendiente' ? 'warning' :
                        selectedOrder.status === 'Aprobado' ? 'info' :
                        selectedOrder.status === 'En preparación' ? 'primary' :
                        selectedOrder.status === 'Enviado' ? 'secondary' :
                        selectedOrder.status === 'Entregado' ? 'success' :
                        'danger'
                      }
                      className="ms-2"
                    >
                      {selectedOrder.status}
                    </Badge>
                  </p>
                  <p><strong>Método de entrega:</strong> {selectedOrder.deliveryMethod}</p>
                  {selectedOrder.deliveryMethod === 'Retiro en tienda' ? (
                    <p><strong>Sucursal:</strong> {selectedOrder.branch}</p>
                  ) : (
                    <p><strong>Dirección de envío:</strong> {selectedOrder.shippingAddress}</p>
                  )}
                </Col>
                <Col md={6}>
                  <h5>Información del Cliente</h5>
                  <p><strong>Nombre:</strong> {selectedOrder.customer.name}</p>
                  <p><strong>ID:</strong> {selectedOrder.customer.id}</p>
                  <h5 className="mt-4">Información de Pago</h5>
                  <p><strong>Método:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>Estado:</strong> 
                    <Badge 
                      bg={selectedOrder.paymentStatus === 'Pagado' ? 'success' : 'warning'}
                      className="ms-2"
                    >
                      {selectedOrder.paymentStatus}
                    </Badge>
                  </p>
                </Col>
              </Row>
              
              <h5>Productos</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.unitPrice)}</td>
                      <td>{formatPrice(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                    <td><strong>{formatPrice(selectedOrder.total)}</strong></td>
                  </tr>
                </tfoot>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Cerrar
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setShowDetailsModal(false);
              handleChangeStatus(selectedOrder);
            }}
          >
            Cambiar Estado
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para cambiar estado */}
      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Estado del Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Número de pedido</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedOrder.orderNumber}
                  readOnly
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Estado actual</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedOrder.status}
                  readOnly
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Nuevo estado</Form.Label>
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="En preparación">En preparación</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Notas</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Notas sobre el cambio de estado (opcional)"
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveStatus}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderManagement;