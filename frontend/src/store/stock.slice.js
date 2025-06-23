import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Estado inicial
const initialState = {
  stocks: [],
  alerts: [],
  currentStock: null,
  branches: [],
  pagination: {
    page: 1,
    total: 0,
    pages: 1,
    per_page: 10
  },
  filters: {
    branch_id: null,
    product_id: null,
    category: null,
    low_stock: false,
    out_of_stock: false,
    search: ''
  },
  isLoading: false,
  error: null,
  transferStatus: {
    isLoading: false,
    error: null,
    success: false
  },
  updateStatus: {
    isLoading: false,
    error: null,
    success: false
  }
};

// Acciones asíncronas
export const fetchStocks = createAsyncThunk(
  'stock/fetchStocks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/stock', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cargar el stock'
      );
    }
  }
);

export const fetchStockAlerts = createAsyncThunk(
  'stock/fetchStockAlerts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/stock/alerts', { params });
      return response.data.alerts;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cargar las alertas de stock'
      );
    }
  }
);

export const updateStock = createAsyncThunk(
  'stock/updateStock',
  async ({ stockId, stockData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/stock/update/${stockId}`, stockData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al actualizar el stock'
      );
    }
  }
);

export const transferStock = createAsyncThunk(
  'stock/transferStock',
  async (transferData, { rejectWithValue }) => {
    try {
      const response = await api.post('/stock/transfer', transferData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al transferir el stock'
      );
    }
  }
);

export const fetchStockById = createAsyncThunk(
  'stock/fetchStockById',
  async (stockId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/stock`, { params: { stock_id: stockId } });
      // El endpoint /stock devuelve un array → coge el primero
      return data.stocks?.[0] ?? null;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Error al obtener el stock'
      );
    }
  }
);

export const fetchBranches = createAsyncThunk(
  'stock/fetchBranches',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/products/branches');
      // Ese endpoint ya existe en tu backend → products.py
      return data.branches;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Error al cargar las sucursales'
      );
    }
  }
);

// Slice
const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    setStockFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    clearStockFilters: (state) => {
      state.filters = {
        branch_id: null,
        product_id: null,
        category: null,
        low_stock: false,
        out_of_stock: false,
        search: ''
      };
    },
    clearStockErrors: (state) => {
      state.error = null;
      state.transferStatus.error = null;
      state.updateStatus.error = null;
    },
    clearTransferStatus: (state) => {
      state.transferStatus = {
        isLoading: false,
        error: null,
        success: false
      };
    },
    clearUpdateStatus: (state) => {
      state.updateStatus = {
        isLoading: false,
        error: null,
        success: false
      };
    },
    addStockAlert: (state, action) => {
      // Agregar alerta a la lista si no existe
      const alertExists = state.alerts.some(
        alert => alert.product_id === action.payload.product_id && 
                 alert.branch_id === action.payload.branch_id
      );
      
      if (!alertExists) {
        state.alerts.push(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    // fetchStocks
    builder.addCase(fetchStocks.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchStocks.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stocks = action.payload.stocks;
      
      // Si hay información de paginación en la respuesta
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      } else {
        // Si no hay paginación, calcular basado en resultados
        state.pagination.total = action.payload.stocks.length;
        state.pagination.pages = Math.ceil(
          action.payload.stocks.length / state.pagination.per_page
        );
      }
    });
    builder.addCase(fetchStocks.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // fetchStockAlerts
    builder.addCase(fetchStockAlerts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchStockAlerts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.alerts = action.payload;
    });
    builder.addCase(fetchStockAlerts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // updateStock
    builder.addCase(updateStock.pending, (state) => {
      state.updateStatus.isLoading = true;
      state.updateStatus.error = null;
      state.updateStatus.success = false;
    });
    builder.addCase(updateStock.fulfilled, (state, action) => {
      state.updateStatus.isLoading = false;
      state.updateStatus.success = true;
      
      // Actualizar el stock en la lista de stocks
      const index = state.stocks.findIndex(stock => stock.id === action.payload.stock.id);
      if (index !== -1) {
        state.stocks[index] = {
          ...state.stocks[index],
          ...action.payload.stock
        };
      }
    });
    builder.addCase(updateStock.rejected, (state, action) => {
      state.updateStatus.isLoading = false;
      state.updateStatus.error = action.payload;
    });

    // transferStock
    builder.addCase(transferStock.pending, (state) => {
      state.transferStatus.isLoading = true;
      state.transferStatus.error = null;
      state.transferStatus.success = false;
    });

    /* fetchStockById */
    builder.addCase(fetchStockById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchStockById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentStock = action.payload;
    });
    builder.addCase(fetchStockById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    /* fetchBranches */
    builder.addCase(fetchBranches.fulfilled, (state, action) => {
      state.branches = action.payload;
    });

    builder.addCase(transferStock.fulfilled, (state, action) => {
      state.transferStatus.isLoading = false;
      state.transferStatus.success = true;
      
      // Actualizar stocks después de la transferencia
      // (normalmente haríamos un refetch, pero podemos actualizar el estado si tenemos la info)
      const { product_id, source_branch_id, target_branch_id, source_remaining, target_new_quantity } = action.payload.transfer;
      
      // Actualizar stock origen
      const sourceIndex = state.stocks.findIndex(
        stock => stock.product_id === product_id && stock.branch_id === source_branch_id
      );
      if (sourceIndex !== -1) {
        state.stocks[sourceIndex].quantity = source_remaining;
      }
      
      // Actualizar stock destino
      const targetIndex = state.stocks.findIndex(
        stock => stock.product_id === product_id && stock.branch_id === target_branch_id
      );
      if (targetIndex !== -1) {
        state.stocks[targetIndex].quantity = target_new_quantity;
      }
    });
    builder.addCase(transferStock.rejected, (state, action) => {
      state.transferStatus.isLoading = false;
      state.transferStatus.error = action.payload;
    });
  }
});

// Acciones
export const { 
  setStockFilters, 
  clearStockFilters, 
  clearStockErrors,
  clearTransferStatus,
  clearUpdateStatus,
  addStockAlert
} = stockSlice.actions;

// Selectores
export const selectStocks = (state) => state.stock.stocks;
export const selectStockAlerts = (state) => state.stock.alerts;
export const selectStockPagination = (state) => state.stock.pagination;
export const selectStockFilters = (state) => state.stock.filters;
export const selectIsLoading = (state) => state.stock.isLoading;
export const selectStockError = (state) => state.stock.error;
export const selectTransferStatus = (state) => state.stock.transferStatus;
export const selectUpdateStatus = (state) => state.stock.updateStatus;
export const selectCurrentStock    = (state) => state.stock.currentStock;   
export const selectBranches        = (state) => state.stock.branches;     

// Reducer
export default stockSlice.reducer;