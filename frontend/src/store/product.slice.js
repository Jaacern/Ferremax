import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../services/product.service';

// Estado inicial
const initialState = {
  products: [],
  product: null,
  categories: [],
  pagination: {
    page: 1,
    total: 0,
    pages: 1,
    per_page: 12
  },
  filters: {
    category: null,
    search: '',
    min_price: null,
    max_price: null,
    brand: null,
    featured: null,
    new: null
  },
  isLoading: false,
  error: null
};

// Acciones asíncronas
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page, filters }, { rejectWithValue }) => {
    try {
      console.log('Redux - fetchProducts llamado con:', { page, filters });
      const result = await productService.getProducts(page, filters);
      console.log('Redux - fetchProducts resultado:', result);
      return result;
    } catch (error) {
      console.error('Redux - fetchProducts error:', error);
      console.error('Redux - fetchProducts error response:', error.response);
      console.error('Redux - fetchProducts error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Error al cargar productos';
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      return await productService.getProductById(productId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cargar el producto'
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getCategories();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cargar categorías'
      );
    }
  }
);

// Slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      console.log('Redux - setFilters llamado con:', action.payload);
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    clearFilters: (state) => {
      state.filters = {
        category: null,
        search: '',
        min_price: null,
        max_price: null,
        brand: null,
        featured: null,
        new: null
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearProduct: (state) => {
      state.product = null;
    }
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder.addCase(fetchProducts.pending, (state) => {
      console.log('Redux - fetchProducts pending');
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      console.log('Redux - fetchProducts fulfilled:', action.payload);
      state.isLoading = false;
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      console.error('Redux - fetchProducts rejected:', action.payload);
      state.isLoading = false;
      state.error = action.payload;
    });

    // fetchProductById
    builder.addCase(fetchProductById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.product = action.payload;
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // fetchCategories
    builder.addCase(fetchCategories.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.isLoading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  }
});

// Acciones
export const { 
  setFilters, 
  clearFilters, 
  clearError,
  clearProduct
} = productSlice.actions;

// Selectores
export const selectProducts = (state) => state.product.products;
export const selectProduct = (state) => state.product.product;
export const selectCategories = (state) => state.product.categories;
export const selectPagination = (state) => state.product.pagination;
export const selectFilters = (state) => state.product.filters;
export const selectIsLoading = (state) => state.product.isLoading;
export const selectError = (state) => state.product.error;

// Reducer
export default productSlice.reducer;