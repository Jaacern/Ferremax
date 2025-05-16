import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { 
  Box, Typography, Paper, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Alert, Grid, FormControl,
  InputLabel, Select, MenuItem, Card, CardContent,
  Divider
} from '@mui/material';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { Download, FilterList, Search } from '@mui/icons-material';

const SalesReport = () => {
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para filtros
  const [dateRange, setDateRange] = useState({
    from: '', // Primer día del mes actual
    to: '' // Día actual
  });
  const [branchFilter, setBranchFilter] = useState('');
  const [branches, setBranches] = useState([]);
  
  // Estado para datos del reporte
  const [reportData, setReportData] = useState({
    summary: {
      totalSales: 0,
      totalOrders: 0,
      avgTicket: 0,
      totalProducts: 0
    },
    salesByCategory: [],
    salesByBranch: [],
    salesByPaymentMethod: [],
    monthlySales: []
  });

  useEffect(() => {
    // Establecer fechas por defecto (mes actual)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setDateRange({
      from: firstDay.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    });
    
    // Cargar sucursales
    fetchBranches();
  }, []);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchReportData();
    }
  }, [dateRange, branchFilter]);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/products/branches');
      setBranches(response.data.branches);
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
      setError('No se pudieron cargar las sucursales');
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        from_date: dateRange.from,
        to_date: dateRange.to
      });
      
      if (branchFilter) {
        params.append('branch_id', branchFilter);
      }
      
      // Esta ruta es hipotética, el backend no tiene un endpoint específico
      // para informes de ventas, sería necesario implementarlo
      // const response = await api.get(`/accountant/sales-report?${params.toString()}`);
      
      // Por ahora, simularemos datos
      setTimeout(() => {
        // Datos simulados para el informe
        const mockReportData = {
          summary: {
            totalSales: 25430000,
            totalOrders: 175,
            avgTicket: 145314,
            totalProducts: 532
          },
          salesByCategory: [
            { name: 'Herramientas Manuales', value: 7850000 },
            { name: 'Herramientas Eléctricas', value: 10200000 },
            { name: 'Materiales de Construcción', value: 4300000 },
            { name: 'Equipos de Seguridad', value: 1200000 },
            { name: 'Otros', value: 1880000 }
          ],
          salesByBranch: [
            { name: 'Casa Matriz Santiago', value: 12500000 },
            { name: 'Sucursal Providencia', value: 7630000 },
            { name: 'Sucursal Las Condes', value: 5300000 }
          ],
          salesByPaymentMethod: [
            { name: 'Tarjeta de Crédito', value: 14230000 },
            { name: 'Tarjeta de Débito', value: 8500000 },
            { name: 'Transferencia Bancaria', value: 2700000 }
          ],
          monthlySales: [
            { month: 'Ene', sales: 4200000 },
            { month: 'Feb', sales: 3800000 },
            { month: 'Mar', sales: 5100000 },
            { month: 'Abr', sales: 4700000 },
            { month: 'May', sales: 5900000 }
          ]
        };
        
        setReportData(mockReportData);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error al cargar reporte:', err);
      setError('No se pudo cargar el reporte de ventas. Intente nuevamente.');
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  const handleExportReport = () => {
    // Aquí se implementaría la lógica para exportar el reporte
    // Podría ser un PDF, Excel, CSV, etc.
    alert('Función de exportación no implementada');
  };

  // Formatear montos en pesos chilenos
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (!user || user.role !== 'accountant') {
    return (
      <Box p={3}>
        <Alert severity="error">
          No tiene permisos para acceder a esta página
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom component="h1">
        Informe de Ventas
      </Typography>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Filtros */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3} md={2}>
            <TextField
              fullWidth
              label="Desde"
              type="date"
              name="from"
              value={dateRange.from}
              onChange={handleDateChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={3} md={2}>
            <TextField
              fullWidth
              label="Hasta"
              type="date"
              name="to"
              value={dateRange.to}
              onChange={handleDateChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sucursal</InputLabel>
              <Select
                value={branchFilter}
                label="Sucursal"
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <MenuItem value="">Todas las sucursales</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2} md={3} textAlign="right">
            <Button
              variant="contained"
              color="primary"
              startIcon={<FilterList />}
              onClick={fetchReportData}
              disabled={loading}
            >
              Filtrar
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={12} md={2} textAlign="right">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Download />}
              onClick={handleExportReport}
              disabled={loading}
            >
              Exportar
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          Cargando informe...
        </Box>
      ) : (
        <>
          {/* Tarjetas de resumen */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="textSecondary">
                    Total de Ventas
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(reportData.summary.totalSales)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="textSecondary">
                    Pedidos Realizados
                  </Typography>
                  <Typography variant="h4">
                    {reportData.summary.totalOrders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="textSecondary">
                    Ticket Promedio
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(reportData.summary.avgTicket)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="textSecondary">
                    Productos Vendidos
                  </Typography>
                  <Typography variant="h4">
                    {reportData.summary.totalProducts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Gráficos */}
          <Grid container spacing={3}>
            {/* Gráfico de ventas mensuales */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Ventas Mensuales
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.monthlySales}>
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value / 1000000}M`} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Ventas']} 
                      labelFormatter={(label) => `Mes: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="sales" name="Ventas" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Gráfico de ventas por método de pago */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Ventas por Método de Pago
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.salesByPaymentMethod}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.salesByPaymentMethod.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Gráfico de ventas por categoría */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Ventas por Categoría
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={reportData.salesByCategory}
                    layout="vertical"
                  >
                    <XAxis type="number" tickFormatter={(value) => `$${value / 1000000}M`} />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value" name="Ventas" fill="#00C49F">
                      {reportData.salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Gráfico de ventas por sucursal */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Ventas por Sucursal
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={reportData.salesByBranch}
                    layout="vertical"
                  >
                    <XAxis type="number" tickFormatter={(value) => `$${value / 1000000}M`} />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value" name="Ventas" fill="#FFBB28">
                      {reportData.salesByBranch.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default SalesReport;