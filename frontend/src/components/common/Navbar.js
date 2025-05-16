import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectIsAuthenticated, selectUser, selectUserRole } from '../../store/auth.slice';
import { selectCartItemCount } from '../../store/cart.slice';
import { fetchStockAlerts, selectStockAlerts } from '../../store/stock.slice';
import { ROLES } from '../../config';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const cartItemCount = useSelector(selectCartItemCount);
  const stockAlerts = useSelector(selectStockAlerts);
  
  // Cargar alertas de stock si el usuario es admin, vendedor o bodeguero
  useEffect(() => {
    if (isAuthenticated && [ROLES.ADMIN, ROLES.VENDOR, ROLES.WAREHOUSE].includes(userRole)) {
      dispatch(fetchStockAlerts());
    }
  }, [dispatch, isAuthenticated, userRole]);
  
  // Manejar cierre de sesión
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsUserDropdownOpen(false);
  };
  
  // Alternar menú móvil
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Cerrar otros dropdowns
    setIsUserDropdownOpen(false);
    setIsNotificationsOpen(false);
  };
  
  // Alternar dropdown de usuario
  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    // Cerrar otros dropdowns
    setIsNotificationsOpen(false);
  };
  
  // Alternar dropdown de notificaciones
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    // Cerrar otros dropdowns
    setIsUserDropdownOpen(false);
  };
  
  // Renderizar enlaces según rol
  const renderRoleLinks = () => {
    if (!isAuthenticated || !userRole) return null;
    
    switch (userRole) {
      case ROLES.ADMIN:
        return (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/products" onClick={() => setIsMenuOpen(false)}>
                Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/orders" onClick={() => setIsMenuOpen(false)}>
                Pedidos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/users" onClick={() => setIsMenuOpen(false)}>
                Usuarios
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/branches" onClick={() => setIsMenuOpen(false)}>
                Sucursales
              </Link>
            </li>
          </>
        );
      
      case ROLES.VENDOR:
        return (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/vendor/dashboard" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/vendor/orders" onClick={() => setIsMenuOpen(false)}>
                Pedidos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/vendor/inventory" onClick={() => setIsMenuOpen(false)}>
                Inventario
              </Link>
            </li>
          </>
        );
      
      case ROLES.WAREHOUSE:
        return (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/warehouse/dashboard" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/warehouse/orders" onClick={() => setIsMenuOpen(false)}>
                Pedidos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/warehouse/stock" onClick={() => setIsMenuOpen(false)}>
                Inventario
              </Link>
            </li>
          </>
        );
      
      case ROLES.ACCOUNTANT:
        return (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/accountant/dashboard" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/accountant/payments" onClick={() => setIsMenuOpen(false)}>
                Pagos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/accountant/reports" onClick={() => setIsMenuOpen(false)}>
                Informes
              </Link>
            </li>
          </>
        );
      
      case ROLES.CUSTOMER:
        return (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/orders" onClick={() => setIsMenuOpen(false)}>
                Mis Pedidos
              </Link>
            </li>
          </>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container">
        {/* Logo y botón de menú */}
        <Link className="navbar-brand" to="/">
          <strong>FERREMAS</strong>
        </Link>
        
        <div className="d-flex align-items-center order-lg-2">
          {/* Carrito de compras */}
          <Link 
            to="/cart" 
            className="nav-link text-white me-3 position-relative" 
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="bi bi-cart-fill fs-5"></i>
            {cartItemCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartItemCount}
                <span className="visually-hidden">productos en el carrito</span>
              </span>
            )}
          </Link>
          
          {/* Notificaciones (solo para roles específicos) */}
          {isAuthenticated && [ROLES.ADMIN, ROLES.VENDOR, ROLES.WAREHOUSE].includes(userRole) && (
            <div className="dropdown me-3">
              <button
                className="btn btn-link nav-link text-white position-relative p-0"
                onClick={toggleNotifications}
                aria-expanded={isNotificationsOpen}
              >
                <i className="bi bi-bell-fill fs-5"></i>
                {stockAlerts.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {stockAlerts.length}
                    <span className="visually-hidden">notificaciones</span>
                  </span>
                )}
              </button>
              
              <div className={`dropdown-menu dropdown-menu-end p-0 ${isNotificationsOpen ? 'show' : ''}`} style={{ minWidth: '320px' }}>
                <div className="p-3 border-bottom">
                  <h6 className="mb-0">Notificaciones</h6>
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {stockAlerts.length > 0 ? (
                    stockAlerts.map((alert, index) => (
                      <div key={index} className="p-3 border-bottom">
                        <div className="d-flex">
                          <div className="me-3">
                            <span className="badge bg-danger">
                              <i className="bi bi-exclamation-triangle"></i>
                            </span>
                          </div>
                          <div>
                            <p className="mb-0 fw-bold">{alert.product_name}</p>
                            <p className="mb-0 text-muted small">
                              Stock bajo en {alert.branch_name}: {alert.current_stock} unidades
                            </p>
                            <p className="mb-0 text-muted small">
                              <i className="bi bi-clock me-1"></i>
                              {new Date(alert.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center">
                      <p className="mb-0 text-muted">No hay notificaciones</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Menú de usuario (autenticado) */}
          {isAuthenticated && user ? (
            <div className="dropdown">
              <button
                className="btn btn-link nav-link text-white d-flex align-items-center"
                onClick={toggleUserDropdown}
                aria-expanded={isUserDropdownOpen}
              >
                <span className="d-none d-lg-inline me-2">
                  {user.first_name || user.username}
                </span>
                <i className="bi bi-person-circle fs-5"></i>
              </button>
              
              <div className={`dropdown-menu dropdown-menu-end ${isUserDropdownOpen ? 'show' : ''}`}>
                <h6 className="dropdown-header">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.username}
                </h6>
                <div className="dropdown-divider"></div>
                <Link className="dropdown-item" to="/profile" onClick={() => setIsUserDropdownOpen(false)}>
                  <i className="bi bi-person me-2"></i>
                  Mi Perfil
                </Link>
                {userRole === ROLES.CUSTOMER && (
                  <>
                    <Link className="dropdown-item" to="/orders" onClick={() => setIsUserDropdownOpen(false)}>
                      <i className="bi bi-box me-2"></i>
                      Mis Pedidos
                    </Link>
                    <Link className="dropdown-item" to="/addresses" onClick={() => setIsUserDropdownOpen(false)}>
                      <i className="bi bi-geo-alt me-2"></i>
                      Mis Direcciones
                    </Link>
                  </>
                )}
                <Link className="dropdown-item" to="/change-password" onClick={() => setIsUserDropdownOpen(false)}>
                  <i className="bi bi-key me-2"></i>
                  Cambiar Contraseña
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            // Enlaces de autenticación (no autenticado)
            <div className="d-none d-lg-flex">
              <Link className="nav-link text-white me-3" to="/login">
                Iniciar Sesión
              </Link>
              <Link className="btn btn-outline-light" to="/register">
                Registrarse
              </Link>
            </div>
          )}
          
          {/* Botón de menú móvil */}
          <button
            className="navbar-toggler ms-2"
            type="button"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
        
        {/* Menú principal */}
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={() => setIsMenuOpen(false)}>
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products" onClick={() => setIsMenuOpen(false)}>
                Productos
              </Link>
            </li>
            
            {/* Enlaces específicos según rol */}
            {renderRoleLinks()}
          </ul>
          
          {/* Enlaces de autenticación en móvil */}
          {!isAuthenticated && (
            <div className="d-lg-none mt-3 mb-2">
              <Link className="btn btn-outline-light me-2 w-100 mb-2" to="/login" onClick={() => setIsMenuOpen(false)}>
                Iniciar Sesión
              </Link>
              <Link className="btn btn-light w-100" to="/register" onClick={() => setIsMenuOpen(false)}>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;