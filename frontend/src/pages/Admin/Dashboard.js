import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import SalesChart from '../../components/dashboard/SalesChart';
import StockChart from '../../components/dashboard/StockChart';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import { Grid, Paper, Typography, Box, Alert } from '@mui/material';

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Aquí harías las llamadas a la API para obtener datos para el dashboard
        // Por ejemplo:
        
        // Datos de ventas recientes
        /*
        const salesResponse = await api.get('/admin/dashboard/sales');
        setSalesData(salesResponse.data.sales);
        
        // Datos de stock
        const stockResponse = await api.get('/admin/dashboard/stock');
        setStockData(stockResponse.data.stock);
        
        // Actividades recientes
        const activitiesResponse = await api.get('/admin/dashboard/activities');
        setActivities(activitiesResponse.data.activities);
        */
        
        // Como ejemplo, usaremos datos simulados:
        setSalesData([
          { month: 'Ene', value: 4000 },
          { month: 'Feb', value: 3000 },
          { month: 'Mar', value: 5000 },
          { month: 'Abr', value: 4500 },
          { month: 'May', value: 6000 },
          { month: 'Jun', value: 5500 },
        ]);
        
        setStockData([
          { category: 'Herramientas Manuales', value: 45 },
          { category: 'Herramientas Eléctricas', value: 30 },
          { category: 'Materiales de Construcción', value: 60 },
          { category: 'Acabados', value: 25 },
          { category: 'Equipos de Seguridad', value: 15 },
        ]);
        
        setActivities([
          { id: 1, type: 'order', message: 'Nuevo pedido #ORD-20240515-ABC123 creado', timestamp: '2024-05-15T10:30:00Z' },
          { id: 2, type: 'stock', message: 'Alerta de stock bajo: Martillo Stanley (5 unidades)', timestamp: '2024-05-15T09:45:00Z' },
          { id: 3, type: 'user', message: 'Nuevo usuario registrado: cliente@ejemplo.com', timestamp: '2024-05-15T08:15:00Z' },
          { id: 4, type: 'payment', message: 'Pago confirmado para pedido #ORD-20240514-XYZ789', timestamp: '2024-05-14T16:20:00Z' },
        ]);
        
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (!user || user.role !== 'admin') {
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
        Dashboard de Administrador
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Bienvenido, {user.first_name || user.username}
      </Typography>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3} className="mt-4">
        {/* Gráfico de ventas */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ventas Mensuales
            </Typography>
            <SalesChart data={salesData} loading={loading} />
          </Paper>
        </Grid>
        
        {/* Gráfico de stock */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Distribución de Inventario
            </Typography>
            <StockChart data={stockData} loading={loading} />
          </Paper>
        </Grid>
        
        {/* Actividades recientes */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Actividades Recientes
            </Typography>
            <ActivityFeed activities={activities} loading={loading} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;