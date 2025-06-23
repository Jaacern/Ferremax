import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import stockService from '../../services/stock.service';

const StockForm = ({ stockId, branchId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    min_stock: '',
    notes: ''
  });

  const [validated, setValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setIsLoading(true);
        const data = await stockService.getStockById(stockId); // implement in stock.service.js
        setFormData({
          quantity: data.quantity,
          min_stock: data.min_stock || 5,
          notes: data.notes || ''
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar stock');
      } finally {
        setIsLoading(false);
      }
    };

    if (stockId) fetchStock();
  }, [stockId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'quantity' || name === 'min_stock') && value !== '') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0) return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await stockService.updateStock(stockId, formData); // implement this if needed
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar stock');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad en stock</Form.Label>
            <Form.Control
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              required
            />
            <Form.Control.Feedback type="invalid">
              La cantidad es requerida.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Stock mínimo</Form.Label>
            <Form.Control
              type="number"
              name="min_stock"
              value={formData.min_stock}
              onChange={handleChange}
              min="0"
              required
            />
            <Form.Control.Feedback type="invalid">
              El stock mínimo es requerido.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Notas</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Información adicional"
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
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
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
