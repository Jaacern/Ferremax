import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import StockChart from '../../components/dashboard/StockChart';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import { 
  Grid, Paper, Typography, Box, Alert, Card, 
  CardContent, Chip, Divider, Button
} from '@mui/material';
import { 
  LocalShipping, WarehouseOutlined, Warning, 
  CheckCircle, Inventory 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const WarehouseDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [stockData, setStockData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [summaryData, setSummaryData] = useState({
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branchId, setBranchId] = useState(null);
  
  useEffect(() => {
    // En un caso real, obtendríamos el branch_id del usuario desde el backend
    // Para este ejemplo, usaremos el ID 1
    setBranchId(1);
  }, []);
  
  useEffect(() => {
    if (branchId) {
      fetchDashboardData();
    }
  }, [branchId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener órdenes pendientes/en preparación/listas
      const ordersResponse = await api.get(`/orders?branch_id=${branchId}`);
      const ordersData = ordersResponse.data.orders;
      
      // Contar órdenes por estado
      const pendingOrders = ordersData.filter(o => o.status === 'aprobado').length;
      const preparingOrders = ordersData.filter(o => o.status === 'en preparación').length;
      const readyOrders = ordersData.filter(o => o.status === 'listo para entrega').length;
      
      // Obtener datos de stock
      const stockResponse = await api.get(`/stock?branch_id=${branchId}`);
      const stocksData = stockResponse.data.stocks;
      
      // Contar items con stock bajo
      const lowStockItems = stocksData.filter(s => s.is_low_stock).length;
      
      // Agrupar datos de stock por categoría para el gráfico
      const stockByCategory = {};
      stocksData.forEach(item => {
        const category = item.product?.category || 'Otros';
        stockByCategory[category] = (stockByCategory[category] || 0) + item.quantity;
      });
      
      const stockChartData = Object.keys(stockByCategory).map(category => ({
        name: category,
        value: stockByCategory[category]
      }));
      
      // Obtener actividades recientes (en un caso real se consultaría al backend)
      // Aquí simulamos algunas actividades
      const recentActivities = [
        { id: 1, type: 'order', message: 'Pedido #ORD-20240515-ABC123 marcado como listo', timestamp: '2024-05-15T10:30:00Z' },
        { id: 2, type: 'stock', message: 'Alerta de stock bajo: Martillo Stanley', timestamp: '2024-05-15T09:45:00Z' },
        { id: 3, type: 'transfer', message: 'Transferencia de stock recibida desde Sucursal Las Condes', timestamp: '2024-05-15T08:15:00Z' },
        { id: 4, type: 'order', message: 'Pedido #ORD-20240514-DEF456 en preparación', timestamp: '2024-05-14T16:20:00Z' },
      ];
      
      // Actualizar estado
      setSummaryData({
        pendingOrders,
        preparingOrders,
        readyOrders,
        lowStockItems
      });
      
      setStockData(stockChartData);
      setActivities(recentActivities);
      
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('No se pudieron cargar los datos del dashboard. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'warehouse') {
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
        Dashboard de Bodega
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Bienvenido, {user.first_name || user.username}
      </Typography>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Tarjetas de resumen */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="primary" fontSize="large" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Pedidos Pendientes
                </Typography>
              </Box>
              <Typography variant="h4">
                {summaryData.pendingOrders}
              </Typography>
              <Box mt={1}>
                <Chip 
                  label="Por preparar" 
                  color="primary" 
                  size="small" 
                  variant="outlined"
                  component={Link}
                  to="/warehouse/pending-orders"
                  clickable
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarehouseOutlined color="secondary" fontSize="large" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  En Preparación
                </Typography>
              </Box>
              <Typography variant="h4">
                {summaryData.preparingOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalShipping color="success" fontSize="large" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Listos para Entrega
                </Typography>
              </Box>
              <Typography variant="h4">
                {summaryData.readyOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color="error" fontSize="large" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Stock Bajo
                </Typography>
              </Box>
              <Typography variant="h4">
                {summaryData.lowStockItems}
              </Typography>
              <Box mt={1}>
                <Chip 
                  label="Ver alertas" 
                  color="error" 
                  size="small" 
                  variant="outlined"
                  component={Link}
                  to="/warehouse/stock-management?filter=low"
                  clickable
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Gráfico de stock */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Distribución de Inventario
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<Inventory />}
                component={Link}
                to="/warehouse/stock-management"
              >
                Gestionar Stock
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                Cargando datos de stock...
              </Box>
            ) : (
              <StockChart data={stockData} />
            )}
          </Paper>
        </Grid>
        
        {/* Actividades recientes */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Actividades Recientes
            </Typography>
            <ActivityFeed activities={activities} loading={loading} />
          </Paper>
        </Grid>
        
        {/* Acciones rápidas */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Acciones rápidas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<LocalShipping />}
                  component={Link}
                  to="/warehouse/pending-orders"
                >
                  Procesar Pedidos
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  startIcon={<Inventory />}
                  component={Link}
                  to="/warehouse/stock-management"
                >
                  Gestionar Stock
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  component={Link}
                  to="/warehouse/stock-management?action=transfer"
                >
                  Transferir Stock
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  component={Link}
                  to="/warehouse/stock-management?filter=low"
                >
                  Ver Alertas
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WarehouseDashboard;