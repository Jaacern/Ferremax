/**
 * Redux slice para manejar inventario
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import stockService from '../services/stock.service';

// Estado inicial
const initialState = {
  stocks: [],
  stockAlerts: [],
  notification: null,
  loading: false,
  error: null
};

// Acciones asíncronas
export const fetchStocks = createAsyncThunk(
  'stock/fetchStocks',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await stockService.getStocks(filters);
      return response.stocks;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener inventario');
    }
  }
);

export const updateStock = createAsyncThunk(
  'stock/updateStock',
  async ({ stockId, quantity, minStock }, { rejectWithValue }) => {
    try {
      const response = await stockService.updateStock(stockId, quantity, minStock);
      return response.stock;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al actualizar inventario');
    }
  }
);

export const transferStock = createAsyncThunk(
  'stock/transferStock',
  async ({ productId, sourceBranchId, targetBranchId, quantity }, { rejectWithValue }) => {
    try {
      const response = await stockService.transferStock(
        productId,
        sourceBranchId,
        targetBranchId,
        quantity
      );
      return response.transfer;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al transferir inventario');
    }
  }
);

export const fetchStockAlerts = createAsyncThunk(
  'stock/fetchStockAlerts',
  async (branchId = null, { rejectWithValue }) => {
    try {
      const response = await stockService.getStockAlerts(branchId);
      return response.alerts;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener alertas de inventario');
    }
  }
);

export const bulkUpdateStock = createAsyncThunk(
  'stock/bulkUpdateStock',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await stockService.bulkUpdateStock(updates);
      return response.updates;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al actualizar inventario masivamente');
    }
  }
);

export const initializeStock = createAsyncThunk(
  'stock/initializeStock',
  async ({ productId, quantity, minStock }, { rejectWithValue }) => {
    try {
      const response = await stockService.initializeStock(productId, quantity, minStock);
      return response.results;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al inicializar inventario');
    }
  }
);

// Slice
const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    // Reiniciar error
    resetError: (state) => {
      state.error = null;
    },
    
    // Agregar alerta de stock (para notificaciones en tiempo real)
    addStockAlert: (state, action) => {
      // Verificar si ya existe la alerta para evitar duplicados
      const alertExists = state.stockAlerts.some(
        alert => alert.product_id === action.payload.product_id && 
                alert.branch_id === action.payload.branch_id
      );
      
      if (!alertExists) {
        state.stockAlerts.unshift(action.payload);
        
        // Limitar a 20 alertas como máximo
        if (state.stockAlerts.length > 20) {
          state.stockAlerts.pop();
        }
      }
      
      // Guardar última notificación para mostrar
      state.notification = action.payload;
    },
    
    // Limpiar notificación actual
    clearStockNotification: (state) => {
      state.notification = null;
    },
    
    // Limpiar todas las alertas
    clearStockAlerts: (state) => {
      state.stockAlerts = [];
    }
  },
  extraReducers: (builder) => {
    // Fetch Stocks
    builder.addCase(fetchStocks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStocks.fulfilled, (state, action) => {
      state.loading = false;
      state.stocks = action.payload;
    });
    builder.addCase(fetchStocks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Update Stock
    builder.addCase(updateStock.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateStock.fulfilled, (state, action) => {
      state.loading = false;
      // Actualizar en la lista
      state.stocks = state.stocks.map(stock => 
        stock.id === action.payload.id ? action.payload : stock
      );
    });
    builder.addCase(updateStock.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Transfer Stock
    builder.addCase(transferStock.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(transferStock.fulfilled, (state, action) => {
      state.loading = false;
      // No actualizamos directamente los stocks porque necesitaríamos
      // recargar los datos para tener la información completa
    });
    builder.addCase(transferStock.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Fetch Stock Alerts
    builder.addCase(fetchStockAlerts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStockAlerts.fulfilled, (state, action) => {
      state.loading = false;
      state.stockAlerts = action.payload;
    });
    builder.addCase(fetchStockAlerts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Bulk Update Stock
    builder.addCase(bulkUpdateStock.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(bulkUpdateStock.fulfilled, (state, action) => {
      state.loading = false;
      // No actualizamos directamente los stocks porque necesitaríamos
      // recargar los datos para tener la información completa
    });
    builder.addCase(bulkUpdateStock.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Initialize Stock
    builder.addCase(initializeStock.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(initializeStock.fulfilled, (state, action) => {
      state.loading = false;
      // No actualizamos directamente los stocks porque necesitaríamos
      // recargar los datos para tener la información completa
    });
    builder.addCase(initializeStock.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

// Exportar acciones y reducer
export const { 
  resetError, 
  addStockAlert, 
  clearStockNotification, 
  clearStockAlerts 
} = stockSlice.actions;

export default stockSlice.reducer;

// Selectores
export const selectStocks = (state) => state.stock.stocks;
export const selectStockAlerts = (state) => state.stock.stockAlerts;
export const selectStockNotification = (state) => state.stock.notification;
export const selectStockLoading = (state) => state.stock.loading;
export const selectStockError = (state) => state.stock.error;