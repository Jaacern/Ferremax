import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, TextField, Button, CircularProgress } from '@mui/material';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor ingrese su correo electrónico');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Aquí normalmente enviaríamos una solicitud al backend
      // Como no vemos esta funcionalidad implementada en el backend proporcionado,
      // simulamos el comportamiento
      
      // await api.post('/auth/forgot-password', { email });
      
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
    } catch (err) {
      setError('No se pudo procesar la solicitud. Intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña
          </p>
        </div>
        
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        {success ? (
          <div className="text-center">
            <Alert severity="success" className="mb-4">
              Se han enviado las instrucciones a tu correo electrónico
            </Alert>
            <Link to="/auth/login" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <TextField
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                fullWidth
                label="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                className="py-2"
              >
                {loading ? <CircularProgress size={24} /> : 'Enviar instrucciones'}
              </Button>
            </div>
            
            <div className="text-center mt-4">
              <Link to="/auth/login" className="text-sm text-blue-600 hover:text-blue-800">
                Volver a iniciar sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;