const axios = require('axios');
class DkService {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://api.dk.com';
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.companyId = config.companyId;
    this.username = config.username;
    this.password = config.password;
    this.environment = config.environment || 'sandbox';
    
    // Set up axios instance
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.apiKey) {
          config.headers['X-API-Key'] = this.apiKey;
        }
        if (this.secretKey) {
          config.headers['X-Secret-Key'] = this.secretKey;
        }
        if (this.companyId) {
          config.headers['X-Company-Id'] = this.companyId;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('DK API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Test the connection to DK API
   */
  async testConnection() {
    try {
      const response = await this.client.get('/api/health');
      return {
        success: true,
        message: 'Connection successful',
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Connection failed',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Authenticate with DK API
   */
  async authenticate() {
    try {
      const response = await this.client.post('/api/auth/login', {
        username: this.username,
        password: this.password,
        companyId: this.companyId
      });
      
      return {
        success: true,
        token: response.data.token,
        expiresIn: response.data.expiresIn
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Authentication failed',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get company information
   */
  async getCompanyInfo() {
    try {
      const response = await this.client.get('/api/company');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get company info',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Sync products from DK
   */
  async syncProducts(options = {}) {
    try {
      const params = {
        limit: options.limit || 100,
        offset: options.offset || 0,
        lastSync: options.lastSync || null
      };

      const response = await this.client.get('/api/products', { params });
      
      return {
        success: true,
        data: response.data.products || [],
        total: response.data.total || 0,
        hasMore: response.data.hasMore || false
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to sync products',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Sync customers from DK
   */
  async syncCustomers(options = {}) {
    try {
      const params = {
        limit: options.limit || 100,
        offset: options.offset || 0,
        lastSync: options.lastSync || null
      };

      const response = await this.client.get('/api/customers', { params });
      
      return {
        success: true,
        data: response.data.customers || [],
        total: response.data.total || 0,
        hasMore: response.data.hasMore || false
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to sync customers',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Sync orders to DK
   */
  async syncOrder(orderData) {
    try {
      const response = await this.client.post('/api/orders', orderData);
      
      return {
        success: true,
        data: response.data,
        dkOrderId: response.data.id
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to sync order',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get order status from DK
   */
  async getOrderStatus(dkOrderId) {
    try {
      const response = await this.client.get(`/api/orders/${dkOrderId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get order status',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update order status in DK
   */
  async updateOrderStatus(dkOrderId, status, notes = '') {
    try {
      const response = await this.client.patch(`/api/orders/${dkOrderId}`, {
        status,
        notes
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update order status',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Sync inventory levels
   */
  async syncInventory(productIds = []) {
    try {
      const params = productIds.length > 0 ? { productIds: productIds.join(',') } : {};
      const response = await this.client.get('/api/inventory', { params });
      
      return {
        success: true,
        data: response.data.inventory || [],
        total: response.data.total || 0
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to sync inventory',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get financial reports
   */
  async getFinancialReports(options = {}) {
    try {
      const params = {
        startDate: options.startDate,
        endDate: options.endDate,
        reportType: options.reportType || 'sales'
      };

      const response = await this.client.get('/api/reports/financial', { params });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get financial reports',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    const errors = [];

    if (!this.baseUrl) {
      errors.push('Base URL is required');
    }

    if (!this.apiKey && !this.username) {
      errors.push('Either API key or username is required');
    }

    if (this.username && !this.password) {
      errors.push('Password is required when using username authentication');
    }

    if (!this.companyId) {
      errors.push('Company ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get integration status
   */
  async getStatus() {
    try {
      const connectionTest = await this.testConnection();
      const configValidation = this.validateConfig();

      return {
        isConnected: connectionTest.success,
        isConfigured: configValidation.isValid,
        lastSync: null, // This would be stored in the database
        errors: configValidation.errors,
        connectionError: connectionTest.success ? null : connectionTest.message
      };
    } catch (error) {
      return {
        isConnected: false,
        isConfigured: false,
        lastSync: null,
        errors: ['Failed to check status'],
        connectionError: error.message
      };
    }
  }
}

module.exports = DkService;
















