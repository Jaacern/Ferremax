import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, ButtonGroup } from 'react-bootstrap';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalesChart = ({ salesData = [], title = "Análisis de Ventas" }) => {
  const [period, setPeriod] = useState('month');
  const [chartType, setChartType] = useState('line');
  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState({
    total: 0,
    average: 0,
    change: 0,
    changePercentage: 0
  });
  
  // Procesar datos cuando cambia el período o los datos
  useEffect(() => {
    if (!salesData || salesData.length === 0) {
      return;
    }
    
    // Obtener etiquetas y datos según el período seleccionado
    const { labels, values, previousValues } = processDataByPeriod(salesData, period);
    
    // Calcular resumen
    const currentTotal = values.reduce((sum, value) => sum + value, 0);
    const previousTotal = previousValues.reduce((sum, value) => sum + value, 0);
    const change = currentTotal - previousTotal;
    const changePercentage = previousTotal !== 0 
      ? (change / previousTotal) * 100 
      : 0;
    
    setSummary({
      total: currentTotal,
      average: values.length > 0 ? currentTotal / values.length : 0,
      change,
      changePercentage
    });
    
    // Crear datos para el gráfico
    setChartData({
      labels,
      datasets: [
        {
          label: 'Ventas actuales',
          data: values,
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4
        },
        {
          label: 'Período anterior',
          data: previousValues,
          fill: false,
          backgroundColor: 'rgba(201, 203, 207, 0.2)',
          borderColor: 'rgba(201, 203, 207, 1)',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    });
  }, [salesData, period]);
  
  // Función para procesar los datos según el período
  const processDataByPeriod = (data, period) => {
    // Ordenar datos por fecha
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let labels = [];
    let values = [];
    let previousValues = [];
    
    // Diferentes estrategias según el período
    switch (period) {
      case 'day':
        // Datos por hora para el día seleccionado
        labels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
        values = [12500, 8700, 5400, 17800, 26500, 38200, 41000, 32500]; // Ejemplo
        previousValues = [10200, 7600, 4800, 15600, 22800, 33500, 39200, 28700]; // Ejemplo
        break;
      
      case 'week':
        // Datos por día para la semana actual
        labels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        values = [145000, 172000, 163000, 188000, 213000, 287000, 173000]; // Ejemplo
        previousValues = [132000, 158000, 151000, 175000, 198000, 263000, 161000]; // Ejemplo
        break;
      
      case 'month':
        // Datos por semana para el mes actual
        labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
        values = [850000, 920000, 880000, 990000]; // Ejemplo
        previousValues = [810000, 860000, 790000, 920000]; // Ejemplo
        break;
      
      case 'year':
        // Datos por mes para el año actual
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        values = [
          3200000, 3100000, 3300000, 3400000, 3600000, 
          3800000, 3900000, 4100000, 4000000, 4200000, 
          4300000, 4500000
        ]; // Ejemplo
        previousValues = [
          3000000, 2900000, 3100000, 3200000, 3400000,
          3600000, 3700000, 3800000, 3700000, 3900000,
          4000000, 4200000
        ]; // Ejemplo
        break;
      
      default:
        break;
    }
    
    return { labels, values, previousValues };
  };
  
  // Opciones de gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value);
          }
        }
      }
    }
  };
  
  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };

  // Si no hay datos, mostrar mensaje
  if (!chartData) {
    return (
      <Card className="h-100">
        <Card.Header as="h5">{title}</Card.Header>
        <Card.Body className="text-center py-5">
          <div className="py-5">
            <i className="bi bi-graph-up fs-1 text-muted mb-3 d-block"></i>
            <p className="text-muted">No hay datos de ventas disponibles.</p>
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
              style={{ width: '120px' }}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="day">Diario</option>
              <option value="week">Semanal</option>
              <option value="month">Mensual</option>
              <option value="year">Anual</option>
            </Form.Select>
            
            <ButtonGroup size="sm">
              <Button
                variant={chartType === 'line' ? 'primary' : 'outline-primary'}
                onClick={() => setChartType('line')}
              >
                <i className="bi bi-graph-up"></i>
              </Button>
              <Button
                variant={chartType === 'bar' ? 'primary' : 'outline-primary'}
                onClick={() => setChartType('bar')}
              >
                <i className="bi bi-bar-chart"></i>
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Tarjetas de resumen */}
        <Row className="mb-4 g-3">
          <Col md={3} xs={6}>
            <Card className="h-100 bg-light border-0">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Ventas Totales</h6>
                <h4>{formatCurrency(summary.total)}</h4>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} xs={6}>
            <Card className="h-100 bg-light border-0">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Promedio</h6>
                <h4>{formatCurrency(summary.average)}</h4>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} xs={6}>
            <Card className="h-100 bg-light border-0">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">Variación</h6>
                <h4 className={summary.change >= 0 ? 'text-success' : 'text-danger'}>
                  {summary.change >= 0 ? '+' : ''}{formatCurrency(summary.change)}
                </h4>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} xs={6}>
            <Card className="h-100 bg-light border-0">
              <Card.Body className="text-center">
                <h6 className="text-muted mb-2">% Cambio</h6>
                <h4 className={summary.changePercentage >= 0 ? 'text-success' : 'text-danger'}>
                  {summary.changePercentage >= 0 ? '+' : ''}
                  {summary.changePercentage.toFixed(2)}%
                </h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Gráfico */}
        <div style={{ height: '300px' }} className="mb-3">
          {chartType === 'line' ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </Card.Body>
      
      <Card.Footer className="text-muted small">
        <i className="bi bi-info-circle me-1"></i>
        Los datos del período actual se comparan con el período anterior.
      </Card.Footer>
    </Card>
  );
};

export default SalesChart;