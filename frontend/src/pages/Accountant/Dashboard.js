import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registrar los componentes necesarios para Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const AccountantDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [paymentsData, setPaymentsData] = useState(null);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [error, setError] = useState(null);

  // Simular carga de datos
  useEffect(() => {
    // En una app real, aquí cargaríamos datos desde la API
    const loadData = async () => {
      try {
        // Simular tiempo de carga
        await new Promise(r => setTimeout(r, 800));

        // Datos simulados para gráficos y estadísticas
        setSalesData({
          daily: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [
              {
                label: 'Ventas diarias',
                data: [12500000, 9800000, 10200000, 15600000, 18900000, 21200000, 14500000],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
              }
            ]
          },
          branches: {
            labels: ['Casa Matriz', 'Providencia', 'Las Condes', 'Maipú', 'Viña del Mar', 'Concepción', 'Temuco'],
            datasets: [
              {
                label: 'Ventas mensuales por sucursal',
                data: [45600000, 32500000, 28900000, 19800000, 22300000, 18500000, 15200000],
                backgroundColor: [
                  'rgba(255, 99, 132, 0.5)',
                  'rgba(54, 162, 235, 0.5)',
                  'rgba(255, 206, 86, 0.5)',
                  'rgba(75, 192, 192, 0.5)',
                  'rgba(153, 102, 255, 0.5)',
                  'rgba(255, 159, 64, 0.5)',
                  'rgba(199, 199, 199, 0.5)'
                ],
              }
            ]
          }
        });

        setPaymentsData({
          totalSales: 182800000,
          totalPaid: 168400000,
          totalPending: 14400000,
          methods: {
            credit: 98500000,
            debit: 52300000,
            transfer: 17600000,
            other: 0
          },
          status: {
            completed: 287,
            pending: 42,
            failed: 8
          }
        });

        setPendingTransfers([
          { id: 1, order_number: 'ORD-20250512-ABC123', customer: 'María González', amount: 125000, date: '2025-05-12' },
          { id: 2, order_number: 'ORD-20250513-DEF456', customer: 'Juan Pérez', amount: 298500, date: '2025-05-13' },
          { id: 3, order_number: 'ORD-20250513-GHI789', customer: 'Ana Martínez', amount: 156800, date: '2025-05-13' },
          { id: 4, order_number: 'ORD-20250514-JKL012', customer: 'Carlos Rodríguez', amount: 87900, date: '2025-05-14' },
          { id: 5, order_number: 'ORD-20250514-MNO345', customer: 'Patricia Soto', amount: 345600, date: '2025-05-14' }
        ]);

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Error al cargar los datos del dashboard. Por favor, intenta nuevamente.');
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Formatear número como moneda CLP
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };

  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando datos del dashboard...</p>
        </div>
      </Container>
    );
  }

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
      <h1 className="mb-4">Dashboard de Contabilidad</h1>

      {/* Métricas principales */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-4 mb-lg-0">
          <Card className="h-100 border-primary">
            <Card.Body className="d-flex flex-column align-items-center text-center">
              <div className="text-primary mb-2">
                <i className="bi bi-graph-up" style={{ fontSize: '2rem' }}></i>
              </div>
              <Card.Title>Ventas Totales</Card.Title>
              <h3 className="mt-2">{formatCurrency(paymentsData.totalSales)}</h3>
              <p className="text-muted mb-0">Este mes</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4 mb-lg-0">
          <Card className="h-100 border-success">
            <Card.Body className="d-flex flex-column align-items-center text-center">
              <div className="text-success mb-2">
                <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
              </div>
              <Card.Title>Pagos Confirmados</Card.Title>
              <h3 className="mt-2">{formatCurrency(paymentsData.totalPaid)}</h3>
              <p className="text-muted mb-0">{paymentsData.status.completed} transacciones</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4 mb-lg-0">
          <Card className="h-100 border-warning">
            <Card.Body className="d-flex flex-column align-items-center text-center">
              <div className="text-warning mb-2">
                <i className="bi bi-hourglass-split" style={{ fontSize: '2rem' }}></i>
              </div>
              <Card.Title>Pagos Pendientes</Card.Title>
              <h3 className="mt-2">{formatCurrency(paymentsData.totalPending)}</h3>
              <p className="text-muted mb-0">{paymentsData.status.pending} transacciones</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 border-danger">
            <Card.Body className="d-flex flex-column align-items-center text-center">
              <div className="text-danger mb-2">
                <i className="bi bi-x-circle" style={{ fontSize: '2rem' }}></i>
              </div>
              <Card.Title>Pagos Fallidos</Card.Title>
              <h3 className="mt-2">{paymentsData.status.failed}</h3>
              <p className="text-muted mb-0">Requieren atención</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row className="mb-4">
        <Col lg={8} className="mb-4 mb-lg-0">
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Tendencia de Ventas</h5>
            </Card.Header>
            <Card.Body>
              <Line
                data={salesData.daily}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return formatCurrency(context.parsed.y);
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      ticks: {
                        callback: function (value) {
                          return formatCurrency(value).replace('$', '') + ' CLP';
                        }
                      }
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Distribución de Métodos de Pago</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container" style={{ position: 'relative', height: '250px' }}>
                <Bar
                  data={{
                    labels: ['Tarjeta Crédito', 'Tarjeta Débito', 'Transferencia'],
                    datasets: [
                      {
                        label: 'Monto',
                        data: [
                          paymentsData.methods.credit,
                          paymentsData.methods.debit,
                          paymentsData.methods.transfer
                        ],
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.5)',
                          'rgba(54, 162, 235, 0.5)',
                          'rgba(255, 206, 86, 0.5)'
                        ],
                        borderColor: [
                          'rgba(255, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 206, 86, 1)'
                        ],
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return formatCurrency(context.parsed.y);
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value) {
                            if (value >= 1000000) {
                              return (value / 1000000).toFixed(0) + 'M';
                            }
                            return value;
                          }
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

      {/* Transferencias pendientes */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Transferencias Bancarias Pendientes</h5>
              <Button as={Link} to="/accountant/payments" variant="outline-primary" size="sm">
                Ver todos
              </Button>
            </Card.Header>
            <Card.Body>
              {pendingTransfers.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Orden</th>
                        <th>Cliente</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingTransfers.map(transfer => (
                        <tr key={transfer.id}>
                          <td>{transfer.order_number}</td>
                          <td>{transfer.customer}</td>
                          <td>{formatCurrency(transfer.amount)}</td>
                          <td>{transfer.date}</td>
                          <td>
                            <Badge bg="warning" text="dark">Pendiente</Badge>
                          </td>
                          <td className="text-end">
                            <Button variant="success" size="sm" className="me-2">
                              <i className="bi bi-check"></i> Confirmar
                            </Button>
                            <Button variant="outline-danger" size="sm">
                              <i className="bi bi-x"></i> Rechazar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="info">
                  No hay transferencias pendientes de aprobación.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ventas por sucursal */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Ventas por Sucursal</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Bar
                  data={salesData.branches}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return formatCurrency(context.parsed.y);
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value) {
                            if (value >= 1000000) {
                              return (value / 1000000).toFixed(0) + 'M';
                            }
                            return value;
                          }
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
    </Container>
  );
};

export default AccountantDashboard;