import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/auth.slice';
import { selectCurrentCurrency } from '../../store/currency.slice'; // Importar selector
import CurrencyDisplay from '../common/CurrencyDisplay'; // Importar componente

const CheckoutForm = ({ onSubmit, isLoading, cartTotal = 0 }) => {
  const currentUser = useSelector(selectCurrentUser);
  const currentCurrency = useSelector(selectCurrentCurrency); // Obtener moneda actual
  
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
    currency: currentCurrency, // Añadir moneda seleccionada
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
    const cleanedFormData = {
      ...formData,
      branchId: formData.deliveryMethod === 'PICKUP' ? formData.branchId : null,
      currency: currentCurrency // Asegurarse de que se envía la moneda actual
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
  
  // Añadir un resumen de los costos con la moneda seleccionada
  const renderOrderSummary = () => {
    // Costos de envío
    const shipping = formData.deliveryMethod === 'DELIVERY' ? 5000 : 0;
    
    return (
      <Card className="mb-4">
        <Card.Header as="h5">Resumen del pedido</Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal:</span>
            <span>
              <CurrencyDisplay amount={cartTotal} originalCurrency="CLP" />
            </span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Envío:</span>
            <span>
              {shipping === 0 
                ? 'Gratis' 
                : <CurrencyDisplay amount={shipping} originalCurrency="CLP" />
              }
            </span>
          </div>
          <hr />
          <div className="d-flex justify-content-between fw-bold">
            <span>Total:</span>
            <span>
              <CurrencyDisplay amount={cartTotal + shipping} originalCurrency="CLP" />
            </span>
          </div>
          
          {currentCurrency !== 'CLP' && (
            <div className="mt-3 small text-muted">
              * Los precios se muestran en {currentCurrency}. El pago se procesará en esta moneda.
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };
  
  return (
    <>
      {/* Añadir el resumen del pedido */}
      {renderOrderSummary()}
      
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
                label={`Despacho a domicilio (${formData.deliveryMethod === 'DELIVERY' 
                  ? <CurrencyDisplay amount={5000} originalCurrency="CLP" /> 
                  : "$5.000"
                })`}
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
            
            {/* Mostrar información sobre la moneda de pago */}
            <div className="bg-light p-3 rounded mt-3">
              <p className="mb-1">
                <i className="bi bi-info-circle me-2"></i>
                El pago se procesará en <strong>{currentCurrency}</strong>
              </p>
              
              {formData.paymentMethod !== 'BANK_TRANSFER' && (
                <p className="mb-0 small">
                  Serás redirigido a WebPay para completar el pago de forma segura.
                </p>
              )}
              
              {formData.paymentMethod === 'BANK_TRANSFER' && (
                <p className="mb-0 small">
                  Recibirás los datos bancarios para realizar la transferencia después de confirmar tu pedido.
                </p>
              )}
            </div>
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
    </>
  );
};

export default CheckoutForm;