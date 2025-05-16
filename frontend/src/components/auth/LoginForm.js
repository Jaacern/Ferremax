import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, selectIsAuthenticated, selectAuthLoading, selectAuthError, resetError } from '../../store/auth.slice';
import { validateEmail } from '../../utils/validationUtils';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
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
  
  // Validar formulario antes de enviar
  const validateForm = () => {
    const errors = {};
    const { username, password } = formData;
    
    // Validar nombre de usuario o email
    if (!username) {
      errors.username = 'El nombre de usuario es requerido';
    } else if (username.includes('@') && !validateEmail(username)) {
      errors.username = 'Correo electrónico inválido';
    }
    
    // Validar contraseña
    if (!password) {
      errors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      dispatch(login(formData));
    }
  };
  
  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h1 className="text-center mb-4">Iniciar Sesión</h1>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Usuario o Correo Electrónico
            </label>
            <input
              type="text"
              className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ingrese su usuario o correo"
              autoComplete="username"
              disabled={loading}
            />
            {formErrors.username && (
              <div className="invalid-feedback">{formErrors.username}</div>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingrese su contraseña"
              autoComplete="current-password"
              disabled={loading}
            />
            {formErrors.password && (
              <div className="invalid-feedback">{formErrors.password}</div>
            )}
          </div>
          
          <div className="d-grid">
            <button 
              type="submit" 
              className="btn btn-primary py-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Iniciando sesión...
                </>
              ) : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
        
        <div className="mt-3 text-center">
          <p>
            <Link to="/forgot-password" className="text-decoration-none">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
          <p className="mb-0">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-decoration-none">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;