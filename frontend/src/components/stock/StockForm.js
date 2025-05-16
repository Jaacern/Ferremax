import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateStock, selectStockLoading } from '../../store/stock.slice';

/**
 * Componente para editar la cantidad de stock de un producto.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.stock - Datos del stock a editar
 * @param {Function} props.onUpdate - Función a llamar cuando se actualiza el stock
 * @param {Function} props.onCancel - Función para cancelar la edición
 * @returns {React.ReactNode} - Formulario de edición de stock
 */
const StockForm = ({ stock, onUpdate, onCancel }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectStockLoading);
  
  const [quantity, setQuantity] = useState(stock ? stock.quantity : 0);
  const [minStock, setMinStock] = useState(stock ? stock.min_stock : 5);
  const [errors, setErrors] = useState({});
  
  // Actualizar estado local cuando cambia el stock
  useEffect(() => {
    if (stock) {
      setQuantity(stock.quantity);
      setMinStock(stock.min_stock);
    }
  }, [stock]);
  
  // Manejar cambio en la cantidad
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(isNaN(value) ? 0 : value);
    
    // Limpiar error si existe
    if (errors.quantity) {
      setErrors({ ...errors, quantity: null });
    }
  };
  
  // Manejar cambio en el stock mínimo
  const handleMinStockChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setMinStock(isNaN(value) ? 0 : value);
    
    // Limpiar error si existe
    if (errors.minStock) {
      setErrors({ ...errors, minStock: null });
    }
  };
  
  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (quantity < 0) {
      newErrors.quantity = 'La cantidad no puede ser negativa';
    }
    
    if (minStock < 0) {
      newErrors.minStock = 'El stock mínimo no puede ser negativo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await dispatch(updateStock({ 
          stockId: stock.id, 
          quantity, 
          minStock 
        })).unwrap();
        
        if (onUpdate) {
          onUpdate();
        }
      } catch (error) {
        console.error('Error al actualizar stock:', error);
      }
    }
  };
  
  // Si no hay stock, no mostrar nada
  if (!stock) return null;
  
  return (
    <div className="card">
      <div className="card-header bg-light">
        <h5 className="mb-0">Actualizar Stock</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="productName" className="form-label">Producto</label>
            <input
              type="text"
              className="form-control"
              id="productName"
              value={stock.product_name || ''}
              disabled
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="branchName" className="form-label">Sucursal</label>
            <input
              type="text"
              className="form-control"
              id="branchName"
              value={stock.branch_name || ''}
              disabled
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="quantity" className="form-label">Cantidad</label>
            <input
              type="number"
              className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              min="0"
            />
            {errors.quantity && (
              <div className="invalid-feedback">{errors.quantity}</div>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="minStock" className="form-label">Stock Mínimo</label>
            <input
              type="number"
              className={`form-control ${errors.minStock ? 'is-invalid' : ''}`}
              id="minStock"
              value={minStock}
              onChange={handleMinStockChange}
              min="0"
            />
            {errors.minStock && (
              <div className="invalid-feedback">{errors.minStock}</div>
            )}
            <div className="form-text">
              Se generarán alertas cuando el stock sea menor o igual a este valor.
            </div>
          </div>
          
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockForm;