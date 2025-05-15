import React, { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  selectIsAuthenticated, 
  selectPasswordChangeRequired 
} from '../../store/auth.slice';

import PasswordChange from '../../components/auth/PasswordChange';

const ChangePassword = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const passwordChangeRequired = useSelector(selectPasswordChangeRequired);

  // Si no está autenticado, redirigir al login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    // Si no necesita cambiar la contraseña y no está en la página por decisión propia
    else if (!passwordChangeRequired && !window.location.search.includes('voluntary=true')) {
      navigate('/');
    }
  }, [isAuthenticated, passwordChangeRequired, navigate]);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Cambiar Contraseña</h2>
                {passwordChangeRequired ? (
                  <p className="text-danger">
                    Es necesario cambiar tu contraseña para continuar.
                  </p>
                ) : (
                  <p className="text-muted">
                    Actualiza tu contraseña para mantener tu cuenta segura.
                  </p>
                )}
              </div>
              
              <PasswordChange />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ChangePassword;