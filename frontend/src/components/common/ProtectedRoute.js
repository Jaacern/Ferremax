import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/auth.slice';

/**
 * Componente para proteger rutas y redirigir si no se cumplen las condiciones.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isAllowed - Indica si el acceso está permitido (autenticación, rol, etc.)
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si el acceso está permitido
 * @param {string} props.redirectPath - Ruta a la que redirigir si el acceso no está permitido
 * @returns {React.ReactNode} - Renderiza los hijos o redirige según corresponda
 */
const ProtectedRoute = ({
  isAllowed,
  children,
  redirectPath = '/login'
}) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Si no está autenticado en absoluto, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  
  // Si está autenticado pero no tiene los permisos necesarios, redirigir al dashboard
  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si tiene los permisos, renderizar los hijos
  return children;
};

export default ProtectedRoute;