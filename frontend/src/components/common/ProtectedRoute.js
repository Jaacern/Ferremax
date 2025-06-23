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

  // 🔒 No autenticado: redirige al login
  if (!isAuthenticated) {
    return <Navigate to={redirect} replace />;
  }

  // 🔐 Se requiere cambio de contraseña y aún no se ha hecho
  if (requirePasswordChange && passwordChangeRequired) {
    return <Navigate to="/change-password" replace />;
  }

  // 🔓 Se indica que debe cambiar la contraseña pero ya no es necesario
  if (requirePasswordChange && !passwordChangeRequired) {
    return <Navigate to="/" replace />;
  }

  // ⚠️ userRole puede ser null en un primer render; prevenir fallo
  if (!userRole) {
    return <Navigate to={redirect} replace />;
  }

  // ✅ Validar roles permitidos
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirección personalizada según rol
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'vendor':
        return <Navigate to="/vendor" replace />;
      case 'warehouse':
        return <Navigate to="/warehouse" replace />;
      case 'accountant':
        return <Navigate to="/accountant" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // ✅ Autenticado, con rol válido
  return children;
};

export default ProtectedRoute;
