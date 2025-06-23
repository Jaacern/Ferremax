import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { selectCurrentCurrency } from '../../store/currency.slice';
import CurrencyService from '../../services/currency.service';

const CurrencyDisplay = ({ amount, originalCurrency = 'CLP', className = '' }) => {
  const currentCurrency = useSelector(selectCurrentCurrency);
  const [convertedAmount, setConvertedAmount] = useState(amount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const convertCurrency = async () => {
      // Si la moneda original es la misma que la actual, no hay conversión
      if (originalCurrency === currentCurrency) {
        setConvertedAmount(amount);
        return;
      }

      try {
        setLoading(true);
        const result = await CurrencyService.convertAmount(
          amount,
          originalCurrency,
          currentCurrency
        );
        setConvertedAmount(result.amount);
      } catch (error) {
        console.error('Error converting currency:', error);
        // En caso de error, mostrar el monto original
        setConvertedAmount(amount);
      } finally {
        setLoading(false);
      }
    };

    convertCurrency();
  }, [amount, originalCurrency, currentCurrency]);

  return (
    <span className={className}>
      {loading ? (
        <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
      ) : (
        CurrencyService.formatPrice(convertedAmount, currentCurrency)
      )}
    </span>
  );
};

export default CurrencyDisplay;