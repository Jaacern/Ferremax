import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../store/auth.slice';
import { Alert } from '@mui/material';
import PasswordChange from '../../components/auth/PasswordChange';

const ChangePassword = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user, loading, passwordChangeRequired } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Verificar si el usuario está autenticado
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  const handleChangePassword = async (passwordData) => {
    try {
      setError(null);
      setSuccess(false);
      
      const resultAction = await dispatch(changePassword(passwordData));
      
      if (changePassword.fulfilled.match(resultAction)) {
        setSuccess(true);
        
        // Si el cambio era requerido, redirigir según rol después de 2 segundos
        if (passwordChangeRequired) {
          setTimeout(() => {
            const role = user.role;
            switch (role) {
              case 'admin':
                navigate('/admin/dashboard');
                break;
              case 'vendor':
                navigate('/vendor/dashboard');
                break;
              case 'warehouse':
                navigate('/warehouse/dashboard');
                break;
              case 'accountant':
                navigate('/accountant/dashboard');
                break;
              case 'customer':
                navigate('/catalog');
                break;
              default:
                navigate('/');
            }
          }, 2000);
        }
      } else {
        setError(resultAction.error.message || 'Error al cambiar la contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.');
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {passwordChangeRequired 
              ? 'Es necesario cambiar tu contraseña' 
              : 'Cambiar Contraseña'}
          </h2>
          {passwordChangeRequired && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Por razones de seguridad, debes cambiar tu contraseña inicial
            </p>
          )}
        </div>
        
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" className="mb-4">
            Contraseña actualizada correctamente
            {passwordChangeRequired && (
              <>. <br />Redirigiendo...
              </>
            )}
          </Alert>
        )}
        
        <PasswordChange 
          onSubmit={handleChangePassword} 
          loading={loading} 
          isRequired={passwordChangeRequired} 
        />
      </div>
    </div>
  );
};

export default ChangePassword;