import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../store/auth.slice';
import { Alert } from '@mui/material';
import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
  const [error, setError] = useState(null);
  const { loading } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      setError(null);
      const resultAction = await dispatch(login(credentials));
      
      if (login.fulfilled.match(resultAction)) {
        const userData = resultAction.payload;
        
        // Verificar si se requiere cambio de contraseña
        if (userData.password_change_required) {
          navigate('/auth/change-password');
          return;
        }
        
        // Redirigir según el rol del usuario
        const role = userData.user.role;
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
      } else {
        setError(resultAction.error.message || 'Error al iniciar sesión');
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
            Iniciar Sesión
          </h2>
        </div>
        
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        <LoginForm onSubmit={handleLogin} loading={loading} />
        
        <div className="mt-6 text-center">
          <Link to="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
            ¿Olvidaste tu contraseña?
          </Link>
          <div className="mt-2">
            <Link to="/auth/register" className="text-sm text-blue-600 hover:text-blue-800">
              ¿No tienes una cuenta? Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;