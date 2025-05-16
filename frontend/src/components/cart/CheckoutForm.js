import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCartItems,
  selectCartTotal,
  selectSelectedBranchId,
  selectDeliveryMethod,
  selectDeliveryAddress,
  selectCartNotes,
  setDeliveryMethod,
  setDeliveryAddress,
  setNotes,
  createOrder,
  selectCartLoading,
  selectCartError,
  selectLastOrder
} from '../../store/cart.slice';
import { selectUser } from '../../store/auth.slice';
import { DELIVERY_METHODS } from '../../config';
import { formatPrice } from '../../utils/formatUtils';

/**
 * Formulario de checkout para finalizar la compra.
 */
const CheckoutForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Seleccionar datos del estado
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const selectedBranchId = useSelector(selectSelectedBranchId);
  const deliveryMethod = useSelector(selectDeliveryMethod);
  const deliveryAddress = useSelector(selectDeliveryAddress);
  const notes = useSelector(selectCartNotes);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const lastOrder = useSelector(selectLastOrder);
  const user = useSelector(selectUser);
  
  // Estado local para validación
  const [errors, setErrors] = useState({});
  
  // Calcular envío según método seleccionado
  const deliveryCost = deliveryMethod === DELIVERY_METHODS.DELIVERY ? 5000 : 0;
  
  // Total final
  const totalWithDelivery = cartTotal + deliveryCost;
  
  // Si ya se creó una orden, redirigir al pago
  useEffect(() => {
    if (lastOrder) {
      navigate('/payment/success', { state: { orderId: lastOrder.id } });
    }
  }, [lastOrder, navigate]);
  
  // Si el carrito está vacío, redirigir
  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      navigate('/cart');
    }
  }, [cartItems, loading, navigate]);
  
  // Manejar cambio de método de entrega
  const handleDeliveryMethodChange = (e) => {
    dispatch(setDeliveryMethod(e.target.value));
    
    // Limpiar error si existe
    if (errors.deliveryMethod) {
      setErrors({ ...errors, deliveryMethod: null });
    }
  };
  
  // Manejar cambio de dirección
  const handleAddressChange = (e) => {
    dispatch(setDeliveryAddress(e.target.value));
    
    // Limpiar error si existe
    if (errors.deliveryAddress) {
      setErrors({ ...errors, deliveryAddress: null });
    }
  };
  
  // Manejar cambio de notas
  const handleNotesChange = (e) => {
    dispatch(setNotes(e.target.value));
  };
  
  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    // Validar sucursal seleccionada
    if (!selectedBranchId) {
      newErrors.branch = 'Debe seleccionar una sucursal';
    }
    
    // Validar método de entrega
    if (!deliveryMethod) {
      newErrors.deliveryMethod = 'Debe seleccionar un método de entrega';
    }
    
    // Validar dirección si es envío a domicilio
    if (deliveryMethod === DELIVERY_METHODS.DELIVERY && !deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'La dirección de entrega es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Preparar datos para la orden
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        branch_id: selectedBranchId,
        delivery_method: deliveryMethod,
        delivery_address: deliveryAddress,
        notes
      };
      
      // Crear orden
      dispatch(createOrder(orderData));
    }
  };
  
  // Usar dirección del perfil
  const useProfileAddress = () => {
    if (user && user.address) {
      dispatch(setDeliveryAddress(user.address));
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Información de Entrega</h5>
            </div>
            <div className="card-body">
              {/* Método de entrega */}
              <div className="mb-4">
                <label className="form-label">Método de Entrega</label>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="deliveryMethod"
                    id="pickupMethod"
                    value={DELIVERY_METHODS.PICKUP}
                    checked={deliveryMethod === DELIVERY_METHODS.PICKUP}
                    onChange={handleDeliveryMethodChange}
                  />
                  <label className="form-check-label" htmlFor="pickupMethod">
                    Retiro en Tienda (Gratis)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="deliveryMethod"
                    id="deliveryMethod"
                    value={DELIVERY_METHODS.DELIVERY}
                    checked={deliveryMethod === DELIVERY_METHODS.DELIVERY}
                    onChange={handleDeliveryMethodChange}
                  />
                  <label className="form-check-label" htmlFor="deliveryMethod">
                    Despacho a Domicilio ({formatPrice(5000)})
                  </label>
                </div>
                {errors.deliveryMethod && (
                  <div className="text-danger mt-1">{errors.deliveryMethod}</div>
                )}
              </div>
              
              {/* Dirección de entrega (si aplica) */}
              {deliveryMethod === DELIVERY_METHODS.DELIVERY && (
                <div className="mb-3">
                  <label htmlFor="deliveryAddress" className="form-label">
                    Dirección de Entrega
                  </label>
                  <div className="input-group mb-2">
                    <textarea
                      id="deliveryAddress"
                      className={`form-control ${errors.deliveryAddress ? 'is-invalid' : ''}`}
                      rows="3"
                      value={deliveryAddress}
                      onChange={handleAddressChange}
                      placeholder="Ingrese la dirección completa de entrega"
                    ></textarea>
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={useProfileAddress}
                      disabled={!user || !user.address}
                    >
                      Usar Mi Dirección
                    </button>
                    {errors.deliveryAddress && (
                      <div className="invalid-feedback">{errors.deliveryAddress}</div>
                    )}
                  </div>
                  <div className="form-text">
                    Incluya calle, número, departamento, comuna y ciudad.
                  </div>
                </div>
              )}
              
              {/* Notas del pedido */}
              <div className="mb-3">
                <label htmlFor="orderNotes" className="form-label">
                  Notas del Pedido (Opcional)
                </label>
                <textarea
                  id="orderNotes"
                  className="form-control"
                  rows="3"
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Instrucciones especiales para la entrega o preparación del pedido"
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Productos en el carrito */}
          <div className="card mb-4 mb-md-0">
            <div className="card-header">
              <h5 className="mb-0">Productos ({cartItems.length})</h5>
            </div>
            <div className="card-body">
              {cartItems.map(item => (
                <div key={item.id} className="d-flex mb-3">
                  <div className="me-3">
                    <img 
                      src={item.image_url || '/placeholder-image.jpg'} 
                      alt={item.name} 
                      className="img-fluid rounded" 
                      style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{item.name}</h6>
                    <p className="text-muted small mb-0">
                      SKU: {item.sku}
                    </p>
                    <div className="d-flex justify-content-between">
                      <span>{item.quantity} x {formatPrice(item.price)}</span>
                      <span className="fw-bold">{formatPrice(item.quantity * item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Resumen del Pedido</h5>
            </div>
            <div className="card-body">
              {/* Desglose de costos */}
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Envío</span>
                <span>{deliveryCost > 0 ? formatPrice(deliveryCost) : 'Gratis'}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold mb-4">
                <span>Total</span>
                <span>{formatPrice(totalWithDelivery)}</span>
              </div>
              
              {/* Error si existe */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {/* Error de sucursal */}
              {errors.branch && (
                <div className="alert alert-danger" role="alert">
                  {errors.branch}
                </div>
              )}
              
              {/* Botón de confirmación */}
              <div className="d-grid">
                <button 
                  type="submit" 
                  className="btn btn-primary py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Procesando...
                    </>
                  ) : 'Confirmar Pedido'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;