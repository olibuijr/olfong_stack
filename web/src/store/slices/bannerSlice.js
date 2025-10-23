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

export const fetchFeaturedBanners = createAsyncThunk(
  'banners/fetchFeaturedBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/banners/featured');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured banners');
    }
  }
);

export const fetchHeroBanner = createAsyncThunk(
  'banners/fetchHeroBanner',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/banners/hero/active');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hero banner');
    }
  }
);

export const setFeaturedBanner = createAsyncThunk(
  'banners/setFeaturedBanner',
  async ({ id, featuredOrder }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/banners/${id}/featured`, { featuredOrder });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set banner as featured');
    }
  }
);

export const removeFeaturedBanner = createAsyncThunk(
  'banners/removeFeaturedBanner',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/banners/${id}/featured`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove banner from featured');
    }
  }
);

// Initial state
const initialState = {
  banners: [],
  featuredBanners: [],
  heroBanner: null,
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
      })

      // Fetch Featured Banners
      .addCase(fetchFeaturedBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredBanners = action.payload;
        state.error = null;
      })
      .addCase(fetchFeaturedBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Hero Banner
      .addCase(fetchHeroBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHeroBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.heroBanner = action.payload;
        state.error = null;
      })
      .addCase(fetchHeroBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Set Featured Banner
      .addCase(setFeaturedBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setFeaturedBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.banners.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        // Update featured banners if this banner is now featured
        if (action.payload.isFeatured) {
          const featuredIndex = state.featuredBanners.findIndex(b => b.id === action.payload.id);
          if (featuredIndex !== -1) {
            state.featuredBanners[featuredIndex] = action.payload;
          } else {
            state.featuredBanners.push(action.payload);
            state.featuredBanners.sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
          }
        }
        state.error = null;
      })
      .addCase(setFeaturedBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Remove Featured Banner
      .addCase(removeFeaturedBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFeaturedBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.banners.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        // Remove from featured banners
        state.featuredBanners = state.featuredBanners.filter(b => b.id !== action.payload.id);
        state.error = null;
      })
      .addCase(removeFeaturedBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
   },
 });

export const { clearCurrentBanner, clearError } = bannerSlice.actions;
export default bannerSlice.reducer;
