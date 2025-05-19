import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/auth.slice';

const CheckoutForm = ({ onSubmit, isLoading }) => {
  const currentUser = useSelector(selectCurrentUser);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    firstName: currentUser?.first_name || '',
    lastName: currentUser?.last_name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: '',
    region: '',
    zipCode: '',
    deliveryMethod: 'PICKUP',  // PICKUP o DELIVERY
    branchId: null,  // Para retiro en tienda
    paymentMethod: 'CREDIT_CARD',  // CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER
    notes: ''
  });
  
  // Estado para validación
  const [validated, setValidated] = useState(false);
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Si llegamos aquí, el formulario es válido
    console.log("✅ Submit pressed");
    console.log("formData:", formData);
    const cleanedFormData = {
      ...formData,
      branchId: formData.deliveryMethod === 'PICKUP' ? formData.branchId : null
    };
    onSubmit(cleanedFormData);
  };
  
  // Determinar si necesitamos dirección de envío
  const needsShippingAddress = formData.deliveryMethod === 'DELIVERY';
  
  // Lista ficticia de sucursales (en una app real vendría del backend)
  const branches = [
    { id: 1, name: 'Casa Matriz Santiago' },
    { id: 2, name: 'Sucursal Providencia' },
    { id: 3, name: 'Sucursal Las Condes' },
    { id: 4, name: 'Sucursal Maipú' },
    { id: 5, name: 'Sucursal Viña del Mar' }
  ];
  
  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Card className="mb-4">
        <Card.Header as="h5">Información de contacto</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formFirstName">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor ingrese su nombre.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formLastName">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor ingrese su apellido.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor ingrese un correo electrónico válido.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formPhone">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor ingrese un número de teléfono.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header as="h5">Método de entrega</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Check
              type="radio"
              id="deliveryPickup"
              label="Retiro en tienda (gratis)"
              name="deliveryMethod"
              value="PICKUP"
              checked={formData.deliveryMethod === 'PICKUP'}
              onChange={handleChange}
              className="mb-2"
            />
            
            <Form.Check
              type="radio"
              id="deliveryShipping"
              label="Despacho a domicilio ($5.000)"
              name="deliveryMethod"
              value="DELIVERY"
              checked={formData.deliveryMethod === 'DELIVERY'}
              onChange={handleChange}
            />
          </Form.Group>
          
          {formData.deliveryMethod === 'PICKUP' ? (
            <Form.Group className="mt-3">
              <Form.Label>Seleccionar sucursal para retiro</Form.Label>
              <Form.Select 
                name="branchId" 
                value={formData.branchId} 
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar sucursal</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Por favor seleccione una sucursal para retiro.
              </Form.Control.Feedback>
            </Form.Group>
          ) : (
            <>
              <Form.Group className="mb-3" controlId="formAddress">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required={needsShippingAddress}
                />
                <Form.Control.Feedback type="invalid">
                  Por favor ingrese su dirección.
                </Form.Control.Feedback>
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formCity">
                    <Form.Label>Ciudad</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required={needsShippingAddress}
                    />
                    <Form.Control.Feedback type="invalid">
                      Por favor ingrese su ciudad.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="formRegion">
                    <Form.Label>Región</Form.Label>
                    <Form.Control
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      required={needsShippingAddress}
                    />
                    <Form.Control.Feedback type="invalid">
                      Por favor ingrese su región.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group className="mb-3" controlId="formZipCode">
                    <Form.Label>Código postal</Form.Label>
                    <Form.Control
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required={needsShippingAddress}
                    />
                    <Form.Control.Feedback type="invalid">
                      Por favor ingrese su código postal.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header as="h5">Método de pago</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Check
              type="radio"
              id="paymentCreditCard"
              label="Tarjeta de crédito"
              name="paymentMethod"
              value="CREDIT_CARD"
              checked={formData.paymentMethod === 'CREDIT_CARD'}
              onChange={handleChange}
              className="mb-2"
            />
            
            <Form.Check
              type="radio"
              id="paymentDebitCard"
              label="Tarjeta de débito"
              name="paymentMethod"
              value="DEBIT_CARD"
              checked={formData.paymentMethod === 'DEBIT_CARD'}
              onChange={handleChange}
              className="mb-2"
            />
            
            <Form.Check
              type="radio"
              id="paymentBankTransfer"
              label="Transferencia bancaria"
              name="paymentMethod"
              value="BANK_TRANSFER"
              checked={formData.paymentMethod === 'BANK_TRANSFER'}
              onChange={handleChange}
            />
          </Form.Group>
          
          {formData.paymentMethod !== 'BANK_TRANSFER' && (
            <div className="bg-light p-3 rounded mt-3">
              <p className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Serás redirigido a WebPay para completar el pago de forma segura.
              </p>
            </div>
          )}
          
          {formData.paymentMethod === 'BANK_TRANSFER' && (
            <div className="bg-light p-3 rounded mt-3">
              <p className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Recibirás los datos bancarios para realizar la transferencia después de confirmar tu pedido.
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header as="h5">Notas adicionales</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3" controlId="formNotes">
            <Form.Label>Notas sobre tu pedido (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Instrucciones especiales para la entrega, etc."
            />
          </Form.Group>
        </Card.Body>
      </Card>
      
      <div className="d-grid">
        <Button 
          variant="primary" 
          size="lg" 
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
              Procesando...
            </>
          ) : (
            'Confirmar pedido'
          )}
        </Button>
      </div>
    </Form>
  );
};

export default CheckoutForm;