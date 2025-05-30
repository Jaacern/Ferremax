import React, { useEffect } from 'react';
import { Container, Row, Col, Button, Card, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProducts,
  selectProducts,
  selectIsLoading
} from '../store/product.slice';

import ProductCard from '../components/products/ProductCard';

const Home = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const isLoading = useSelector(selectIsLoading);
  
  // Cargar productos destacados al montar el componente
  useEffect(() => {
    dispatch(fetchProducts({ 
      page: 1, 
      filters: { 
        featured: true,
        per_page: 8
      } 
    }));
  }, [dispatch]);
  
  // Filtrar productos destacados (en una app real, esto vendría directamente filtrado del backend)
  const featuredProducts = products.slice(0, 4);
  const newProducts = products.filter(p => p.is_new).slice(0, 4);
  
  return (
    <div className="home-page">
      {/* Banner principal */}
      <Carousel className="home-carousel">
        <Carousel.Item>
          <div 
            className="d-block w-100 bg-primary text-white" 
            style={{ height: '400px', backgroundColor: '#0d6efd' }}
          >
            <Container className="d-flex align-items-center h-100">
              <Row className="w-100">
                <Col md={6} className="d-flex flex-column justify-content-center">
                  <h1 className="display-4 fw-bold">Tienda Online FERREMAS</h1>
                  <p className="lead">
                    Todo lo que necesitas para tus proyectos de construcción y ferretería
                  </p>
                  <div className="mt-3">
                    <Button 
                      as={Link} 
                      to="/products" 
                      variant="light" 
                      size="lg" 
                      className="me-2"
                    >
                      Ver catálogo
                    </Button>
                    <Button 
                      as={Link} 
                      to="/register" 
                      variant="outline-light" 
                      size="lg"
                    >
                      Registrarse
                    </Button>
                  </div>
                </Col>
                <Col md={6} className="d-none d-md-flex align-items-center justify-content-end">
                  <div className="bg-white rounded p-3">
                    <img 
                      src="https://via.placeholder.com/500x300?text=FERREMAS" 
                      alt="Herramientas FERREMAS" 
                      className="img-fluid"
                    />
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div 
            className="d-block w-100 bg-danger text-white" 
            style={{ height: '400px', backgroundColor: '#dc3545' }}
          >
            <Container className="d-flex align-items-center h-100">
              <Row className="w-100">
                <Col md={6} className="d-flex flex-column justify-content-center">
                  <h1 className="display-4 fw-bold">Ofertas especiales</h1>
                  <p className="lead">
                    Descuentos de hasta 30% en productos seleccionados
                  </p>
                  <div className="mt-3">
                    <Button 
                      as={Link} 
                      to="/products?featured=true" 
                      variant="light" 
                      size="lg"
                    >
                      Ver ofertas
                    </Button>
                  </div>
                </Col>
                <Col md={6} className="d-none d-md-flex align-items-center justify-content-end">
                  <div className="bg-white rounded p-3">
                    <img 
                      src="https://via.placeholder.com/500x300?text=OFERTAS" 
                      alt="Ofertas especiales" 
                      className="img-fluid"
                    />
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </Carousel.Item>
      </Carousel>
      
      {/* Categorías */}
      <Container className="py-5">
        <h2 className="mb-4">Categorías principales</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="category-card h-100">
              <Card.Img 
                variant="top" 
                src="https://via.placeholder.com/300x200?text=Herramientas" 
              />
              <Card.Body className="text-center">
                <Card.Title>Herramientas</Card.Title>
                <Button 
                  as={Link}
                  to="/products?category=MANUAL_TOOLS"
                  variant="primary"
                >
                  Ver productos
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-4">
            <Card className="category-card h-100">
              <Card.Img 
                variant="top" 
                src="https://via.placeholder.com/300x200?text=Materiales" 
              />
              <Card.Body className="text-center">
                <Card.Title>Materiales de construcción</Card.Title>
                <Button 
                  as={Link}
                  to="/products?category=CONSTRUCTION_MATERIALS"
                  variant="primary"
                >
                  Ver productos
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-4">
            <Card className="category-card h-100">
              <Card.Img 
                variant="top" 
                src="https://via.placeholder.com/300x200?text=Seguridad" 
              />
              <Card.Body className="text-center">
                <Card.Title>Equipos de seguridad</Card.Title>
                <Button 
                  as={Link}
                  to="/products?category=SAFETY_EQUIPMENT"
                  variant="primary"
                >
                  Ver productos
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* Productos destacados */}
      <div className="bg-light py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Productos destacados</h2>
            <Button 
              as={Link} 
              to="/products?featured=true" 
              variant="outline-primary"
            >
              Ver todos
            </Button>
          </div>
          
          <Row>
            {isLoading ? (
              <Col className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </Col>
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <Col key={product.id} md={6} lg={3} className="mb-4">
                  <ProductCard product={product} />
                </Col>
              ))
            ) : (
              <Col className="text-center py-3">
                <p>No hay productos destacados disponibles en este momento.</p>
              </Col>
            )}
          </Row>
        </Container>
      </div>
      
      {/* Nuevos productos */}
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Nuevos productos</h2>
          <Button 
            as={Link} 
            to="/products?new=true" 
            variant="outline-primary"
          >
            Ver todos
          </Button>
        </div>
        
        <Row>
          {isLoading ? (
            <Col className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </Col>
          ) : newProducts.length > 0 ? (
            newProducts.map(product => (
              <Col key={product.id} md={6} lg={3} className="mb-4">
                <ProductCard product={product} />
              </Col>
            ))
          ) : (
            <Col className="text-center py-3">
              <p>No hay nuevos productos disponibles en este momento.</p>
            </Col>
          )}
        </Row>
      </Container>
      
      {/* Banner de suscripción */}
      <div className="bg-secondary text-white py-5">
        <Container className="text-center">
          <h2 className="mb-3">Suscríbete a nuestro boletín</h2>
          <p className="mb-4">
            Recibe las últimas ofertas y novedades directamente en tu correo.
          </p>
          
          <Row className="justify-content-center">
            <Col md={6}>
              <div className="input-group mb-3">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Tu correo electrónico" 
                  aria-label="Tu correo electrónico" 
                />
                <Button variant="primary">Suscribirse</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* Ventajas de comprar */}
      <Container className="py-5">
        <h2 className="text-center mb-5">¿Por qué comprar en FERREMAS?</h2>
        
        <Row>
          <Col md={3} className="text-center mb-4">
            <div className="feature-icon mb-3">
              <i className="bi bi-truck fs-1 text-primary"></i>
            </div>
            <h5>Envío rápido</h5>
            <p className="text-muted">
              Entregamos en todo Chile con los mejores tiempos.
            </p>
          </Col>
          
          <Col md={3} className="text-center mb-4">
            <div className="feature-icon mb-3">
              <i className="bi bi-shield-check fs-1 text-primary"></i>
            </div>
            <h5>Calidad garantizada</h5>
            <p className="text-muted">
              Trabajamos con las mejores marcas del mercado.
            </p>
          </Col>
          
          <Col md={3} className="text-center mb-4">
            <div className="feature-icon mb-3">
              <i className="bi bi-credit-card fs-1 text-primary"></i>
            </div>
            <h5>Pago seguro</h5>
            <p className="text-muted">
              Todas las operaciones están protegidas.
            </p>
          </Col>
          
          <Col md={3} className="text-center mb-4">
            <div className="feature-icon mb-3">
              <i className="bi bi-headset fs-1 text-primary"></i>
            </div>
            <h5>Soporte técnico</h5>
            <p className="text-muted">
              Atención al cliente profesional y cordial.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;