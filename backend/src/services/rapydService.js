const axios = require('axios');
const crypto = require('crypto');

class RapydService {
  constructor(config) {
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.environment = config.environment || 'sandbox';
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.rapyd.net' 
      : 'https://sandboxapi.rapyd.net';
  }

  /**
   * Generate Rapyd signature for API authentication
   */
  generateSignature(method, url, body, salt, timestamp) {
    const toSign = method.toLowerCase() + url + salt + timestamp + this.accessKey + this.secretKey + (body || '');
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(toSign)
      .digest('hex');
  }

  /**
   * Make authenticated request to Rapyd API
   */
  async makeRequest(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const salt = crypto.randomBytes(12).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = data ? JSON.stringify(data) : '';
    const signature = this.generateSignature(method, endpoint, body, salt, timestamp);

    const headers = {
      'Content-Type': 'application/json',
      'access_key': this.accessKey,
      'salt': salt,
      'timestamp': timestamp,
      'signature': signature,
    };

    try {
      const response = await axios({
        method,
        url,
        data: data ? JSON.stringify(data) : undefined,
        headers,
      });

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error('Rapyd API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message },
        status: error.response?.status || 500,
      };
    }
  }

  /**
   * Create a payment
   */
  async createPayment(paymentData) {
    const {
      amount,
      currency = 'ISK',
      orderId,
      customerEmail,
      customerPhone,
      customerName,
      description,
      returnUrl,
      cancelUrl,
      paymentMethod = 'card',
      country = 'IS',
    } = paymentData;

    const paymentData_rapyd = {
      amount: amount,
      currency: currency.toUpperCase(),
      merchant_reference_id: orderId,
      customer: {
        email: customerEmail,
        phone_number: customerPhone,
        name: customerName,
      },
      payment_method: {
        type: paymentMethod,
        fields: {
          number: '', // Will be filled by customer
          expiration_month: '',
          expiration_year: '',
          cvv: '',
          name: customerName,
        }
      },
      description: description || `Order ${orderId}`,
      complete_payment_url: returnUrl,
      error_payment_url: cancelUrl,
      country: country,
      language: 'en',
    };

    return await this.makeRequest('POST', '/v1/payments', paymentData_rapyd);
  }

  /**
   * Create a checkout page
   */
  async createCheckoutPage(paymentData) {
    const {
      amount,
      currency = 'ISK',
      orderId,
      customerEmail,
      customerPhone,
      customerName,
      description,
      returnUrl,
      cancelUrl,
      country = 'IS',
    } = paymentData;

    const checkoutData = {
      amount: amount,
      currency: currency.toUpperCase(),
      merchant_reference_id: orderId,
      customer: {
        email: customerEmail,
        phone_number: customerPhone,
        name: customerName,
      },
      description: description || `Order ${orderId}`,
      complete_payment_url: returnUrl,
      error_payment_url: cancelUrl,
      country: country,
      language: 'en',
      payment_method_types: ['card', 'bank_transfer', 'ewallet'],
    };

    return await this.makeRequest('POST', '/v1/checkout', checkoutData);
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId) {
    return await this.makeRequest('GET', `/v1/payments/${paymentId}`);
  }

  /**
   * Capture a payment
   */
  async capturePayment(paymentId, amount = null) {
    const data = amount ? { amount: amount } : {};
    return await this.makeRequest('POST', `/v1/payments/${paymentId}/capture`, data);
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId, amount = null, reason = null) {
    const data = {
      amount: amount,
      reason: reason || 'Refund requested',
    };
    return await this.makeRequest('POST', `/v1/payments/${paymentId}/refund`, data);
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(paymentId) {
    return await this.makeRequest('POST', `/v1/payments/${paymentId}/cancel`);
  }

  /**
   * List payments with filters
   */
  async listPayments(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.merchantReferenceId) queryParams.append('merchant_reference_id', filters.merchantReferenceId);
    if (filters.fromDate) queryParams.append('from_date', filters.fromDate);
    if (filters.toDate) queryParams.append('to_date', filters.toDate);

    const endpoint = `/v1/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest('GET', endpoint);
  }

  /**
   * Get available payment methods for a country
   */
  async getPaymentMethods(country = 'IS') {
    return await this.makeRequest('GET', `/v1/payment_methods/country?country=${country}`);
  }

  /**
   * Get supported countries
   */
  async getSupportedCountries() {
    return await this.makeRequest('GET', '/v1/data/countries');
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies() {
    return await this.makeRequest('GET', '/v1/data/currencies');
  }

  /**
   * Test connection to Rapyd API
   */
  async testConnection() {
    try {
      // Try to get account info or make a simple API call
      const response = await this.makeRequest('GET', '/v1/account');
      
      if (response.success) {
        return {
          success: true,
          message: 'Rapyd connection successful',
          data: {
            accessKey: this.accessKey,
            environment: this.environment,
            status: 'connected'
          }
        };
      } else {
        return {
          success: false,
          message: 'Rapyd connection failed',
          error: response.error
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Rapyd connection test failed',
        error: error.message
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature, timestamp) {
    const salt = crypto.randomBytes(12).toString('hex');
    const expectedSignature = this.generateSignature('POST', '/webhook', payload, salt, timestamp);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Process webhook event
   */
  processWebhook(payload) {
    try {
      const event = JSON.parse(payload);
      
      return {
        success: true,
        event: {
          type: event.type,
          paymentId: event.data?.id,
          orderId: event.data?.merchant_reference_id,
          status: event.data?.status,
          amount: event.data?.amount,
          currency: event.data?.currency,
          timestamp: event.timestamp,
          data: event
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid webhook payload',
        message: error.message
      };
    }
   }

  /**
   * Get supported payment methods (static list for quick reference)
   */
  getSupportedPaymentMethods() {
    return [
      'card', // Credit/Debit cards
      'bank_transfer', // Bank transfer
      'ewallet', // E-wallet
      'cash', // Cash payments
      'visa',
      'mastercard',
      'amex',
      'diners',
      'jcb',
      'discover',
      'paypal',
      'apple_pay',
      'google_pay',
      'alipay',
      'wechat_pay',
      'klarna',
      'afterpay',
      'sepa',
      'ideal',
      'sofort',
      'giropay',
      'eps',
      'bancontact',
      'p24',
      'blik',
    ];
  }
}

module.exports = RapydService;
