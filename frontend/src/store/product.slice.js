/**
 * Redux slice para manejar productos
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../services/product.service';

// Estado inicial
const initialState = {
  products: [],
  product: null,
  categories: [],
  branches: [],
  pagination: {
    total: 0,
    pages: 0,
    page: 1,
    per_page: 12
  },
  loading: false,
  error: null
};

// Acciones asíncronas
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener productos');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(productId);
      return response.product;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener producto');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getCategories();
      return response.categories;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener categorías');
    }
  }
);

export const fetchBranches = createAsyncThunk(
  'products/fetchBranches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getBranches();
      return response.branches;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener sucursales');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(productData);
      return response.product;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al crear producto');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(productId, productData);
      return response.product;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al actualizar producto');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al eliminar producto');
    }
  }
);

// Slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Reiniciar producto seleccionado
    resetSelectedProduct: (state) => {
      state.product = null;
    },
    
    // Reiniciar error
    resetError: (state) => {
      state.error = null;
    },
    
    // Cambiar página actual
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Fetch Product By Id
    builder.addCase(fetchProductById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.loading = false;
      state.product = action.payload;
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Fetch Categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Fetch Branches
    builder.addCase(fetchBranches.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBranches.fulfilled, (state, action) => {
      state.loading = false;
      state.branches = action.payload;
    });
    builder.addCase(fetchBranches.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Create Product
    builder.addCase(createProduct.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.products = [action.payload, ...state.products];
    });
    builder.addCase(createProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Update Product
    builder.addCase(updateProduct.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      state.loading = false;
      // Actualizar en el listado
      state.products = state.products.map(product => 
        product.id === action.payload.id ? action.payload : product
      );
      // Actualizar producto seleccionado si coincide
      if (state.product && state.product.id === action.payload.id) {
        state.product = action.payload;
      }
    });
    builder.addCase(updateProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Delete Product
    builder.addCase(deleteProduct.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.products = state.products.filter(product => product.id !== action.payload);
      // Reiniciar producto seleccionado si coincide
      if (state.product && state.product.id === action.payload) {
        state.product = null;
      }
    });
    builder.addCase(deleteProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

// Exportar acciones y reducer
export const { resetSelectedProduct, resetError, setCurrentPage } = productSlice.actions;
export default productSlice.reducer;

// Selectores
export const selectProducts = (state) => state.products.products;
export const selectProduct = (state) => state.products.product;
export const selectCategories = (state) => state.products.categories;
export const selectBranches = (state) => state.products.branches;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectProductsPagination = (state) => state.products.pagination;