import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  PieController,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockChart = ({ stockData = [], title = "Análisis de Inventario" }) => {
  const [viewMode, setViewMode] = useState('category');
  const [branchFilter, setBranchFilter] = useState('all');
  const [chartData, setChartData] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  
  // Lista de sucursales disponibles (en una aplicación real, estos vendrían del backend)
  const branches = [
    { id: 'all', name: 'Todas las sucursales' },
    { id: '1', name: 'Casa Matriz Santiago' },
    { id: '2', name: 'Sucursal Providencia' },
    { id: '3', name: 'Sucursal Las Condes' },
    { id: '4', name: 'Sucursal Maipú' },
    { id: '5', name: 'Sucursal Viña del Mar' }
  ];
  
  // Procesar datos cuando cambia el modo de visualización o los datos
  useEffect(() => {
    if (!stockData || stockData.length === 0) {
      return;
    }
    
    // Filtrar datos por sucursal si es necesario
    const filteredData = branchFilter === 'all' 
      ? stockData 
      : stockData.filter(item => item.branch_id === branchFilter);
    
    // Calcular métricas
    let lowStock = 0;
    let outOfStock = 0;
    let totalStockCount = 0;
    
    filteredData.forEach(item => {
      if (item.quantity <= 0) {
        outOfStock++;
      } else if (item.quantity <= item.min_stock) {
        lowStock++;
      }
      totalStockCount += item.quantity;
    });
    
    setLowStockCount(lowStock);
    setOutOfStockCount(outOfStock);
    setTotalProducts(filteredData.length);
    setTotalStock(totalStockCount);
    
    // Preparar datos según el modo de visualización
    switch (viewMode) {
      case 'category':
        prepareDataByCategory(filteredData);
        break;
      case 'status':
        prepareDataByStatus(filteredData);
        break;
      case 'branch':
        prepareDataByBranch(filteredData);
        break;
      default:
        break;
    }
  }, [stockData, viewMode, branchFilter]);
  
  // Preparar datos por categoría
  const prepareDataByCategory = (data) => {
    // Agrupar por categoría
    const categoryCounts = {};
    
    data.forEach(item => {
      const category = item.product_category || 'Sin categoría';
      if (!categoryCounts[category]) {
        categoryCounts[category] = {
          total: 0,
          lowStock: 0,
          outOfStock: 0
        };
      }
      
      categoryCounts[category].total += item.quantity;
      
      if (item.quantity <= 0) {
        categoryCounts[category].outOfStock++;
      } else if (item.quantity <= item.min_stock) {
        categoryCounts[category].lowStock++;
      }
    });
    
    // Ordenar categorías por cantidad total
    const sortedCategories = Object.keys(categoryCounts).sort(
      (a, b) => categoryCounts[b].total - categoryCounts[a].total
    );
    
    // Preparar datos para el gráfico
    setChartData({
      labels: sortedCategories,
      datasets: [
        {
          label: 'Stock total',
          data: sortedCategories.map(cat => categoryCounts[cat].total),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgba(53, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Stock bajo',
          data: sortedCategories.map(cat => categoryCounts[cat].lowStock),
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        },
        {
          label: 'Sin stock',
          data: sortedCategories.map(cat => categoryCounts[cat].outOfStock),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    });
  };
  
  // Preparar datos por estado de stock
  const prepareDataByStatus = (data) => {
    // Contar productos por estado
    const healthyStock = data.filter(item => item.quantity > item.min_stock).length;
    const lowStock = data.filter(item => item.quantity > 0 && item.quantity <= item.min_stock).length;
    const outOfStock = data.filter(item => item.quantity <= 0).length;
    
    // Preparar datos para el gráfico
    setChartData({
      labels: ['Stock saludable', 'Stock bajo', 'Sin stock'],
      datasets: [
        {
          data: [healthyStock, lowStock, outOfStock],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
      ]
    });
  };
  
  // Preparar datos por sucursal
  const prepareDataByBranch = (data) => {
    // Agrupar por sucursal
    const branchCounts = {};
    
    data.forEach(item => {
      const branchName = item.branch_name || 'Desconocida';
      if (!branchCounts[branchName]) {
        branchCounts[branchName] = {
          total: 0,
          lowStock: 0,
          outOfStock: 0
        };
      }
      
      branchCounts[branchName].total += item.quantity;
      
      if (item.quantity <= 0) {
        branchCounts[branchName].outOfStock++;
      } else if (item.quantity <= item.min_stock) {
        branchCounts[branchName].lowStock++;
      }
    });
    
    // Ordenar sucursales por cantidad total
    const sortedBranches = Object.keys(branchCounts).sort(
      (a, b) => branchCounts[b].total - branchCounts[a].total
    );
    
    // Preparar datos para el gráfico
    setChartData({
      labels: sortedBranches,
      datasets: [
        {
          label: 'Stock total',
          data: sortedBranches.map(branch => branchCounts[branch].total),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgba(53, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Productos con stock bajo',
          data: sortedBranches.map(branch => branchCounts[branch].lowStock),
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        },
        {
          label: 'Productos sin stock',
          data: sortedBranches.map(branch => branchCounts[branch].outOfStock),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    });
  };
  
  // Opciones para gráficos de barras
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };
  
  // Opciones para gráficos de pastel
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };
  
  // Si no hay datos, mostrar mensaje
  if (!chartData) {
    return (
      <Card className="h-100">
        <Card.Header as="h5">{title}</Card.Header>
        <Card.Body className="text-center py-5">
          <div className="py-5">
            <i className="bi bi-box-seam fs-1 text-muted mb-3 d-block"></i>
            <p className="text-muted">No hay datos de inventario disponibles.</p>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className="h-100">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="m-0">{title}</h5>
          <div className="d-flex">
            <Form.Select 
              size="sm" 
              className="me-2" 
              style={{ width: '150px' }}
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Form.Select>
            
            <div className="btn-group btn-group-sm">
              <Button 
                variant={viewMode === 'category' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('category')}
              >
                Categorías
              </Button>
              <Button 
                variant={viewMode === 'status' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('status')}
              >
                Estado
              </Button>
              <Button 
                variant={viewMode === 'branch' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('branch')}
                disabled={branchFilter !== 'all'}
              >
                Sucursales
              </Button>
            </div>
          </div>
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Tarjetas de resumen */}
        <Row className="mb-4 g-3">
          <Col md={3} xs={6}>
            <Card className="h-100 bg-light border-0">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Productos totales</h6>
                <h4>{totalProducts}</h4>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} xs={6}>
            <Card className="h-100 bg-light border-0">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Stock total</h6>
                <h4>{totalStock.toLocaleString()}</h4>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} xs={6}>
            <Card className="h-100 bg-light border-0">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Stock bajo</h6>
                <div className="d-flex align-items-center justify-content-center">
                  <h4 className="mb-0 me-2">{lowStockCount}</h4>
                  <Badge bg="warning">
                    {((lowStockCount / totalProducts) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} xs={6}>
            <Card className="h-100 bg-light border-0">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Sin stock</h6>
                <div className="d-flex align-items-center justify-content-center">
                  <h4 className="mb-0 me-2">{outOfStockCount}</h4>
                  <Badge bg="danger">
                    {((outOfStockCount / totalProducts) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Gráfico */}
        <div style={{ height: '300px' }}>
          {viewMode === 'status' ? (
            <Pie data={chartData} options={pieOptions} />
          ) : (
            <Bar data={chartData} options={barOptions} />
          )}
        </div>
      </Card.Body>
      
      <Card.Footer className="text-muted small">
        <i className="bi bi-info-circle me-1"></i>
        {viewMode === 'category' && 'Visualización de stock por categoría de producto.'}
        {viewMode === 'status' && 'Distribución de productos según estado de stock.'}
        {viewMode === 'branch' && 'Comparación de niveles de stock entre sucursales.'}
      </Card.Footer>
    </Card>
  );
};

export default StockChart;