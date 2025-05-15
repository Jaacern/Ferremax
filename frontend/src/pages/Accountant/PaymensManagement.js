import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Tabs, Tab, Modal, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const PaymentsManagement = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [error, setError] = useState(null);
  
  // Estado para filtros
  const [filter, setFilter] = useState({
    search: '',
    status: 'all',
    method: 'all',
    dateFrom: '',
    dateTo: ''
  });
  
  // Estado para modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [confirmationData, setConfirmationData] = useState({
    transactionId: '',
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Cargar pagos
  useEffect(() => {
    const loadPayments = async () => {
      try {
        // En una app real, aquí cargaríamos los pagos desde la API
        await new Promise(r => setTimeout(r, 800));
        
        // Datos simulados
        const mockPayments = [
          {
            id: 1,
            order_id: 5001,
            order_number: 'ORD-20250510-ABC123',
            customer: { id: 101, name: 'María González' },
            amount: 125000,
            currency: 'CLP',
            payment_method: 'BANK_TRANSFER',
            status: 'PENDING',
            date: '2025-05-10T14:30:00Z'
          },
          {
            id: 2,
            order_id: 5002,
            order_number: 'ORD-20250511-DEF456',
            customer: { id: 102, name: 'Juan Pérez' },
            amount: 298500,
            currency: 'CLP',
            payment_method: 'CREDIT_CARD',
            status: 'COMPLETED',
            date: '2025-05-11T09:15:00Z'
          },
          {
            id: 3,
            order_id: 5003,
            order_number: 'ORD-20250511-GHI789',
            customer: { id: 103, name: 'Ana Martínez' },
            amount: 156800,
            currency: 'CLP',
            payment_method: 'BANK_TRANSFER',
            status: 'PENDING',
            date: '2025-05-11T17:45:00Z'
          },
          {
            id: 4,
            order_id: 5004,
            order_number: 'ORD-20250512-JKL012',
            customer: { id: 104, name: 'Carlos Rodríguez' },
            amount: 87900,
            currency: 'CLP',
            payment_method: 'DEBIT_CARD',
            status: 'COMPLETED',
            date: '2025-05-12T10:00:00Z'
          },
          {
            id: 5,
            order_id: 5005,
            order_number: 'ORD-20250512-MNO345',
            customer: { id: 105, name: 'Patricia Soto' },
            amount: 345600,
            currency: 'CLP',
            payment_method: 'BANK_TRANSFER',
            status: 'PENDING',
            date: '2025-05-12T14:30:00Z'
          },
          {
            id: 6,
            order_id: 5006,
            order_number: 'ORD-20250513-PQR678',
            customer: { id: 106, name: 'Fernando López' },
            amount: 215000,
            currency: 'CLP',
            payment_method: 'CREDIT_CARD',
            status: 'COMPLETED',
            date: '2025-05-13T11:20:00Z'
          },
          {
            id: 7,
            order_id: 5007,
            order_number: 'ORD-20250513-STU901',
            customer: { id: 107, name: 'Camila Díaz' },
            amount: 78500,
            currency: 'CLP',
            payment_method: 'DEBIT_CARD',
            status: 'FAILED',
            date: '2025-05-13T16:05:00Z'
          },
          {
            id: 8,
            order_id: 5008,
            order_number: 'ORD-20250514-VWX234',
            customer: { id: 108, name: 'Javier Morales' },
            amount: 189600,
            currency: 'CLP',
            payment_method: 'BANK_TRANSFER',
            status: 'PENDING',
            date: '2025-05-14T09:40:00Z'
          },
          {
            id: 9,
            order_id: 5009,
            order_number: 'ORD-20250514-YZA567',
            customer: { id: 109, name: 'Laura Muñoz' },
            amount: 412300,
            currency: 'CLP',
            payment_method: 'CREDIT_CARD',
            status: 'COMPLETED',
            date: '2025-05-14T13:15:00Z'
          },
          {
            id: 10,
            order_id: 5010,
            order_number: 'ORD-20250514-BCD890',
            customer: { id: 110, name: 'Roberto Silva' },
            amount: 67200,
            currency: 'CLP',
            payment_method: 'BANK_TRANSFER',
            status: 'PENDING',
            date: '2025-05-14T15:50:00Z'
          }
        ];
        
        setPayments(mockPayments);
        setFilteredPayments(mockPayments);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading payments:', err);
        setError('Error al cargar los pagos. Por favor, intenta nuevamente.');
        setIsLoading(false);
      }
    };
    
    loadPayments();
  }, []);
  
  // Filtrar pagos cuando cambian los filtros
  useEffect(() => {
    if (!payments.length) return;
    
    const result = payments.filter(payment => {
      // Filtro de búsqueda en número de orden o cliente
      const searchMatch = 
        payment.order_number.toLowerCase().includes(filter.search.toLowerCase()) ||
        payment.customer.name.toLowerCase().includes(filter.search.toLowerCase());
      
      // Filtro por estado
      const statusMatch = 
        filter.status === 'all' || 
        payment.status.toLowerCase() === filter.status.toLowerCase();
      
      // Filtro por método de pago
      const methodMatch = 
        filter.method === 'all' || 
        payment.payment_method.toLowerCase() === filter.method.toLowerCase();
      
      // Filtro por fechas
      const dateMatch = 
        (!filter.dateFrom || new Date(payment.date) >= new Date(filter.dateFrom)) &&
        (!filter.dateTo || new Date(payment.date) <= new Date(filter.dateTo));
      
      return searchMatch && statusMatch && methodMatch && dateMatch;
    });
    
    setFilteredPayments(result);
  }, [filter, payments]);
  
  // Manejar cambio de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Limpiar filtros
  const handleClearFilters = () => {
    setFilter({
      search: '',
      status: 'all',
      method: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };
  
  // Abrir modal de confirmación
  const handleConfirmPayment = (payment) => {
    setSelectedPayment(payment);
    setConfirmationData({
      transactionId: '',
      notes: ''
    });
    setShowConfirmModal(true);
  };
  
  // Confirmar pago
  const handleSubmitConfirmation = async () => {
    if (!confirmationData.transactionId) {
      alert('El ID de transacción es requerido');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // En una app real, aquí llamaríamos a la API para confirmar el pago
      await new Promise(r => setTimeout(r, 1000));
      
      // Actualizar lista localmente para simular respuesta
      const updatedPayments = payments.map(payment => 
        payment.id === selectedPayment.id 
          ? { ...payment, status: 'COMPLETED' } 
          : payment
      );
      
      setPayments(updatedPayments);
      
      // Cerrar modal
      setShowConfirmModal(false);
      setIsProcessing(false);
      setSelectedPayment(null);
      
      // Mensaje de éxito
      alert('Pago confirmado correctamente');
    } catch (err) {
      console.error('Error confirming payment:', err);
      setIsProcessing(false);
      alert('Error al confirmar el pago. Por favor, intenta nuevamente.');
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-CL', options);
  };
  
  // Formatear moneda
  const formatCurrency = (amount, currency = 'CLP') => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // Renderizar badge según estado
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge bg="success">Completado</Badge>;
      case 'PENDING':
        return <Badge bg="warning" text="dark">Pendiente</Badge>;
      case 'FAILED':
        return <Badge bg="danger">Fallido</Badge>;
      case 'PROCESSING':
        return <Badge bg="info">Procesando</Badge>;
      case 'REFUNDED':
        return <Badge bg="secondary">Reembolsado</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Renderizar nombre de método de pago
  const renderPaymentMethod = (method) => {
    switch (method) {
      case 'CREDIT_CARD':
        return 'Tarjeta de crédito';
      case 'DEBIT_CARD':
        return 'Tarjeta de débito';
      case 'BANK_TRANSFER':
        return 'Transferencia bancaria';
      default:
        return method;
    }
  };
  
  // Renderizar carga
  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando información de pagos...</p>
        </div>
      </Container>
    );
  }
  
  // Renderizar error
  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Gestión de Pagos</h1>
      
      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Filtros</h5>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Buscar</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Orden o cliente..."
                    name="search"
                    value={filter.search}
                    onChange={handleFilterChange}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="status"
                  value={filter.status}
                  onChange={handleFilterChange}
                >
                  <option value="all">Todos</option>
                  <option value="completed">Completados</option>
                  <option value="pending">Pendientes</option>
                  <option value="failed">Fallidos</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Método de pago</Form.Label>
                <Form.Select
                  name="method"
                  value={filter.method}
                  onChange={handleFilterChange}
                >
                  <option value="all">Todos</option>
                  <option value="credit_card">Tarjeta de crédito</option>
                  <option value="debit_card">Tarjeta de débito</option>
                  <option value="bank_transfer">Transferencia bancaria</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Desde</Form.Label>
                <Form.Control
                  type="date"
                  name="dateFrom"
                  value={filter.dateFrom}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Hasta</Form.Label>
                <Form.Control
                  type="date"
                  name="dateTo"
                  value={filter.dateTo}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <div className="text-end">
            <Button
              variant="outline-secondary"
              onClick={handleClearFilters}
              className="me-2"
            >
              Limpiar filtros
            </Button>
            <Button
              variant="primary"
              onClick={() => {/* Aquí podría ir una acción adicional al aplicar filtros */}}
            >
              Aplicar filtros
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* Pestañas de pagos */}
      <Tabs 
        defaultActiveKey="all" 
        id="payment-tabs"
        className="mb-3"
      >
        <Tab eventKey="all" title="Todos los pagos">
          <Card>
            <Card.Body>
              {filteredPayments.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Orden</th>
                        <th>Cliente</th>
                        <th>Método</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map(payment => (
                        <tr key={payment.id}>
                          <td>{payment.order_number}</td>
                          <td>{payment.customer.name}</td>
                          <td>{renderPaymentMethod(payment.payment_method)}</td>
                          <td>{formatCurrency(payment.amount, payment.currency)}</td>
                          <td>{formatDate(payment.date)}</td>
                          <td>{renderStatusBadge(payment.status)}</td>
                          <td className="text-end">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => navigate(`/accountant/orders/${payment.order_id}`)}
                            >
                              <i className="bi bi-eye"></i> Ver orden
                            </Button>
                            
                            {payment.status === 'PENDING' && payment.payment_method === 'BANK_TRANSFER' && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleConfirmPayment(payment)}
                              >
                                <i className="bi bi-check-circle"></i> Confirmar
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="info">
                  No se encontraron pagos con los filtros actuales.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="pending" title="Pendientes">
          <Card>
            <Card.Body>
              {filteredPayments.filter(p => p.status === 'PENDING').length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Orden</th>
                        <th>Cliente</th>
                        <th>Método</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments
                        .filter(p => p.status === 'PENDING')
                        .map(payment => (
                          <tr key={payment.id}>
                            <td>{payment.order_number}</td>
                            <td>{payment.customer.name}</td>
                            <td>{renderPaymentMethod(payment.payment_method)}</td>
                            <td>{formatCurrency(payment.amount, payment.currency)}</td>
                            <td>{formatDate(payment.date)}</td>
                            <td className="text-end">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => navigate(`/accountant/orders/${payment.order_id}`)}
                              >
                                <i className="bi bi-eye"></i> Ver orden
                              </Button>
                              
                              {payment.payment_method === 'BANK_TRANSFER' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleConfirmPayment(payment)}
                                >
                                  <i className="bi bi-check-circle"></i> Confirmar
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="info">
                  No hay pagos pendientes.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="completed" title="Completados">
          <Card>
            <Card.Body>
              {filteredPayments.filter(p => p.status === 'COMPLETED').length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Orden</th>
                        <th>Cliente</th>
                        <th>Método</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments
                        .filter(p => p.status === 'COMPLETED')
                        .map(payment => (
                          <tr key={payment.id}>
                            <td>{payment.order_number}</td>
                            <td>{payment.customer.name}</td>
                            <td>{renderPaymentMethod(payment.payment_method)}</td>
                            <td>{formatCurrency(payment.amount, payment.currency)}</td>
                            <td>{formatDate(payment.date)}</td>
                            <td className="text-end">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/accountant/orders/${payment.order_id}`)}
                              >
                                <i className="bi bi-eye"></i> Ver orden
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="info">
                  No hay pagos completados con los filtros actuales.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      {/* Modal de confirmación de pago */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <div>
              <Alert variant="info">
                <p className="mb-1"><strong>Orden:</strong> {selectedPayment.order_number}</p>
                <p className="mb-1"><strong>Cliente:</strong> {selectedPayment.customer.name}</p>
                <p className="mb-0"><strong>Monto:</strong> {formatCurrency(selectedPayment.amount, selectedPayment.currency)}</p>
              </Alert>
              
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>ID de transacción <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={confirmationData.transactionId}
                    onChange={(e) => setConfirmationData({
                      ...confirmationData,
                      transactionId: e.target.value
                    })}
                    placeholder="Ingrese ID de transferencia"
                  />
                  <Form.Text className="text-muted">
                    Ingrese el ID o número de transferencia bancaria.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Notas</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={confirmationData.notes}
                    onChange={(e) => setConfirmationData({
                      ...confirmationData,
                      notes: e.target.value
                    })}
                    placeholder="Notas adicionales"
                  />
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleSubmitConfirmation}
            disabled={!confirmationData.transactionId || isProcessing}
          >
            {isProcessing ? (
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
              'Confirmar pago'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentsManagement;