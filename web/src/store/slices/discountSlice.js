import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchProductsWithDiscounts = createAsyncThunk(
  'discounts/fetchProductsWithDiscounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/products?hasDiscount=true&limit=100');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch discounted products');
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  'discounts/fetchAllProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/products?limit=500');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const setProductDiscount = createAsyncThunk(
  'discounts/setProductDiscount',
  async (payload, { rejectWithValue }) => {
    try {
      const {
        productId,
        originalPrice,
        discountPercentage,
        discountStartDate,
        discountEndDate,
        discountReason,
        discountReasonIs
      } = payload;

      const response = await api.post(`/api/products/${productId}/discount`, {
        originalPrice,
        discountPercentage,
        discountStartDate,
        discountEndDate,
        discountReason,
        discountReasonIs
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set discount');
    }
  }
);

export const removeProductDiscount = createAsyncThunk(
  'discounts/removeProductDiscount',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/products/${productId}/discount`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove discount');
    }
  }
);

export const bulkRemoveDiscounts = createAsyncThunk(
  'discounts/bulkRemoveDiscounts',
  async (productIds, { rejectWithValue }) => {
    try {
      const promises = productIds.map(id =>
        api.delete(`/api/products/${id}/discount`)
      );
      const results = await Promise.all(promises);
      return results.map(r => r.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk remove discounts');
    }
  }
);

const initialState = {
  productsWithDiscounts: [],
  allProducts: [],
  isLoading: false,
  error: null,
  operationLoading: false
};

const discountSlice = createSlice({
  name: 'discounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch products with discounts
    builder
      .addCase(fetchProductsWithDiscounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsWithDiscounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productsWithDiscounts = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
      })
      .addCase(fetchProductsWithDiscounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch all products
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allProducts = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Set product discount
    builder
      .addCase(setProductDiscount.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(setProductDiscount.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updated = action.payload;
        const index = state.productsWithDiscounts.findIndex(p => p.id === updated.id);
        if (index >= 0) {
          state.productsWithDiscounts[index] = updated;
        } else {
          state.productsWithDiscounts.push(updated);
        }
      })
      .addCase(setProductDiscount.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });

    // Remove product discount
    builder
      .addCase(removeProductDiscount.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(removeProductDiscount.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.productsWithDiscounts = state.productsWithDiscounts.filter(
          p => p.id !== action.payload.id
        );
      })
      .addCase(removeProductDiscount.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });

    // Bulk remove discounts
    builder
      .addCase(bulkRemoveDiscounts.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(bulkRemoveDiscounts.fulfilled, (state, action) => {
        state.operationLoading = false;
        const removedIds = action.payload.map(p => p.id);
        state.productsWithDiscounts = state.productsWithDiscounts.filter(
          p => !removedIds.includes(p.id)
        );
      })
      .addCase(bulkRemoveDiscounts.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = discountSlice.actions;
export default discountSlice.reducer;
