const { PrismaClient } = require('@prisma/client');
const UnicontaService = require('../services/unicontaService');
const DkService = require('../services/dkService');
const { successResponse, errorResponse } = require('../utils/response');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Encryption key (in production, this should be stored securely)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText2 = textParts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText2, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Get all integrations
const getIntegrations = async (req, res) => {
  try {
    const integrations = await prisma.integration.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    // Decrypt sensitive fields
    const decryptedIntegrations = integrations.map(integration => ({
      ...integration,
      apiKey: integration.apiKey ? '***' + integration.apiKey.slice(-4) : null,
      secretKey: integration.secretKey ? '***' + integration.secretKey.slice(-4) : null,
      password: integration.password ? '***' + integration.password.slice(-4) : null
    }));

    return successResponse(res, { integrations: decryptedIntegrations });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return errorResponse(res, 'Failed to fetch integrations', 500);
  }
};

// Get integration by ID
const getIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    const integration = await prisma.integration.findUnique({
      where: { id: parseInt(id) }
    });

    if (!integration) {
      return errorResponse(res, 'Integration not found', 404);
    }

    // Decrypt sensitive fields for display
    const decryptedIntegration = {
      ...integration,
      apiKey: integration.apiKey ? '***' + integration.apiKey.slice(-4) : null,
      secretKey: integration.secretKey ? '***' + integration.secretKey.slice(-4) : null,
      password: integration.password ? '***' + integration.password.slice(-4) : null
    };

    return successResponse(res, { integration: decryptedIntegration });
  } catch (error) {
    console.error('Error fetching integration:', error);
    return errorResponse(res, 'Failed to fetch integration', 500);
  }
};

// Create or update integration
const upsertIntegration = async (req, res) => {
  try {
    const { name, displayName, provider, config, apiKey, secretKey, baseUrl, environment, companyId, username, password, description } = req.body;

    // Encrypt sensitive fields
    const encryptedData = {
      name,
      displayName,
      provider,
      config: config ? JSON.stringify(config) : null,
      apiKey: apiKey ? encrypt(apiKey) : null,
      secretKey: secretKey ? encrypt(secretKey) : null,
      baseUrl,
      environment: environment || 'sandbox',
      companyId,
      username,
      password: password ? encrypt(password) : null,
      description
    };

    const integration = await prisma.integration.upsert({
      where: { name },
      update: encryptedData,
      create: encryptedData
    });

    return successResponse(res, { integration });
  } catch (error) {
    console.error('Error upserting integration:', error);
    return errorResponse(res, 'Failed to save integration', 500);
  }
};

// Update integration
const updateIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Encrypt sensitive fields if they're being updated
    if (updateData.apiKey) {
      updateData.apiKey = encrypt(updateData.apiKey);
    }
    if (updateData.secretKey) {
      updateData.secretKey = encrypt(updateData.secretKey);
    }
    if (updateData.password) {
      updateData.password = encrypt(updateData.password);
    }
    if (updateData.config) {
      updateData.config = JSON.stringify(updateData.config);
    }

    const integration = await prisma.integration.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return successResponse(res, { integration });
  } catch (error) {
    console.error('Error updating integration:', error);
    return errorResponse(res, 'Failed to update integration', 500);
  }
};

// Toggle integration enabled status
const toggleIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    const { isEnabled } = req.body;

    const integration = await prisma.integration.update({
      where: { id: parseInt(id) },
      data: { isEnabled }
    });

    return successResponse(res, { integration });
  } catch (error) {
    console.error('Error toggling integration:', error);
    return errorResponse(res, 'Failed to toggle integration', 500);
  }
};

// Test integration connection
const testIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    const integration = await prisma.integration.findUnique({
      where: { id: parseInt(id) }
    });

    if (!integration) {
      return errorResponse(res, 'Integration not found', 404);
    }

    // Decrypt credentials for testing
    const decryptedIntegration = {
      ...integration,
      apiKey: integration.apiKey ? decrypt(integration.apiKey) : null,
      secretKey: integration.secretKey ? decrypt(integration.secretKey) : null,
      password: integration.password ? decrypt(integration.password) : null
    };

    let service;
    switch (integration.provider) {
      case 'uniconta':
        service = new UnicontaService({
          baseUrl: decryptedIntegration.baseUrl,
          apiKey: decryptedIntegration.apiKey,
          secretKey: decryptedIntegration.secretKey,
          companyId: decryptedIntegration.companyId,
          username: decryptedIntegration.username,
          password: decryptedIntegration.password,
          environment: decryptedIntegration.environment
        });
        break;
      case 'dk':
        service = new DkService({
          baseUrl: decryptedIntegration.baseUrl,
          apiKey: decryptedIntegration.apiKey,
          secretKey: decryptedIntegration.secretKey,
          companyId: decryptedIntegration.companyId,
          username: decryptedIntegration.username,
          password: decryptedIntegration.password,
          environment: decryptedIntegration.environment
        });
        break;
      default:
        return errorResponse(res, 'Unsupported integration provider', 400);
    }

    const testResult = await service.testConnection();

    // Update last sync time if successful
    if (testResult.success) {
      await prisma.integration.update({
        where: { id: parseInt(id) },
        data: { 
          lastSync: new Date(),
          lastError: null
        }
      });
    } else {
      await prisma.integration.update({
        where: { id: parseInt(id) },
        data: { lastError: testResult.message }
      });
    }

    return successResponse(res, { testResult });
  } catch (error) {
    console.error('Error testing integration:', error);
    return errorResponse(res, 'Failed to test integration', 500);
  }
};

// Get integration status
const getIntegrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const integration = await prisma.integration.findUnique({
      where: { id: parseInt(id) }
    });

    if (!integration) {
      return errorResponse(res, 'Integration not found', 404);
    }

    // Decrypt credentials for status check
    const decryptedIntegration = {
      ...integration,
      apiKey: integration.apiKey ? decrypt(integration.apiKey) : null,
      secretKey: integration.secretKey ? decrypt(integration.secretKey) : null,
      password: integration.password ? decrypt(integration.password) : null
    };

    let service;
    switch (integration.provider) {
      case 'uniconta':
        service = new UnicontaService({
          baseUrl: decryptedIntegration.baseUrl,
          apiKey: decryptedIntegration.apiKey,
          secretKey: decryptedIntegration.secretKey,
          companyId: decryptedIntegration.companyId,
          username: decryptedIntegration.username,
          password: decryptedIntegration.password,
          environment: decryptedIntegration.environment
        });
        break;
      case 'dk':
        service = new DkService({
          baseUrl: decryptedIntegration.baseUrl,
          apiKey: decryptedIntegration.apiKey,
          secretKey: decryptedIntegration.secretKey,
          companyId: decryptedIntegration.companyId,
          username: decryptedIntegration.username,
          password: decryptedIntegration.password,
          environment: decryptedIntegration.environment
        });
        break;
      default:
        return errorResponse(res, 'Unsupported integration provider', 400);
    }

    const status = await service.getStatus();

    return successResponse(res, { status });
  } catch (error) {
    console.error('Error getting integration status:', error);
    return errorResponse(res, 'Failed to get integration status', 500);
  }
};

// Sync data from integration
const syncIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    const { syncType, options = {} } = req.body;

    const integration = await prisma.integration.findUnique({
      where: { id: parseInt(id) }
    });

    if (!integration) {
      return errorResponse(res, 'Integration not found', 404);
    }

    if (!integration.isEnabled) {
      return errorResponse(res, 'Integration is not enabled', 400);
    }

    // Decrypt credentials for sync
    const decryptedIntegration = {
      ...integration,
      apiKey: integration.apiKey ? decrypt(integration.apiKey) : null,
      secretKey: integration.secretKey ? decrypt(integration.secretKey) : null,
      password: integration.password ? decrypt(integration.password) : null
    };

    let service;
    switch (integration.provider) {
      case 'uniconta':
        service = new UnicontaService({
          baseUrl: decryptedIntegration.baseUrl,
          apiKey: decryptedIntegration.apiKey,
          secretKey: decryptedIntegration.secretKey,
          companyId: decryptedIntegration.companyId,
          username: decryptedIntegration.username,
          password: decryptedIntegration.password,
          environment: decryptedIntegration.environment
        });
        break;
      case 'dk':
        service = new DkService({
          baseUrl: decryptedIntegration.baseUrl,
          apiKey: decryptedIntegration.apiKey,
          secretKey: decryptedIntegration.secretKey,
          companyId: decryptedIntegration.companyId,
          username: decryptedIntegration.username,
          password: decryptedIntegration.password,
          environment: decryptedIntegration.environment
        });
        break;
      default:
        return errorResponse(res, 'Unsupported integration provider', 400);
    }

    let syncResult;
    switch (syncType) {
      case 'products':
        syncResult = await service.syncProducts(options);
        break;
      case 'customers':
        syncResult = await service.syncCustomers(options);
        break;
      case 'inventory':
        syncResult = await service.syncInventory(options.productIds);
        break;
      default:
        return errorResponse(res, 'Unsupported sync type', 400);
    }

    // Update last sync time
    await prisma.integration.update({
      where: { id: parseInt(id) },
      data: { 
        lastSync: new Date(),
        lastError: syncResult.success ? null : syncResult.message
      }
    });

    return successResponse(res, { syncResult });
  } catch (error) {
    console.error('Error syncing integration:', error);
    return errorResponse(res, 'Failed to sync integration', 500);
  }
};

// Delete integration
const deleteIntegration = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.integration.delete({
      where: { id: parseInt(id) }
    });

    return successResponse(res, { message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Error deleting integration:', error);
    return errorResponse(res, 'Failed to delete integration', 500);
  }
};

module.exports = {
  getIntegrations,
  getIntegration,
  upsertIntegration,
  updateIntegration,
  toggleIntegration,
  testIntegration,
  getIntegrationStatus,
  syncIntegration,
  deleteIntegration
};
