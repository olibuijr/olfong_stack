import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (timeRange = '30d', { rejectWithValue }) => {
    try {
      // For now, return mock data since the backend routes are not fully implemented
      // This prevents the route not found errors
      const mockData = {
        metrics: {
          revenue: {
            current: 0,
            previous: 0,
            growth: 0
          },
          orders: {
            current: 0,
            previous: 0,
            growth: 0
          },
          customers: {
            current: 0,
            previous: 0,
            growth: 0
          },
          products: {
            current: 0,
            previous: 0,
            growth: 0
          }
        },
        orderStatusDistribution: [],
        topProducts: [],
        timeRange,
        period: {
          current: {
            start: null,
            end: null
          },
          previous: {
            start: null,
            end: null
          }
        }
      };
      
      return mockData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics data');
    }
  }
);

export const fetchRevenueTrend = createAsyncThunk(
  'analytics/fetchRevenueTrend',
  async (timeRange = '30d', { rejectWithValue }) => {
    try {
      const response = await api.get(`/analytics/revenue-trend?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue trend data');
    }
  }
);

const initialState = {
  metrics: {
    revenue: {
      current: 0,
      previous: 0,
      growth: 0
    },
    orders: {
      current: 0,
      previous: 0,
      growth: 0
    },
    customers: {
      current: 0,
      previous: 0,
      growth: 0
    },
    products: {
      current: 0,
      previous: 0,
      growth: 0
    }
  },
  orderStatusDistribution: [],
  topProducts: [],
  revenueTrend: [],
  timeRange: '30d',
  period: {
    current: {
      start: null,
      end: null
    },
    previous: {
      start: null,
      end: null
    }
  },
  isLoading: false,
  error: null
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload.metrics;
        state.orderStatusDistribution = action.payload.orderStatusDistribution;
        state.topProducts = action.payload.topProducts;
        state.timeRange = action.payload.timeRange;
        state.period = action.payload.period;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Revenue Trend
      .addCase(fetchRevenueTrend.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenueTrend.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenueTrend = action.payload.revenueTrend;
      })
      .addCase(fetchRevenueTrend.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setTimeRange } = analyticsSlice.actions;
export default analyticsSlice.reducer;
