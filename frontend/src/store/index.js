/**
 * Configuración del store de Redux
 */
import { configureStore } from '@reduxjs/toolkit';

// Importar reducers
import authReducer from './auth.slice';
import cartReducer from './cart.slice';
import productReducer from './product.slice';
import orderReducer from './order.slice';
import stockReducer from './stock.slice';

// Configurar store
const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    orders: orderReducer,
    stock: stockReducer
  },
  // Middleware personalizado si es necesario
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones específicas si es necesario
        // ignoredActions: ['some/action']
      }
    })
});

export default store;