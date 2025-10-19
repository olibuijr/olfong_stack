import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import socketService from '../../services/socket';
import toast from 'react-hot-toast';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      // Store token
      localStorage.setItem('token', response.data.token);
      
      // Connect socket and join user room
      socketService.connect();
      socketService.joinUserRoom(response.data.user.id);
      
      toast.success('Skráðir inn');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Innskráning mistókst');
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const kenniLogin = createAsyncThunk(
  'auth/kenniLogin',
  async ({ idToken }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/kenni/login', { idToken });

      localStorage.setItem('token', response.data.token);
      socketService.connect();
      socketService.joinUserRoom(response.data.user.id);
      toast.success('Innskráður með Kenni');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kenni innskráning mistókst');
      return rejectWithValue(error.response?.data?.message || 'Kenni login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Store token
      localStorage.setItem('token', response.data.token);
      
      // Connect socket and join user room
      socketService.connect();
      socketService.joinUserRoom(response.data.user.id);
      
      toast.success('Nýskráning tókst');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Nýskráning mistókst');
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile');
      return response.data; // The API interceptor already unwraps the response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      toast.success('Prófíll uppfærður');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mistókst að uppfæra prófíll');
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false, // Always start as false to trigger getProfile
  isLoading: !!localStorage.getItem('token'), // Set loading if token exists
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Disconnect socket
      socketService.disconnect();
      
      toast.success('Útskráður');
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Kenni Login
      .addCase(kenniLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(kenniLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(kenniLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // If profile fetch fails due to invalid token, clear auth state
        if (action.payload?.includes('token') || action.payload?.includes('401') || action.payload?.includes('Invalid')) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem('token');
        }
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload };
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;

