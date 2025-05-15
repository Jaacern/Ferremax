import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectIsLoading, selectAuthError, clearError } from '../../store/auth.slice';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [validated, setValidated] = useState(false);
  
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
    
    // Limpiar errores al modificar campos
    if (error) {
      dispatch(clearError());
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Validación del formulario
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    dispatch(login(credentials));
  };
  
  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <Form.Group className="mb-3" controlId="formUsername">
        <Form.Label>Nombre de usuario</Form.Label>
        <Form.Control
          type="text"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          placeholder="Ingrese su nombre de usuario"
          required
        />
        <Form.Control.Feedback type="invalid">
          El nombre de usuario es requerido.
        </Form.Control.Feedback>
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formPassword">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Ingrese su contraseña"
          required
        />
        <Form.Control.Feedback type="invalid">
          La contraseña es requerida.
        </Form.Control.Feedback>
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
            Iniciando sesión...
          </>
        ) : (
          'Iniciar Sesión'
        )}
      </Button>
    </Form>
  );
};

export default LoginForm;