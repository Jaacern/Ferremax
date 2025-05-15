import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Spinner, Alert, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../../store/auth.slice';

// Este servicio se implementaría completamente en una aplicación real
// Aquí lo simularemos con datos de ejemplo
const branchService = {
  getBranches: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Casa Matriz Santiago', address: 'Av. Libertador O\'Higgins 1111', city: 'Santiago', region: 'Metropolitana', phone: '+56 2 2123 4567', email: 'matriz@ferremas.cl', is_main: true },
          { id: 2, name: 'Sucursal Providencia', address: 'Av. Providencia 2222', city: 'Santiago', region: 'Metropolitana', phone: '+56 2 2234 5678', email: 'providencia@ferremas.cl', is_main: false },
          { id: 3, name: 'Sucursal Las Condes', address: 'Av. Apoquindo 3333', city: 'Santiago', region: 'Metropolitana', phone: '+56 2 2345 6789', email: 'lascondes@ferremas.cl', is_main: false },
          { id: 4, name: 'Sucursal Maipú', address: 'Av. 5 de Abril 4444', city: 'Santiago', region: 'Metropolitana', phone: '+56 2 2456 7890', email: 'maipu@ferremas.cl', is_main: false },
          { id: 5, name: 'Sucursal Viña del Mar', address: 'Av. San Martín 5555', city: 'Viña del Mar', region: 'Valparaíso', phone: '+56 32 2567 8901', email: 'vina@ferremas.cl', is_main: false },
          { id: 6, name: 'Sucursal Concepción', address: 'Av. Paicaví 6666', city: 'Concepción', region: 'Biobío', phone: '+56 41 2678 9012', email: 'concepcion@ferremas.cl', is_main: false },
          { id: 7, name: 'Sucursal Temuco', address: 'Av. Alemania 7777', city: 'Temuco', region: 'La Araucanía', phone: '+56 45 2789 0123', email: 'temuco@ferremas.cl', is_main: false }
        ]);
      }, 1000);
    });
  },
  createBranch: (branchData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: Math.floor(Math.random() * 1000) + 8, ...branchData });
      }, 1000);
    });
  },
  updateBranch: (id, branchData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, ...branchData });
      }, 1000);
    });
  },
  deleteBranch: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
};

const BranchManagement = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el modal de edición/creación
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentBranch, setCurrentBranch] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // Estado para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: '',
    is_main: false
  });
  
  // Cargar sucursales al montar el componente
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'admin') return;
    
    const fetchBranches = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await branchService.getBranches();
        setBranches(data);
      } catch (err) {
        setError('Error al cargar las sucursales. Por favor, intenta de nuevo más tarde.');
        console.error('Error fetching branches:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBranches();
  }, [isAuthenticated, userRole]);
  
  // Abrir modal para crear nueva sucursal
  const handleOpenCreateModal = () => {
    setCurrentBranch(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      region: '',
      phone: '',
      email: '',
      is_main: false
    });
    setModalTitle('Crear nueva sucursal');
    setFormError(null);
    setShowModal(true);
  };
  
  // Abrir modal para editar sucursal
  const handleOpenEditModal = (branch) => {
    setCurrentBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      region: branch.region,
      phone: branch.phone,
      email: branch.email,
      is_main: branch.is_main
    });
    setModalTitle('Editar sucursal');
    setFormError(null);
    setShowModal(true);
  };
  
  // Abrir modal para confirmar eliminación
  const handleOpenDeleteModal = (branch) => {
    setBranchToDelete(branch);
    setShowDeleteModal(true);
  };
  
  // Cerrar modales
  const handleCloseModal = () => {
    setShowModal(false);
    setFormError(null);
  };
  
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setBranchToDelete(null);
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Validar formulario
  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('El nombre de la sucursal es obligatorio');
      return false;
    }
    
    if (!formData.address.trim()) {
      setFormError('La dirección es obligatoria');
      return false;
    }
    
    if (!formData.city.trim()) {
      setFormError('La ciudad es obligatoria');
      return false;
    }
    
    if (!formData.region.trim()) {
      setFormError('La región es obligatoria');
      return false;
    }
    
    // Validar formato de email con regex simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setFormError('El formato del correo electrónico no es válido');
      return false;
    }
    
    // Validar formato de teléfono (simple)
    const phoneRegex = /^[+]?[\d\s()-]{7,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setFormError('El formato del teléfono no es válido');
      return false;
    }
    
    return true;
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      let updatedBranch;
      
      if (currentBranch) {
        // Actualizar sucursal existente
        updatedBranch = await branchService.updateBranch(currentBranch.id, formData);
        
        // Actualizar la lista de sucursales
        setBranches(branches.map(branch => 
          branch.id === currentBranch.id ? updatedBranch : branch
        ));
      } else {
        // Crear nueva sucursal
        updatedBranch = await branchService.createBranch(formData);
        
        // Añadir a la lista de sucursales
        setBranches([...branches, updatedBranch]);
      }
      
      // Cerrar modal
      handleCloseModal();
      
    } catch (err) {
      setFormError('Error al guardar la sucursal. Por favor, intenta de nuevo.');
      console.error('Error saving branch:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Eliminar sucursal
  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await branchService.deleteBranch(branchToDelete.id);
      
      // Actualizar lista de sucursales
      setBranches(branches.filter(branch => branch.id !== branchToDelete.id));
      
      // Cerrar modal
      handleCloseDeleteModal();
      
    } catch (err) {
      setError('Error al eliminar la sucursal. Por favor, intenta de nuevo.');
      console.error('Error deleting branch:', err);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Si no está autenticado o no es administrador, mostrar mensaje de acceso denegado
  if (!isAuthenticated || userRole !== 'admin') {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Acceso denegado</Alert.Heading>
          <p>
            No tienes permisos para acceder a esta sección. Esta página está reservada para administradores.
          </p>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Gestión de Sucursales</h1>
          <p className="text-muted">
            Administra las sucursales de FERREMAS
          </p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleOpenCreateModal}>
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Sucursal
          </Button>
        </Col>
      </Row>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Cargando sucursales...</span>
              </Spinner>
              <p className="mt-3">Cargando sucursales...</p>
            </div>
          ) : branches.length === 0 ? (
            <Alert variant="info">
              No hay sucursales registradas. Haz clic en "Nueva Sucursal" para crear una.
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Ciudad</th>
                  <th>Región</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch, index) => (
                  <tr key={branch.id}>
                    <td>{index + 1}</td>
                    <td>{branch.name}</td>
                    <td>{branch.address}</td>
                    <td>{branch.city}</td>
                    <td>{branch.region}</td>
                    <td>{branch.phone}</td>
                    <td>{branch.email}</td>
                    <td>
                      {branch.is_main ? (
                        <Badge bg="success">Casa Matriz</Badge>
                      ) : (
                        <Badge bg="primary">Sucursal</Badge>
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleOpenEditModal(branch)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleOpenDeleteModal(branch)}
                        disabled={branch.is_main} // No permitir eliminar la casa matriz
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal para crear/editar sucursal */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger">{formError}</Alert>
            )}
            
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de la sucursal *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Casa Matriz"
                    name="is_main"
                    checked={formData.is_main}
                    onChange={handleInputChange}
                    disabled={currentBranch && !currentBranch.is_main && branches.some(b => b.is_main)} // No permitir cambiar si ya hay otra casa matriz
                  />
                  <Form.Text className="text-muted">
                    Solo puede haber una casa matriz
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Dirección *</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ciudad *</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Región *</Form.Label>
                  <Form.Control
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+56 2 1234 5678"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="sucursal@ferremas.cl"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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
                'Guardar'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Modal para confirmar eliminación */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar la sucursal <strong>{branchToDelete?.name}</strong>?
          <Alert variant="warning" className="mt-3">
            <Alert.Heading>Advertencia</Alert.Heading>
            <p>
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a esta sucursal.
            </p>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteBranch}
            disabled={isDeleting}
          >
            {isDeleting ? (
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
              'Eliminar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BranchManagement;