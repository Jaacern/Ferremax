import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { transferStock, selectStockLoading } from '../../store/stock.slice';

/**
 * Componente para transferir stock entre sucursales.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.stock - Datos del stock origen
 * @param {Array} props.branches - Lista de sucursales disponibles
 * @param {Function} props.onComplete - Función a llamar cuando se completa la transferencia
 * @param {Function} props.onCancel - Función para cancelar la transferencia
 * @returns {React.ReactNode} - Formulario de transferencia de stock
 */
const StockTransferForm = ({ stock, branches = [], onComplete, onCancel }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectStockLoading);
  
  const [targetBranchId, setTargetBranchId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});
  
  // Actualizar estado local cuando cambia el stock o las sucursales
  useEffect(() => {
    if (stock && branches.length > 0) {
      // Preseleccionar la primera sucursal que no sea la actual
      const otherBranches = branches.filter(branch => branch.id !== stock.branch_id);
      if (otherBranches.length > 0) {
        setTargetBranchId(otherBranches[0].id.toString());
      }
      
      // Inicializar cantidad a 1 o mitad del stock disponible (lo que sea menor)
      const defaultQuantity = Math.min(1, Math.floor(stock.quantity / 2));
      setQuantity(defaultQuantity > 0 ? defaultQuantity : 1);
    }
  }, [stock, branches]);
  
  // Filtrar sucursales disponibles (excluir la sucursal origen)
  const availableBranches = branches.filter(branch => 
    branch.id !== (stock ? stock.branch_id : null)
  );
  
  // Manejar cambio en la sucursal destino
  const handleBranchChange = (e) => {
    setTargetBranchId(e.target.value);
    
    // Limpiar error si existe
    if (errors.targetBranchId) {
      setErrors({ ...errors, targetBranchId: null });
    }
  };
  
  // Manejar cambio en la cantidad
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(isNaN(value) ? 0 : value);
    
    // Limpiar error si existe
    if (errors.quantity) {
      setErrors({ ...errors, quantity: null });
    }
  };
  
  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!targetBranchId) {
      newErrors.targetBranchId = 'Debe seleccionar una sucursal destino';
    }
    
    if (!quantity || quantity <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    } else if (stock && quantity > stock.quantity) {
      newErrors.quantity = `La cantidad no puede ser mayor al stock disponible (${stock.quantity})`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stock) return;
    
    if (validateForm()) {
      try {
        await dispatch(transferStock({
          productId: stock.product_id,
          sourceBranchId: stock.branch_id,
          targetBranchId: parseInt(targetBranchId, 10),
          quantity
        })).unwrap();
        
        if (onComplete) {
          onComplete();
        }
      } catch (error) {
        console.error('Error al transferir stock:', error);
        // Mostrar mensaje de error general
        setErrors({ general: error.message || 'Error al transferir stock' });
      }
    }
  };
  
  // Si no hay stock o sucursales, no mostrar nada
  if (!stock || availableBranches.length === 0) {
    return (
      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0">Transferir Stock</h5>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            No hay sucursales disponibles para transferir stock.
          </div>
          <div className="d-flex justify-content-end">
            <button className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="card-header bg-light">
        <h5 className="mb-0">Transferir Stock</h5>
      </div>
      <div className="card-body">
        {errors.general && (
          <div className="alert alert-danger mb-3">
            {errors.general}
          </div>
        )}
        
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
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="sourceBranch" className="form-label">Sucursal Origen</label>
              <input
                type="text"
                className="form-control"
                id="sourceBranch"
                value={stock.branch_name || ''}
                disabled
              />
              <div className="form-text">
                Stock disponible: <strong>{stock.quantity}</strong> unidades
              </div>
            </div>
            
            <div className="col-md-6">
              <label htmlFor="targetBranch" className="form-label">Sucursal Destino</label>
              <select
                id="targetBranch"
                className={`form-select ${errors.targetBranchId ? 'is-invalid' : ''}`}
                value={targetBranchId}
                onChange={handleBranchChange}
              >
                <option value="">Seleccione sucursal destino</option>
                {availableBranches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              {errors.targetBranchId && (
                <div className="invalid-feedback">{errors.targetBranchId}</div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="quantity" className="form-label">Cantidad a Transferir</label>
            <input
              type="number"
              className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max={stock.quantity}
            />
            {errors.quantity && (
              <div className="invalid-feedback">{errors.quantity}</div>
            )}
          </div>
          
          <div className="alert alert-info mb-4">
            <div className="d-flex">
              <div className="me-3">
                <i className="bi bi-info-circle fs-4"></i>
              </div>
              <div>
                <h6 className="mb-2">Información de Transferencia</h6>
                <p className="mb-0">
                  Se transferirán <strong>{quantity}</strong> unidades de <strong>{stock.product_name}</strong> desde 
                  la sucursal <strong>{stock.branch_name}</strong> hacia 
                  la sucursal <strong>{
                    availableBranches.find(b => b.id.toString() === targetBranchId)?.name || 'seleccionada'
                  }</strong>.
                </p>
              </div>
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
                  Transfiriendo...
                </>
              ) : 'Confirmar Transferencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockTransferForm;