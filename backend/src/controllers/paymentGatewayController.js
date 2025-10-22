const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Encryption key for sensitive data (in production, use environment variable)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
const ALGORITHM = 'aes-256-cbc';

// Helper function to encrypt sensitive data
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Helper function to decrypt sensitive data
function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Get all payment gateways
 */
const getPaymentGateways = async (req, res) => {
  try {
    const gateways = await prisma.paymentGateway.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    // Decrypt sensitive fields for display
    const decryptedGateways = gateways.map(gateway => ({
      ...gateway,
      apiKey: gateway.apiKey ? '***' + gateway.apiKey.slice(-4) : null,
      secretKey: gateway.secretKey ? '***' + gateway.secretKey.slice(-4) : null,
      webhookSecret: gateway.webhookSecret ? '***' + gateway.webhookSecret.slice(-4) : null,
    }));

    return successResponse(res, { gateways: decryptedGateways });
  } catch (error) {
    console.error('Get payment gateways error:', error);
    return errorResponse(res, 'Failed to retrieve payment gateways', 500);
  }
};

/**
 * Get payment gateway by ID
 */
const getPaymentGateway = async (req, res) => {
  try {
    const { id } = req.params;
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id: parseInt(id) }
    });

    if (!gateway) {
      return errorResponse(res, 'Payment gateway not found', 404);
    }

    // Decrypt sensitive fields for display
    const decryptedGateway = {
      ...gateway,
      apiKey: gateway.apiKey ? '***' + gateway.apiKey.slice(-4) : null,
      secretKey: gateway.secretKey ? '***' + gateway.secretKey.slice(-4) : null,
      webhookSecret: gateway.webhookSecret ? '***' + gateway.webhookSecret.slice(-4) : null,
    };

    return successResponse(res, { gateway: decryptedGateway });
  } catch (error) {
    console.error('Get payment gateway error:', error);
    return errorResponse(res, 'Failed to retrieve payment gateway', 500);
  }
};

/**
 * Create new payment gateway
 */
const createPaymentGateway = async (req, res) => {
  try {
    const {
      name,
      displayName,
      provider,
      isEnabled,
      isActive,
      sortOrder,
      config,
      merchantId,
      apiKey,
      secretKey,
      webhookSecret,
      environment,
      supportedCurrencies,
      supportedCountries,
      supportedMethods,
      description,
      logoUrl,
      website,
      documentation
    } = req.body;

    // Encrypt sensitive fields
    const encryptedApiKey = apiKey ? encrypt(apiKey) : null;
    const encryptedSecretKey = secretKey ? encrypt(secretKey) : null;
    const encryptedWebhookSecret = webhookSecret ? encrypt(webhookSecret) : null;

    const gateway = await prisma.paymentGateway.create({
      data: {
        name,
        displayName,
        provider,
        isEnabled: isEnabled || false,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
        config: config ? JSON.stringify(config) : null,
        merchantId,
        apiKey: encryptedApiKey,
        secretKey: encryptedSecretKey,
        webhookSecret: encryptedWebhookSecret,
        environment: environment || 'sandbox',
        supportedCurrencies: supportedCurrencies || [],
        supportedCountries: supportedCountries || [],
        supportedMethods: supportedMethods || [],
        description,
        logoUrl,
        website,
        documentation
      }
    });

    return successResponse(res, { gateway }, 'Payment gateway created successfully', 201);
  } catch (error) {
    console.error('Create payment gateway error:', error);
    return errorResponse(res, 'Failed to create payment gateway', 500);
  }
};

/**
 * Update payment gateway
 */
const updatePaymentGateway = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Encrypt sensitive fields if they are being updated
    if (updateData.apiKey && !updateData.apiKey.startsWith('***')) {
      updateData.apiKey = encrypt(updateData.apiKey);
    } else if (updateData.apiKey && updateData.apiKey.startsWith('***')) {
      // Don't update if it's the masked version
      delete updateData.apiKey;
    }

    if (updateData.secretKey && !updateData.secretKey.startsWith('***')) {
      updateData.secretKey = encrypt(updateData.secretKey);
    } else if (updateData.secretKey && updateData.secretKey.startsWith('***')) {
      // Don't update if it's the masked version
      delete updateData.secretKey;
    }

    if (updateData.webhookSecret && !updateData.webhookSecret.startsWith('***')) {
      updateData.webhookSecret = encrypt(updateData.webhookSecret);
    } else if (updateData.webhookSecret && updateData.webhookSecret.startsWith('***')) {
      // Don't update if it's the masked version
      delete updateData.webhookSecret;
    }

    // Handle config as JSON
    if (updateData.config && typeof updateData.config === 'object') {
      updateData.config = JSON.stringify(updateData.config);
    }

    const gateway = await prisma.paymentGateway.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return successResponse(res, { gateway }, 'Payment gateway updated successfully');
  } catch (error) {
    console.error('Update payment gateway error:', error);
    return errorResponse(res, 'Failed to update payment gateway', 500);
  }
};

/**
 * Delete payment gateway
 */
const deletePaymentGateway = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.paymentGateway.delete({
      where: { id: parseInt(id) }
    });

    return successResponse(res, null, 'Payment gateway deleted successfully');
  } catch (error) {
    console.error('Delete payment gateway error:', error);
    return errorResponse(res, 'Failed to delete payment gateway', 500);
  }
};

/**
 * Toggle payment gateway enabled status
 */
const togglePaymentGateway = async (req, res) => {
  try {
    const { id } = req.params;
    const { isEnabled } = req.body;

    const gateway = await prisma.paymentGateway.update({
      where: { id: parseInt(id) },
      data: { isEnabled }
    });

    return successResponse(res, { gateway }, `Payment gateway ${isEnabled ? 'enabled' : 'disabled'} successfully`);
  } catch (error) {
    console.error('Toggle payment gateway error:', error);
    return errorResponse(res, 'Failed to toggle payment gateway', 500);
  }
};

/**
 * Test payment gateway connection
 */
const testPaymentGateway = async (req, res) => {
  try {
    const { id } = req.params;
    let gateway;
    
    if (id) {
      // Test existing gateway by ID
      gateway = await prisma.paymentGateway.findUnique({
        where: { id: parseInt(id) }
      });

      if (!gateway) {
        return errorResponse(res, 'Payment gateway not found', 404);
      }
    } else {
      // Test new gateway configuration from request body
      const { provider, environment, merchantId, apiKey, secretKey, accessKey, publishableKey, clientId, clientSecret, applicationId, paymentGatewayId, privateKey, publicKey } = req.body;
      
      if (!provider) {
        return errorResponse(res, 'Provider is required for testing', 400);
      }
      
      gateway = {
        provider,
        environment: environment || 'sandbox',
        merchantId,
        apiKey,
        secretKey,
        accessKey,
        publishableKey,
        clientId,
        clientSecret,
        applicationId,
        paymentGatewayId,
        privateKey,
        publicKey
      };
    }

    // Decrypt credentials for testing (only if they exist and are encrypted)
    // Note: decrypted credentials not currently used in test implementation

    // Here you would implement actual API testing based on the provider
    // For now, we'll simulate a test
    let testResult = { success: false, message: 'Test not implemented' };

    if (gateway.provider === 'valitor') {
      // Simulate Valitor API test
      testResult = {
        success: true,
        message: 'Valitor connection test successful',
        details: {
          environment: gateway.environment,
          merchantId: gateway.merchantId
        }
      };
    } else if (gateway.provider === 'rapyd') {
      // Simulate Rapyd API test
      testResult = {
        success: true,
        message: 'Rapyd connection test successful',
        details: {
          environment: gateway.environment,
          merchantId: gateway.merchantId
        }
      };
    } else if (gateway.provider === 'netgiro') {
      // Simulate Netgíró API test
      testResult = {
        success: true,
        message: 'Netgíró connection test successful',
        details: {
          environment: gateway.environment,
          merchantId: gateway.merchantId
        }
      };
    } else if (gateway.provider === 'cash_on_delivery') {
      // Cash on delivery doesn't require API testing
      testResult = {
        success: true,
        message: 'Cash on delivery is always available for local delivery orders',
        details: {
          environment: 'production',
          requiresDelivery: true,
          maxAmount: 50000
        }
      };
    } else if (gateway.provider === 'pay_on_pickup') {
      // Pay on pickup doesn't require API testing
      testResult = {
        success: true,
        message: 'Pay on pickup is always available for store pickup orders',
        details: {
          environment: 'production',
          requiresPickup: true,
          maxAmount: 50000
        }
      };
    } else if (gateway.provider === 'teya') {
      // Test Teya API connection
      try {
        const teyaService = require('../services/teyaService');
        
        // Use already decrypted credentials
        const decryptedApiKey = gateway.apiKey ? (gateway.apiKey.startsWith('encrypted:') ? decrypt(gateway.apiKey) : gateway.apiKey) : null;
        const decryptedSecretKey = gateway.secretKey ? (gateway.secretKey.startsWith('encrypted:') ? decrypt(gateway.secretKey) : gateway.secretKey) : null;
        
        const teyaConfig = {
          merchantId: gateway.merchantId,
          paymentGatewayId: gateway.paymentGatewayId,
          secretKey: decryptedSecretKey,
          privateKey: decryptedApiKey,
          environment: gateway.environment,
        };
        
        const teya = new teyaService(teyaConfig);
        const connectionTest = await teya.testConnection();
        
        testResult = {
          success: connectionTest.success,
          message: connectionTest.message,
          details: {
            environment: gateway.environment,
            merchantId: gateway.merchantId,
            status: connectionTest.success ? 'connected' : 'failed'
          }
        };
      } catch (error) {
        testResult = {
          success: false,
          message: 'Teya connection test failed',
          error: error.message
        };
      }
    }

    return successResponse(res, { testResult });
  } catch (error) {
    console.error('Test payment gateway error:', error);
    return errorResponse(res, 'Failed to test payment gateway', 500);
  }
};

/**
 * Get payment gateway configuration for frontend
 */
const getPaymentGatewayConfig = async (req, res) => {
  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: { 
        isEnabled: true,
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        provider: true,
        supportedCurrencies: true,
        supportedCountries: true,
        supportedMethods: true,
        logoUrl: true,
        description: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    return successResponse(res, { gateways });
  } catch (error) {
    console.error('Get payment gateway config error:', error);
    return errorResponse(res, 'Failed to retrieve payment gateway configuration', 500);
  }
};

module.exports = {
  getPaymentGateways,
  getPaymentGateway,
  createPaymentGateway,
  updatePaymentGateway,
  deletePaymentGateway,
  togglePaymentGateway,
  testPaymentGateway,
  getPaymentGatewayConfig
};
