import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Form, 
  InputGroup, 
  Alert, 
  Spinner, 
  Badge, 
  Modal, 
  Tabs,
  Tab
} from 'react-bootstrap';
import api from '../../services/api';

const StockManagement = () => {
  // Estados para la lista de productos/stock
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [showLowStock, setShowLowStock] = useState(false);
  
  // Estados para el modal de actualización de stock
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Estados para el modal de transferencia
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    product_id: '',
    source_branch_id: '',
    target_branch_id: '',
    quantity: 1
  });
  const [isTransfering, setIsTransfering] = useState(false);
  
  // Cargar datos iniciales
  useEffect(() => {
    fetchBranches();
    fetchProducts();
  }, []);
  
  // Cuando cambia la sucursal seleccionada, cargar inventario
  useEffect(() => {
    if (selectedBranch) {
      fetchStocks();
    }
  }, [selectedBranch]);
  
  // Cargar sucursales
  const fetchBranches = async () => {
    try {
      const response = await api.get('/products/branches');
      setBranches(response.data.branches);
      
      // Establecer la primera sucursal como seleccionada por defecto
      if (response.data.branches.length > 0 && !selectedBranch) {
        setSelectedBranch(response.data.branches[0].id.toString());
      }
    } catch (err) {
      console.error('Error loading branches:', err);
      setError('Error al cargar las sucursales. Por favor, intenta de nuevo.');
    }
  };
  
  // Cargar productos
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };
  
  // Cargar inventario
  const fetchStocks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/stock', {
        params: {
          branch_id: selectedBranch,
          low_stock: showLowStock || undefined
        }
      });
      setStocks(response.data.stocks);
    } catch (err) {
      console.error('Error loading stocks:', err);
      setError('Error al cargar el inventario. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtrar inventario por búsqueda
  const filteredStocks = stocks.filter(stock => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      stock.product.name.toLowerCase().includes(searchLower) ||
      stock.product.sku.toLowerCase().includes(searchLower) ||
      (stock.product.brand && stock.product.brand.toLowerCase().includes(searchLower))
    );
  });
  
  // Abrir modal de actualización
  const openUpdateModal = (stock) => {
    setSelectedStock(stock);
    setNewQuantity(stock.quantity.toString());
    setShowUpdateModal(true);
  };
  
  // Manejar actualización de stock
  const handleUpdateStock = async () => {
    if (!selectedStock || isNaN(parseInt(newQuantity))) return;
    
    setIsUpdating(true);
    
    try {
      await api.put(`/stock/update/${selectedStock.id}`, {
        quantity: parseInt(newQuantity)
      });
      
      // Actualizar la lista de stock
      fetchStocks();
      
      // Cerrar el modal
      setShowUpdateModal(false);
    } catch (err) {
      console.error('Error updating stock:', err);
      setError('Error al actualizar el stock. Por favor, intenta de nuevo.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Abrir modal de transferencia
  const openTransferModal = (stock = null) => {
    if (stock) {
      setTransferData({
        product_id: stock.product_id,
        source_branch_id: selectedBranch,
        target_branch_id: '',
        quantity: 1
      });
    } else {
      setTransferData({
        product_id: '',
        source_branch_id: selectedBranch,
        target_branch_id: '',
        quantity: 1
      });
    }
    setShowTransferModal(true);
  };
  
  // Manejar cambios en el formulario de transferencia
  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Ejecutar transferencia
  const handleTransferStock = async () => {
    if (
      !transferData.product_id ||
      !transferData.source_branch_id ||
      !transferData.target_branch_id ||
      isNaN(parseInt(transferData.quantity)) ||
      parseInt(transferData.quantity) <= 0
    ) {
      return;
    }
    
    setIsTransfering(true);
    
    try {
      await api.post('/stock/transfer', {
        product_id: parseInt(transferData.product_id),
        source_branch_id: parseInt(transferData.source_branch_id),
        target_branch_id: parseInt(transferData.target_branch_id),
        quantity: parseInt(transferData.quantity)
      });
      
      // Actualizar la lista de stock
      fetchStocks();
      
      // Cerrar el modal
      setShowTransferModal(false);
    } catch (err) {
      console.error('Error transferring stock:', err);
      setError('Error al transferir el stock. Por favor, intenta de nuevo.');
    } finally {
      setIsTransfering(false);
    }
  };
  
  // Obtener el nombre del producto por ID
  const getProductName = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    return product ? product.name : 'Producto desconocido';
  };
  
  // Obtener el nombre de la sucursal por ID
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === parseInt(branchId));
    return branch ? branch.name : 'Sucursal desconocida';
  };
  
  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };
  
  // Obtener insignia de estado de stock
  const getStockStatusBadge = (stock) => {
    if (stock.quantity <= 0) {
      return <Badge bg="danger">Sin stock</Badge>;
    } else if (stock.is_low_stock) {
      return <Badge bg="warning">Stock bajo</Badge>;
    }
    return <Badge bg="success">Disponible</Badge>;
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Gestión de Inventario</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          <Tabs defaultActiveKey="stock" className="mb-3">
            <Tab eventKey="stock" title="Inventario actual">
              <Row className="mb-4">
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sucursal</Form.Label>
                    <Form.Select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      disabled={isLoading}
                    >
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Buscar producto</Form.Label>
                    <InputGroup>
                      <Form.Control
                        placeholder="Nombre, SKU o marca..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                
                <Col md={2}>
                  <Form.Group className="mb-3 mt-md-4">
                    <Form.Check
                      type="switch"
                      id="low-stock-switch"
                      label="Solo stock bajo"
                      checked={showLowStock}
                      onChange={() => {
                        setShowLowStock(!showLowStock);
                        // Recargar con el nuevo filtro
                        setTimeout(fetchStocks, 100);
                      }}
                      disabled={isLoading}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="mb-3 d-flex justify-content-between">
                <span>
                  {!isLoading && (
                    <small className="text-muted">
                      Mostrando {filteredStocks.length} productos
                    </small>
                  )}
                </span>
                
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={fetchStocks}
                    disabled={isLoading}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Actualizar
                  </Button>
                  
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => openTransferModal()}
                    disabled={isLoading}
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Nueva transferencia
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </Spinner>
                  <p className="mt-2">Cargando inventario...</p>
                </div>
              ) : filteredStocks.length === 0 ? (
                <Alert variant="info">
                  <p className="mb-0">No se encontraron productos en el inventario con los filtros seleccionados.</p>
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Producto</th>
                      <th>Marca</th>
                      <th>Cantidad</th>
                      <th>Mín. Stock</th>
                      <th>Estado</th>
                      <th>Precio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStocks.map(stock => (
                      <tr key={stock.id}>
                        <td>{stock.product.sku}</td>
                        <td>{stock.product.name}</td>
                        <td>{stock.product.brand || '-'}</td>
                        <td>{stock.quantity}</td>
                        <td>{stock.min_stock}</td>
                        <td>{getStockStatusBadge(stock)}</td>
                        <td>{formatCurrency(stock.product.current_price)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => openUpdateModal(stock)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => openTransferModal(stock)}
                          >
                            <i className="bi bi-box-arrow-right"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
            
            <Tab eventKey="alerts" title="Alertas de stock">
              <div className="mb-3">
                <Alert variant="info">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Esta sección muestra productos con stock bajo o agotado que requieren atención.
                </Alert>
                
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mb-3"
                  onClick={() => {
                    setShowLowStock(true);
                    setTimeout(fetchStocks, 100);
                  }}
                  disabled={isLoading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Actualizar alertas
                </Button>
                
                {isLoading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Sucursal</th>
                        <th>Cantidad actual</th>
                        <th>Mínimo requerido</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks
                        .filter(stock => stock.is_low_stock)
                        .map(stock => (
                          <tr key={`alert-${stock.id}`}>
                            <td>{stock.product.name}</td>
                            <td>{getBranchName(stock.branch_id)}</td>
                            <td className={stock.quantity <= 0 ? 'text-danger fw-bold' : 'text-warning'}>
                              {stock.quantity}
                            </td>
                            <td>{stock.min_stock}</td>
                            <td>
                              {stock.quantity <= 0 ? (
                                <Badge bg="danger">Agotado</Badge>
                              ) : (
                                <Badge bg="warning">Stock bajo</Badge>
                              )}
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-1"
                                onClick={() => openUpdateModal(stock)}
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => openTransferModal(stock)}
                              >
                                <i className="bi bi-box-arrow-right"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
      
      {/* Modal de actualización de stock */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Actualizar Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStock && (
            <>
              <p>
                <strong>Producto:</strong> {selectedStock.product.name}<br />
                <strong>SKU:</strong> {selectedStock.product.sku}<br />
                <strong>Sucursal:</strong> {getBranchName(selectedStock.branch_id)}<br />
                <strong>Stock actual:</strong> {selectedStock.quantity}<br />
                <strong>Stock mínimo:</strong> {selectedStock.min_stock}
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>Nueva cantidad</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  required
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateStock}
            disabled={isUpdating}
          >
            {isUpdating ? (
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
              'Guardar cambios'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal de transferencia de stock */}
      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Transferir Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Select
                name="product_id"
                value={transferData.product_id}
                onChange={handleTransferChange}
                required
              >
                <option value="">Seleccionar producto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Sucursal origen</Form.Label>
              <Form.Select
                name="source_branch_id"
                value={transferData.source_branch_id}
                onChange={handleTransferChange}
                required
              >
                <option value="">Seleccionar sucursal origen</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Sucursal destino</Form.Label>
              <Form.Select
                name="target_branch_id"
                value={transferData.target_branch_id}
                onChange={handleTransferChange}
                required
              >
                <option value="">Seleccionar sucursal destino</option>
                {branches
                  .filter(branch => branch.id !== parseInt(transferData.source_branch_id))
                  .map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Cantidad a transferir</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                min="1"
                value={transferData.quantity}
                onChange={handleTransferChange}
                required
              />
            </Form.Group>
          </Form>
          
          {transferData.product_id && transferData.source_branch_id && (
            <Alert variant="info">
              <small>
                <i className="bi bi-info-circle me-1"></i>
                Asegúrate de que haya suficiente stock en la sucursal origen antes de realizar la transferencia.
              </small>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleTransferStock}
            disabled={
              isTransfering || 
              !transferData.product_id || 
              !transferData.source_branch_id || 
              !transferData.target_branch_id || 
              !transferData.quantity || 
              parseInt(transferData.quantity) <= 0
            }
          >
            {isTransfering ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Transfiriendo...
              </>
            ) : (
              'Realizar transferencia'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StockManagement;