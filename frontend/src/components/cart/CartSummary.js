import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { selectCartItems, selectCartTotal } from '../../store/cart.slice';
import { selectCurrentCurrency } from '../../store/currency.slice';
import CurrencyDisplay from '../common/CurrencyDisplay';
import CurrencyService from '../../services/currency.service';

const CartSummary = () => {
  const cartItems = useSelector(selectCartItems);
  const cartSubtotal = useSelector(selectCartTotal);
  const currentCurrency = useSelector(selectCurrentCurrency);
  
  // Valores iniciales
  const [convertedValues, setConvertedValues] = useState({
    subtotal: cartSubtotal,
    shipping: 5000,
    tax: cartSubtotal * 0.19,
    total: cartSubtotal + 5000 + (cartSubtotal * 0.19)
  });
  
  const [isConversionLoading, setIsConversionLoading] = useState(false);
  
  // Umbral para envío gratuito (CLP 50,000)
  const freeShippingThreshold = 50000;
  
  // Definir costo de envío según el subtotal
  const shippingCost = cartSubtotal >= freeShippingThreshold ? 0 : 5000;
  
  // Actualizar valores cuando cambia el subtotal, envío o moneda
  useEffect(() => {
    const updateValues = async () => {
      // Valores base en CLP
      const baseValues = {
        subtotal: cartSubtotal,
        shipping: shippingCost,
        tax: cartSubtotal * 0.19,
        total: cartSubtotal + shippingCost + (cartSubtotal * 0.19)
      };
      
      // Si la moneda es CLP, no es necesario convertir
      if (currentCurrency === 'CLP') {
        setConvertedValues(baseValues);
        return;
      }
      
      setIsConversionLoading(true);
      
      try {
        // Convertir subtotal
        const subtotalResult = await CurrencyService.convertAmount(
          cartSubtotal, 'CLP', currentCurrency
        );
        
        // Convertir envío si no es 0
        let convertedShipping = 0;
        if (shippingCost > 0) {
          const shippingResult = await CurrencyService.convertAmount(
            shippingCost, 'CLP', currentCurrency
          );
          convertedShipping = shippingResult.amount;
        }
        
        // Calcular IVA sobre el subtotal convertido
        const taxAmount = subtotalResult.amount * 0.19;
        
        // Calcular total
        const totalAmount = subtotalResult.amount + convertedShipping + taxAmount;
        
        setConvertedValues({
          subtotal: subtotalResult.amount,
          shipping: convertedShipping,
          tax: taxAmount,
          total: totalAmount
        });
      } catch (error) {
        console.error('Error converting currency:', error);
        // En caso de error, usar los valores en CLP
        setConvertedValues(baseValues);
      } finally {
        setIsConversionLoading(false);
      }
    };
    
    updateValues();
  }, [cartSubtotal, shippingCost, currentCurrency]);
  
  if (cartItems.length === 0) {
    return null;
  }
  
  return (
    <Card className="cart-summary">
      <Card.Header className="bg-white">
        <h5 className="mb-0">Resumen del pedido</h5>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal ({cartItems.length} productos):</span>
          <CurrencyDisplay amount={cartSubtotal} originalCurrency="CLP" />
        </div>
        
        <div className="d-flex justify-content-between mb-2">
          <span>Envío:</span>
          {shippingCost === 0 ? (
            <span className="text-success">Gratis</span>
          ) : (
            <CurrencyDisplay amount={shippingCost} originalCurrency="CLP" />
          )}
        </div>
        
        <div className="d-flex justify-content-between mb-2">
          <span>IVA (19%):</span>
          <CurrencyDisplay amount={cartSubtotal * 0.19} originalCurrency="CLP" />
        </div>
        
        <hr />
        
        <div className="d-flex justify-content-between mb-3">
          <h5 className="mb-0">Total:</h5>
          <h5 className="mb-0">
            <CurrencyDisplay 
              amount={cartSubtotal + shippingCost + (cartSubtotal * 0.19)} 
              originalCurrency="CLP" 
            />
          </h5>
        </div>
        
        {cartSubtotal < freeShippingThreshold && (
          <div className="alert alert-info small mb-3">
            <i className="bi bi-info-circle me-2"></i>
            Añade <CurrencyDisplay amount={freeShippingThreshold - cartSubtotal} originalCurrency="CLP" /> más para obtener envío gratuito
          </div>
        )}
        
        {currentCurrency !== 'CLP' && (
          <div className="small text-muted mb-3">
            * Los precios se muestran en {currentCurrency} según la tasa de cambio actual.
          </div>
        )}
      </Card.Body>
      <Card.Footer className="bg-white">
        <Button
          as={Link}
          to="/checkout" 
          variant="primary"
          className="w-100"
        >
          Proceder al pago
        </Button>
        <Button
          as={Link}
          to="/products"
          variant="outline-secondary"
          className="w-100 mt-2"
        >
          Continuar comprando
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default CartSummary;