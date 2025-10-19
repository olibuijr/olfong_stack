const axios = require('axios');
const crypto = require('crypto');

class ValitorService {
  constructor(config) {
    this.merchantId = config.merchantId;
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.environment = config.environment || 'sandbox';
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.valitor.com' 
      : 'https://api-sandbox.valitor.com';
  }

  /**
   * Generate authentication signature for Valitor API
   */
  generateSignature(method, url, body, timestamp) {
    const message = `${method}${url}${body || ''}${timestamp}`;
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex');
  }

  /**
   * Make authenticated request to Valitor API
   */
  async makeRequest(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = data ? JSON.stringify(data) : '';
    const signature = this.generateSignature(method, endpoint, body, timestamp);

    const headers = {
      'Content-Type': 'application/json',
      'X-Valitor-Merchant-Id': this.merchantId,
      'X-Valitor-API-Key': this.apiKey,
      'X-Valitor-Timestamp': timestamp,
      'X-Valitor-Signature': signature,
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
      console.error('Valitor API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message },
        status: error.response?.status || 500,
      };
    }
  }

  /**
   * Create a payment session
   */
  async createPaymentSession(paymentData) {
    const {
      amount,
      currency = 'ISK',
      orderId,
      customerEmail,
      customerPhone,
      returnUrl,
      cancelUrl,
      description,
    } = paymentData;

    const sessionData = {
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency: currency.toUpperCase(),
      merchant_reference: orderId,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      description: description || `Order ${orderId}`,
      payment_methods: ['card'], // Valitor supports card payments
    };

    return await this.makeRequest('POST', '/v1/payments/sessions', sessionData);
  }

  /**
   * Get payment session status
   */
  async getPaymentSession(sessionId) {
    return await this.makeRequest('GET', `/v1/payments/sessions/${sessionId}`);
  }

  /**
   * Capture a payment
   */
  async capturePayment(paymentId, amount = null) {
    const data = amount ? { amount: Math.round(amount * 100) } : {};
    return await this.makeRequest('POST', `/v1/payments/${paymentId}/capture`, data);
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId, amount = null, reason = null) {
    const data = {
      amount: amount ? Math.round(amount * 100) : null,
      reason: reason || 'Refund requested',
    };
    return await this.makeRequest('POST', `/v1/payments/${paymentId}/refund`, data);
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId) {
    return await this.makeRequest('GET', `/v1/payments/${paymentId}`);
  }

  /**
   * List payments with filters
   */
  async listPayments(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.merchantReference) queryParams.append('merchant_reference', filters.merchantReference);
    if (filters.fromDate) queryParams.append('from_date', filters.fromDate);
    if (filters.toDate) queryParams.append('to_date', filters.toDate);

    const endpoint = `/v1/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest('GET', endpoint);
  }

  /**
   * Test connection to Valitor API
   */
  async testConnection() {
    try {
      // Try to get merchant info or make a simple API call
      const response = await this.makeRequest('GET', '/v1/merchant/info');
      
      if (response.success) {
        return {
          success: true,
          message: 'Valitor connection successful',
          data: {
            merchantId: this.merchantId,
            environment: this.environment,
            status: 'connected'
          }
        };
      } else {
        return {
          success: false,
          message: 'Valitor connection failed',
          error: response.error
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Valitor connection test failed',
        error: error.message
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature, timestamp) {
    const expectedSignature = this.generateSignature('POST', '/webhook', payload, timestamp);
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
          paymentId: event.payment_id,
          orderId: event.merchant_reference,
          status: event.status,
          amount: event.amount / 100, // Convert back from smallest currency unit
          currency: event.currency,
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
   * Get supported currencies
   */
  getSupportedCurrencies() {
    return [
      'ISK', // Icelandic Króna
      'EUR', // Euro
      'USD', // US Dollar
      'GBP', // British Pound
      'DKK', // Danish Krone
      'NOK', // Norwegian Krone
      'SEK', // Swedish Krona
    ];
  }

  /**
   * Get supported countries
   */
  getSupportedCountries() {
    return [
      'IS', // Iceland
      'DK', // Denmark
      'NO', // Norway
      'SE', // Sweden
      'FI', // Finland
      'DE', // Germany
      'FR', // France
      'GB', // United Kingdom
      'US', // United States
    ];
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods() {
    return [
      'card', // Credit/Debit cards
      'visa',
      'mastercard',
      'amex',
      'diners',
      'jcb'
    ];
  }
}

module.exports = ValitorService;