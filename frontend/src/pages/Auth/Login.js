import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../../store/auth.slice';

import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      switch (userRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'vendor':
          navigate('/vendor');
          break;
        case 'warehouse':
          navigate('/warehouse');
          break;
        case 'accountant':
          navigate('/accountant');
          break;
        case 'customer':
        default:
          navigate('/');
          break;
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Iniciar Sesión</h2>
                <p className="text-muted">
                  Accede a tu cuenta de FERREMAS
                </p>
              </div>
              
              <LoginForm />
              
              <div className="mt-4 text-center">
                <p className="mb-0">
                  ¿No tienes una cuenta?{' '}
                  <Link to="/register" className="text-decoration-none">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
          
          <Alert variant="info" className="mt-4">
            <strong>Información:</strong> Puedes iniciar sesión con:
            <ul className="mb-0 mt-2">
              <li>
                <strong>Admin:</strong> usuario: <code>admin</code>, contraseña: <code>Admin123!</code>
              </li>
              <li>
                <strong>Vendedor:</strong> usuario: <code>vendedor</code>, contraseña: <code>Vendedor123!</code>
              </li>
              <li>
                <strong>Bodeguero:</strong> usuario: <code>bodeguero</code>, contraseña: <code>Bodeguero123!</code>
              </li>
              <li>
                <strong>Contador:</strong> usuario: <code>contador</code>, contraseña: <code>Contador123!</code>
              </li>
              <li>
                <strong>Cliente:</strong> usuario: <code>cliente</code>, contraseña: <code>Cliente123!</code>
              </li>
            </ul>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;