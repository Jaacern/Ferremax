import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../services/api';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const VendorDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0
  });
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener órdenes pendientes
        const pendingResponse = await api.get('/orders?status=pendiente&per_page=5');
        setPendingOrders(pendingResponse.data.orders || []);
        
        // Obtener órdenes recientes
        const recentResponse = await api.get('/orders?per_page=5');
        setRecentOrders(recentResponse.data.orders || []);
        
        // Obtener estadísticas de órdenes
        const statsResponse = await api.get('/vendor/stats');
        setOrderStats(statsResponse.data.order_stats || {
          pending: 0,
          approved: 0, 
          rejected: 0,
          completed: 0
        });
        
        // Obtener datos de ventas para el gráfico
        const salesResponse = await api.get('/vendor/sales');
        const salesChartData = {
          labels: salesResponse.data.dates || getLast7Days(),
          datasets: [
            {
              label: 'Ventas ($)',
              data: salesResponse.data.sales || [0, 0, 0, 0, 0, 0, 0],
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
              label: 'Pedidos',
              data: salesResponse.data.orders || [0, 0, 0, 0, 0, 0, 0],
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
          ]
        };
        setSalesData(salesChartData);
        
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Función para obtener los últimos 7 días (fallback si la API no devuelve fechas)
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }));
    }
    return dates;
  };
  
  // Función para formatear precios
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };
  
  // Función para formatear fechas
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-CL', options);
  };
  
  // Configuración de las opciones del gráfico
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ventas de los últimos 7 días',
      },
    },
  };
  
  // Obtener el badge según el estado del pedido
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendiente':
        return <Badge bg="warning" text="dark">Pendiente</Badge>;
      case 'aprobado':
        return <Badge bg="info">Aprobado</Badge>;
      case 'rechazado':
        return <Badge bg="danger">Rechazado</Badge>;
      case 'en preparación':
        return <Badge bg="primary">En preparación</Badge>;
      case 'listo para entrega':
        return <Badge bg="success">Listo para entrega</Badge>;
      case 'enviado':
        return <Badge bg="primary">Enviado</Badge>;
      case 'entregado':
        return <Badge bg="success">Entregado</Badge>;
      case 'cancelado':
        return <Badge bg="danger">Cancelado</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando dashboard...</span>
        </Spinner>
        <p className="mt-3">Cargando datos del dashboard...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Dashboard de Vendedor</h1>
      
      {/* Tarjetas de estadísticas */}
      <Row className="mb-4">
        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-primary h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Pedidos Pendientes
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{orderStats.pending}</div>
                </Col>
                <Col xs="auto">
                  <i className="bi bi-hourglass-split fa-2x text-gray-300"></i>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-success h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Pedidos Aprobados
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{orderStats.approved}</div>
                </Col>
                <Col xs="auto">
                  <i className="bi bi-check-circle fa-2x text-gray-300"></i>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-info h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Pedidos Completados
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{orderStats.completed}</div>
                </Col>
                <Col xs="auto">
                  <i className="bi bi-truck fa-2x text-gray-300"></i>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-4">
          <Card className="border-left-warning h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Pedidos Rechazados
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{orderStats.rejected}</div>
                </Col>
                <Col xs="auto">
                  <i className="bi bi-x-circle fa-2x text-gray-300"></i>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Gráfico de ventas y acciones rápidas */}
      <Row className="mb-4">
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold">Visión general de ventas</h6>
            </Card.Header>
            <Card.Body>
              <div className="chart-area">
                <Line options={chartOptions} data={salesData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header className="py-3">
              <h6 className="m-0 font-weight-bold">Acciones rápidas</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  as={Link} 
                  to="/vendor/orders-to-approve" 
                  variant="primary" 
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>Ver pedidos pendientes</span>
                  <Badge bg="light" text="dark">{orderStats.pending}</Badge>
                </Button>
                
                <Button 
                  as={Link} 
                  to="/vendor/product-inventory" 
                  variant="info" 
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>Revisar inventario</span>
                  <i className="bi bi-box-seam"></i>
                </Button>
                
                <Button 
                  as={Link} 
                  to="/vendor/orders" 
                  variant="secondary" 
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>Ver todos los pedidos</span>
                  <i className="bi bi-list-ul"></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header className="py-3">
              <h6 className="m-0 font-weight-bold">Resumen de hoy</h6>
            </Card.Header>
            <Card.Body className="py-3">
              <p><strong>Pedidos nuevos:</strong> {orderStats.today_new || 0}</p>
              <p><strong>Pedidos aprobados:</strong> {orderStats.today_approved || 0}</p>
              <p><strong>Pedidos rechazados:</strong> {orderStats.today_rejected || 0}</p>
              <p><strong>Ventas totales:</strong> {formatPrice(orderStats.today_sales || 0)}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Pedidos pendientes y recientes */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold">Pedidos pendientes de aprobación</h6>
              <Button 
                as={Link} 
                to="/vendor/orders-to-approve" 
                variant="primary" 
                size="sm"
              >
                Ver todos
              </Button>
            </Card.Header>
            <Card.Body>
              {pendingOrders.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Nº Pedido</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.order_number}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>{formatPrice(order.final_amount || order.total_amount)}</td>
                        <td>
                          <Button 
                            as={Link}
                            to={`/vendor/orders/${order.id}`}
                            variant="outline-primary"
                            size="sm"
                          >
                            Revisar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-3">
                  <p className="mb-0">No hay pedidos pendientes de aprobación.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold">Pedidos recientes</h6>
              <Button 
                as={Link} 
                to="/vendor/orders" 
                variant="primary" 
                size="sm"
              >
                Ver todos
              </Button>
            </Card.Header>
            <Card.Body>
              {recentOrders.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Nº Pedido</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.order_number}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td>{formatPrice(order.final_amount || order.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-3">
                  <p className="mb-0">No hay pedidos recientes.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VendorDashboard;