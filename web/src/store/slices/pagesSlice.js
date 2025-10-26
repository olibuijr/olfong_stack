import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchPages = createAsyncThunk(
  'pages/fetchPages',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/pages?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pages');
    }
  }
);

export const fetchPublicPages = createAsyncThunk(
  'pages/fetchPublicPages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/pages/public');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch public pages');
    }
  }
);

export const fetchPageById = createAsyncThunk(
  'pages/fetchPageById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pages/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch page');
    }
  }
);

export const fetchPageBySlug = createAsyncThunk(
  'pages/fetchPageBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pages/slug/${slug}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch page');
    }
  }
);

export const createPage = createAsyncThunk(
  'pages/createPage',
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await api.post('/pages', pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create page');
    }
  }
);

export const updatePage = createAsyncThunk(
  'pages/updatePage',
  async ({ id, ...pageData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pages/${id}`, pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update page');
    }
  }
);

export const deletePage = createAsyncThunk(
  'pages/deletePage',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/pages/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete page');
    }
  }
);

export const reorderPages = createAsyncThunk(
  'pages/reorderPages',
  async (pageOrders, { rejectWithValue }) => {
    try {
      const response = await api.put('/pages/reorder', { pageOrders });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder pages');
    }
  }
);

export const togglePageVisibility = createAsyncThunk(
  'pages/togglePageVisibility',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/pages/${id}/visibility`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle page visibility');
    }
  }
);

// Initial state
const initialState = {
  pages: [],
  publicPages: [],
  currentPage: null,
  isLoading: false,
  error: null,
};

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    clearCurrentPage: (state) => {
      state.currentPage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pages
      .addCase(fetchPages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pages = action.payload;
        state.error = null;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Public Pages
      .addCase(fetchPublicPages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicPages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.publicPages = action.payload;
        state.error = null;
      })
      .addCase(fetchPublicPages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Page By ID
      .addCase(fetchPageById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPageById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPage = action.payload;
        state.error = null;
      })
      .addCase(fetchPageById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Page By Slug
      .addCase(fetchPageBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPageBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPage = action.payload;
        state.error = null;
      })
      .addCase(fetchPageBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Page
      .addCase(createPage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pages.push(action.payload);
        state.error = null;
      })
      .addCase(createPage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Page
      .addCase(updatePage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePage.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.pages.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pages[index] = action.payload;
        }
        if (state.currentPage && state.currentPage.id === action.payload.id) {
          state.currentPage = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Page
      .addCase(deletePage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pages = state.pages.filter(p => p.id !== action.payload);
        if (state.currentPage && state.currentPage.id === action.payload) {
          state.currentPage = null;
        }
        state.error = null;
      })
      .addCase(deletePage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Reorder Pages
      .addCase(reorderPages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reorderPages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pages = action.payload;
        state.error = null;
      })
      .addCase(reorderPages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Toggle Page Visibility
      .addCase(togglePageVisibility.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(togglePageVisibility.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.pages.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pages[index] = action.payload;
        }
        if (state.currentPage && state.currentPage.id === action.payload.id) {
          state.currentPage = action.payload;
        }
        state.error = null;
      })
      .addCase(togglePageVisibility.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentPage, clearError } = pagesSlice.actions;
export default pagesSlice.reducer;
