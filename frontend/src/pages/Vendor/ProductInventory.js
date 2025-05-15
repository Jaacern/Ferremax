import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Form, InputGroup, Button, Badge, Spinner, Alert, Pagination } from 'react-bootstrap';
import api from '../../services/api';

const ProductInventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLowStock, setShowLowStock] = useState(false);
  const productsPerPage = 10;

  useEffect(() => {
    fetchBranches();
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filtrar productos cada vez que cambian los filtros
    filterProducts();
  }, [searchTerm, selectedCategory, selectedBranch, showLowStock, products]);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/products/branches');
      setBranches(response.data.branches);
      
      // Si no hay sucursal seleccionada, seleccionar la primera
      if (response.data.branches.length > 0 && !selectedBranch) {
        setSelectedBranch(response.data.branches[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/stock', {
        params: { branch_id: selectedBranch || undefined }
      });
      
      setProducts(response.data.stocks);
      setTotalPages(Math.ceil(response.data.stocks.length / productsPerPage));
    } catch (err) {
      setError('Error al cargar el inventario. Por favor, intenta de nuevo.');
      console.error('Error loading inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    // Aplicar filtros a los productos
    let filtered = [...products];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.product_brand && item.product_brand.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(item => item.product.category === selectedCategory);
    }
    
    // Filtrar por stock bajo
    if (showLowStock) {
      filtered = filtered.filter(item => item.is_low_stock);
    }
    
    // Actualizar productos filtrados y recalcular páginas
    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / productsPerPage));
    
    // Resetear página actual si no hay resultados en la página actual
    if (currentPage > Math.max(1, Math.ceil(filtered.length / productsPerPage))) {
      setCurrentPage(1);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
    // Volver a cargar productos para la nueva sucursal
    fetchProducts();
    setCurrentPage(1);
  };

  const toggleLowStockFilter = () => {
    setShowLowStock(!showLowStock);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStockStatusBadge = (stock) => {
    if (stock.quantity <= 0) {
      return <Badge bg="danger">Sin stock</Badge>;
    } else if (stock.is_low_stock) {
      return <Badge bg="warning">Stock bajo</Badge>;
    } else {
      return <Badge bg="success">Disponible</Badge>;
    }
  };

  // Obtener los productos para la página actual
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  // Renderizar paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let items = [];
    const maxVisible = 5; // Máximo de páginas a mostrar
    
    // Primera y anterior
    items.push(
      <Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />,
      <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
    );

    // Páginas numeradas
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    // Ajustar startPage si estamos cerca del final
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Elipsis al inicio si necesario
    if (startPage > 1) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }
    
    // Páginas numeradas
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    // Elipsis al final si necesario
    if (endPage < totalPages) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }

    // Siguiente y última
    items.push(
      <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />,
      <Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
    );

    return <Pagination>{items}</Pagination>;
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Inventario de Productos</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Sucursal</Form.Label>
                <Form.Select
                  value={selectedBranch}
                  onChange={handleBranchChange}
                  disabled={isLoading}
                >
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  disabled={isLoading}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group>
                <Form.Label>Buscar</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Nombre, SKU o marca..."
                    value={searchTerm}
                    onChange={handleSearch}
                    disabled={isLoading}
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setSearchTerm('')}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
            </Col>
            
            <Col md={2} className="d-flex align-items-end">
              <Form.Group className="w-100">
                <Form.Check
                  type="switch"
                  id="show-low-stock"
                  label="Solo stock bajo"
                  checked={showLowStock}
                  onChange={toggleLowStockFilter}
                  disabled={isLoading}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-end mb-3">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={fetchProducts}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Actualizar inventario
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <p className="mt-2">Cargando inventario...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <Alert variant="info">
              <p className="mb-0">No se encontraron productos con los filtros seleccionados.</p>
            </Alert>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th>Marca</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageProducts().map(item => (
                    <tr key={item.id}>
                      <td>{item.product_sku}</td>
                      <td>{item.product_name}</td>
                      <td>{item.product.brand || '-'}</td>
                      <td>{item.product.category}</td>
                      <td>
                        {item.quantity} / {item.min_stock}
                      </td>
                      <td>{getStockStatusBadge(item)}</td>
                      <td>
                        ${new Intl.NumberFormat('es-CL').format(item.product.current_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Mostrando {filteredProducts.length > 0 ? 
                      `${(currentPage - 1) * productsPerPage + 1}-${Math.min(currentPage * productsPerPage, filteredProducts.length)}` 
                      : '0'} de {filteredProducts.length} productos
                  </small>
                </div>
                <div>{renderPagination()}</div>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProductInventory;