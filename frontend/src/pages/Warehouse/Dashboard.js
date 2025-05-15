import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Table, Button, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import api from '../../services/api';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const WarehouseDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockStats, setStockStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    stockAlerts: []
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [recentTransfers, setRecentTransfers] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [stockDistribution, setStockDistribution] = useState({
    labels: [],
    data: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // En una implementación real, haríamos múltiples llamadas a la API para obtener los datos
        // Para simplificar, simularemos respuestas

        // 1. Buscar información del usuario para obtener su sucursal
        const userResponse = await api.get('/auth/profile');
        const userBranch = userResponse.data.user.branch_id || 1;
        setSelectedBranch(userBranch);

        // 2. Obtener estadísticas de stock
        const stockResponse = await api.get('/stock/alerts', {
          params: { branch_id: userBranch }
        });
        
        // 3. Obtener órdenes pendientes para preparar
        const ordersResponse = await api.get('/orders', {
          params: { 
            branch_id: userBranch,
            status: 'APPROVED'
          }
        });

        // 4. Obtener transferencias recientes
        const transfersResponse = await fetchMockTransfers();

        // 5. Obtener distribución de stock por categoría
        const stockDistributionData = await fetchMockStockDistribution();

        // Actualizar estados con los datos obtenidos
        setStockStats({
          totalProducts: 150, // Simulado
          lowStockCount: stockResponse.data.alerts.filter(a => a.alert_level === 'warning').length,
          outOfStockCount: stockResponse.data.alerts.filter(a => a.alert_level === 'critical').length,
          stockAlerts: stockResponse.data.alerts.slice(0, 5) // Solo mostrar 5 primeras alertas
        });

        setPendingOrders(ordersResponse.data.orders.slice(0, 5));
        setRecentTransfers(transfersResponse);
        setStockDistribution(stockDistributionData);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error al cargar los datos del dashboard. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Función para simular datos de transferencias recientes
  const fetchMockTransfers = async () => {
    // Simular un retraso de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 1,
        date: '2025-05-13T14:30:00',
        source_branch: 'Casa Matriz Santiago',
        target_branch: 'Sucursal Providencia',
        product_name: 'Taladro Percutor Bosch',
        quantity: 5
      },
      {
        id: 2,
        date: '2025-05-12T11:15:00',
        source_branch: 'Sucursal Las Condes',
        target_branch: 'Casa Matriz Santiago',
        product_name: 'Sierra Circular Dewalt',
        quantity: 2
      },
      {
        id: 3,
        date: '2025-05-11T16:45:00',
        source_branch: 'Casa Matriz Santiago',
        target_branch: 'Sucursal Maipú',
        product_name: 'Set de Destornilladores Stanley',
        quantity: 10
      }
    ];
  };

  // Función para simular datos de distribución de stock
  const fetchMockStockDistribution = async () => {
    // Simular un retraso de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      labels: ['Herramientas Manuales', 'Herramientas Eléctricas', 'Materiales de Construcción', 'Acabados', 'Seguridad'],
      data: [25, 30, 20, 15, 10]
    };
  };

  // Configuración para gráfico de barras
  const barChartData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      {
        label: 'Entradas',
        data: [65, 59, 80, 81, 56],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Salidas',
        data: [45, 79, 50, 41, 36],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  // Configuración para gráfico de torta
  const pieChartData = {
    labels: stockDistribution.labels,
    datasets: [
      {
        data: stockDistribution.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CL');
  };

  if (isLoading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando dashboard de bodega...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Dashboard de Bodega</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Cards de resumen */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100 border-primary">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Stock Total</Card.Title>
              <div className="d-flex align-items-center mt-auto">
                <div className="display-4 me-3">{stockStats.totalProducts}</div>
                <div className="text-muted">productos en inventario</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100 border-warning">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Stock Bajo</Card.Title>
              <div className="d-flex align-items-center mt-auto">
                <div className="display-4 me-3 text-warning">{stockStats.lowStockCount}</div>
                <div className="text-muted">productos con stock bajo</div>
              </div>
              <Link to="/warehouse/stock?low_stock=true" className="btn btn-sm btn-outline-warning mt-2">
                Ver detalles
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100 border-danger">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Sin Stock</Card.Title>
              <div className="d-flex align-items-center mt-auto">
                <div className="display-4 me-3 text-danger">{stockStats.outOfStockCount}</div>
                <div className="text-muted">productos agotados</div>
              </div>
              <Link to="/warehouse/stock?out_of_stock=true" className="btn btn-sm btn-outline-danger mt-2">
                Ver detalles
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col lg={8}>
          {/* Órdenes pendientes para preparar */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Órdenes Pendientes de Preparación</h5>
              <Link to="/warehouse/pending-orders" className="btn btn-sm btn-primary">
                Ver todas
              </Link>
            </Card.Header>
            <Card.Body>
              {pendingOrders.length === 0 ? (
                <Alert variant="info">
                  <p className="mb-0">No hay órdenes pendientes de preparación en este momento.</p>
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>N° Orden</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.order_number}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          {order.user?.first_name} {order.user?.last_name}
                        </td>
                        <td>
                          <Badge bg="success">Aprobado</Badge>
                        </td>
                        <td>
                          <Button
                            as={Link}
                            to={`/warehouse/orders/${order.id}`}
                            variant="outline-primary"
                            size="sm"
                          >
                            Preparar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
          
          {/* Transferencias recientes */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Transferencias Recientes</h5>
              <Link to="/warehouse/stock/transfers" className="btn btn-sm btn-primary">
                Gestionar transferencias
              </Link>
            </Card.Header>
            <Card.Body>
              {recentTransfers.length === 0 ? (
                <Alert variant="info">
                  <p className="mb-0">No hay transferencias recientes.</p>
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Origen</th>
                      <th>Destino</th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransfers.map(transfer => (
                      <tr key={transfer.id}>
                        <td>{formatDate(transfer.date)}</td>
                        <td>{transfer.source_branch}</td>
                        <td>{transfer.target_branch}</td>
                        <td>{transfer.product_name}</td>
                        <td>{transfer.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          {/* Alertas de stock */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Alertas de Stock</h5>
            </Card.Header>
            <Card.Body>
              {stockStats.stockAlerts.length === 0 ? (
                <Alert variant="success">
                  <p className="mb-0">No hay alertas de stock en este momento.</p>
                </Alert>
              ) : (
                <div>
                  {stockStats.stockAlerts.map((alert, index) => (
                    <div key={index} className="mb-3 pb-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="mb-0">{alert.product_name}</h6>
                        {alert.alert_level === 'critical' ? (
                          <Badge bg="danger">Agotado</Badge>
                        ) : (
                          <Badge bg="warning">Stock bajo</Badge>
                        )}
                      </div>
                      <div className="text-muted small mb-2">
                        {alert.branch_name} | SKU: {alert.product_sku}
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="me-2">
                          {alert.current_stock} / {alert.min_stock}
                        </div>
                        <ProgressBar
                          className="flex-grow-1"
                          variant={alert.alert_level === 'critical' ? 'danger' : 'warning'}
                          now={(alert.current_stock / alert.min_stock) * 100}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    as={Link}
                    to="/warehouse/stock/alerts"
                    variant="outline-danger"
                    size="sm"
                    className="w-100"
                  >
                    Ver todas las alertas
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {/* Distribución de stock por categoría */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Distribución de Stock</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px' }}>
                <Pie 
                  data={pieChartData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          boxWidth: 12
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Gráfico de movimientos */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Movimientos de Inventario</h5>
        </Card.Header>
        <Card.Body>
          <div style={{ height: '300px' }}>
            <Bar 
              data={barChartData} 
              options={{
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Entradas y Salidas de Inventario'
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Cantidad'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Mes'
                    }
                  }
                }
              }}
            />
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WarehouseDashboard;