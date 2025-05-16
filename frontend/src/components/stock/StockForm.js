import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { updateStock, fetchStockById, selectCurrentStock, selectIsLoading, selectStockError } from '../../store/stock.slice';

const StockForm = ({ stockId, branchId, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const currentStock = useSelector(selectCurrentStock);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectStockError);
  
  const [formData, setFormData] = useState({
    quantity: '',
    min_stock: '',
    notes: ''
  });
  
  const [validated, setValidated] = useState(false);
  
  // Cargar datos actuales del stock si se proporciona un ID
  useEffect(() => {
    if (stockId) {
      dispatch(fetchStockById(stockId));
    }
  }, [dispatch, stockId]);
  
  // Actualizar formulario cuando se carga el stock
  useEffect(() => {
    if (currentStock) {
      setFormData({
        quantity: currentStock.quantity,
        min_stock: currentStock.min_stock || 5,
        notes: currentStock.notes || ''
      });
    }
  }, [currentStock]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación para campos numéricos
    if ((name === 'quantity' || name === 'min_stock') && value !== '') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0) return;
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
    
    // Si es una actualización
    if (stockId) {
      dispatch(updateStock({
        id: stockId,
        data: formData
      })).then((result) => {
        if (!result.error) {
          if (onSuccess) onSuccess();
        }
      });
    } 
    // Si es creación (inicialización) de stock para un producto en una sucursal
    else if (branchId) {
      // Aquí se podría implementar la lógica para crear nuevo stock
      // Normalmente esto vendría en otra acción del slice
    }
  };
  
  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formQuantity">
            <Form.Label>Cantidad en stock</Form.Label>
            <Form.Control
              type="number"
              name="quantity"
              min="0"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              La cantidad es requerida.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formMinStock">
            <Form.Label>Stock mínimo</Form.Label>
            <Form.Control
              type="number"
              name="min_stock"
              min="0"
              value={formData.min_stock}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              El stock mínimo es requerido.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      
      <Form.Group className="mb-3" controlId="formNotes">
        <Form.Label>Notas</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Información adicional sobre la actualización de stock"
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
          disabled={isLoading}
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
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>
      </div>
    </Form>
  );
};

export default StockForm;