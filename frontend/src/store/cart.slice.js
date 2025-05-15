import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Estado inicial
const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null
};

// Funciones auxiliares
const calculateTotal = (items) => {
  return items.reduce((sum, item) => {
    const itemPrice = item.discount_percentage 
      ? item.price * (1 - item.discount_percentage / 100) 
      : item.price;
    return sum + (itemPrice * item.quantity);
  }, 0);
};

const calculateItemCount = (items) => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Obtener carrito desde localStorage
const loadCartFromStorage = () => {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      const parsedCart = JSON.parse(savedCart);
      return {
        ...initialState,
        items: parsedCart.items || [],
        total: calculateTotal(parsedCart.items || []),
        itemCount: calculateItemCount(parsedCart.items || [])
      };
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      return initialState;
    }
  }
  return initialState;
};

// Guardar carrito en localStorage
const saveCartToStorage = (cart) => {
  localStorage.setItem('cart', JSON.stringify({
    items: cart.items
  }));
};

// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartFromStorage(),
  reducers: {
    addToCart: (state, action) => {
      const { id, quantity = 1, ...rest } = action.payload;
      
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = state.items.findIndex(item => item.id === id);
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad del item existente
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Añadir nuevo item
        state.items.push({ id, quantity, ...rest });
      }
      
      // Recalcular totales
      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
      
      // Guardar en localStorage
      saveCartToStorage(state);
    },
    
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload;
      
      // Encontrar el item y actualizar
      const itemIndex = state.items.findIndex(item => item.id === id);
      
      if (itemIndex >= 0) {
        // Si la cantidad es 0 o menos, eliminar el item
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
        }
        
        // Recalcular totales
        state.total = calculateTotal(state.items);
        state.itemCount = calculateItemCount(state.items);
        
        // Guardar en localStorage
        saveCartToStorage(state);
      }
    },
    
    removeFromCart: (state, action) => {
      const id = action.payload;
      
      // Filtrar el item
      state.items = state.items.filter(item => item.id !== id);
      
      // Recalcular totales
      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
      
      // Guardar en localStorage
      saveCartToStorage(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      
      // Limpiar localStorage
      localStorage.removeItem('cart');
    }
  }
});

// Acciones
export const { 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = cartSlice.actions;

// Selectores
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectIsCartEmpty = (state) => state.cart.items.length === 0;

// Reducer
export default cartSlice.reducer;