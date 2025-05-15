import React, { useState } from 'react';
import { Card, Row, Col, Button, Badge, Form, Alert, Tab, Tabs, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cart.slice';

const ProductDetail = ({ product, showFullDetails = false }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState(
    product?.stocks && product.stocks.length > 0 ? product.stocks[0].branch_id : ''
  );

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
    dispatch(addToCart({
      ...product,
      quantity,
      branch_id: selectedBranch || (product.stocks && product.stocks.length > 0 ? product.stocks[0].branch_id : null)
    }));
  };

  // Obtener stock disponible para la sucursal seleccionada
  const getAvailableStock = () => {
    if (!product?.stocks) return 0;

    const branchId = selectedBranch || (product.stocks.length > 0 ? product.stocks[0].branch_id : null);
    const stock = product.stocks.find(s => s.branch_id === branchId);

    return stock ? stock.quantity : 0;
  };

  // Si no hay producto, mostrar mensaje
  if (!product) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div>Producto no disponible</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="product-detail-card">
      <Card.Body>
        <Row>
          {/* Imagen del producto */}
          <Col md={5} className="mb-4 mb-md-0">
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
          <Col md={7}>
            {/* Encabezado */}
            <h2 className="mb-2">{product.name}</h2>

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
                  <h3 className="product-detail-price mb-0">
                    {formatPrice(currentPrice)}
                  </h3>
                  <div className="product-detail-discount">
                    {formatPrice(product.price)}
                  </div>
                  <div className="text-success">
                    Ahorras {formatPrice(product.price - currentPrice)}
                  </div>
                </>
              ) : (
                <h3 className="product-detail-price mb-0">
                  {formatPrice(product.price)}
                </h3>
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

            {/* Descripción */}
            {!showFullDetails && (
              <div className="mb-3">
                <h5>Descripción</h5>
                <p>{product.description || 'No hay descripción disponible para este producto.'}</p>
              </div>
            )}

            {/* Enlace a detalles completos */}
            {!showFullDetails && (
              <Button
                as={Link}
                to={`/products/${product.id}`}
                variant="outline-primary"
                className="w-100"
              >
                Ver detalles completos
              </Button>
            )}
          </Col>
        </Row>

        {/* Detalles completos en tabs (solo en vista completa) */}
        {showFullDetails && (
          <div className="mt-4">
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

              <Tab eventKey="availability" title="Disponibilidad">
                <div className="p-3">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Sucursal</th>
                        <th>Stock disponible</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.stocks && product.stocks.length > 0 ? (
                        product.stocks.map(stock => (
                          <tr key={stock.branch_id}>
                            <td>{stock.branch_name}</td>
                            <td>{stock.quantity}</td>
                            <td>
                              {stock.quantity > 10 ? (
                                <Badge bg="success">Disponible</Badge>
                              ) : stock.quantity > 0 ? (
                                <Badge bg="warning" text="dark">Stock bajo</Badge>
                              ) : (
                                <Badge bg="danger">Sin stock</Badge>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center">No hay información de stock disponible</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Tab>
            </Tabs>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProductDetail;