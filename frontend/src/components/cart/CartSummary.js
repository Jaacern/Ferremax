// src/components/cart/CartSummary.jsx
import React, { useEffect } from 'react';
import { Card, ListGroup, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { selectCartTotal, selectCartItemCount } from '../../store/cart.slice';

import {
  selectCurrency,
  selectRate,
  selectCurrencyState,
  fetchConversion,
} from '../../store/currency.slice';

import CurrencySelector from '../CurrencySelector';  // ⬅️ nuevo

// ────────────────────────────────────────────────────────────────
// util para formatear precios según ISO-4217
// ────────────────────────────────────────────────────────────────
const fmt = (val, iso) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: iso,
    maximumFractionDigits: iso === 'CLP' ? 0 : 2,
  }).format(val);

const CartSummary = ({ showCheckoutButton = true }) => {
  const dispatch   = useDispatch();

  // carrito
  const cartTotal  = useSelector(selectCartTotal);      // CLP
  const itemCount  = useSelector(selectCartItemCount);  // uds

  // divisa
  const cur        = useSelector(selectCurrency);       // 'CLP' | 'USD' | …
  const rate       = useSelector(selectRate);           // CLP → cur
  const { status } = useSelector(selectCurrencyState);  // loading / …

  // ───────────── disparar conversión cuando cambian total ó moneda
  useEffect(() => {
    if (cur !== 'CLP') {
      dispatch(fetchConversion({ amount: cartTotal, to: cur }));
    }
  }, [cur, cartTotal, dispatch]);

  // shipping + IVA en CLP
  const shippingCLP = itemCount > 0 ? 5_000 : 0;
  const taxCLP      = cartTotal * 0.19;

  // totales mostrados
  const factor      = cur === 'CLP' ? 1 : rate;
  const subtotal    = cartTotal   * factor;
  const shipping    = shippingCLP * factor;
  const tax         = taxCLP      * factor;
  const total       = (cartTotal + shippingCLP) * factor;

  return (
    <Card className="cart-summary shadow-sm">
      <Card.Header as="h5">Resumen del pedido</Card.Header>

      {/* Selector de moneda */}
      <Card.Body className="pt-3 pb-0">
        <CurrencySelector cartTotalCLP={cartTotal} />
      </Card.Body>

      <ListGroup variant="flush">
        <ListGroup.Item className="d-flex justify-content-between">
          <span>Subtotal ({itemCount} productos)</span>
          <span>{fmt(subtotal, cur)}</span>
        </ListGroup.Item>

        <ListGroup.Item className="d-flex justify-content-between">
          <span>Envío</span>
          <span>{shipping > 0 ? fmt(shipping, cur) : 'Gratis'}</span>
        </ListGroup.Item>

        <ListGroup.Item className="d-flex justify-content-between">
          <span>IVA (19&nbsp;%)</span>
          <span>{fmt(tax, cur)}</span>
        </ListGroup.Item>

        <ListGroup.Item className="d-flex justify-content-between fw-bold">
          <span>Total</span>
          <span>{fmt(total, cur)}</span>
        </ListGroup.Item>
      </ListGroup>

      {/* Mensaje de tasa aplicada  */}
      {cur !== 'CLP' && (
        <Card.Footer className="text-muted small">
          {status === 'loading' ? (
            <>
              Actualizando tasa&nbsp;
              <Spinner animation="border" size="sm" />
            </>
          ) : (
            <>
              Conversión 1 CLP = {rate.toFixed(6)} {cur}
            </>
          )}
        </Card.Footer>
      )}

      <Card.Body className="pt-2">
        {showCheckoutButton && (
          <Button
            as={Link}
            to="/checkout"
            variant="primary"
            size="lg"
            className="w-100"
            disabled={itemCount === 0}
          >
            Proceder al pago
          </Button>
        )}

        <Button
          as={Link}
          to="/products"
          variant="outline-secondary"
          className="w-100 mt-2"
        >
          Continuar comprando
        </Button>
      </Card.Body>
    </Card>
  );
};

export default CartSummary;
