import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

const AdminDashboard = () => {
  // Datos simulados para las gráficas y estadísticas
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar datos simulados
  useEffect(() => {
    // Simular carga de datos (en una app real, esto sería una llamada a la API)
    const loadData = async () => {
      setIsLoading(true);
      
      // Esperar un momento para simular la carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos simulados
      setStats({
        totalSales: 4582930,
        totalOrders: 156,
        pendingOrders: 23,
        lowStockProducts: 8
      });
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);
  
  // Datos para gráfico de ventas
  const salesData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        label: 'Ventas',
        data: [1250000, 1850000, 1350000, 2000000, 1750000, 2200000],
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  
  // Datos para gráfico de categorías
  const categoryData = {
    labels: ['Herramientas Manuales', 'Herramientas Eléctricas', 'Materiales de Construcción', 'Acabados', 'Seguridad'],
    datasets: [
      {
        label: 'Ventas por categoría',
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Datos para gráfico de pedidos
  const orderData = {
    labels: ['Pendientes', 'Aprobados', 'En preparación', 'Enviados', 'Entregados'],
    datasets: [
      {
        label: 'Estado de pedidos',
        data: [23, 45, 18, 32, 38],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ]
      }
    ]
  };
  
  // Órdenes recientes simuladas
  const recentOrders = [
    { id: 1, orderNumber: 'ORD-20250514-ABC123', customer: 'Carlos Rodríguez', date: '14/05/2025', total: 125990, status: 'Pendiente' },
    { id: 2, orderNumber: 'ORD-20250514-DEF456', customer: 'María López', date: '14/05/2025', total: 85450, status: 'Aprobado' },
    { id: 3, orderNumber: 'ORD-20250513-GHI789', customer: 'Juan Pérez', date: '13/05/2025', total: 235000, status: 'En preparación' },
    { id: 4, orderNumber: 'ORD-20250513-JKL012', customer: 'Ana Martínez', date: '13/05/2025', total: 56780, status: 'Enviado' },
    { id: 5, orderNumber: 'ORD-20250512-MNO345', customer: 'Pedro Sánchez', date: '12/05/2025', total: 178900, status: 'Entregado' }
  ];
  
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };
  
  // Opciones para gráficos
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ventas mensuales'
      }
    }
  };
  
  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Panel de Administración</h1>
        <div>
          <Button variant="primary" className="me-2">
            <i className="bi bi-file-earmark-text me-1"></i> Generar Informe
          </Button>
        </div>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <Row className="g-3 mb-4">
        <Col md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded">
                <i className="bi bi-currency-dollar text-primary fs-1"></i>
              </div>
              <div className="ms-3">
                <h6 className="text-muted mb-1">Ventas Totales</h6>
                <h3 className="mb-0">
                  {isLoading ? (
                    <span className="placeholder col-8"></span>
                  ) : (
                    formatPrice(stats.totalSales)
                  )}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded">
                <i className="bi bi-bag-check text-success fs-1"></i>
              </div>
              <div className="ms-3">
                <h6 className="text-muted mb-1">Pedidos Totales</h6>
                <h3 className="mb-0">
                  {isLoading ? (
                    <span className="placeholder col-4"></span>
                  ) : (
                    stats.totalOrders
                  )}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded">
                <i className="bi bi-hourglass-split text-warning fs-1"></i>
              </div>
              <div className="ms-3">
                <h6 className="text-muted mb-1">Pedidos Pendientes</h6>
                <h3 className="mb-0">
                  {isLoading ? (
                    <span className="placeholder col-4"></span>
                  ) : (
                    stats.pendingOrders
                  )}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-danger bg-opacity-10 p-3 rounded">
                <i className="bi bi-exclamation-triangle text-danger fs-1"></i>
              </div>
              <div className="ms-3">
                <h6 className="text-muted mb-1">Stock Bajo</h6>
                <h3 className="mb-0">
                  {isLoading ? (
                    <span className="placeholder col-4"></span>
                  ) : (
                    stats.lowStockProducts
                  )}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Enlaces rápidos */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Accesos rápidos</h5>
              <div className="d-flex gap-2 flex-wrap">
                <Button as={Link} to="/admin/products" variant="outline-primary">
                  <i className="bi bi-box me-1" /> Gestionar Productos
                </Button>

                <Button as={Link} to="/admin/users" variant="outline-primary">
                  <i className="bi bi-people me-1" /> Gestionar Usuarios
                </Button>

                <Button as={Link} to="/admin/orders" variant="outline-primary">
                  <i className="bi bi-bag me-1" /> Gestionar Pedidos
                </Button>

                <Button as={Link} to="/admin/stock" variant="outline-primary">
                  <i className="bi bi-clipboard-check me-1" /> Gestionar Stock
                </Button>

                <Button as={Link} to="/admin/branches" variant="outline-primary">
                  <i className="bi bi-shop me-1" /> Gestionar Sucursales
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Gráficos */}
      <Row className="g-3 mb-4">
        <Col lg={8}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Ventas Mensuales</h5>
              <div style={{ height: '300px' }}>
                <Line data={salesData} options={lineOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Ventas por Categoría</h5>
              <div className="d-flex justify-content-center" style={{ height: '300px' }}>
                <Pie data={categoryData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-3 mb-4">
        <Col lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Estado de Pedidos</h5>
              <div className="d-flex justify-content-center" style={{ height: '300px' }}>
                <Bar 
                  data={orderData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      },
                      title: {
                        display: true,
                        text: 'Pedidos por estado'
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Pedidos Recientes</h5>
                <Button as={Link} to="/admin/orders" variant="link" className="text-decoration-none">
                  Ver todos <i className="bi bi-arrow-right"></i>
                </Button>
              </div>
              
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Nº Pedido</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.orderNumber}</td>
                        <td>{order.customer}</td>
                        <td>{order.date}</td>
                        <td>{formatPrice(order.total)}</td>
                        <td>
                          <span className={`badge bg-${
                            order.status === 'Pendiente' ? 'warning' :
                            order.status === 'Aprobado' ? 'info' :
                            order.status === 'En preparación' ? 'primary' :
                            order.status === 'Enviado' ? 'secondary' :
                            'success'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <Button 
                            as={Link} 
                            to={`/admin/orders/${order.id}`} 
                            variant="link" 
                            size="sm" 
                            className="text-decoration-none p-0"
                          >
                            <i className="bi bi-eye"></i> Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;