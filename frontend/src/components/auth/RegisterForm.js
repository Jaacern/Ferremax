import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, selectIsAuthenticated, selectAuthLoading, selectAuthError, resetError } from '../../store/auth.slice';
import { validateEmail, validatePassword, validatePhone } from '../../utils/validationUtils';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [step, setStep] = useState(1); // Paso actual del formulario (1: credenciales, 2: datos personales)
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Limpiar errores al montar el componente
    return () => {
      dispatch(resetError());
    };
  }, [isAuthenticated, navigate, dispatch]);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error específico cuando el usuario comienza a escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Validar primer paso (credenciales)
  const validateStep1 = () => {
    const errors = {};
    const { username, email, password, confirmPassword } = formData;
    
    // Validar nombre de usuario
    if (!username) {
      errors.username = 'El nombre de usuario es requerido';
    } else if (username.length < 4) {
      errors.username = 'El nombre de usuario debe tener al menos 4 caracteres';
    }
    
    // Validar correo electrónico
    if (!email) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!validateEmail(email)) {
      errors.email = 'Correo electrónico inválido';
    }
    
    // Validar contraseña
    if (!password) {
      errors.password = 'La contraseña es requerida';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.success) {
        errors.password = passwordValidation.message;
      }
    }
    
    // Validar confirmación de contraseña
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirme su contraseña';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validar segundo paso (datos personales)
  const validateStep2 = () => {
    const errors = {};
    const { first_name, last_name, phone } = formData;
    
    // Validar nombre
    if (first_name && first_name.length < 2) {
      errors.first_name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    // Validar apellido
    if (last_name && last_name.length < 2) {
      errors.last_name = 'El apellido debe tener al menos 2 caracteres';
    }
    
    // Validar teléfono (opcional)
    if (phone && !validatePhone(phone)) {
      errors.phone = 'Formato de teléfono inválido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Avanzar al siguiente paso
  const goToNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };
  
  // Retroceder al paso anterior
  const goToPreviousStep = () => {
    setStep(1);
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (step === 1) {
      goToNextStep();
    } else {
      if (validateStep2()) {
        // Omitir confirmPassword al enviar al servidor
        const { confirmPassword, ...registerData } = formData;
        dispatch(register(registerData));
      }
    }
  };
  
  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h1 className="text-center mb-4">Registro de Cliente</h1>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <div className="progress mb-4">
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: step === 1 ? '50%' : '100%' }}
            aria-valuenow={step === 1 ? 50 : 100}
            aria-valuemin="0" 
            aria-valuemax="100"
          >
            {step === 1 ? 'Paso 1: Credenciales' : 'Paso 2: Datos Personales'}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            // Paso 1: Credenciales
            <>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Elija un nombre de usuario"
                  disabled={loading}
                  required
                />
                {formErrors.username && (
                  <div className="invalid-feedback">{formErrors.username}</div>
                )}
              </div>
              
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  disabled={loading}
                  required
                />
                {formErrors.email && (
                  <div className="invalid-feedback">{formErrors.email}</div>
                )}
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Contraseña *
                </label>
                <input
                  type="password"
                  className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Cree una contraseña"
                  disabled={loading}
                  required
                />
                {formErrors.password && (
                  <div className="invalid-feedback">{formErrors.password}</div>
                )}
                <div className="form-text">
                  La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repita su contraseña"
                  disabled={loading}
                  required
                />
                {formErrors.confirmPassword && (
                  <div className="invalid-feedback">{formErrors.confirmPassword}</div>
                )}
              </div>
            </>
          ) : (
            // Paso 2: Datos Personales
            <>
              <div className="mb-3">
                <label htmlFor="first_name" className="form-label">
                  Nombre
                </label>
                <input
                  type="text"
                  className={`form-control ${formErrors.first_name ? 'is-invalid' : ''}`}
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Su nombre"
                  disabled={loading}
                />
                {formErrors.first_name && (
                  <div className="invalid-feedback">{formErrors.first_name}</div>
                )}
              </div>
              
              <div className="mb-3">
                <label htmlFor="last_name" className="form-label">
                  Apellido
                </label>
                <input
                  type="text"
                  className={`form-control ${formErrors.last_name ? 'is-invalid' : ''}`}
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Su apellido"
                  disabled={loading}
                />
                {formErrors.last_name && (
                  <div className="invalid-feedback">{formErrors.last_name}</div>
                )}
              </div>
              
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                  disabled={loading}
                />
                {formErrors.phone && (
                  <div className="invalid-feedback">{formErrors.phone}</div>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="address" className="form-label">
                  Dirección
                </label>
                <textarea
                  className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Su dirección completa"
                  rows="3"
                  disabled={loading}
                ></textarea>
                {formErrors.address && (
                  <div className="invalid-feedback">{formErrors.address}</div>
                )}
              </div>
            </>
          )}
          
          <div className="d-flex justify-content-between">
            {step === 2 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={goToPreviousStep}
                disabled={loading}
              >
                Volver
              </button>
            )}
            
            <button
              type="submit"
              className={`btn btn-primary ${step === 1 ? 'ms-auto' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : step === 1 ? 'Siguiente' : 'Registrarse'}
            </button>
          </div>
        </form>
        
        <div className="mt-3 text-center">
          <p className="mb-0">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-decoration-none">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;