import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Estado inicial
const initialState = {
  orders: [],
  order: null,
  pagination: {
    page: 1,
    total: 0,
    pages: 1,
    per_page: 10
  },
  filters: {
    status: null,
    fromDate: null,
    toDate: null
  },
  isLoading: false,
  error: null,
  checkoutSuccess: false,
  checkoutOrderId: null
};

// Acción para obtener todas las órdenes del usuario
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page = 1, perPage = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...filters
      };
      
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cargar las órdenes'
      );
    }
  }
);

// Acción para obtener una orden específica
export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cargar la orden'
      );
    }
  }
);

// Acción para crear una nueva orden (checkout)
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al crear la orden'
      );
    }
  }
);

// Acción para actualizar el estado de una orden
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, notes }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al actualizar el estado de la orden'
      );
    }
  }
);

// Acción para cancelar una orden
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, notes }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, { notes });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cancelar la orden'
      );
    }
  }
);

// Slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.order = null;
    },
    setOrderFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    clearOrderFilters: (state) => {
      state.filters = {
        status: null,
        fromDate: null,
        toDate: null
      };
    },
    resetCheckoutState: (state) => {
      state.checkoutSuccess = false;
      state.checkoutOrderId = null;
    }
  },
  extraReducers: (builder) => {
    // fetchOrders
    builder.addCase(fetchOrders.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.isLoading = false;
      state.orders = action.payload.orders;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // fetchOrderById
    builder.addCase(fetchOrderById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOrderById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.order = action.payload;
    });
    builder.addCase(fetchOrderById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // createOrder
    builder.addCase(createOrder.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.checkoutSuccess = false;
      state.checkoutOrderId = null;
    });
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.isLoading = false;
      state.checkoutSuccess = true;
      state.checkoutOrderId = action.payload.order.id;
    });
    builder.addCase(createOrder.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.checkoutSuccess = false;
    });

    // updateOrderStatus
    builder.addCase(updateOrderStatus.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      // Actualizar la orden en la lista si existe
      if (state.orders.length > 0) {
        const index = state.orders.findIndex(o => o.id === action.payload.order.id);
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
      }
      // Actualizar la orden actual si es la misma
      if (state.order && state.order.id === action.payload.order.id) {
        state.order = action.payload.order;
      }
    });
    builder.addCase(updateOrderStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // cancelOrder
    builder.addCase(cancelOrder.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cancelOrder.fulfilled, (state, action) => {
      state.isLoading = false;
      // Actualizar la orden en la lista si existe
      if (state.orders.length > 0) {
        const index = state.orders.findIndex(o => o.id === action.payload.order.id);
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
      }
      // Actualizar la orden actual si es la misma
      if (state.order && state.order.id === action.payload.order.id) {
        state.order = action.payload.order;
      }
    });
    builder.addCase(cancelOrder.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  }
});

// Acciones
export const {
  clearOrderError,
  clearCurrentOrder,
  setOrderFilters,
  clearOrderFilters,
  resetCheckoutState
} = orderSlice.actions;

// Selectores
export const selectOrders = (state) => state.order.orders;
export const selectCurrentOrder = (state) => state.order.order;
export const selectOrdersPagination = (state) => state.order.pagination;
export const selectOrdersFilters = (state) => state.order.filters;
export const selectOrdersLoading = (state) => state.order.isLoading;
export const selectOrdersError = (state) => state.order.error;
export const selectCheckoutSuccess = (state) => state.order.checkoutSuccess;
export const selectCheckoutOrderId = (state) => state.order.checkoutOrderId;

// Reducer
export default orderSlice.reducer;