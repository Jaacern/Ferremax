import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Button, 
  Form, 
  Badge, 
  Alert, 
  Spinner, 
  Breadcrumb, 
  Tab, 
  Tabs, 
  Table 
} from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { 
  fetchProductById,
  selectProduct,
  selectIsLoading,
  selectError,
  clearProduct
} from '../../store/product.slice';

// Importaremos las acciones del carrito cuando las creemos
// import { addToCart } from '../../store/cart.slice';

const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const product = useSelector(selectProduct);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState('');
  
  // Cargar producto al montar o cuando cambia el ID
  useEffect(() => {
    dispatch(fetchProductById(id));
    
    // Limpiar producto al desmontar
    return () => {
      dispatch(clearProduct());
    };
  }, [dispatch, id]);
  
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };
  
  // Calcular precio con descuento si existe
  const hasDiscount = product?.discount_percentage > 0;
  const currentPrice = hasDiscount
    ? product?.price * (1 - product?.discount_percentage / 100)
    : product?.price;
  
  // Manejar cambio de cantidad
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  // Manejar cambio de sucursal
  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };
  
  // Manejar agregar al carrito
  const handleAddToCart = () => {
    // Cuando implementemos el slice del carrito, descomentar esta línea
    // dispatch(addToCart({ 
    //   ...product, 
    //   quantity, 
    //   branch_id: selectedBranch || (product.stocks && product.stocks.length > 0 ? product.stocks[0].branch_id : null)
    // }));
    
    // Por ahora, solo mostrar un mensaje en consola
    console.log('Agregado al carrito:', {
      ...product,
      quantity,
      branch_id: selectedBranch || (product?.stocks && product.stocks.length > 0 ? product.stocks[0].branch_id : null)
    });
    
    // Navegar al carrito
    // navigate('/cart');
  };
  
  // Verificar disponibilidad en sucursales
  const isAvailableInBranch = (branchId) => {
    if (!product?.stocks) return false;
    
    const stock = product.stocks.find(s => s.branch_id === branchId);
    return stock && stock.quantity > 0;
  };
  
  // Obtener stock disponible para la sucursal seleccionada
  const getAvailableStock = () => {
    if (!product?.stocks) return 0;
    
    const branchId = selectedBranch || (product.stocks.length > 0 ? product.stocks[0].branch_id : null);
    const stock = product.stocks.find(s => s.branch_id === branchId);
    
    return stock ? stock.quantity : 0;
  };
  
  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando producto...</span>
        </Spinner>
        <p className="mt-3">Cargando información del producto...</p>
      </Container>
    );
  }
  
  // Si hay un error, mostrar mensaje de error
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error al cargar el producto</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/products')}>
            Volver al catálogo
          </Button>
        </Alert>
      </Container>
    );
  }
  
  // Si no hay producto, mostrar mensaje
  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="info">
          <p className="mb-0">El producto no existe o ha sido eliminado.</p>
          <Button variant="primary" className="mt-3" onClick={() => navigate('/products')}>
            Volver al catálogo
          </Button>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/products' }}>Productos</Breadcrumb.Item>
        {product.category && (
          <Breadcrumb.Item 
            linkAs={Link} 
            linkProps={{ to: `/products?category=${product.category}` }}
          >
            {product.category}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
      </Breadcrumb>
      
      <Row>
        {/* Imagen del producto */}
        <Col lg={5} md={6} className="mb-4">
          <div className="product-image-container border rounded p-3 bg-white text-center">
            <img 
              src={product.image_url || 'https://via.placeholder.com/500x500?text=FERREMAS'} 
              alt={product.name} 
              className="img-fluid product-detail-img"
            />
          </div>
          
          {/* Badges */}
          <div className="mt-3">
            {hasDiscount && (
              <Badge bg="danger" className="me-2">
                -{product.discount_percentage}% DESCUENTO
              </Badge>
            )}
            
            {product.is_new && (
              <Badge bg="primary" className="me-2">
                NUEVO
              </Badge>
            )}
            
            {product.is_featured && (
              <Badge bg="warning" text="dark">
                DESTACADO
              </Badge>
            )}
          </div>
        </Col>
        
        {/* Información del producto */}
        <Col lg={7} md={6}>
          {/* Encabezado */}
          <h1 className="mb-2">{product.name}</h1>
          
          <div className="mb-2">
            <span className="text-muted me-3">
              SKU: {product.sku}
            </span>
            {product.brand && (
              <span className="text-muted">
                Marca: {product.brand}
              </span>
            )}
          </div>
          
          {/* Precios */}
          <div className="mb-4">
            {hasDiscount ? (
              <>
                <h2 className="product-detail-price mb-0">
                  {formatPrice(currentPrice)}
                </h2>
                <div className="product-detail-discount">
                  {formatPrice(product.price)}
                </div>
                <div className="text-success">
                  Ahorras {formatPrice(product.price - currentPrice)}
                </div>
              </>
            ) : (
              <h2 className="product-detail-price mb-0">
                {formatPrice(product.price)}
              </h2>
            )}
          </div>
          
          {/* Disponibilidad */}
          <div className="mb-4">
            <h5>Disponibilidad</h5>
            {product.stocks && product.stocks.length > 0 ? (
              <Form.Group className="mb-3">
                <Form.Label>Seleccionar sucursal:</Form.Label>
                <Form.Select 
                  value={selectedBranch || ''}
                  onChange={handleBranchChange}
                >
                  {product.stocks.map(stock => (
                    <option 
                      key={stock.branch_id} 
                      value={stock.branch_id}
                      disabled={stock.quantity <= 0}
                    >
                      {stock.branch_name} - {stock.quantity > 0 ? `${stock.quantity} unidades` : 'Sin stock'}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            ) : (
              <Alert variant="warning">
                No hay información de stock disponible.
              </Alert>
            )}
          </div>
          
          {/* Cantidad y botón de compra */}
          <div className="mb-4">
            <Row className="align-items-center">
              <Col xs={4} sm={3}>
                <Form.Group>
                  <Form.Label>Cantidad:</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={getAvailableStock()}
                    value={quantity}
                    onChange={handleQuantityChange}
                  />
                </Form.Group>
              </Col>
              
              <Col>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100 mt-4"
                  onClick={handleAddToCart}
                  disabled={getAvailableStock() === 0}
                >
                  {getAvailableStock() > 0 ? 'Agregar al carrito' : 'Sin stock disponible'}
                </Button>
              </Col>
            </Row>
          </div>
          
          {/* Descripción y detalles en tabs */}
          <Tabs defaultActiveKey="description" className="mb-3">
            <Tab eventKey="description" title="Descripción">
              <div className="p-3">
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <p className="text-muted">No hay descripción disponible para este producto.</p>
                )}
              </div>
            </Tab>
            
            <Tab eventKey="details" title="Especificaciones">
              <div className="p-3">
                <Table striped bordered hover>
                  <tbody>
                    <tr>
                      <td>SKU</td>
                      <td>{product.sku}</td>
                    </tr>
                    <tr>
                      <td>Marca</td>
                      <td>{product.brand || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Código del fabricante</td>
                      <td>{product.brand_code || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Categoría</td>
                      <td>{product.category || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Subcategoría</td>
                      <td>{product.subcategory || 'N/A'}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Tab>
          </Tabs>
        </Col>
      </Row>
      
      {/* Sección de productos relacionados se puede agregar aquí */}
    </Container>
  );
};

export default ProductPage;