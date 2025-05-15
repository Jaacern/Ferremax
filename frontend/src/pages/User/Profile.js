import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Tab, Nav } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, selectIsLoading, selectAuthError } from '../../store/auth.slice';

// En una aplicación real, importaríamos acciones para actualizar el perfil
// import { updateProfile } from '../../store/auth.slice';

const Profile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [validated, setValidated] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      });
    }
  }, [currentUser]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Limpiar mensajes
    setSuccessMessage('');
    
    try {
      // En una aplicación real, aquí despacharíamos la acción para actualizar el perfil
      // await dispatch(updateProfile(profileData)).unwrap();
      
      // Simulamos una actualización exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Perfil actualizado correctamente');
    } catch (err) {
      // El error ya se maneja en el slice
      console.error('Error al actualizar perfil:', err);
    }
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Mi Perfil</h1>
      
      <Row>
        <Col md={3} className="mb-4">
          <Card>
            <Card.Body>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="profile" active>Información Personal</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="address" disabled>Direcciones</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="orders" disabled>Mis Pedidos</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="password" href="/change-password?voluntary=true">Cambiar Contraseña</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={9}>
          <Card>
            <Card.Header as="h5">Información Personal</Card.Header>
            <Card.Body>
              {successMessage && (
                <Alert variant="success" className="mb-4">
                  {successMessage}
                </Alert>
              )}
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formFirstName">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleChange}
                        placeholder="Ingresa tu nombre"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formLastName">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleChange}
                        placeholder="Ingresa tu apellido"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    placeholder="Ingresa tu correo electrónico"
                    required
                    disabled
                  />
                  <Form.Text className="text-muted">
                    El correo electrónico no se puede cambiar.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    placeholder="Ingresa tu número de teléfono"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formAddress">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    placeholder="Ingresa tu dirección"
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Guardando...
                      </>
                    ) : (
                      'Guardar cambios'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;