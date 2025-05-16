import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { formatPrice } from '../../utils/formatUtils';

/**
 * Componente que muestra un gráfico de ventas históricas.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.data - Datos para el gráfico
 * @param {string} props.period - Período de tiempo (day, week, month, year)
 * @param {Function} props.onPeriodChange - Función para cambiar el período
 * @returns {React.ReactNode} - Gráfico de ventas
 */
const SalesChart = ({ data, period, onPeriodChange }) => {
  const [chartData, setChartData] = useState([]);
  
  // Procesar datos para el gráfico según el período seleccionado
  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }
    
    // Formatos de fecha según período
    const dateFormats = {
      day: { key: 'hour', format: (date) => date.getHours() + ':00' },
      week: { key: 'day', format: (date) => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()] },
      month: { key: 'day', format: (date) => date.getDate() },
      year: { key: 'month', format: (date) => ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][date.getMonth()] },
    };
    
    const { key, format } = dateFormats[period] || dateFormats.month;
    
    // Agrupar datos según período
    const groupedData = data.reduce((acc, item) => {
      const date = new Date(item.date);
      const groupKey = format(date);
      
      if (!acc[groupKey]) {
        acc[groupKey] = { 
          name: groupKey, 
          sales: 0, 
          orders: 0 
        };
      }
      
      acc[groupKey].sales += item.amount;
      acc[groupKey].orders += item.orders;
      return acc;
    }, {});
    
    // Convertir a array para el gráfico
    const formattedData = Object.values(groupedData);
    
    // Ordenar datos si es necesario
    if (period === 'day') {
      formattedData.sort((a, b) => {
        const hourA = parseInt(a.name.split(':')[0], 10);
        const hourB = parseInt(b.name.split(':')[0], 10);
        return hourA - hourB;
      });
    } else if (period === 'month') {
      formattedData.sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10));
    }
    
    setChartData(formattedData);
  }, [data, period]);
  
  // Personalizar tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-sm border" style={{ borderRadius: '4px' }}>
          <p className="mb-1 fw-bold">{label}</p>
          <p className="mb-1 text-primary" style={{ fontSize: '14px' }}>
            <span className="me-2">💰 Ventas:</span> 
            <span className="fw-bold">{formatPrice(payload[0].value)}</span>
          </p>
          <p className="mb-0 text-success" style={{ fontSize: '14px' }}>
            <span className="me-2">📦 Pedidos:</span> 
            <span className="fw-bold">{payload[1].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="card h-100">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Ventas</h5>
        <div className="btn-group btn-group-sm">
          <button
            className={`btn ${period === 'day' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onPeriodChange('day')}
          >
            Día
          </button>
          <button
            className={`btn ${period === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onPeriodChange('week')}
          >
            Semana
          </button>
          <button
            className={`btn ${period === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onPeriodChange('month')}
          >
            Mes
          </button>
          <button
            className={`btn ${period === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onPeriodChange('year')}
          >
            Año
          </button>
        </div>
      </div>
      <div className="card-body">
        {!chartData || chartData.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center text-muted">
              <i className="bi bi-bar-chart-line fs-1"></i>
              <p className="mt-2">No hay datos disponibles para este período.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left" 
                tickFormatter={(value) => `$${value / 1000}k`}
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={false}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                name="Ventas"
                stroke="#0d6efd"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Pedidos"
                stroke="#198754"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SalesChart;