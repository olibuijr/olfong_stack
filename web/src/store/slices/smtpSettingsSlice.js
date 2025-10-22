import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchSMTPSettings = createAsyncThunk(
  'smtpSettings/fetchSMTPSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/smtp-settings');
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch SMTP settings');
    }
  }
);

export const updateSMTPSettings = createAsyncThunk(
  'smtpSettings/updateSMTPSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await api.put('/smtp-settings', settingsData);
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update SMTP settings');
    }
  }
);

export const testSMTPConnection = createAsyncThunk(
  'smtpSettings/testSMTPConnection',
  async (smtpConfig, { rejectWithValue }) => {
    try {
      const response = await api.post('/smtp-settings/test', smtpConfig);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'SMTP test failed');
    }
  }
);

// Initial state
const initialState = {
  settings: null,
  isLoading: false,
  error: null,
  testResult: null,
  isTesting: false,
};

const smtpSettingsSlice = createSlice({
  name: 'smtpSettings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTestResult: (state) => {
      state.testResult = null;
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
      // Fetch SMTP settings
      .addCase(fetchSMTPSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSMTPSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(fetchSMTPSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update SMTP settings
      .addCase(updateSMTPSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSMTPSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(updateSMTPSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Test SMTP connection
      .addCase(testSMTPConnection.pending, (state) => {
        state.isTesting = true;
        state.error = null;
        state.testResult = null;
      })
      .addCase(testSMTPConnection.fulfilled, (state, action) => {
        state.isTesting = false;
        state.testResult = {
          success: true,
          message: action.payload.message,
          details: action.payload.details
        };
        state.error = null;
      })
      .addCase(testSMTPConnection.rejected, (state, action) => {
        state.isTesting = false;
        state.testResult = {
          success: false,
          message: action.payload
        };
        state.error = action.payload;
      });
  },
});

export const { clearError, clearTestResult, updateSettingsField } = smtpSettingsSlice.actions;
export default smtpSettingsSlice.reducer;
