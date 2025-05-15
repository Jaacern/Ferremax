import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { 
  changePassword, 
  selectIsLoading, 
  selectAuthError, 
  clearError 
} from '../../store/auth.slice';

const PasswordChange = () => {
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [validated, setValidated] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Limpiar errores al modificar campos
    if (error) {
      dispatch(clearError());
    }
    
    // Validación de coincidencia de contraseñas
    if (name === 'new_password' || name === 'confirm_password') {
      if (name === 'confirm_password' && value !== passwordData.new_password) {
        setPasswordError('Las contraseñas no coinciden');
      } else if (name === 'new_password' && passwordData.confirm_password && value !== passwordData.confirm_password) {
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Validación del formulario
    if (form.checkValidity() === false || passwordData.new_password !== passwordData.confirm_password) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Validar requisitos de contraseña
    if (!validatePassword(passwordData.new_password)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.');
      return;
    }
    
    // Preparar datos para el envío
    const { confirm_password, ...changeData } = passwordData;
    
    try {
      await dispatch(changePassword(changeData)).unwrap();
      setSuccess(true);
      // Resetear formulario
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setValidated(false);
    } catch (err) {
      // El error ya se maneja en el slice
    }
  };
  
  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-3">
          Contraseña actualizada correctamente.
        </Alert>
      )}
      
      <Form.Group className="mb-3" controlId="formCurrentPassword">
        <Form.Label>Contraseña actual</Form.Label>
        <Form.Control
          type="password"
          name="current_password"
          value={passwordData.current_password}
          onChange={handleChange}
          placeholder="Ingrese su contraseña actual"
          required
        />
        <Form.Control.Feedback type="invalid">
          La contraseña actual es requerida.
        </Form.Control.Feedback>
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formNewPassword">
        <Form.Label>Nueva contraseña</Form.Label>
        <Form.Control
          type="password"
          name="new_password"
          value={passwordData.new_password}
          onChange={handleChange}
          placeholder="Ingrese su nueva contraseña"
          required
          isInvalid={!!passwordError}
        />
        <Form.Control.Feedback type="invalid">
          {passwordError || 'La nueva contraseña es requerida.'}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formConfirmPassword">
        <Form.Label>Confirmar nueva contraseña</Form.Label>
        <Form.Control
          type="password"
          name="confirm_password"
          value={passwordData.confirm_password}
          onChange={handleChange}
          placeholder="Confirme su nueva contraseña"
          required
          isInvalid={!!passwordError}
        />
        <Form.Control.Feedback type="invalid">
          {passwordError || 'Confirme su nueva contraseña.'}
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
            Actualizando...
          </>
        ) : (
          'Cambiar Contraseña'
        )}
      </Button>
    </Form>
  );
};

export default PasswordChange;