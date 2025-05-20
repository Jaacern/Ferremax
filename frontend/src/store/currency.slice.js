import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CurrencyService from '../services/currency.service';

// Obtener moneda del localStorage o usar CLP por defecto
const getSavedCurrency = () => {
  const saved = localStorage.getItem('currency');
  return saved ? saved : 'CLP';
};

// Thunk para cargar tasas de cambio
export const fetchExchangeRates = createAsyncThunk(
  'currency/fetchRates',
  async (baseCurrency, { rejectWithValue }) => {
    try {
      return await CurrencyService.getExchangeRates(baseCurrency);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para convertir montos
export const convertAmount = createAsyncThunk(
  'currency/convertAmount',
  async ({ amount, fromCurrency, toCurrency }, { rejectWithValue }) => {
    try {
      return await CurrencyService.convertAmount(amount, fromCurrency, toCurrency);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    currentCurrency: getSavedCurrency(),
    rates: [],
    availableCurrencies: ['CLP', 'USD', 'EUR', 'GBP', 'ARS', 'BRL', 'MXN'],
    conversionCache: {}, // Cache para conversiones frecuentes
    loading: false,
    error: null
  },
  reducers: {
    setCurrency: (state, action) => {
      state.currentCurrency = action.payload;
      // Guardar en localStorage para persistencia
      localStorage.setItem('currency', action.payload);
    },
    setCachedConversion: (state, action) => {
      const { key, value } = action.payload;
      state.conversionCache[key] = value;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.loading = false;
        state.rates = action.payload;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(convertAmount.fulfilled, (state, action) => {
        // No necesitamos actualizar el estado aquí, 
        // pero podríamos cachear el resultado si queremos
      });
  }
});

// Selectors
export const selectCurrentCurrency = (state) => state.currency.currentCurrency;
export const selectAvailableCurrencies = (state) => state.currency.availableCurrencies;
export const selectCurrencyRates = (state) => state.currency.rates;
export const selectCurrencyLoading = (state) => state.currency.loading;

export const { setCurrency, setCachedConversion } = currencySlice.actions;
export default currencySlice.reducer;