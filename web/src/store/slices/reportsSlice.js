import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async ({ reportType, timeRange, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      let response;
      switch (reportType) {
        case 'sales':
          response = await api.get(`/reports/sales?${params}`);
          return { sales: response.data?.data || response.data };
        case 'products':
          response = await api.get(`/reports/inventory?${params}`);
          return { products: response.data?.data || response.data };
        case 'customers':
          response = await api.get(`/reports/customers?${params}`);
          return { customers: response.data?.data || response.data };
        case 'orders':
          // For orders, we'll use the analytics endpoint since it has order status distribution
          response = await api.get(`/analytics?timeRange=${timeRange}`);
          return { orders: response.data?.data || response.data };
        default:
          return {};
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports data');
    }
  }
);

export const fetchSalesReport = createAsyncThunk(
  'reports/fetchSalesReport',
  async ({ timeRange, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await api.get(`/reports/sales?${params}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales report');
    }
  }
);

export const fetchProductsReport = createAsyncThunk(
  'reports/fetchProductsReport',
  async ({ timeRange, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await api.get(`/reports/products?${params}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products report');
    }
  }
);

export const fetchCustomersReport = createAsyncThunk(
  'reports/fetchCustomersReport',
  async ({ timeRange, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await api.get(`/reports/customers?${params}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers report');
    }
  }
);

export const fetchOrdersReport = createAsyncThunk(
  'reports/fetchOrdersReport',
  async ({ timeRange, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await api.get(`/reports/orders?${params}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders report');
    }
  }
);

const initialState = {
  sales: {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    growthRate: 0,
    dailySales: []
  },
  products: {
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    topSelling: [],
    categoryBreakdown: []
  },
  customers: {
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    averageOrderFrequency: 0,
    customerSegments: [],
    topCustomers: []
  },
  orders: {
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    averageProcessingTime: 0,
    deliveryMethods: [],
    orderStatusTrend: []
  },
  currentReport: 'sales',
  timeRange: 'last30days',
  dateRange: {
    start: null,
    end: null
  },
  isLoading: false,
  error: null
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentReport: (state, action) => {
      state.currentReport = action.payload;
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reports
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        const { sales, products, customers, orders } = action.payload;
        if (sales) state.sales = sales;
        if (products) state.products = products;
        if (customers) state.customers = customers;
        if (orders) state.orders = orders;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Sales Report
      .addCase(fetchSalesReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Products Report
      .addCase(fetchProductsReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProductsReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Customers Report
      .addCase(fetchCustomersReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomersReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomersReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Orders Report
      .addCase(fetchOrdersReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrdersReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrdersReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentReport, setTimeRange, setDateRange } = reportsSlice.actions;
export default reportsSlice.reducer;
