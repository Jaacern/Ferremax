import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-5 mt-5">
      <div className="container">
        <div className="row">
          {/* Logo y descripción */}
          <div className="col-lg-4 mb-4 mb-lg-0">
            <h5 className="text-uppercase mb-4">FERREMAS</h5>
            <p className="mb-4">
              Su proveedor de confianza en herramientas y materiales de construcción de alta calidad.
              Encontrará todo lo que necesita para sus proyectos de construcción y renovación.
            </p>
            <div className="d-flex">
              <a href="https://facebook.com" className="text-white me-3" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="https://instagram.com" className="text-white me-3" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="https://twitter.com" className="text-white me-3" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="https://youtube.com" className="text-white" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-youtube fs-5"></i>
              </a>
            </div>
          </div>
          
          {/* Enlaces de navegación */}
          <div className="col-lg-2 col-md-4 mb-4 mb-md-0">
            <h6 className="text-uppercase mb-4">Navegación</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none">Inicio</Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-white text-decoration-none">Productos</Link>
              </li>
              <li className="mb-2">
                <Link to="/cart" className="text-white text-decoration-none">Carrito</Link>
              </li>
              <li className="mb-2">
                <Link to="/profile" className="text-white text-decoration-none">Mi Cuenta</Link>
              </li>
            </ul>
          </div>
          
          {/* Enlaces de categorías */}
          <div className="col-lg-2 col-md-4 mb-4 mb-md-0">
            <h6 className="text-uppercase mb-4">Categorías</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/products?category=MANUAL_TOOLS" className="text-white text-decoration-none">
                  Herramientas Manuales
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=POWER_TOOLS" className="text-white text-decoration-none">
                  Herramientas Eléctricas
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=CONSTRUCTION_MATERIALS" className="text-white text-decoration-none">
                  Materiales
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=SAFETY_EQUIPMENT" className="text-white text-decoration-none">
                  Seguridad
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contacto */}
          <div className="col-lg-4 col-md-4">
            <h6 className="text-uppercase mb-4">Contacto</h6>
            <p className="mb-2">
              <i className="bi bi-geo-alt-fill me-2"></i>
              Av. Libertador Bernardo O'Higgins 1111, Santiago
            </p>
            <p className="mb-2">
              <i className="bi bi-envelope-fill me-2"></i>
              <a href="mailto:contacto@ferremas.cl" className="text-white text-decoration-none">
                contacto@ferremas.cl
              </a>
            </p>
            <p className="mb-2">
              <i className="bi bi-telephone-fill me-2"></i>
              <a href="tel:+56221234567" className="text-white text-decoration-none">
                +56 2 2123 4567
              </a>
            </p>
            <p className="mb-0">
              <i className="bi bi-clock-fill me-2"></i>
              Lun - Vie: 9:00 - 18:00, Sáb: 9:00 - 14:00
            </p>
          </div>
        </div>
        
        <hr className="my-4" />
        
        {/* Pie de página inferior */}
        <div className="row align-items-center">
          <div className="col-md-7 col-lg-8">
            <p className="mb-md-0">
              &copy; {currentYear} FERREMAS. Todos los derechos reservados.
            </p>
          </div>
          
          <div className="col-md-5 col-lg-4">
            <div className="text-md-end">
              <Link to="/privacy-policy" className="text-white text-decoration-none me-3">
                Privacidad
              </Link>
              <Link to="/terms" className="text-white text-decoration-none me-3">
                Términos
              </Link>
              <Link to="/support" className="text-white text-decoration-none">
                Soporte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;