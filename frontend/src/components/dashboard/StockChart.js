import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * Componente que muestra un gráfico de stock para el dashboard.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.data - Datos de stock para el gráfico
 * @param {string} props.branch - Sucursal seleccionada para filtrar
 * @param {Function} props.onBranchChange - Función para cambiar la sucursal
 * @param {Array} props.branches - Lista de sucursales disponibles
 * @returns {React.ReactNode} - Gráfico de stock
 */
const StockChart = ({ data, branch, onBranchChange, branches }) => {
  const [chartData, setChartData] = useState([]);
  
  // Preparar datos para el gráfico
  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }
    
    // Filtrar por sucursal si es necesario
    const filteredData = branch ? data.filter(item => item.branch_id === branch) : data;
    
    // Tomar los 10 productos con menor stock
    const sortedData = [...filteredData].sort((a, b) => a.quantity - b.quantity);
    const lowStockData = sortedData.slice(0, 10);
    
    // Formatear datos para el gráfico
    const formattedData = lowStockData.map(item => ({
      name: item.product_name,
      quantity: item.quantity,
      min_stock: item.min_stock,
      id: item.product_id,
      status: item.quantity <= 0 ? 'out' : item.quantity <= item.min_stock ? 'low' : 'normal'
    }));
    
    setChartData(formattedData);
  }, [data, branch]);
  
  // Colores según estado del stock
  const getBarColor = (status) => {
    switch (status) {
      case 'out':
        return '#dc3545'; // Rojo - Agotado
      case 'low':
        return '#ffc107'; // Amarillo - Bajo
      default:
        return '#0d6efd'; // Azul - Normal
    }
  };
  
  // Personalizar tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const status = item.quantity <= 0 
        ? 'Agotado' 
        : item.quantity <= item.min_stock 
          ? 'Stock Bajo' 
          : 'Stock Normal';
      
      return (
        <div className="bg-white p-3 shadow-sm border" style={{ borderRadius: '4px' }}>
          <p className="mb-1 fw-bold">{label}</p>
          <p className="mb-1">
            <span>Cantidad actual:</span> 
            <span className="fw-bold ms-2">{item.quantity} unidades</span>
          </p>
          <p className="mb-1">
            <span>Stock mínimo:</span> 
            <span className="fw-bold ms-2">{item.min_stock} unidades</span>
          </p>
          <p className={`mb-0 fw-bold ${
            item.status === 'out' ? 'text-danger' : 
            item.status === 'low' ? 'text-warning' : 
            'text-success'
          }`}>
            Estado: {status}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="card h-100">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Stock por Producto</h5>
        <div>
          <select 
            className="form-select form-select-sm"
            value={branch || ''}
            onChange={(e) => onBranchChange(e.target.value ? parseInt(e.target.value, 10) : null)}
          >
            <option value="">Todas las sucursales</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="card-body">
        {!chartData || chartData.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center text-muted">
              <i className="bi bi-box-seam fs-1"></i>
              <p className="mt-2">No hay datos de stock disponibles.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: 100,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12 }} 
                width={90}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="quantity" name="Cantidad Actual">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
              <Bar dataKey="min_stock" name="Stock Mínimo" fill="#cccccc" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="card-footer bg-white">
        <div className="d-flex justify-content-around">
          <div className="d-flex align-items-center">
            <span className="badge bg-danger me-2">&nbsp;</span>
            <small>Agotado</small>
          </div>
          <div className="d-flex align-items-center">
            <span className="badge bg-warning me-2">&nbsp;</span>
            <small>Stock Bajo</small>
          </div>
          <div className="d-flex align-items-center">
            <span className="badge bg-primary me-2">&nbsp;</span>
            <small>Stock Normal</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;