import api from './api';

const CurrencyService = {
  // Obtener todas las tasas de cambio disponibles
  getExchangeRates: async (fromCurrency = 'CLP') => {
    try {
      const response = await api.get(`/payments/exchange-rates`, {
        params: { from: fromCurrency }
      });
      return response.data.rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw error;
    }
  },

  // Convertir un monto de una moneda a otra
  convertAmount: async (amount, fromCurrency = 'CLP', toCurrency) => {
    try {
      // Si las monedas son iguales, no hacer conversión
      if (fromCurrency === toCurrency) {
        return { amount };
      }
      
      const response = await api.get(`/payments/convert`, {
        params: {
          amount: amount,
          from: fromCurrency,
          to: toCurrency
        }
      });
      return response.data.converted;
    } catch (error) {
      console.error('Error converting amount:', error);
      // En caso de error, devolver el monto original
      return { amount };
    }
  },
  
  // Formatear precio según la moneda
  formatPrice: (amount, currency = 'CLP') => {
    if (amount === undefined || amount === null) {
      return '-';
    }
    
    // Configurar opciones según la moneda
    const options = {
      style: 'currency',
      currency: currency,
    };
    
    // El peso chileno no usa decimales
    if (currency === 'CLP') {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 0;
    } else {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
    }
    
    return new Intl.NumberFormat('es-CL', options).format(amount);
  }
};

export default CurrencyService;