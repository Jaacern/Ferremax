import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import SalesChart from '../../components/dashboard/SalesChart';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import { Grid, Paper, Typography, Box, Alert, Card, CardContent } from '@mui/material';
import { AttachMoney, Timeline, LocalShipping, MoneyOff } from '@mui/icons-material';

const AccountantDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [salesData, setSalesData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalSales: 0,
    pendingPayments: 0,
    confirmedPayments: 0,
    avgTicket: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Aquí harías las llamadas a la API para obtener datos para el dashboard
        // Como ejemplo, usaremos datos simulados:
        setSalesData([
          { month: 'Ene', value: 4000000 },
          { month: 'Feb', value: 3500000 },
          { month: 'Mar', value: 5200000 },
          { month: 'Abr', value: 4800000 },
          { month: 'May', value: 6100000 },
          { month: 'Jun', value: 5700000 },
        ]);
        
        setActivities([
          { id: 1, type: 'payment', message: 'Pago confirmado: #ORD-20240515-ABC123 por $45.000', timestamp: '2024-05-15T10:30:00Z' },
          { id: 2, type: 'order', message: 'Nueva orden pendiente de pago: #ORD-20240515-DEF456', timestamp: '2024-05-15T09:45:00Z' },
          { id: 3, type: 'payment', message: 'Transferencia bancaria registrada para #ORD-20240514-GHI789', timestamp: '2024-05-15T08:15:00Z' },
          { id: 4, type: 'payment', message: 'Pago rechazado para #ORD-20240514-JKL012', timestamp: '2024-05-14T16:20:00Z' },
        ]);
        
        setSummaryData({
          totalSales: 25430000,
          pendingPayments: 5,
          confirmedPayments: 18,
          avgTicket: 145000
        });
        
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Formatear montos en pesos chilenos
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

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
        Dashboard Contable
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
                <AttachMoney color="primary" fontSize="large" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Ventas Totales
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(summaryData.totalSales)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Timeline color="success" fontSize="large" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Ticket Promedio
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(summaryData.avgTicket)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalShipping color="secondary" fontSize="large" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Pagos Confirmados
                </Typography>
              </Box>
              <Typography variant="h4">
                {summaryData.confirmedPayments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyOff color="error" fontSize="large" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Pagos Pendientes
                </Typography>
              </Box>
              <Typography variant="h4">
                {summaryData.pendingPayments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Gráfico de ventas */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ventas Mensuales
            </Typography>
            <SalesChart data={salesData} loading={loading} formatY={formatCurrency} />
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
      </Grid>
    </Box>
  );
};

export default AccountantDashboard;