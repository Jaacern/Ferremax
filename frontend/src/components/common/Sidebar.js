import React from 'react';
import { Nav, Accordion } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/auth.slice';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const userRole = useSelector(selectUserRole);
  
  // Determinar si un enlace está activo
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  // Determinar qué menú mostrar según el rol
  const renderMenu = () => {
    switch (userRole) {
      case 'admin':
        return renderAdminMenu();
      case 'vendor':
        return renderVendorMenu();
      case 'warehouse':
        return renderWarehouseMenu();
      case 'accountant':
        return renderAccountantMenu();
      case 'customer':
      default:
        return renderCustomerMenu();
    }
  };
  
  // Menú para administradores
  const renderAdminMenu = () => (
    <>
      <Nav.Link 
        as={Link} 
        to="/admin" 
        className={`sidebar-link ${isActive('/admin') && !isActive('/admin/') ? 'active' : ''}`}
      >
        <i className="bi bi-speedometer2 me-2"></i>
        Dashboard
      </Nav.Link>
      
      <Accordion flush className="sidebar-accordion">
        <Accordion.Item eventKey="0">
          <Accordion.Header className="sidebar-accordion-header">
            <i className="bi bi-box-seam me-2"></i>
            Productos
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav.Link 
              as={Link} 
              to="/admin/products" 
              className={`sidebar-sublink ${isActive('/admin/products') ? 'active' : ''}`}
            >
              <i className="bi bi-list-ul me-2"></i>
              Lista de productos
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/admin/products/create" 
              className={`sidebar-sublink ${isActive('/admin/products/create') ? 'active' : ''}`}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Nuevo producto
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/admin/categories" 
              className={`sidebar-sublink ${isActive('/admin/categories') ? 'active' : ''}`}
            >
              <i className="bi bi-tags me-2"></i>
              Categorías
            </Nav.Link>
          </Accordion.Body>
        </Accordion.Item>
        
        <Accordion.Item eventKey="1">
          <Accordion.Header className="sidebar-accordion-header">
            <i className="bi bi-people me-2"></i>
            Usuarios
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav.Link 
              as={Link} 
              to="/admin/users" 
              className={`sidebar-sublink ${isActive('/admin/users') && !isActive('/admin/users/') ? 'active' : ''}`}
            >
              <i className="bi bi-list-ul me-2"></i>
              Lista de usuarios
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/admin/users/create" 
              className={`sidebar-sublink ${isActive('/admin/users/create') ? 'active' : ''}`}
            >
              <i className="bi bi-person-plus me-2"></i>
              Nuevo usuario
            </Nav.Link>
          </Accordion.Body>
        </Accordion.Item>
        
        <Accordion.Item eventKey="2">
          <Accordion.Header className="sidebar-accordion-header">
            <i className="bi bi-cart me-2"></i>
            Pedidos
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav.Link 
              as={Link} 
              to="/admin/orders" 
              className={`sidebar-sublink ${isActive('/admin/orders') && !isActive('/admin/orders/') ? 'active' : ''}`}
            >
              <i className="bi bi-list-ul me-2"></i>
              Todos los pedidos
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/admin/orders/pending" 
              className={`sidebar-sublink ${isActive('/admin/orders/pending') ? 'active' : ''}`}
            >
              <i className="bi bi-hourglass-split me-2"></i>
              Pendientes
            </Nav.Link>
          </Accordion.Body>
        </Accordion.Item>
        
        <Accordion.Item eventKey="3">
          <Accordion.Header className="sidebar-accordion-header">
            <i className="bi bi-building me-2"></i>
            Sucursales
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav.Link 
              as={Link} 
              to="/admin/branches" 
              className={`sidebar-sublink ${isActive('/admin/branches') && !isActive('/admin/branches/') ? 'active' : ''}`}
            >
              <i className="bi bi-list-ul me-2"></i>
              Lista de sucursales
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/admin/branches/create" 
              className={`sidebar-sublink ${isActive('/admin/branches/create') ? 'active' : ''}`}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Nueva sucursal
            </Nav.Link>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      
      <Nav.Link 
        as={Link} 
        to="/admin/reports" 
        className={`sidebar-link ${isActive('/admin/reports') ? 'active' : ''}`}
      >
        <i className="bi bi-graph-up me-2"></i>
        Reportes
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/admin/settings" 
        className={`sidebar-link ${isActive('/admin/settings') ? 'active' : ''}`}
      >
        <i className="bi bi-gear me-2"></i>
        Configuración
      </Nav.Link>
    </>
  );
  
  // Menú para vendedores
  const renderVendorMenu = () => (
    <>
      <Nav.Link 
        as={Link} 
        to="/vendor" 
        className={`sidebar-link ${isActive('/vendor') && !isActive('/vendor/') ? 'active' : ''}`}
      >
        <i className="bi bi-speedometer2 me-2"></i>
        Dashboard
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/vendor/orders" 
        className={`sidebar-link ${isActive('/vendor/orders') ? 'active' : ''}`}
      >
        <i className="bi bi-cart me-2"></i>
        Pedidos
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/vendor/inventory" 
        className={`sidebar-link ${isActive('/vendor/inventory') ? 'active' : ''}`}
      >
        <i className="bi bi-box-seam me-2"></i>
        Inventario
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/vendor/customers" 
        className={`sidebar-link ${isActive('/vendor/customers') ? 'active' : ''}`}
      >
        <i className="bi bi-people me-2"></i>
        Clientes
      </Nav.Link>
    </>
  );
  
  // Menú para bodegueros
  const renderWarehouseMenu = () => (
    <>
      <Nav.Link 
        as={Link} 
        to="/warehouse" 
        className={`sidebar-link ${isActive('/warehouse') && !isActive('/warehouse/') ? 'active' : ''}`}
      >
        <i className="bi bi-speedometer2 me-2"></i>
        Dashboard
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/warehouse/stock" 
        className={`sidebar-link ${isActive('/warehouse/stock') ? 'active' : ''}`}
      >
        <i className="bi bi-box-seam me-2"></i>
        Gestión de Stock
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/warehouse/orders" 
        className={`sidebar-link ${isActive('/warehouse/orders') ? 'active' : ''}`}
      >
        <i className="bi bi-cart me-2"></i>
        Pedidos Pendientes
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/warehouse/transfers" 
        className={`sidebar-link ${isActive('/warehouse/transfers') ? 'active' : ''}`}
      >
        <i className="bi bi-arrow-left-right me-2"></i>
        Transferencias
      </Nav.Link>
    </>
  );
  
  // Menú para contadores
  const renderAccountantMenu = () => (
    <>
      <Nav.Link 
        as={Link} 
        to="/accountant" 
        className={`sidebar-link ${isActive('/accountant') && !isActive('/accountant/') ? 'active' : ''}`}
      >
        <i className="bi bi-speedometer2 me-2"></i>
        Dashboard
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/accountant/payments" 
        className={`sidebar-link ${isActive('/accountant/payments') ? 'active' : ''}`}
      >
        <i className="bi bi-credit-card me-2"></i>
        Gestión de Pagos
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/accountant/reports" 
        className={`sidebar-link ${isActive('/accountant/reports') ? 'active' : ''}`}
      >
        <i className="bi bi-graph-up me-2"></i>
        Informes de Ventas
      </Nav.Link>
    </>
  );
  
  // Menú para clientes
  const renderCustomerMenu = () => (
    <>
      <Nav.Link 
        as={Link} 
        to="/profile" 
        className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
      >
        <i className="bi bi-person me-2"></i>
        Mi Perfil
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/orders" 
        className={`sidebar-link ${isActive('/orders') ? 'active' : ''}`}
      >
        <i className="bi bi-cart me-2"></i>
        Mis Pedidos
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/addresses" 
        className={`sidebar-link ${isActive('/addresses') ? 'active' : ''}`}
      >
        <i className="bi bi-geo-alt me-2"></i>
        Mis Direcciones
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/wishlist" 
        className={`sidebar-link ${isActive('/wishlist') ? 'active' : ''}`}
      >
        <i className="bi bi-heart me-2"></i>
        Lista de Deseos
      </Nav.Link>
    </>
  );
  
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h5 className="m-0">Panel de Control</h5>
        <button 
          className="btn-close d-md-none" 
          onClick={toggleSidebar}
          aria-label="Cerrar menú lateral"
        ></button>
      </div>
      
      <div className="sidebar-body">
        <Nav className="flex-column">
          {renderMenu()}
        </Nav>
      </div>
      
      <style jsx="true">{`
        .sidebar {
          position: fixed;
          top: 56px; /* Altura del navbar */
          left: 0;
          bottom: 0;
          width: 250px;
          background-color: #f8f9fa;
          border-right: 1px solid #dee2e6;
          z-index: 1030;
          transition: transform 0.3s ease;
          overflow-y: auto;
        }
        
        @media (max-width: 767.98px) {
          .sidebar {
            transform: translateX(-100%);
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
        }
        
        .sidebar-header {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #dee2e6;
        }
        
        .sidebar-body {
          padding: 1rem 0;
        }
        
        .sidebar-link {
          padding: 0.5rem 1rem;
          color: #212529;
        }
        
        .sidebar-link:hover {
          background-color: #e9ecef;
        }
        
        .sidebar-link.active {
          background-color: #0d6efd;
          color: white;
        }
        
        .sidebar-accordion-header {
          padding: 0;
        }
        
        .sidebar-accordion-header button {
          padding: 0.5rem 1rem;
          color: #212529;
          font-weight: 400;
          text-align: left;
          width: 100%;
        }
        
        .sidebar-sublink {
          padding: 0.5rem 1rem 0.5rem 2rem;
          color: #212529;
        }
        
        .sidebar-sublink:hover {
          background-color: #e9ecef;
        }
        
        .sidebar-sublink.active {
          background-color: #0d6efd;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;