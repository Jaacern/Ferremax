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
import { useDispatch } from 'react-redux';

import authService from '../../services/auth.service';

const UserManagement = () => {
  // Estados para datos de usuarios
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    per_page: 10
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estado para el usuario actual en edición/eliminación
  const [currentUser, setCurrentUser] = useState(null);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    first_name: '',
    last_name: '',
    rut: '',
    phone: '',
    address: '',
    is_active: true
  });
  
  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Estado para errores de formulario
  const [formError, setFormError] = useState(null);
  
  // Estado para operaciones
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState(null);
  
  // Cargar usuarios
  const loadUsers = async (page = 1, filters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.getUsers(page, {
        ...filters,
        per_page: 10
      });
      
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);
  
  // Manejar cambio de página
  const handlePageChange = (page) => {
    loadUsers(page, { 
      search: searchTerm, 
      role: roleFilter 
    });
  };
  
  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(1, { 
      search: searchTerm, 
      role: roleFilter 
    });
  };
  
  // Resetear búsqueda
  const handleResetSearch = () => {
    setSearchTerm('');
    setRoleFilter('');
    loadUsers(1);
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
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      first_name: '',
      last_name: '',
      rut: '',
      phone: '',
      address: '',
      is_active: true
    });
    setFormError(null);
    setOperationSuccess(null);
    setShowAddModal(true);
  };
  
  // Abrir modal de edición
  const handleShowEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      rut: user.rut || '',
      phone: user.phone || '',
      address: user.address || '',
      is_active: user.is_active
    });
    setFormError(null);
    setOperationSuccess(null);
    setShowEditModal(true);
  };
  
  // Abrir modal de eliminación
  const handleShowDeleteModal = (user) => {
    setCurrentUser(user);
    setFormError(null);
    setOperationSuccess(null);
    setShowDeleteModal(true);
  };
  
  // Cerrar modales
  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setCurrentUser(null);
  };
  
  // Validar formulario
  const validateForm = () => {
    // Validar campos requeridos
    if (!formData.username || !formData.email || (!currentUser && !formData.password)) {
      setFormError('Los campos usuario, email y contraseña son obligatorios');
      return false;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('El formato del email no es válido');
      return false;
    }
    
    // Validar contraseña si está creando o cambiando
    if (formData.password) {
      // Verificar fortaleza de contraseña
      if (formData.password.length < 8) {
        setFormError('La contraseña debe tener al menos 8 caracteres');
        return false;
      }
      
      // Verificar que las contraseñas coincidan
      if (formData.password !== formData.confirmPassword) {
        setFormError('Las contraseñas no coinciden');
        return false;
      }
    }
    
    return true;
  };
  
  // Crear usuario
  const handleAddUser = async () => {
    if (!validateForm()) return;
    
    setOperationLoading(true);
    setFormError(null);
    
    try {
      // Preparar datos (eliminar confirmPassword)
      const { confirmPassword, ...userData } = formData;
      
      // Llamar al servicio
      await authService.createUser(userData);
      
      // Actualizar lista
      loadUsers();
      
      // Mostrar mensaje de éxito
      setOperationSuccess('Usuario creado exitosamente');
      
      // Cerrar modal después de un momento
      setTimeout(() => {
        handleCloseModals();
        setOperationSuccess(null);
      }, 2000);
      
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al crear el usuario');
    } finally {
      setOperationLoading(false);
    }
  };
  
  // Actualizar usuario
  const handleUpdateUser = async () => {
    if (!validateForm()) return;
    
    setOperationLoading(true);
    setFormError(null);
    
    try {
      // Preparar datos (eliminar confirmPassword)
      const { confirmPassword, ...userData } = formData;
      
      // Si no se proporciona contraseña, eliminarla del objeto
      if (!userData.password) {
        delete userData.password;
      }
      
      // Llamar al servicio
      await authService.updateUser(currentUser.id, userData);
      
      // Actualizar lista
      loadUsers(pagination.page, { 
        search: searchTerm, 
        role: roleFilter 
      });
      
      // Mostrar mensaje de éxito
      setOperationSuccess('Usuario actualizado exitosamente');
      
      // Cerrar modal después de un momento
      setTimeout(() => {
        handleCloseModals();
        setOperationSuccess(null);
      }, 2000);
      
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al actualizar el usuario');
    } finally {
      setOperationLoading(false);
    }
  };
  
  // Eliminar usuario
  const handleDeleteUser = async () => {
    setOperationLoading(true);
    setFormError(null);
    
    try {
      // Llamar al servicio
      await authService.deleteUser(currentUser.id);
      
      // Actualizar lista
      loadUsers(pagination.page, { 
        search: searchTerm, 
        role: roleFilter 
      });
      
      // Mostrar mensaje de éxito
      setOperationSuccess('Usuario eliminado exitosamente');
      
      // Cerrar modal después de un momento
      setTimeout(() => {
        handleCloseModals();
        setOperationSuccess(null);
      }, 2000);
      
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al eliminar el usuario');
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
  
  // Helper para mostrar badge de rol
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge bg="danger">Administrador</Badge>;
      case 'vendor':
        return <Badge bg="success">Vendedor</Badge>;
      case 'warehouse':
        return <Badge bg="primary">Bodeguero</Badge>;
      case 'accountant':
        return <Badge bg="info">Contador</Badge>;
      case 'customer':
        return <Badge bg="secondary">Cliente</Badge>;
      default:
        return <Badge bg="light" text="dark">{role}</Badge>;
    }
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Gestión de Usuarios</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button variant="primary" onClick={handleShowAddModal}>
              <i className="bi bi-person-plus-fill me-2"></i>
              Agregar Usuario
            </Button>
            
            <Form onSubmit={handleSearch} className="d-flex">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar usuarios"
                />
                <Form.Select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{ maxWidth: '150px' }}
                >
                  <option value="">Todos los roles</option>
                  <option value="admin">Administrador</option>
                  <option value="vendor">Vendedor</option>
                  <option value="warehouse">Bodeguero</option>
                  <option value="accountant">Contador</option>
                  <option value="customer">Cliente</option>
                </Form.Select>
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
              <p className="mt-2">Cargando usuarios...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No hay usuarios disponibles
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>
                            {user.first_name} {user.last_name}
                            {user.rut && (
                              <div className="small text-muted">
                                RUT: {user.rut}
                              </div>
                            )}
                          </td>
                          <td>{user.email}</td>
                          <td>{renderRoleBadge(user.role)}</td>
                          <td>
                            {user.is_active ? (
                              <Badge bg="success">Activo</Badge>
                            ) : (
                              <Badge bg="danger">Inactivo</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1 mb-1"
                              onClick={() => handleShowEditModal(user)}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="mb-1"
                              onClick={() => handleShowDeleteModal(user)}
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
      
      {/* Modal para agregar usuario */}
      <Modal show={showAddModal} onHide={handleCloseModals} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agregar Usuario</Modal.Title>
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
                  <Form.Label>Nombre de usuario *</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    El nombre de usuario debe ser único.
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Mínimo 8 caracteres.
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirmar contraseña *</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rol *</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="customer">Cliente</option>
                    <option value="vendor">Vendedor</option>
                    <option value="warehouse">Bodeguero</option>
                    <option value="accountant">Contador</option>
                    <option value="admin">Administrador</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="userActive"
                    label="Usuario activo"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>RUT</Form.Label>
                  <Form.Control
                    type="text"
                    name="rut"
                    value={formData.rut}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
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
            onClick={handleAddUser}
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
              'Guardar usuario'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para editar usuario */}
      <Modal show={showEditModal} onHide={handleCloseModals} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
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
                  <Form.Label>Nombre de usuario *</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña (dejar en blanco para mantener)</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    Dejar en blanco para mantener la contraseña actual.
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirmar contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rol *</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="customer">Cliente</option>
                    <option value="vendor">Vendedor</option>
                    <option value="warehouse">Bodeguero</option>
                    <option value="accountant">Contador</option>
                    <option value="admin">Administrador</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="userActiveEdit"
                    label="Usuario activo"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>RUT</Form.Label>
                  <Form.Control
                    type="text"
                    name="rut"
                    value={formData.rut}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
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
            onClick={handleUpdateUser}
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
              'Actualizar usuario'
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
            ¿Estás seguro de que deseas eliminar el usuario{' '}
            <strong>{currentUser?.username}</strong>?
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
            onClick={handleDeleteUser}
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
              'Eliminar usuario'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;