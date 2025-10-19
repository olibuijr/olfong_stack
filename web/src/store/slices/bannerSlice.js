import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchBanners = createAsyncThunk(
  'banners/fetchBanners',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.includeInactive) queryParams.append('includeInactive', 'true');
      
      const response = await api.get(`/banners?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch banners');
    }
  }
);

export const fetchBanner = createAsyncThunk(
  'banners/fetchBanner',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/banners/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch banner');
    }
  }
);

export const createBanner = createAsyncThunk(
  'banners/createBanner',
  async (bannerData, { rejectWithValue }) => {
    try {
      const response = await api.post('/banners', bannerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create banner');
    }
  }
);

export const updateBanner = createAsyncThunk(
  'banners/updateBanner',
  async ({ id, ...bannerData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/banners/${id}`, bannerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update banner');
    }
  }
);

export const deleteBanner = createAsyncThunk(
  'banners/deleteBanner',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/banners/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete banner');
    }
  }
);

export const toggleBannerStatus = createAsyncThunk(
  'banners/toggleBannerStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/banners/${id}/toggle`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle banner status');
    }
  }
);

// Initial state
const initialState = {
  banners: [],
  currentBanner: null,
  isLoading: false,
  error: null,
};

const bannerSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    clearCurrentBanner: (state) => {
      state.currentBanner = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Banners
      .addCase(fetchBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = action.payload;
        state.error = null;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Banner
      .addCase(fetchBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBanner = action.payload;
        state.error = null;
      })
      .addCase(fetchBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Banner
      .addCase(createBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners.push(action.payload);
        state.error = null;
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Banner
      .addCase(updateBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.banners.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        if (state.currentBanner && state.currentBanner.id === action.payload.id) {
          state.currentBanner = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete Banner
      .addCase(deleteBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = state.banners.filter(b => b.id !== action.payload);
        if (state.currentBanner && state.currentBanner.id === action.payload) {
          state.currentBanner = null;
        }
        state.error = null;
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Toggle Banner Status
      .addCase(toggleBannerStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleBannerStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.banners.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        if (state.currentBanner && state.currentBanner.id === action.payload.id) {
          state.currentBanner = action.payload;
        }
        state.error = null;
      })
      .addCase(toggleBannerStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentBanner, clearError } = bannerSlice.actions;
export default bannerSlice.reducer;
