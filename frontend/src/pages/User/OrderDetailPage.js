import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner, Alert, Container } from 'react-bootstrap';
import api from '../../services/api';
import OrderDetail from '../../components/orders/OrderDetail';  

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el detalle del pedido.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <Container className="py-4">
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-3">Cargando detalle del pedido...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <OrderDetail order={order} />
      )}
    </Container>
  );
};

export default OrderDetailPage;
