import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../store/auth.slice';
import { Alert } from '@mui/material';
import RegisterForm from '../../components/auth/RegisterForm';

const Register = () => {
  const [error, setError] = useState(null);
  const { loading } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    try {
      setError(null);
      const resultAction = await dispatch(register(userData));
      
      if (register.fulfilled.match(resultAction)) {
        // Redirigir al catálogo después del registro exitoso
        navigate('/catalog');
      } else {
        setError(resultAction.error.message || 'Error al registrarse');
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
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Regístrate para acceder a nuestro catálogo de productos
          </p>
        </div>
        
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        <RegisterForm onSubmit={handleRegister} loading={loading} />
        
        <div className="mt-6 text-center">
          <p className="text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/auth/login" className="text-blue-600 hover:text-blue-800">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;