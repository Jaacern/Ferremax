import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';          // ← tu wrapper de axios

// thunk: solicita la conversión al backend
export const fetchConversion = createAsyncThunk(
  'currency/fetchConversion',
  async ({ amount, from = 'CLP', to }) => {
    const res = await api.get('/payments/convert', {
      params: { amount, from, to }
    });
    return res.data;                        // ← JSON {original, converted, rate, …}
  }
);

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    selected: 'CLP',        // divisa elegida por el usuario
    rate: 1,                // tasa CLP→selected
    rateDate: null,
    status: 'idle',
    error: null
  },
  reducers: {
    setSelected(state, action) {
      state.selected = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversion.pending,  (s) => { s.status = 'loading'; })
      .addCase(fetchConversion.rejected, (s, a) => {
        s.status = 'failed';
        s.error  = a.error.message;
      })
      .addCase(fetchConversion.fulfilled, (s, a) => {
        s.status   = 'succeeded';
        s.rate     = a.payload.rate;
        s.rateDate = a.payload.rate_date;
      });
  }
});

export const { setSelected } = currencySlice.actions;
export const selectCurrency      = (s) => s.currency.selected;
export const selectRate          = (s) => s.currency.rate;
export const selectCurrencyState = (s) => s.currency;
export default currencySlice.reducer;
