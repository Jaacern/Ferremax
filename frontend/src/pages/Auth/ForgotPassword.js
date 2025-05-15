import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setMessage(null);
    
    try {
      // En una aplicación real, aquí harías una petición al backend
      // Simulación de envío de correo electrónico
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage('Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.');
      setEmail('');
    } catch (err) {
      setError('No se pudo procesar tu solicitud. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Recuperar contraseña</h2>
                <p className="text-muted">
                  Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                </p>
              </div>
              
              {message && (
                <Alert variant="success" className="mb-4">
                  {message}
                </Alert>
              )}
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa un correo electrónico válido.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Enviando...
                      </>
                    ) : (
                      'Enviar instrucciones'
                    )}
                  </Button>
                </div>
              </Form>
              
              <div className="mt-4 text-center">
                <div className="mb-2">
                  <Link to="/login" className="text-decoration-none">
                    <i className="bi bi-arrow-left me-1"></i> Volver a iniciar sesión
                  </Link>
                </div>
                <div>
                  ¿No tienes una cuenta? <Link to="/register" className="text-decoration-none">Regístrate</Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;