const axios = require('axios');
const crypto = require('crypto');

class TeyaService {
  constructor(config) {
    this.merchantId = config.merchantId;
    this.paymentGatewayId = config.paymentGatewayId;
    this.secretKey = config.secretKey;
    this.privateKey = config.privateKey;
    this.environment = config.environment || 'sandbox';
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.teya.com' 
      : 'https://api-sandbox.teya.com';
  }

  /**
   * Generate Teya signature for API authentication
   * Based on Teya's SecurePay API documentation
   */
  generateSignature(data, secretKey) {
    // Sort the data by keys and create a query string
    const sortedKeys = Object.keys(data).sort();
    const queryString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    // Add the secret key
    const stringToSign = queryString + secretKey;
    
    // Generate MD5 hash
    return crypto
      .createHash('md5')
      .update(stringToSign, 'utf8')
      .digest('hex')
      .toUpperCase();
  }

  /**
   * Make authenticated request to Teya API
   */
  async makeRequest(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Add common parameters for Teya API
    const requestData = {
      ...data,
      MerchantId: this.merchantId,
      PaymentGatewayId: this.paymentGatewayId,
    };

    // Generate signature
    const signature = this.generateSignature(requestData, this.secretKey);
    requestData.Signature = signature;

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Olfong-Stack/1.0',
    };

    try {
      const response = await axios({
        method,
        url,
        data: new URLSearchParams(requestData).toString(),
        headers,
      });

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error('Teya API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message },
        status: error.response?.status || 500,
      };
    }
  }

  /**
   * Create a payment session using Teya SecurePay
   */
  async createPaymentSession(paymentData) {
    const {
      amount,
      currency = 'ISK',
      orderId,
      customerEmail,
      customerPhone,
      customerName,
      returnUrl,
      cancelUrl,
      description,
    } = paymentData;

    // Convert amount to smallest currency unit (ISK doesn't have decimals)
    const amountInCents = Math.round(amount);

    const sessionData = {
      Amount: amountInCents,
      Currency: currency.toUpperCase(),
      Reference: orderId,
      CustomerEmail: customerEmail,
      CustomerPhone: customerPhone,
      CustomerName: customerName,
      RedirectSuccess: returnUrl,
      RedirectSuccessServer: returnUrl,
      RedirectCancel: cancelUrl,
      RedirectCancelServer: cancelUrl,
      Description: description || `Order ${orderId}`,
      Language: 'en',
    };

    return await this.makeRequest('POST', '/SecurePay/StartPayment', sessionData);
  }

  /**
   * Create a payment using Teya RPG (RESTful Payment Gateway)
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
      cardNumber,
      cardExpiryMonth,
      cardExpiryYear,
      cardCvv,
    } = paymentData;

    const paymentData_teya = {
      amount: amount,
      currency: currency.toUpperCase(),
      reference: orderId,
      customer: {
        email: customerEmail,
        phone: customerPhone,
        name: customerName,
      },
      card: {
        number: cardNumber,
        expiry_month: cardExpiryMonth,
        expiry_year: cardExpiryYear,
        cvv: cardCvv,
      },
      description: description || `Order ${orderId}`,
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.privateKey}`,
      'User-Agent': 'Olfong-Stack/1.0',
    };

    try {
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/v1/payments`,
        data: paymentData_teya,
        headers,
      });

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error('Teya RPG API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message },
        status: error.response?.status || 500,
      };
    }
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId) {
    return await this.makeRequest('GET', `/SecurePay/GetPayment/${paymentId}`);
  }

  /**
   * Capture a payment
   */
  async capturePayment(paymentId, amount = null) {
    const data = amount ? { Amount: Math.round(amount) } : {};
    return await this.makeRequest('POST', `/SecurePay/CapturePayment/${paymentId}`, data);
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId, amount = null, reason = null) {
    const data = {
      Amount: amount ? Math.round(amount) : null,
      Reason: reason || 'Refund requested',
    };
    return await this.makeRequest('POST', `/SecurePay/RefundPayment/${paymentId}`, data);
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(paymentId) {
    return await this.makeRequest('POST', `/SecurePay/CancelPayment/${paymentId}`);
  }

  /**
   * List payments with filters
   */
  async listPayments(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.reference) queryParams.append('reference', filters.reference);
    if (filters.fromDate) queryParams.append('from_date', filters.fromDate);
    if (filters.toDate) queryParams.append('to_date', filters.toDate);

    const endpoint = `/SecurePay/ListPayments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest('GET', endpoint);
  }

  /**
   * Test connection to Teya API
   */
  async testConnection() {
    try {
      // Try to get merchant info or make a simple API call
      const response = await this.makeRequest('GET', '/SecurePay/GetMerchantInfo');
      
      if (response.success) {
        return {
          success: true,
          message: 'Teya connection successful',
          data: {
            merchantId: this.merchantId,
            paymentGatewayId: this.paymentGatewayId,
            environment: this.environment,
            status: 'connected'
          }
        };
      } else {
        return {
          success: false,
          message: 'Teya connection failed',
          error: response.error
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Teya connection test failed',
        error: error.message
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    const expectedSignature = this.generateSignature(payload, this.secretKey);
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
      const event = typeof payload === 'string' ? JSON.parse(payload) : payload;
      
      return {
        success: true,
        event: {
          type: event.type || 'payment_update',
          paymentId: event.paymentId || event.PaymentId,
          orderId: event.reference || event.Reference,
          status: event.status || event.Status,
          amount: event.amount || event.Amount,
          currency: event.currency || event.Currency,
          timestamp: event.timestamp || event.Timestamp,
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
      'CHF', // Swiss Franc
      'CAD', // Canadian Dollar
      'AUD', // Australian Dollar
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
      'CA', // Canada
      'AU', // Australia
      'CH', // Switzerland
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
      'jcb',
      'discover',
      'maestro',
      'visa_electron',
      'bank_transfer', // Bank transfer
      'sepa', // SEPA direct debit
      'klarna', // Klarna
      'afterpay', // Afterpay
      'paypal', // PayPal
      'apple_pay', // Apple Pay
      'google_pay', // Google Pay
    ];
  }

  /**
   * Get test card numbers for sandbox testing
   */
  getTestCards() {
    return {
      visa: {
        number: '4111111111111111',
        expiry_month: '12',
        expiry_year: '2025',
        cvv: '123',
        description: 'Visa test card - always succeeds'
      },
      mastercard: {
        number: '5555555555554444',
        expiry_month: '12',
        expiry_year: '2025',
        cvv: '123',
        description: 'Mastercard test card - always succeeds'
      },
      amex: {
        number: '378282246310005',
        expiry_month: '12',
        expiry_year: '2025',
        cvv: '1234',
        description: 'American Express test card - always succeeds'
      },
      declined: {
        number: '4000000000000002',
        expiry_month: '12',
        expiry_year: '2025',
        cvv: '123',
        description: 'Test card - always declined'
      },
      insufficient_funds: {
        number: '4000000000009995',
        expiry_month: '12',
        expiry_year: '2025',
        cvv: '123',
        description: 'Test card - insufficient funds'
      },
      expired: {
        number: '4000000000000069',
        expiry_month: '12',
        expiry_year: '2020',
        cvv: '123',
        description: 'Test card - expired card'
      },
      processing_error: {
        number: '4000000000000119',
        expiry_month: '12',
        expiry_year: '2025',
        cvv: '123',
        description: 'Test card - processing error'
      }
    };
  }
}

module.exports = TeyaService;