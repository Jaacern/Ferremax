import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/auth.slice';
import { ROLES } from '../../config';

/**
 * Componente de barra lateral para navegación del sistema.
 * Se muestra específicamente para cada tipo de usuario.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si la barra lateral está abierta (móvil)
 * @param {Function} props.toggleSidebar - Función para alternar la barra lateral
 * @returns {React.ReactNode} - Barra lateral con enlaces según el rol del usuario
 */
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const userRole = useSelector(selectUserRole);
  
  // Determinar si un enlace está activo
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Configuración de menús según el rol
  const getMenuItems = () => {
    switch(userRole) {
      case ROLES.ADMIN:
        return [
          { 
            title: 'Dashboard', 
            icon: 'bi-speedometer2', 
            path: '/admin/dashboard' 
          },
          { 
            title: 'Gestión de Productos', 
            icon: 'bi-box-seam', 
            path: '/admin/products' 
          },
          { 
            title: 'Gestión de Pedidos', 
            icon: 'bi-cart-check', 
            path: '/admin/orders' 
          },
          { 
            title: 'Gestión de Usuarios', 
            icon: 'bi-people', 
            path: '/admin/users' 
          },
          { 
            title: 'Gestión de Sucursales', 
            icon: 'bi-building', 
            path: '/admin/branches' 
          }
        ];
        
      case ROLES.VENDOR:
        return [
          { 
            title: 'Dashboard', 
            icon: 'bi-speedometer2', 
            path: '/vendor/dashboard' 
          },
          { 
            title: 'Pedidos por Aprobar', 
            icon: 'bi-clipboard-check', 
            path: '/vendor/orders' 
          },
          { 
            title: 'Inventario', 
            icon: 'bi-box-seam', 
            path: '/vendor/inventory' 
          }
        ];
        
      case ROLES.WAREHOUSE:
        return [
          { 
            title: 'Dashboard', 
            icon: 'bi-speedometer2', 
            path: '/warehouse/dashboard' 
          },
          { 
            title: 'Pedidos Pendientes', 
            icon: 'bi-clipboard-check', 
            path: '/warehouse/orders' 
          },
          { 
            title: 'Gestión de Stock', 
            icon: 'bi-box-seam', 
            path: '/warehouse/stock' 
          }
        ];
        
      case ROLES.ACCOUNTANT:
        return [
          { 
            title: 'Dashboard', 
            icon: 'bi-speedometer2', 
            path: '/accountant/dashboard' 
          },
          { 
            title: 'Gestión de Pagos', 
            icon: 'bi-credit-card', 
            path: '/accountant/payments' 
          },
          { 
            title: 'Informes de Ventas', 
            icon: 'bi-graph-up', 
            path: '/accountant/reports' 
          }
        ];
        
      case ROLES.CUSTOMER:
        return [
          { 
            title: 'Mi Perfil', 
            icon: 'bi-person', 
            path: '/profile' 
          },
          { 
            title: 'Mis Pedidos', 
            icon: 'bi-box', 
            path: '/orders' 
          },
          { 
            title: 'Mis Direcciones', 
            icon: 'bi-geo-alt', 
            path: '/addresses' 
          },
          { 
            title: 'Cambiar Contraseña', 
            icon: 'bi-key', 
            path: '/change-password' 
          }
        ];
        
      default:
        return [];
    }
  };
  
  const menuItems = getMenuItems();
  
  return (
    <div className={`sidebar bg-light ${isOpen ? 'show' : ''}`} style={{
      width: 250,
      height: '100%',
      position: 'fixed',
      top: 0,
      left: isOpen ? 0 : -250,
      zIndex: 1030,
      overflowY: 'auto',
      transition: 'left 0.3s ease',
      paddingTop: '56px',
      boxShadow: isOpen ? '0 0 10px rgba(0,0,0,0.2)' : 'none'
    }}>
      <div className="p-3">
        <button 
          className="btn btn-sm btn-outline-secondary d-lg-none mb-3 w-100" 
          onClick={toggleSidebar}
        >
          <i className="bi bi-x-lg me-2"></i> Cerrar
        </button>
        
        <ul className="nav flex-column">
          {menuItems.map((item, index) => (
            <li className="nav-item" key={index}>
              <Link 
                to={item.path} 
                className={`nav-link py-3 ${isActive(item.path) ? 'text-primary fw-bold' : 'text-dark'}`}
                onClick={() => {
                  if (isOpen) toggleSidebar();
                }}
              >
                <i className={`${item.icon} me-2`}></i> {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;