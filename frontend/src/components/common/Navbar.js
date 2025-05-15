import React from 'react';
import { Navbar as BSNavbar, Container, Nav, NavDropdown, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectIsAuthenticated, 
  selectCurrentUser, 
  selectUserRole,
  logout 
} from '../../store/auth.slice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  
  // Simulación para el carrito - esto vendrá del slice del carrito cuando lo implementemos
  const cartItemCount = 0;
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  // Determinar los enlaces del menú según el rol del usuario
  const renderRoleBasedLinks = () => {
    switch (userRole) {
      case 'admin':
        return (
          <NavDropdown title="Administración" id="admin-dropdown">
            <NavDropdown.Item as={Link} to="/admin">Dashboard</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/admin/products">Productos</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/admin/users">Usuarios</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/admin/orders">Pedidos</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/admin/branches">Sucursales</NavDropdown.Item>
          </NavDropdown>
        );
      case 'vendor':
        return (
          <NavDropdown title="Vendedor" id="vendor-dropdown">
            <NavDropdown.Item as={Link} to="/vendor">Dashboard</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/vendor/orders">Pedidos</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/vendor/inventory">Inventario</NavDropdown.Item>
          </NavDropdown>
        );
      case 'warehouse':
        return (
          <NavDropdown title="Bodega" id="warehouse-dropdown">
            <NavDropdown.Item as={Link} to="/warehouse">Dashboard</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/warehouse/stock">Stock</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/warehouse/orders">Pedidos</NavDropdown.Item>
          </NavDropdown>
        );
      case 'accountant':
        return (
          <NavDropdown title="Contabilidad" id="accountant-dropdown">
            <NavDropdown.Item as={Link} to="/accountant">Dashboard</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/accountant/payments">Pagos</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/accountant/reports">Informes</NavDropdown.Item>
          </NavDropdown>
        );
      default:
        return null;
    }
  };
  
  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" className="py-2 shadow-sm">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          FERREMAS
        </BSNavbar.Brand>
        
        <BSNavbar.Toggle aria-controls="navbar-collapse" />
        
        <BSNavbar.Collapse id="navbar-collapse">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/products">Productos</Nav.Link>
            <NavDropdown title="Categorías" id="categories-dropdown">
              <NavDropdown.Item as={Link} to="/products?category=MANUAL_TOOLS">Herramientas Manuales</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products?category=POWER_TOOLS">Herramientas Eléctricas</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products?category=CONSTRUCTION_MATERIALS">Materiales de Construcción</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products?category=FINISHES">Acabados</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products?category=SAFETY_EQUIPMENT">Equipos de Seguridad</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/products">Ver todas</NavDropdown.Item>
            </NavDropdown>
            {isAuthenticated && renderRoleBasedLinks()}
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                {userRole === 'customer' && (
                  <Nav.Link as={Link} to="/cart" className="position-relative me-2">
                    <i className="bi bi-cart"></i> Carrito
                    {cartItemCount > 0 && (
                      <Badge 
                        bg="danger" 
                        pill 
                        className="position-absolute top-0 start-100 translate-middle"
                      >
                        {cartItemCount}
                      </Badge>
                    )}
                  </Nav.Link>
                )}
                
                <NavDropdown 
                  title={
                    <>
                      <i className="bi bi-person-circle"></i>{' '}
                      {currentUser?.first_name || currentUser?.username}
                    </>
                  } 
                  id="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/profile">Mi Perfil</NavDropdown.Item>
                  {userRole === 'customer' && (
                    <NavDropdown.Item as={Link} to="/orders">Mis Pedidos</NavDropdown.Item>
                  )}
                  <NavDropdown.Item as={Link} to="/change-password?voluntary=true">Cambiar Contraseña</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Cerrar Sesión</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="outline-light"
                  className="ms-2"
                >
                  Registrarse
                </Button>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;