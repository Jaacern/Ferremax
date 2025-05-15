import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/auth.slice';
import api from '../../services/api';

const Orders = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar pedidos del usuario
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/orders');
        setOrders(response.data.orders || []);
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
        setError('No se pudieron cargar tus pedidos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);
  
  // Función para formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };
  
  // Función para formatear fecha
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-CL', options);
  };
  
  // Obtener el badge según el estado del pedido
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendiente':
        return <Badge bg="warning" text="dark">Pendiente</Badge>;
      case 'aprobado':
        return <Badge bg="info">Aprobado</Badge>;
      case 'rechazado':
        return <Badge bg="danger">Rechazado</Badge>;
      case 'en preparación':
        return <Badge bg="primary">En preparación</Badge>;
      case 'listo para entrega':
        return <Badge bg="success">Listo para entrega</Badge>;
      case 'enviado':
        return <Badge bg="primary">Enviado</Badge>;
      case 'entregado':
        return <Badge bg="success">Entregado</Badge>;
      case 'cancelado':
        return <Badge bg="danger">Cancelado</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Mis Pedidos</h1>
      
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando pedidos...</span>
          </Spinner>
          <p className="mt-3">Cargando tus pedidos...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">
          {error}
        </Alert>
      ) : orders.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>No tienes pedidos</h4>
            <p className="text-muted mb-4">
              Aún no has realizado ningún pedido. ¡Comienza a comprar ahora!
            </p>
            <Button 
              as={Link}
              to="/products"
              variant="primary"
            >
              Ir al catálogo
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Nº Pedido</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>{formatPrice(order.final_amount || order.total_amount)}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <Button 
                        as={Link}
                        to={`/orders/${order.id}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        Ver detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Orders;