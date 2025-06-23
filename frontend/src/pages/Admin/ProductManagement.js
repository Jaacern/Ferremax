import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Row, 
  Col, 
  Badge, 
  Alert, 
  Spinner, 
  Pagination,
  Card,
  InputGroup
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProducts,
  fetchCategories,
  selectProducts,
  selectCategories,
  selectPagination,
  selectIsLoading,
  selectError,
  setFilters
} from '../../store/product.slice';
import productService from '../../services/product.service';

const defaultPagination = {
  page: 1,
  pages: 1,
  total: 0,
  per_page: 10,
  has_next: false,
  has_prev: false,
};

const ProductManagement = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const pagination = useSelector(selectPagination) || defaultPagination;
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  
  // Estado para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estado para el producto actual en edición/eliminación
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    brand: '',
    brand_code: '',
    category: '',
    subcategory: '',
    price: '',
    discount_percentage: 0,
    is_featured: false,
    is_new: false,
    image_url: ''
  });
  
  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para errores de formulario
  const [formError, setFormError] = useState(null);
  
  // Estado para operaciones
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState(null);
  
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };
  
  // Cargar productos
  useEffect(() => {
    dispatch(fetchProducts({ page: 1, filters: { per_page: 10 } }));
    dispatch(fetchCategories());
  }, [dispatch]);
  
  // Manejar cambio de página
  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };
  
  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ 
      search: searchTerm,
      page: 1 
    }));
  };
  
  // Resetear búsqueda
  const handleResetSearch = () => {
    setSearchTerm('');
    dispatch(setFilters({ 
      search: '',
      page: 1 
    }));
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Abrir modal de agregar
  const handleShowAddModal = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      brand: '',
      brand_code: '',
      category: '',
      subcategory: '',
      price: '',
      discount_percentage: 0,
      is_featured: false,
      is_new: true,
      image_url: ''
    });
    setFormError(null);
    setOperationSuccess(null);
    setShowAddModal(true);
  };
  
  // Abrir modal de edición
  const handleShowEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      brand: product.brand || '',
      brand_code: product.brand_code || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      price: product.price,
      discount_percentage: product.discount_percentage || 0,
      is_featured: product.is_featured || false,
      is_new: product.is_new || false,
      image_url: product.image_url || ''
    });
    setFormError(null);
    setOperationSuccess(null);
    setShowEditModal(true);
  };
  
  // Abrir modal de eliminación
  const handleShowDeleteModal = (product) => {
    setCurrentProduct(product);
    setFormError(null);
    setOperationSuccess(null);
    setShowDeleteModal(true);
  };
  
  // Cerrar modales
  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setCurrentProduct(null);
  };
  
  // Validar formulario
  const validateForm = () => {
    // ――― 1. Campos obligatorios ―――
    if (!formData.sku || !formData.name || formData.price === '' || !formData.category) {
      setFormError('Los campos SKU, nombre, precio y categoría son obligatorios');
      return false;
    }

  // ――― 2. Precio válido (> 0 y numérico) ―――
  const priceNumber = Number(formData.price);
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      setFormError('El precio debe ser un número positivo');
      return false;
    }

  // ――― 3. Descuento válido 0-100 ―――
  const discountNumber = Number(formData.discount_percentage);
    if (
      Number.isNaN(discountNumber) ||
      discountNumber < 0 ||
      discountNumber > 100
    ) {
      setFormError('El descuento debe ser un número entre 0 y 100');
      return false;
    }

    return true;
  };

  
  const safePage = pagination?.page ?? 1;

  // Crear producto
  const handleAddProduct = async () => {
    if (!validateForm()) return;
    
    setOperationLoading(true);
    setFormError(null);
    
    try {
      // Preparar datos
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount_percentage: parseFloat(formData.discount_percentage)
      };
      
      // Llamar al servicio
      await productService.createProduct(productData);
      
      // Actualizar lista
      dispatch(fetchProducts({ page: 1, filters: { per_page: 10 } }));
      
      // Mostrar mensaje de éxito
      setOperationSuccess('Producto creado exitosamente');
      
      // Cerrar modal después de un momento
      setTimeout(() => {
        handleCloseModals();
        setOperationSuccess(null);
      }, 2000);
      
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al crear el producto');
    } finally {
      setOperationLoading(false);
    }
  };
  
  // Actualizar producto
  const handleUpdateProduct = async () => {
    if (!validateForm()) return;
    
    setOperationLoading(true);
    setFormError(null);
    
    try {
      // Preparar datos
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount_percentage: parseFloat(formData.discount_percentage)
      };
      
      // Llamar al servicio
      await productService.updateProduct(currentProduct.id, productData);
      
      // Actualizar lista
      dispatch(fetchProducts({ 
        page: safePage, 
        filters: { per_page: 10 } 
      }));
      
      // Mostrar mensaje de éxito
      setOperationSuccess('Producto actualizado exitosamente');
      
      // Cerrar modal después de un momento
      setTimeout(() => {
        handleCloseModals();
        setOperationSuccess(null);
      }, 2000);
      
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al actualizar el producto');
    } finally {
      setOperationLoading(false);
    }
  };
  
  // Eliminar producto
  const handleDeleteProduct = async () => {
    setOperationLoading(true);
    setFormError(null);
    
    try {
      // Llamar al servicio
      await productService.deleteProduct(currentProduct.id);
      
      // Actualizar lista
      dispatch(fetchProducts({ 
        page: safePage, 
        filters: { per_page: 10 } 
      }));
      
      // Mostrar mensaje de éxito
      setOperationSuccess('Producto eliminado exitosamente');
      
      // Cerrar modal después de un momento
      setTimeout(() => {
        handleCloseModals();
        setOperationSuccess(null);
      }, 2000);
      
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al eliminar el producto');
    } finally {
      setOperationLoading(false);
    }
  };
  
  // Renderizar paginación
  const renderPagination = () => {
    const { page, pages } = pagination;
    
    // No mostrar si solo hay una página
    if (pages <= 1) return null;
    
    // Crear items de paginación
    const items = [];
    
    // Primera página
    items.push(
      <Pagination.First 
        key="first" 
        onClick={() => handlePageChange(1)}
        disabled={page === 1}
      />
    );
    
    // Página anterior
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      />
    );
    
    // Mostrar un máximo de 5 páginas centradas alrededor de la página actual
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(pages, page + 2);
    
    // Añadir elipsis inicial si necesario
    if (startPage > 1) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }
    
    // Añadir páginas numeradas
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // Añadir elipsis final si necesario
    if (endPage < pages) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }
    
    // Página siguiente
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(page + 1)}
        disabled={page === pages}
      />
    );
    
    // Última página
    items.push(
      <Pagination.Last 
        key="last" 
        onClick={() => handlePageChange(pages)}
        disabled={page === pages}
      />
    );
    
    return (
      <Pagination className="justify-content-center mt-4">
        {items}
      </Pagination>
    );
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Gestión de Productos</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button variant="primary" onClick={handleShowAddModal}>
              <i className="bi bi-plus-circle me-2"></i>
              Agregar Producto
            </Button>
            
            <Form onSubmit={handleSearch} className="d-flex">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar productos"
                />
                <Button variant="outline-secondary" onClick={handleResetSearch} type="button">
                  <i className="bi bi-x-circle"></i>
                </Button>
                <Button variant="primary" type="submit">
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Form>
          </div>
          
          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}
          
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <p className="mt-2">Cargando productos...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No hay productos disponibles
                        </td>
                      </tr>
                    ) : (
                      products.map((product, idx) => (
                        <tr key={product.id ?? product.sku ?? idx}>
                          <td>{product.sku}</td>
                          <td>
                            {product.name}
                            <div className="small text-muted">
                              {product.brand}
                            </div>
                          </td>
                          <td>
                            {product.category}
                            {product.subcategory && (
                              <div className="small text-muted">
                                {product.subcategory}
                              </div>
                            )}
                          </td>
                          <td>
                            {formatPrice(product.price)}
                            {product.discount_percentage > 0 && (
                              <div className="text-danger small">
                                -{product.discount_percentage}%
                              </div>
                            )}
                          </td>
                          <td>
                            {product.is_featured && (
                              <Badge bg="warning" text="dark" className="me-1">
                                Destacado
                              </Badge>
                            )}
                            {product.is_new && (
                              <Badge bg="info" className="me-1">
                                Nuevo
                              </Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1 mb-1"
                              onClick={() => handleShowEditModal(product)}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="mb-1"
                              onClick={() => handleShowDeleteModal(product)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
              
              {/* Paginación */}
              {renderPagination()}
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal para agregar producto */}
      <Modal show={showAddModal} onHide={handleCloseModals} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agregar Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && (
            <Alert variant="danger">{formError}</Alert>
          )}
          
          {operationSuccess && (
            <Alert variant="success">{operationSuccess}</Alert>
          )}
          
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>SKU *</Form.Label>
                  <Form.Control
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Marca</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Código del fabricante</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand_code"
                    value={formData.brand_code}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría *</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subcategoría</Form.Label>
                  <Form.Control
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Descuento (%)</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      name="discount_percentage"
                      value={formData.discount_percentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Producto destacado"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Producto nuevo"
                    name="is_new"
                    checked={formData.is_new}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>URL de imagen</Form.Label>
              <Form.Control
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModals}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddProduct}
            disabled={operationLoading}
          >
            {operationLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Guardando...
              </>
            ) : (
              'Guardar producto'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para editar producto */}
      <Modal show={showEditModal} onHide={handleCloseModals} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && (
            <Alert variant="danger">{formError}</Alert>
          )}
          
          {operationSuccess && (
            <Alert variant="success">{operationSuccess}</Alert>
          )}
          
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>SKU *</Form.Label>
                  <Form.Control
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Marca</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Código del fabricante</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand_code"
                    value={formData.brand_code}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría *</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subcategoría</Form.Label>
                  <Form.Control
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Descuento (%)</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      name="discount_percentage"
                      value={formData.discount_percentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Producto destacado"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Producto nuevo"
                    name="is_new"
                    checked={formData.is_new}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>URL de imagen</Form.Label>
              <Form.Control
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModals}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateProduct}
            disabled={operationLoading}
          >
            {operationLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Actualizando...
              </>
            ) : (
              'Actualizar producto'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para confirmar eliminación */}
      <Modal show={showDeleteModal} onHide={handleCloseModals}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && (
            <Alert variant="danger">{formError}</Alert>
          )}
          
          {operationSuccess && (
            <Alert variant="success">{operationSuccess}</Alert>
          )}
          
          <p>
            ¿Estás seguro de que deseas eliminar el producto 
            <strong>{currentProduct?.name}</strong>?
          </p>
          <p className="text-danger">
            Esta acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModals}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteProduct}
            disabled={operationLoading}
          >
            {operationLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Eliminando...
              </>
            ) : (
              'Eliminar producto'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductManagement;