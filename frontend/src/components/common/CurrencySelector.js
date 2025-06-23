import React, { useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrency, selectCurrentCurrency, selectAvailableCurrencies, fetchExchangeRates } from '../../store/currency.slice';

const CurrencySelector = () => {
  const dispatch = useDispatch();
  const currentCurrency = useSelector(selectCurrentCurrency);
  const availableCurrencies = useSelector(selectAvailableCurrencies);

  useEffect(() => {
    // Cargar tasas de cambio al montar el componente
    dispatch(fetchExchangeRates(currentCurrency));
    
    // También cargar cuando cambia la moneda
    const intervalId = setInterval(() => {
      dispatch(fetchExchangeRates(currentCurrency));
    }, 3600000); // Actualizar cada hora
    
    return () => clearInterval(intervalId);
  }, [dispatch, currentCurrency]);

  const handleSelect = (currency) => {
    dispatch(setCurrency(currency));
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="outline-light" size="sm" id="currency-selector">
        {currentCurrency}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {availableCurrencies.map((currency) => (
          <Dropdown.Item 
            key={currency} 
            active={currency === currentCurrency}
            onClick={() => handleSelect(currency)}
          >
            {currency}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CurrencySelector;