import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/auth.slice';
import api from '../../services/api';

const Addresses = () => {
  const currentUser = useSelector(selectCurrentUser);
  
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el modal de nueva dirección
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validated, setValidated] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // Estado para el formulario de dirección
  const [addressForm, setAddressForm] = useState({
    alias: '',
    recipient_name: '',
    street: '',
    number: '',
    apartment: '',
    city: '',
    region: '',
    zip_code: '',
    phone: '',
    is_default: false
  });
  
  // Cargar direcciones del usuario
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/user/addresses');
        setAddresses(response.data.addresses || []);
      } catch (err) {
        console.error('Error al cargar direcciones:', err);
        setError('No se pudieron cargar tus direcciones. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser) {
      fetchAddresses();
    }
  }, [currentUser]);
  
  // Abrir modal para nueva dirección
  const handleAddAddress = () => {
    setSelectedAddress(null);
    setAddressForm({
      alias: '',
      recipient_name: currentUser?.first_name + ' ' + currentUser?.last_name || '',
      street: '',
      number: '',
      apartment: '',
      city: '',
      region: '',
      zip_code: '',
      phone: currentUser?.phone || '',
      is_default: addresses.length === 0 // Si es la primera dirección, marcarla como predeterminada
    });
    setValidated(false);
    setShowModal(true);
  };
  
  // Abrir modal para editar dirección
  const handleEditAddress = (address) => {
    setSelectedAddress(address);
    setAddressForm({
      alias: address.alias || '',
      recipient_name: address.recipient_name || '',
      street: address.street || '',
      number: address.number || '',
      apartment: address.apartment || '',
      city: address.city || '',
      region: address.region || '',
      zip_code: address.zip_code || '',
      phone: address.phone || '',
      is_default: address.is_default || false
    });
    setValidated(false);
    setShowModal(true);
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (selectedAddress) {
        // Actualizar dirección existente
        const response = await api.put(`/user/addresses/${selectedAddress.id}`, addressForm);
        
        // Actualizar lista de direcciones
        setAddresses(prev => 
          prev.map(addr => 
            addr.id === selectedAddress.id ? response.data.address : addr
          )
        );
      } else {
        // Crear nueva dirección
        const response = await api.post('/user/addresses', addressForm);
        
        // Añadir a la lista de direcciones
        setAddresses(prev => [...prev, response.data.address]);
      }
      
      // Cerrar modal
      setShowModal(false);
    } catch (err) {
      console.error('Error al guardar dirección:', err);
      setError('No se pudo guardar la dirección. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Eliminar dirección
  const handleDeleteAddress = async (address) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
      return;
    }
    
    try {
      await api.delete(`/user/addresses/${address.id}`);
      
      // Actualizar lista de direcciones
      setAddresses(prev => prev.filter(addr => addr.id !== address.id));
    } catch (err) {
      console.error('Error al eliminar dirección:', err);
      setError('No se pudo eliminar la dirección. Por favor, intenta de nuevo más tarde.');
    }
  };
  
  // Establecer dirección como predeterminada
  const handleSetDefault = async (address) => {
    try {
      const response = await api.put(`/user/addresses/${address.id}/default`, {
        is_default: true
      });
      
      // Actualizar lista de direcciones
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          is_default: addr.id === address.id
        }))
      );
    } catch (err) {
      console.error('Error al actualizar dirección predeterminada:', err);
      setError('No se pudo actualizar la dirección predeterminada. Por favor, intenta de nuevo más tarde.');
    }
  };
  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Mis Direcciones</h1>
        <Button variant="primary" onClick={handleAddAddress}>
          <i className="bi bi-plus-lg me-1"></i> Añadir dirección
        </Button>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando direcciones...</span>
          </Spinner>
          <p className="mt-3">Cargando tus direcciones...</p>
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>No tienes direcciones guardadas</h4>
            <p className="text-muted mb-4">
              Añade una dirección para facilitar tus compras.
            </p>
            <Button
              variant="primary"
              onClick={handleAddAddress}
            >
              Añadir mi primera dirección
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {addresses.map(address => (
            <Col key={address.id} lg={6} className="mb-4">
              <Card className={address.is_default ? 'border-primary' : ''}>
                {address.is_default && (
                  <div className="position-absolute top-0 end-0 mt-2 me-2">
                    <Badge bg="primary">Predeterminada</Badge>
                  </div>
                )}
                
                <Card.Body>
                  <h5 className="mb-3">{address.alias || 'Dirección'}</h5>
                  
                  <p className="mb-1">
                    <strong>Destinatario:</strong> {address.recipient_name}
                  </p>
                  <p className="mb-1">
                    <strong>Dirección:</strong> {address.street} {address.number}
                    {address.apartment && `, ${address.apartment}`}
                  </p>
                  <p className="mb-1">
                    <strong>Ciudad:</strong> {address.city}
                  </p>
                  <p className="mb-1">
                    <strong>Región:</strong> {address.region}
                  </p>
                  <p className="mb-1">
                    <strong>Código postal:</strong> {address.zip_code}
                  </p>
                  <p className="mb-3">
                    <strong>Teléfono:</strong> {address.phone}
                  </p>
                  
                  <div className="d-flex justify-content-end">
                    {!address.is_default && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleSetDefault(address)}
                      >
                        Establecer como predeterminada
                      </Button>
                    )}
                    
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditAddress(address)}
                    >
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteAddress(address)}
                      disabled={address.is_default}
                    >
                      Eliminar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      {/* Modal para añadir/editar dirección */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAddress ? 'Editar dirección' : 'Añadir nueva dirección'}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formAlias">
                  <Form.Label>Alias (opcional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="alias"
                    placeholder="ej. Casa, Trabajo"
                    value={addressForm.alias}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Un nombre para identificar esta dirección.
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formRecipientName">
                  <Form.Label>Nombre del destinatario</Form.Label>
                  <Form.Control
                    type="text"
                    name="recipient_name"
                    placeholder="Nombre completo"
                    value={addressForm.recipient_name}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa el nombre del destinatario.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3" controlId="formStreet">
                  <Form.Label>Calle</Form.Label>
                  <Form.Control
                    type="text"
                    name="street"
                    placeholder="Nombre de la calle"
                    value={addressForm.street}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa el nombre de la calle.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formNumber">
                  <Form.Label>Número</Form.Label>
                  <Form.Control
                    type="text"
                    name="number"
                    placeholder="Número"
                    value={addressForm.number}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa el número.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3" controlId="formApartment">
              <Form.Label>Departamento/Casa (opcional)</Form.Label>
              <Form.Control
                type="text"
                name="apartment"
                placeholder="ej. Apto 5B, Casa 3"
                value={addressForm.apartment}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formCity">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    placeholder="Ciudad"
                    value={addressForm.city}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa la ciudad.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formRegion">
                  <Form.Label>Región</Form.Label>
                  <Form.Control
                    type="text"
                    name="region"
                    placeholder="Región"
                    value={addressForm.region}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa la región.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formZipCode">
                  <Form.Label>Código postal</Form.Label>
                  <Form.Control
                    type="text"
                    name="zip_code"
                    placeholder="Código postal"
                    value={addressForm.zip_code}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa el código postal.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label>Teléfono de contacto</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder="Teléfono"
                    value={addressForm.phone}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Por favor ingresa un teléfono de contacto.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3" controlId="formIsDefault">
              <Form.Check
                type="checkbox"
                name="is_default"
                label="Establecer como dirección predeterminada"
                checked={addressForm.is_default}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
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
                Guardando...
              </>
            ) : (
              'Guardar dirección'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Addresses;