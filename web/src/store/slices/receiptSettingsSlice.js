import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchReceiptSettings = createAsyncThunk(
  'receiptSettings/fetchReceiptSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/receipt-settings');
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch receipt settings');
    }
  }
);

export const updateReceiptSettings = createAsyncThunk(
  'receiptSettings/updateReceiptSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await api.put('/receipt-settings', settingsData);
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update receipt settings');
    }
  }
);

export const uploadReceiptLogo = createAsyncThunk(
  'receiptSettings/uploadReceiptLogo',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      // Don't set Content-Type header - let axios handle it with proper boundary for FormData
      const response = await api.post('/receipt-settings/logo', formData, {
        headers: {
          'Content-Type': undefined
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload logo');
    }
  }
);

export const deleteReceiptLogo = createAsyncThunk(
  'receiptSettings/deleteReceiptLogo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/receipt-settings/logo');
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete logo');
    }
  }
);

// Initial state
const initialState = {
  settings: {
    logoInversion: 'none'
  },
  isLoading: false,
  error: null,
  uploadProgress: 0,
};

const receiptSettingsSlice = createSlice({
  name: 'receiptSettings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    updateSettingsField: (state, action) => {
      const { field, value } = action.payload;
      if (state.settings) {
        state.settings[field] = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch receipt settings
      .addCase(fetchReceiptSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReceiptSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(fetchReceiptSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update receipt settings
      .addCase(updateReceiptSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReceiptSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(updateReceiptSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Upload logo
      .addCase(uploadReceiptLogo.pending, (state) => {
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadReceiptLogo.fulfilled, (state, action) => {
        state.uploadProgress = 100;
        state.settings = action.payload.settings;
        state.error = null;
      })
      .addCase(uploadReceiptLogo.rejected, (state, action) => {
        state.uploadProgress = 0;
        state.error = action.payload;
      })
      
      // Delete logo
      .addCase(deleteReceiptLogo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReceiptLogo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(deleteReceiptLogo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUploadProgress, updateSettingsField } = receiptSettingsSlice.actions;
export default receiptSettingsSlice.reducer;
