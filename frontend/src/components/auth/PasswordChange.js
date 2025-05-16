import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  changePassword, 
  selectAuthLoading, 
  selectAuthError, 
  resetError,
  selectPasswordChangeRequired
} from '../../store/auth.slice';
import { validatePassword } from '../../utils/validationUtils';

const PasswordChange = () => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const passwordChangeRequired = useSelector(selectPasswordChangeRequired);
  
  // Limpiar errores al montar y desmontar el componente
  useEffect(() => {
    dispatch(resetError());
    
    return () => {
      dispatch(resetError());
    };
  }, [dispatch]);
  
  // Si se completa el cambio de contraseña, redirigir después de un tiempo
  useEffect(() => {
    let timeout;
    
    if (isSuccess) {
      timeout = setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }
    
    return () => {
      clearTimeout(timeout);
    };
  }, [isSuccess, navigate]);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error específico
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
    const { current_password, new_password, confirm_password } = formData;
    
    // Validar contraseña actual
    if (!current_password) {
      errors.current_password = 'La contraseña actual es requerida';
    }
    
    // Validar nueva contraseña
    if (!new_password) {
      errors.new_password = 'La nueva contraseña es requerida';
    } else {
      const passwordValidation = validatePassword(new_password);
      if (!passwordValidation.success) {
        errors.new_password = passwordValidation.message;
      }
    }
    
    // Validar confirmación de nueva contraseña
    if (!confirm_password) {
      errors.confirm_password = 'Confirme su nueva contraseña';
    } else if (new_password !== confirm_password) {
      errors.confirm_password = 'Las contraseñas no coinciden';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { current_password, new_password } = formData;
      
      dispatch(changePassword({ current_password, new_password }))
        .unwrap()
        .then(() => {
          setIsSuccess(true);
        })
        .catch(() => {
          // El error ya está en el estado de Redux
        });
    }
  };
  
  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h1 className="text-center mb-4">Cambiar Contraseña</h1>
        
        {passwordChangeRequired && (
          <div className="alert alert-warning mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Es necesario cambiar su contraseña por razones de seguridad.
          </div>
        )}
        
        {isSuccess ? (
          <div className="alert alert-success" role="alert">
            <h4 className="alert-heading">¡Contraseña actualizada!</h4>
            <p>Su contraseña ha sido cambiada exitosamente. Será redirigido automáticamente en unos segundos.</p>
            <hr />
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Redirigiendo...</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="current_password" className="form-label">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  className={`form-control ${formErrors.current_password ? 'is-invalid' : ''}`}
                  id="current_password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {formErrors.current_password && (
                  <div className="invalid-feedback">{formErrors.current_password}</div>
                )}
              </div>
              
              <div className="mb-3">
                <label htmlFor="new_password" className="form-label">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  className={`form-control ${formErrors.new_password ? 'is-invalid' : ''}`}
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {formErrors.new_password && (
                  <div className="invalid-feedback">{formErrors.new_password}</div>
                )}
                <div className="form-text">
                  La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirm_password" className="form-label">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  className={`form-control ${formErrors.confirm_password ? 'is-invalid' : ''}`}
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                {formErrors.confirm_password && (
                  <div className="invalid-feedback">{formErrors.confirm_password}</div>
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
                      Actualizando...
                    </>
                  ) : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordChange;