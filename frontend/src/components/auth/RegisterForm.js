import React, { useState } from 'react';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { register, selectIsLoading, selectAuthError, clearError } from '../../store/auth.slice';

const RegisterForm = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  });
  const [validated, setValidated] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
    
    // Limpiar errores al modificar campos
    if (error) {
      dispatch(clearError());
    }
    
    // Validación de coincidencia de contraseñas
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'confirmPassword' && value !== userData.password) {
        setPasswordError('Las contraseñas no coinciden');
      } else if (name === 'password' && userData.confirmPassword && value !== userData.confirmPassword) {
        setPasswordError('Las contraseñas no coinciden');
      } else {
        setPasswordError('');
      }
    }
  };
  
  const validatePassword = (password) => {
    // Validación de requisitos mínimos de contraseña
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Validación del formulario
    if (form.checkValidity() === false || userData.password !== userData.confirmPassword) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Validar requisitos de contraseña
    if (!validatePassword(userData.password)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.');
      return;
    }
    
    // Eliminar confirmPassword antes de enviar
    const { confirmPassword, ...registrationData } = userData;
    
    dispatch(register(registrationData));
  };
  
  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Nombre de usuario</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
              placeholder="Ingrese nombre de usuario"
              required
            />
            <Form.Control.Feedback type="invalid">
              El nombre de usuario es requerido.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="Ingrese su correo electrónico"
              required
            />
            <Form.Control.Feedback type="invalid">
              Ingrese un correo electrónico válido.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="Ingrese contraseña"
              required
              isInvalid={!!passwordError}
            />
            <Form.Control.Feedback type="invalid">
              {passwordError || 'La contraseña es requerida.'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label>Confirmar contraseña</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme su contraseña"
              required
              isInvalid={!!passwordError}
            />
            <Form.Control.Feedback type="invalid">
              {passwordError || 'Confirme su contraseña.'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formFirstName">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={userData.first_name}
              onChange={handleChange}
              placeholder="Ingrese su nombre"
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formLastName">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={userData.last_name}
              onChange={handleChange}
              placeholder="Ingrese su apellido"
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Form.Group className="mb-3" controlId="formPhone">
        <Form.Label>Teléfono</Form.Label>
        <Form.Control
          type="text"
          name="phone"
          value={userData.phone}
          onChange={handleChange}
          placeholder="Ingrese su número de teléfono"
        />
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formAddress">
        <Form.Label>Dirección</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="address"
          value={userData.address}
          onChange={handleChange}
          placeholder="Ingrese su dirección"
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Text className="text-muted">
          * Al registrarte, aceptas recibir noticias, ofertas especiales y descuentos en compras.
        </Form.Text>
      </Form.Group>
      
      <Button 
        variant="primary" 
        type="submit" 
        className="w-100"
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
            Registrando...
          </>
        ) : (
          'Registrarse'
        )}
      </Button>
    </Form>
  );
};

export default RegisterForm;