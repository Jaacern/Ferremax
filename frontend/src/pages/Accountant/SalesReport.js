import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../../store/auth.slice';

// Registrar componentes necesarios para Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const SalesReports = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedBranch, setSelectedBranch] = useState('all');
  
  // Simular carga de datos (en una aplicación real, esto vendría del backend)
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'accountant') return;
    
    setIsLoading(true);
    setError(null);
    
    // Simular petición al servidor
    setTimeout(() => {
      // Generar datos simulados
      const generateSalesData = () => {
        const labels = [];
        const salesValues = [];
        const profitValues = [];
        
        // Generar fechas para el rango seleccionado
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        const days = Math.floor((end - start) / (24 * 60 * 60 * 1000));
        
        for (let i = 0; i <= days; i++) {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          
          // Formatear fecha según el tipo de reporte
          let label;
          if (reportType === 'daily') {
            label = date.toLocaleDateString('es-CL');
          } else if (reportType === 'weekly') {
            const weekNumber = Math.ceil((((date - new Date(date.getFullYear(), 0, 1)) / 86400000) + 1) / 7);
            label = `Semana ${weekNumber}`;
          } else if (reportType === 'monthly') {
            label = date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
          }
          
          if (!labels.includes(label)) {
            labels.push(label);
            // Datos aleatorios de ventas y ganancias
            salesValues.push(Math.floor(Math.random() * 5000000) + 1000000);
            profitValues.push(Math.floor(Math.random() * 2000000) + 500000);
          }
        }
        
        // Datos por categoría
        const categorySales = [
          { category: 'Herramientas Manuales', sales: Math.floor(Math.random() * 3000000) + 1000000 },
          { category: 'Herramientas Eléctricas', sales: Math.floor(Math.random() * 4000000) + 2000000 },
          { category: 'Materiales de Construcción', sales: Math.floor(Math.random() * 5000000) + 3000000 },
          { category: 'Acabados', sales: Math.floor(Math.random() * 2000000) + 500000 },
          { category: 'Equipos de Seguridad', sales: Math.floor(Math.random() * 1500000) + 300000 }
        ];
        
        // Datos por sucursal
        const branchSales = [
          { branch: 'Casa Matriz Santiago', sales: Math.floor(Math.random() * 4000000) + 2000000 },
          { branch: 'Sucursal Providencia', sales: Math.floor(Math.random() * 3500000) + 1500000 },
          { branch: 'Sucursal Las Condes', sales: Math.floor(Math.random() * 4500000) + 2500000 },
          { branch: 'Sucursal Maipú', sales: Math.floor(Math.random() * 2500000) + 1000000 },
          { branch: 'Sucursal Viña del Mar', sales: Math.floor(Math.random() * 3000000) + 1200000 },
          { branch: 'Sucursal Concepción', sales: Math.floor(Math.random() * 2800000) + 1300000 },
          { branch: 'Sucursal Temuco', sales: Math.floor(Math.random() * 2200000) + 900000 }
        ];
        
        // Datos de top productos
        const topProducts = [
          { id: 1, name: 'Taladro Percutor Bosch', sku: 'FER-00002', sales: 126, revenue: 11338854 },
          { id: 2, name: 'Martillo Carpintero Stanley', sku: 'FER-00001', sales: 89, revenue: 1156110 },
          { id: 3, name: 'Sierra Circular Dewalt', sku: 'FER-00004', sales: 64, revenue: 8319360 },
          { id: 4, name: 'Juego de Destornilladores Makita', sku: 'FER-00003', sales: 52, revenue: 1039480 },
          { id: 5, name: 'Lijadora Eléctrica Black & Decker', sku: 'FER-00007', sales: 47, revenue: 2538000 }
        ];
        
        // Datos de pagos
        const payments = [
          { method: 'Tarjeta de Crédito', count: 287, amount: 12580000 },
          { method: 'Tarjeta de Débito', count: 354, amount: 9870000 },
          { method: 'Transferencia Bancaria', count: 142, amount: 7450000 },
          { method: 'Efectivo', count: 68, amount: 1280000 }
        ];
        
        return {
          timeline: { labels, salesValues, profitValues },
          categorySales,
          branchSales,
          topProducts,
          payments,
          totalSales: salesValues.reduce((a, b) => a + b, 0),
          totalProfit: profitValues.reduce((a, b) => a + b, 0),
          orderCount: Math.floor(Math.random() * 300) + 200
        };
      };
      
      setSalesData(generateSalesData());
      setIsLoading(false);
    }, 1500);
  }, [isAuthenticated, userRole, reportType, dateRange, selectedBranch]);
  
  // Formatear valores monetarios
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };
  
  // Configuración para gráfico de línea (ventas por tiempo)
  const timelineChartData = {
    labels: salesData?.timeline.labels || [],
    datasets: [
      {
        label: 'Ventas',
        data: salesData?.timeline.salesValues || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.2
      },
      {
        label: 'Ganancias',
        data: salesData?.timeline.profitValues || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.2
      }
    ]
  };
  
  // Configuración para gráfico de barras (ventas por categoría)
  const categoryChartData = {
    labels: salesData?.categorySales.map(item => item.category) || [],
    datasets: [
      {
        label: 'Ventas por Categoría',
        data: salesData?.categorySales.map(item => item.sales) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Configuración para gráfico de pie (métodos de pago)
  const paymentChartData = {
    labels: salesData?.payments.map(item => item.method) || [],
    datasets: [
      {
        label: 'Ventas por Método de Pago',
        data: salesData?.payments.map(item => item.amount) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Manejar cambio en el tipo de reporte
  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };
  
  // Manejar cambio en el rango de fechas
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };
  
  // Manejar cambio de sucursal
  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };
  
  // Manejar exportación de informe
  const handleExportReport = (format) => {
    alert(`Exportación a ${format} iniciada... Esta funcionalidad estaría implementada en una aplicación real.`);
  };
  
  // Si no está autenticado o no es contador, redirigir
  if (!isAuthenticated || userRole !== 'accountant') {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Acceso denegado</Alert.Heading>
          <p>
            No tienes permisos para acceder a esta sección. Esta página está reservada para contadores.
          </p>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Informes de ventas</h1>
          <p className="text-muted">
            Visualiza y analiza los datos de ventas de FERREMAS
          </p>
        </Col>
      </Row>
      
      {/* Filtros */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Informe</Form.Label>
                    <Form.Select 
                      value={reportType} 
                      onChange={handleReportTypeChange}
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Desde</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="startDate"
                      value={dateRange.startDate}
                      onChange={handleDateChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hasta</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="endDate"
                      value={dateRange.endDate}
                      onChange={handleDateChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sucursal</Form.Label>
                    <Form.Select 
                      value={selectedBranch} 
                      onChange={handleBranchChange}
                    >
                      <option value="all">Todas las sucursales</option>
                      <option value="1">Casa Matriz Santiago</option>
                      <option value="2">Sucursal Providencia</option>
                      <option value="3">Sucursal Las Condes</option>
                      <option value="4">Sucursal Maipú</option>
                      <option value="5">Sucursal Viña del Mar</option>
                      <option value="6">Sucursal Concepción</option>
                      <option value="7">Sucursal Temuco</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mt-2">
                <Col>
                  <Button variant="primary" onClick={() => setIsLoading(true)}>
                    Actualizar informe
                  </Button>
                  
                  <div className="float-end">
                    <Button 
                      variant="outline-secondary" 
                      className="me-2"
                      onClick={() => handleExportReport('pdf')}
                    >
                      <i className="bi bi-file-pdf me-1"></i> Exportar PDF
                    </Button>
                    <Button 
                      variant="outline-success"
                      onClick={() => handleExportReport('excel')}
                    >
                      <i className="bi bi-file-excel me-1"></i> Exportar Excel
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando informes...</span>
          </Spinner>
          <p className="mt-3">Generando informes...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">
          <Alert.Heading>Error al cargar informes</Alert.Heading>
          <p>{error}</p>
        </Alert>
      ) : salesData ? (
        <>
          {/* Tarjetas de resumen */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center h-100" bg="primary" text="white">
                <Card.Body>
                  <h6 className="text-uppercase mb-3">Ventas Totales</h6>
                  <h3 className="mb-0">{formatCurrency(salesData.totalSales)}</h3>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="text-center h-100" bg="success" text="white">
                <Card.Body>
                  <h6 className="text-uppercase mb-3">Ganancias</h6>
                  <h3 className="mb-0">{formatCurrency(salesData.totalProfit)}</h3>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="text-center h-100" bg="info" text="white">
                <Card.Body>
                  <h6 className="text-uppercase mb-3">Número de Pedidos</h6>
                  <h3 className="mb-0">{salesData.orderCount}</h3>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="text-center h-100" bg="warning" text="dark">
                <Card.Body>
                  <h6 className="text-uppercase mb-3">Ticket Promedio</h6>
                  <h3 className="mb-0">
                    {formatCurrency(salesData.totalSales / salesData.orderCount)}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Gráficos */}
          <Tabs
            defaultActiveKey="timeline"
            className="mb-4"
            fill
          >
            <Tab eventKey="timeline" title="Evolución de ventas">
              <Card>
                <Card.Body>
                  <Line 
                    data={timelineChartData} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: `Evolución de Ventas y Ganancias (${reportType === 'daily' ? 'Diaria' : reportType === 'weekly' ? 'Semanal' : 'Mensual'})`,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return formatCurrency(value);
                            }
                          }
                        }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="categories" title="Ventas por categoría">
              <Card>
                <Card.Body>
                  <Bar 
                    data={categoryChartData} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        title: {
                          display: true,
                          text: 'Ventas por Categoría de Producto',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return formatCurrency(value);
                            }
                          }
                        }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="branches" title="Ventas por sucursal">
              <Card>
                <Card.Body>
                  <div style={{ height: '400px' }}>
                    <Bar 
                      data={{
                        labels: salesData.branchSales.map(item => item.branch),
                        datasets: [
                          {
                            label: 'Ventas por Sucursal',
                            data: salesData.branchSales.map(item => item.sales),
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          title: {
                            display: true,
                            text: 'Ventas por Sucursal',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return formatCurrency(value);
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="payments" title="Métodos de pago">
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Pie 
                        data={paymentChartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'right',
                            },
                            title: {
                              display: true,
                              text: 'Ventas por Método de Pago',
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  let label = context.label || '';
                                  let value = context.raw || 0;
                                  return `${label}: ${formatCurrency(value)}`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </Col>
                    <Col md={6}>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Método de pago</th>
                            <th className="text-center">Cantidad</th>
                            <th className="text-end">Importe</th>
                            <th className="text-end">Porcentaje</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesData.payments.map((payment, index) => (
                            <tr key={index}>
                              <td>{payment.method}</td>
                              <td className="text-center">{payment.count}</td>
                              <td className="text-end">{formatCurrency(payment.amount)}</td>
                              <td className="text-end">
                                {((payment.amount / salesData.totalSales) * 100).toFixed(2)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="fw-bold">
                            <td>Total</td>
                            <td className="text-center">
                              {salesData.payments.reduce((sum, item) => sum + item.count, 0)}
                            </td>
                            <td className="text-end">{formatCurrency(salesData.totalSales)}</td>
                            <td className="text-end">100.00%</td>
                          </tr>
                        </tfoot>
                      </Table>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
          
          {/* Tabla de top productos */}
          <Card className="mb-4">
            <Card.Header as="h5">
              Top Productos más vendidos
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th className="text-center">Unidades vendidas</th>
                    <th className="text-end">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.topProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>{product.sku}</td>
                      <td>{product.name}</td>
                      <td className="text-center">{product.sales}</td>
                      <td className="text-end">{formatCurrency(product.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      ) : null}
    </Container>
  );
};

export default SalesReports;