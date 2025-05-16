import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert, Row, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { 
  transferStock, 
  fetchStockById, 
  fetchBranches,
  selectCurrentStock, 
  selectBranches,
  selectIsLoading, 
  selectStockError
} from '../../store/stock.slice';

const StockTransferForm = ({ stockId, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const currentStock = useSelector(selectCurrentStock);
  const branches = useSelector(selectBranches);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectStockError);
  
  const [formData, setFormData] = useState({
    quantity: '',
    target_branch_id: '',
    notes: ''
  });
  
  const [validated, setValidated] = useState(false);
  
  // Cargar datos actuales del stock y las sucursales
  useEffect(() => {
    if (stockId) {
      dispatch(fetchStockById(stockId));
      dispatch(fetchBranches());
    }
  }, [dispatch, stockId]);
  
  // Actualizar cuando se carga el stock
  useEffect(() => {
    if (currentStock) {
      setFormData(prevState => ({
        ...prevState,
        quantity: Math.min(prevState.quantity || 1, currentStock.quantity || 0)
      }));
    }
  }, [currentStock]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación para campos numéricos
    if (name === 'quantity' && value !== '') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0 || (currentStock && numValue > currentStock.quantity)) {
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Verificar que no se esté transfiriendo a la misma sucursal
    if (currentStock && currentStock.branch_id.toString() === formData.target_branch_id) {
      alert('No se puede transferir a la misma sucursal');
      return;
    }
    
    // Verificar que la cantidad sea válida
    if (!formData.quantity || formData.quantity <= 0) {
      alert('La cantidad debe ser mayor a cero');
      return;
    }
    
    // Preparar datos para la transferencia
    const transferData = {
      product_id: currentStock.product_id,
      source_branch_id: currentStock.branch_id,
      target_branch_id: parseInt(formData.target_branch_id),
      quantity: parseInt(formData.quantity),
      notes: formData.notes
    };
    
    dispatch(transferStock(transferData)).then((result) => {
      if (!result.error) {
        if (onSuccess) onSuccess();
      }
    });
  };
  
  // Filtrar sucursales para que no incluya la sucursal actual
  const availableBranches = branches.filter(branch => 
    !currentStock || branch.id !== currentStock.branch_id
  );
  
  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      {currentStock && (
        <Card className="mb-4">
          <Card.Body>
            <h5>Información del producto</h5>
            <Row>
              <Col sm={6}>
                <p className="mb-1">
                  <strong>Producto:</strong> {currentStock.product_name}
                </p>
                <p className="mb-1">
                  <strong>SKU:</strong> {currentStock.product_sku}
                </p>
                {currentStock.product_brand && (
                  <p className="mb-1">
                    <strong>Marca:</strong> {currentStock.product_brand}
                  </p>
                )}
              </Col>
              <Col sm={6}>
                <p className="mb-1">
                  <strong>Sucursal actual:</strong> {currentStock.branch_name}
                </p>
                <p className="mb-1">
                  <strong>Stock disponible:</strong> {currentStock.quantity || 0} unidades
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      <Form.Group className="mb-3" controlId="formTargetBranch">
        <Form.Label>Sucursal destino</Form.Label>
        <Form.Select
          name="target_branch_id"
          value={formData.target_branch_id}
          onChange={handleChange}
          required
          disabled={availableBranches.length === 0}
        >
          <option value="">Seleccione sucursal destino</option>
          {availableBranches.map(branch => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          Seleccione una sucursal destino.
        </Form.Control.Feedback>
        {availableBranches.length === 0 && (
          <Form.Text className="text-danger">
            No hay otras sucursales disponibles para transferir.
          </Form.Text>
        )}
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formQuantity">
        <Form.Label>Cantidad a transferir</Form.Label>
        <Form.Control
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          max={currentStock ? currentStock.quantity : 99999}
          required
        />
        <Form.Control.Feedback type="invalid">
          Ingrese una cantidad válida.
        </Form.Control.Feedback>
        {currentStock && (
          <Form.Text className="text-muted">
            Máximo disponible: {currentStock.quantity} unidades
          </Form.Text>
        )}
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="formNotes">
        <Form.Label>Notas de transferencia</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Motivo de la transferencia o instrucciones adicionales"
        />
      </Form.Group>
      
      <div className="d-flex justify-content-end">
        {onCancel && (
          <Button 
            variant="outline-secondary" 
            onClick={onCancel}
            className="me-2"
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        
        <Button 
          variant="primary" 
          type="submit"
          disabled={isLoading || !currentStock || currentStock.quantity < 1 || availableBranches.length === 0}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Procesando...
            </>
          ) : (
            'Transferir stock'
          )}
        </Button>
      </div>
    </Form>
  );
};

export default StockTransferForm;