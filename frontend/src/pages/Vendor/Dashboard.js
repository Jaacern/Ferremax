import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import SalesChart from '../../components/dashboard/SalesChart';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import { 
  Grid, Paper, Typography, Box, Alert, Card, CardContent, 
  Chip, Button, LinearProgress, Divider
} from '@mui/material';
import { 
  ShoppingBag, LocalShipping, AssignmentTurnedIn, 
  Warning, TrendingUp, Notifications 
} from '@mui/icons-material';

const VendorDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [salesData, setSalesData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [summaryData, setSummaryData] = useState({
    pendingOrders: 0,
    approvedOrders: 0,
    deliveredOrders: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // En un ambiente real, estas serían llamadas a APIs reales
        // Aquí se simulan datos para desarrollo
        
        // Intentamos cargar algunas órdenes pendientes, si las hay
        try {
          const ordersResponse = await api.get('/orders?status=PENDING&per_page=5');
          setPendingOrders(ordersResponse.data.orders.slice(0, 3));
        } catch (err) {
          console.error('Error al cargar órdenes pendientes:', err);
          // No fallamos todo el dashboard si esta parte falla
          setPendingOrders([]);
        }

        // Datos simulados para el dashboard
        setSalesData([
          { month: 'Ene', value: 42 },
          { month: 'Feb', value: 37 },
          { month: 'Mar', value: 51 },
          { month: 'Abr', value: 45 },
          { month: 'May', value: 53 },
          { month: 'Jun', value: 49 },
        ]);
        
        setActivities([
          { id: 1, type: 'order', message: 'Nuevo pedido #ORD-20240515-ABC123 recibido', timestamp: '2024-05-15T10:30:00Z' },
          { id: 2, type: 'stock', message: 'Alerta de stock bajo: Martillo Stanley (5 unidades)', timestamp: '2024-05-15T09:45:00Z' },
          { id: 3, type: 'order', message: 'Pedido #ORD-20240514-DEF456 completado', timestamp: '2024-05-15T08:15:00Z' },
          { id: 4, type: 'order', message: 'Pedido #ORD-20240514-GHI789 aprobado', timestamp: '2024-05-14T16:20:00Z' },
        ]);
        
        setSummaryData({
          pendingOrders: 7,
          approvedOrders: 4,
          deliveredOrders: 15,
          lowStockItems: 3
        });
        
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Suscribirse a eventos de notificación SSE (Server Sent Events)
    const setupSSE = () => {
      const eventSource = new EventSource('/stream');
      
      // Escuchar alertas de stock
      eventSource.addEventListener('stock_alert', (event) => {
        const data = JSON.parse(event.data);
        // Actualizar contador de alertas o mostrar notificación
        setSummaryData(prev => ({
          ...prev,
          lowStockItems: prev.lowStockItems + 1
        }));
        
        // Añadir a actividades
        setActivities(prev => [{
          id: Date.now(),
          type: 'stock',
          message: data.message,
          timestamp: data.timestamp
        }, ...prev].slice(0, 10)); // Mantenemos solo los 10 más recientes
      });
      
      // Escuchar notificaciones de pedidos
      eventSource.addEventListener('order_notifications', (event) => {
        const data = JSON.parse(event.data);
        // Actualizar contadores según el estado
        if (data.status === 'pendiente') {
          setSummaryData(prev => ({
            ...prev,
            pendingOrders: prev.pendingOrders + 1
          }));
        }
        
        // Añadir a actividades
        setActivities(prev => [{
          id: Date.now(),
          type: 'order',
          message: data.message,
          timestamp: data.timestamp
        }, ...prev].slice(0, 10));
      });
      
      // Limpiar al desmontar
      return () => {
        eventSource.close();
      };
    };
    
    // Intentar configurar SSE si estamos en un navegador que lo soporta
    if (typeof EventSource !== 'undefined') {
      const cleanup = setupSSE();
      return cleanup;
    }
    
  }, []);

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  if (!user || user.role !== 'vendor') {
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
        Dashboard de Vendedor
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Bienvenido, {user.first_name || user.username}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <LinearProgress sx={{ mb: 4 }} />
      ) : (
        <>
          {/* Tarjetas de resumen */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShoppingBag color="warning" fontSize="large" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Pedidos Pendientes
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {summaryData.pendingOrders}
                  </Typography>
                  <Box mt={1}>
                    <Chip 
                      label="Por aprobar" 
                      color="warning" 
                      size="small" 
                      variant="outlined"
                      component={Link}
                      to="/vendor/orders-to-approve"
                      clickable
                      sx={{ mr: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentTurnedIn color="info" fontSize="large" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Pedidos Aprobados
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {summaryData.approvedOrders}
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
                      Pedidos Entregados
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {summaryData.deliveredOrders}
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
                      Alertas de Stock
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {summaryData.lowStockItems}
                  </Typography>
                  {summaryData.lowStockItems > 0 && (
                    <Typography variant="body2" color="error">
                      ¡Atención requerida!
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Pedidos pendientes (acordeón) */}
          {pendingOrders.length > 0 && (
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Pedidos Pendientes de Aprobación
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  component={Link}
                  to="/vendor/orders-to-approve"
                >
                  Ver todos
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                {pendingOrders.map(order => (
                  <Grid item xs={12} key={order.id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1">
                            Pedido #{order.order_number}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {formatDate(order.created_at)} - {formatCurrency(order.final_amount)}
                          </Typography>
                        </Box>
                        <Button 
                          variant="contained" 
                          color="primary"
                          size="small"
                          component={Link}
                          to={`/vendor/orders-to-approve/${order.id}`}
                        >
                          Revisar
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
          
          <Grid container spacing={3}>
            {/* Gráfico de ventas */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Ventas Mensuales
                  </Typography>
                </Box>
                <SalesChart data={salesData} loading={false} />
              </Paper>
            </Grid>
            
            {/* Actividades recientes */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Actividades Recientes
                  </Typography>
                </Box>
                <ActivityFeed activities={activities} loading={false} />
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default VendorDashboard;