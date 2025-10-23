import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
);

const initialState = {
  stats: {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    productGrowth: 0,
    customerGrowth: 0
  },
  recentOrders: [],
  orderStatusCounts: {
    pending: 0,
    confirmed: 0,
    preparing: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0
  },
  topProducts: [],
  isLoading: false,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.recentOrders.find(order => order.id === orderId);
      if (order) {
        order.status = status;
      }
      
      // Update order status counts
      if (status === 'delivered') {
        state.orderStatusCounts.delivered += 1;
        state.orderStatusCounts.pending -= 1;
      } else if (status === 'cancelled') {
        state.orderStatusCounts.cancelled += 1;
        state.orderStatusCounts.pending -= 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload.data || action.payload;
        state.stats = data.stats || initialState.stats;
        state.recentOrders = data.recentOrders || [];
        state.orderStatusCounts = data.orderStatusCounts || initialState.orderStatusCounts;
        state.topProducts = data.topProducts || [];
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, updateOrderStatus } = dashboardSlice.actions;
export default dashboardSlice.reducer;
