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
      return await productService.getProducts(page, filters);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cargar productos'
      );
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
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
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