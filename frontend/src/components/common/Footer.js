import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h5>FERREMAS</h5>
            <p className="text-muted small">
              Distribuidora de productos de ferretería y construcción desde 1980.
              Ofrecemos todo lo que necesitas para tus proyectos.
            </p>
          </Col>
          
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h5>Enlaces</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-muted">Inicio</Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-decoration-none text-muted">Productos</Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-decoration-none text-muted">Crear cuenta</Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-decoration-none text-muted">Iniciar sesión</Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h5>Categorías</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/products?category=MANUAL_TOOLS" className="text-decoration-none text-muted">Herramientas Manuales</Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=POWER_TOOLS" className="text-decoration-none text-muted">Herramientas Eléctricas</Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=CONSTRUCTION_MATERIALS" className="text-decoration-none text-muted">Materiales de Construcción</Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=SAFETY_EQUIPMENT" className="text-decoration-none text-muted">Equipos de Seguridad</Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={3} md={6}>
            <h5>Contacto</h5>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                Av. Libertador O'Higgins 1111, Santiago
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                +56 2 2123 4567
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                contacto@ferremas.cl
              </li>
              <li className="mb-2">
                <i className="bi bi-clock me-2"></i>
                Lun-Vie: 9:00 - 18:00, Sáb: 9:00 - 14:00
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4 bg-secondary" />
        
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0 text-muted small">
              &copy; {currentYear} FERREMAS. Todos los derechos reservados.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div className="social-icons">
              <a href="#!" className="text-muted me-3">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#!" className="text-muted me-3">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#!" className="text-muted me-3">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#!" className="text-muted">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;