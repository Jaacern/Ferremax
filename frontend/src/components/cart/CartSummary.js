import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotal, selectSelectedBranchId, selectBranch } from '../../store/cart.slice';
import { selectIsAuthenticated } from '../../store/auth.slice';
import { fetchBranches } from '../../store/product.slice';
import { formatPrice } from '../../utils/formatUtils';

/**
 * Componente que muestra el resumen del carrito y acciones disponibles.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.showCheckoutButton - Indica si mostrar el botón de checkout
 * @returns {React.ReactNode} - Resumen del carrito
 */
const CartSummary = ({ showCheckoutButton = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const selectedBranchId = useSelector(selectSelectedBranchId);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [branches, setBranches] = useState([]);
  
  // Calcular envío (supongamos un valor fijo por ahora)
  const shippingCost = 5000;
  
  // Total final
  const totalWithShipping = cartTotal + shippingCost;
  
  // Cargar sucursales
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const result = await dispatch(fetchBranches()).unwrap();
        setBranches(result || []);
      } catch (error) {
        console.error('Error al cargar sucursales:', error);
      }
    };
    
    loadBranches();
  }, [dispatch]);
  
  // Manejar cambio de sucursal
  const handleBranchChange = (e) => {
    const branchId = parseInt(e.target.value, 10);
    dispatch(selectBranch(branchId));
  };
  
  // Manejar click en el botón de checkout
  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart', message: 'Debe iniciar sesión para completar la compra' } });
      return;
    }
    
    if (!selectedBranchId) {
      alert('Por favor seleccione una sucursal antes de continuar');
      return;
    }
    
    navigate('/checkout');
  };
  
  return (
    <div className="card">
      <div className="card-header bg-light">
        <h5 className="mb-0">Resumen del Pedido</h5>
      </div>
      <div className="card-body">
        {/* Selección de sucursal */}
        <div className="mb-4">
          <label htmlFor="branchSelect" className="form-label">Seleccione Sucursal</label>
          <select 
            id="branchSelect" 
            className="form-select"
            value={selectedBranchId || ''}
            onChange={handleBranchChange}
          >
            <option value="">Seleccione una sucursal</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <div className="form-text">
            La disponibilidad de los productos puede variar según la sucursal.
          </div>
        </div>
        
        {/* Desglose de costos */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Costo de envío</span>
            <span>{formatPrice(shippingCost)}</span>
          </div>
          <hr />
          <div className="d-flex justify-content-between fw-bold">
            <span>Total</span>
            <span>{formatPrice(totalWithShipping)}</span>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="d-grid gap-2">
          {showCheckoutButton && (
            <button 
              className="btn btn-primary py-2"
              onClick={handleCheckoutClick}
              disabled={cartItems.length === 0}
            >
              Proceder al Pago
            </button>
          )}
          <Link to="/products" className="btn btn-outline-secondary">
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;