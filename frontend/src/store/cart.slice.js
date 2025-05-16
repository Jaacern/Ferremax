/**
 * Redux slice para manejar el carrito de compras
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../services/order.service';

// Estado inicial
const initialState = {
  items: JSON.parse(localStorage.getItem('cartItems')) || [],
  selectedBranchId: parseInt(localStorage.getItem('selectedBranchId')) || null,
  deliveryMethod: localStorage.getItem('deliveryMethod') || 'retiro en tienda',
  deliveryAddress: localStorage.getItem('deliveryAddress') || '',
  notes: localStorage.getItem('cartNotes') || '',
  loading: false,
  error: null,
  lastOrder: null
};

// Acciones asíncronas
export const createOrder = createAsyncThunk(
  'cart/createOrder',
  async ({ items, branch_id, delivery_method, delivery_address, notes }, { rejectWithValue }) => {
    try {
      const orderData = {
        branch_id,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        delivery_method,
        delivery_address,
        notes
      };
      
      const response = await orderService.createOrder(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al crear el pedido');
    }
  }
);

// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Agregar producto al carrito
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.current_price || product.price,
          originalPrice: product.price,
          image_url: product.image_url,
          quantity
        });
      }
      
      // Guardar en localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    
    // Remover producto del carrito
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
      
      // Actualizar localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    
    // Actualizar cantidad de un producto
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.id === productId);
      
      if (item) {
        item.quantity = Math.max(1, quantity); // Mínimo 1
      }
      
      // Actualizar localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    
    // Vaciar carrito
    clearCart: (state) => {
      state.items = [];
      
      // Actualizar localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    
    // Seleccionar sucursal
    selectBranch: (state, action) => {
      state.selectedBranchId = action.payload;
      
      // Guardar en localStorage
      localStorage.setItem('selectedBranchId', action.payload);
    },
    
    // Establecer método de entrega
    setDeliveryMethod: (state, action) => {
      state.deliveryMethod = action.payload;
      
      // Guardar en localStorage
      localStorage.setItem('deliveryMethod', action.payload);
    },
    
    // Establecer dirección de entrega
    setDeliveryAddress: (state, action) => {
      state.deliveryAddress = action.payload;
      
      // Guardar en localStorage
      localStorage.setItem('deliveryAddress', action.payload);
    },
    
    // Establecer notas
    setNotes: (state, action) => {
      state.notes = action.payload;
      
      // Guardar en localStorage
      localStorage.setItem('cartNotes', action.payload);
    },
    
    // Reiniciar error
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Create Order
    builder.addCase(createOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.lastOrder = action.payload.order;
      state.items = [];
      
      // Limpiar localStorage del carrito
      localStorage.removeItem('cartItems');
    });
    builder.addCase(createOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

// Exportar acciones y reducer
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  selectBranch,
  setDeliveryMethod,
  setDeliveryAddress,
  setNotes,
  resetError
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectores
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
export const selectSelectedBranchId = (state) => state.cart.selectedBranchId;
export const selectDeliveryMethod = (state) => state.cart.deliveryMethod;
export const selectDeliveryAddress = (state) => state.cart.deliveryAddress;
export const selectCartNotes = (state) => state.cart.notes;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectLastOrder = (state) => state.cart.lastOrder;