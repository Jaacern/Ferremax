import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice';
import productReducer from './product.slice';
import cartReducer from './cart.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer
  },
  // Middleware para manejar serialización de datos no serializables si es necesario
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar ciertas acciones o paths si es necesario
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;