import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/auth.slice';

const PaymentSuccess = () => {
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  
  // Extraer información de la URL si existe
  const queryParams = new URLSearchParams(location.search);
  const orderNumber = queryParams.get('order') || 'ORD-20250514-XYZ123'; // Valor de ejemplo
  
  // Efecto para simular un scroll hacia arriba cuando se carga la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-success shadow-sm">
            <Card.Body className="text-center p-5">
              <div className="mb-4">
                <span className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-check-lg" style={{ fontSize: '3rem' }}></i>
                </span>
              </div>
              
              <h1 className="mb-3 text-success">¡Pago exitoso!</h1>
              
              <p className="mb-4 lead">
                Tu pedido ha sido procesado correctamente. 
                Pronto recibirás un correo electrónico con los detalles de tu compra.
              </p>
              
              <Alert variant="info" className="d-inline-block mb-4">
                <strong>Número de orden:</strong> {orderNumber}
              </Alert>
              
              <div className="mb-4">
                <p>
                  Estimado/a <strong>{currentUser?.first_name || 'Cliente'}</strong>, 
                  muchas gracias por tu compra.
                </p>
                
                {location.state?.deliveryMethod === 'PICKUP' ? (
                  <p>
                    Podrás retirar tu pedido en la sucursal seleccionada una vez que recibas 
                    la confirmación por correo electrónico.
                  </p>
                ) : (
                  <p>
                    Tu pedido será preparado y enviado a la dirección proporcionada. 
                    Podrás seguir el estado de tu envío en la sección "Mis Pedidos".
                  </p>
                )}
              </div>
              
              <div className="d-grid gap-2">
                {currentUser ? (
                  <Button as={Link} to="/orders" variant="primary" size="lg">
                    Ver mis pedidos
                  </Button>
                ) : (
                  <Button as={Link} to="/login" variant="primary" size="lg">
                    Iniciar sesión
                  </Button>
                )}
                
                <Button as={Link} to="/products" variant="outline-secondary">
                  Continuar comprando
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSuccess;