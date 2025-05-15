import React, { useState } from 'react';
import { Table, Button, Badge, Form, InputGroup, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const StockTable = ({ stocks, isLoading, error, onUpdate, onTransfer }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    branch: '',
    availability: 'all',
    lowStock: false
  });
  
  // Formatear número
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-CL').format(num);
  };
  
  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Manejar cambio de filtro
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFilter({
      ...filter,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Filtrar productos
  const filteredStocks = stocks.filter(stock => {
    // Filtro de búsqueda
    const matchesSearch = 
      stock.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.product_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.product_brand && stock.product_brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro por sucursal
    const matchesBranch = filter.branch === '' || 
      stock.branch_id.toString() === filter.branch;
    
    // Filtro por disponibilidad
    const matchesAvailability = 
      filter.availability === 'all' ||
      (filter.availability === 'in_stock' && stock.quantity > 0) ||
      (filter.availability === 'out_of_stock' && stock.quantity <= 0);
    
    // Filtro por stock bajo
    const matchesLowStock = 
      !filter.lowStock || stock.is_low_stock;
    
    return matchesSearch && matchesBranch && matchesAvailability && matchesLowStock;
  });
  
  // Obtener lista única de sucursales
  const branches = [...new Set(stocks.map(stock => ({
    id: stock.branch_id,
    name: stock.branch_name
  })))];
  
  // Renderizar estado de stock
  const renderStockStatus = (stock) => {
    if (stock.quantity <= 0) {
      return <Badge bg="danger">Sin stock</Badge>;
    } else if (stock.is_low_stock) {
      return <Badge bg="warning" text="dark">Stock bajo</Badge>;
    } else {
      return <Badge bg="success">Disponible</Badge>;
    }
  };
  
  // Renderizar tabla
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando inventario...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error al cargar inventario</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }
  
  if (stocks.length === 0) {
    return (
      <Alert variant="info">
        <p className="mb-0">No hay información de inventario disponible.</p>
      </Alert>
    );
  }
  
  return (
    <div className="stock-table">
      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group className="mb-md-0 mb-3">
                <Form.Label>Buscar producto</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nombre, SKU o marca..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-md-0 mb-3">
                <Form.Label>Sucursal</Form.Label>
                <Form.Select 
                  name="branch" 
                  value={filter.branch} 
                  onChange={handleFilterChange}
                >
                  <option value="">Todas las sucursales</option>
                  {branches.map((branch, index) => (
                    <option key={index} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-md-0 mb-3">
                <Form.Label>Disponibilidad</Form.Label>
                <Form.Select 
                  name="availability" 
                  value={filter.availability} 
                  onChange={handleFilterChange}
                >
                  <option value="all">Todos</option>
                  <option value="in_stock">En stock</option>
                  <option value="out_of_stock">Sin stock</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group className="mb-md-0 mb-3">
                <Form.Check 
                  type="checkbox" 
                  id="lowStockFilter" 
                  label="Stock bajo" 
                  name="lowStock"
                  checked={filter.lowStock}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Tabla de productos */}
      <div className="table-responsive">
        <Table striped hover className="align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Sucursal</th>
              <th className="text-center">Cantidad</th>
              <th className="text-center">Stock Mínimo</th>
              <th className="text-center">Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No se encontraron productos con los filtros actuales.
                </td>
              </tr>
            ) : (
              filteredStocks.map((stock) => (
                <tr key={stock.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div 
                        className="me-3 bg-light rounded" 
                        style={{ width: '40px', height: '40px', overflow: 'hidden' }}
                      >
                        <img 
                          src={stock.product?.image_url || 'https://via.placeholder.com/40x40'} 
                          alt={stock.product_name} 
                          className="img-fluid"
                        />
                      </div>
                      <div>
                        <div className="fw-semibold">{stock.product_name}</div>
                        {stock.product_brand && (
                          <small className="text-muted">{stock.product_brand}</small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{stock.product_sku}</td>
                  <td>{stock.branch_name}</td>
                  <td className="text-center">
                    {formatNumber(stock.quantity)}
                  </td>
                  <td className="text-center">
                    {formatNumber(stock.min_stock)}
                  </td>
                  <td className="text-center">
                    {renderStockStatus(stock)}
                  </td>
                  <td className="text-center">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => onUpdate(stock.id)}
                    >
                      <i className="bi bi-pencil"></i> Actualizar
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => onTransfer(stock.id)}
                    >
                      <i className="bi bi-arrow-left-right"></i> Transferir
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default StockTable;