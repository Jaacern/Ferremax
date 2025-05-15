import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  selectIsAuthenticated, 
  selectUserRole,
  selectPasswordChangeRequired
} from '../../store/auth.slice';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirect = '/login',
  requirePasswordChange = false
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const passwordChangeRequired = useSelector(selectPasswordChangeRequired);
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirect} replace />;
  }
  
  // Si se requiere cambio de contraseña y la contraseña necesita ser cambiada
  if (requirePasswordChange && passwordChangeRequired) {
    return <Navigate to="/change-password" replace />;
  }
  
  // Si se requiere cambio de contraseña pero no es necesario cambiarla
  if (requirePasswordChange && !passwordChangeRequired) {
    return <Navigate to="/" replace />;
  }
  
  // Si hay roles permitidos y el usuario no tiene uno de ellos
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirigir según el rol (personalización opcional)
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'vendor':
        return <Navigate to="/vendor" replace />;
      case 'warehouse':
        return <Navigate to="/warehouse" replace />;
      case 'accountant':
        return <Navigate to="/accountant" replace />;
      case 'customer':
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  // Si pasó todas las verificaciones, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute;