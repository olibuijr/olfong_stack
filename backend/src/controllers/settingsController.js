const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all settings or settings by category
 */
const getSettings = async (req, res) => {
  try {
    const { category } = req.query;
    
    const where = {};
    if (category) {
      where.category = category;
    }

    const settings = await prisma.setting.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    // Group settings by category for better organization
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    return successResponse(res, { settings: groupedSettings }, 'Settings retrieved successfully');
  } catch (error) {
    console.error('Error fetching settings:', error);
    return errorResponse(res, 'Failed to fetch settings', 500);
  }
};

/**
 * Get a single setting by key
 */
const getSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await prisma.setting.findUnique({
      where: { key }
    });

    if (!setting) {
      return errorResponse(res, 'Setting not found', 404);
    }

    return successResponse(res, { setting }, 'Setting retrieved successfully');
  } catch (error) {
    console.error('Error fetching setting:', error);
    return errorResponse(res, 'Failed to fetch setting', 500);
  }
};

/**
 * Create or update a setting
 */
const upsertSetting = async (req, res) => {
  try {
    const { key, value, description, category, isEncrypted, isPublic } = req.body;

    if (!key) {
      return errorResponse(res, 'Setting key is required', 400);
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: {
        value,
        description,
        category: category || 'GENERAL',
        isEncrypted: isEncrypted || false,
        isPublic: isPublic || false
      },
      create: {
        key,
        value,
        description,
        category: category || 'GENERAL',
        isEncrypted: isEncrypted || false,
        isPublic: isPublic || false
      }
    });

    return successResponse(res, { setting }, 'Setting saved successfully');
  } catch (error) {
    console.error('Error saving setting:', error);
    return errorResponse(res, 'Failed to save setting', 500);
  }
};

/**
 * Update multiple settings at once
 */
const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
      return errorResponse(res, 'Settings must be an array', 400);
    }

    const results = [];
    
    for (const settingData of settings) {
      const { key, value, description, category, isEncrypted, isPublic } = settingData;
      
      if (!key) {
        continue; // Skip invalid entries
      }

      const setting = await prisma.setting.upsert({
        where: { key },
        update: {
          value,
          description,
          category: category || 'GENERAL',
          isEncrypted: isEncrypted || false,
          isPublic: isPublic || false
        },
        create: {
          key,
          value,
          description,
          category: category || 'GENERAL',
          isEncrypted: isEncrypted || false,
          isPublic: isPublic || false
        }
      });
      
      results.push(setting);
    }

    return successResponse(res, { settings: results }, 'Settings updated successfully');
  } catch (error) {
    console.error('Error updating settings:', error);
    return errorResponse(res, 'Failed to update settings', 500);
  }
};

/**
 * Delete a setting
 */
const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await prisma.setting.delete({
      where: { key }
    });

    return successResponse(res, { setting }, 'Setting deleted successfully');
  } catch (error) {
    console.error('Error deleting setting:', error);
    return errorResponse(res, 'Failed to delete setting', 500);
  }
};

/**
 * Get public settings (for frontend use)
 */
const getPublicSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany({
      where: { isPublic: true },
      select: {
        key: true,
        value: true,
        description: true,
        category: true
      },
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    // Convert to key-value pairs for easier frontend consumption
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });

    return successResponse(res, { settings: settingsMap }, 'Public settings retrieved successfully');
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return errorResponse(res, 'Failed to fetch public settings', 500);
  }
};

/**
 * Initialize default settings
 */
const initializeDefaultSettings = async (req, res) => {
  try {
    const defaultSettings = [
      // API Keys
      {
        key: 'UNSPLASH_ACCESS_KEY',
        value: '',
        description: 'Unsplash API access key for image search',
        category: 'API_KEYS',
        isEncrypted: true,
        isPublic: false
      },
      {
        key: 'PEXELS_API_KEY',
        value: '',
        description: 'Pexels API key for image search',
        category: 'API_KEYS',
        isEncrypted: true,
        isPublic: false
      },
      {
        key: 'PIXABAY_API_KEY',
        value: '',
        description: 'Pixabay API key for image search',
        category: 'API_KEYS',
        isEncrypted: true,
        isPublic: false
      },
      {
        key: 'GOOGLE_API_KEY',
        value: '',
        description: 'Google Custom Search API key',
        category: 'API_KEYS',
        isEncrypted: true,
        isPublic: false
      },
      {
        key: 'GOOGLE_SEARCH_ENGINE_ID',
        value: '',
        description: 'Google Custom Search Engine ID',
        category: 'API_KEYS',
        isEncrypted: false,
        isPublic: false
      },
      // General Settings
      {
        key: 'SITE_NAME',
        value: 'Ölföng',
        description: 'Site name',
        category: 'GENERAL',
        isEncrypted: false,
        isPublic: true
      },
      {
        key: 'SITE_DESCRIPTION',
        value: 'Icelandic wine and beer shop with home delivery',
        description: 'Site description',
        category: 'GENERAL',
        isEncrypted: false,
        isPublic: true
      },
      {
        key: 'CONTACT_EMAIL',
        value: 'info@olfong.is',
        description: 'Contact email address',
        category: 'GENERAL',
        isEncrypted: false,
        isPublic: true
      },
      {
        key: 'CONTACT_PHONE',
        value: '+354 555 1234',
        description: 'Contact phone number',
        category: 'GENERAL',
        isEncrypted: false,
        isPublic: true
      }
    ];

    const results = [];
    
    for (const settingData of defaultSettings) {
      const setting = await prisma.setting.upsert({
        where: { key: settingData.key },
        update: settingData,
        create: settingData
      });
      
      results.push(setting);
    }

    return successResponse(res, { settings: results }, 'Default settings initialized successfully');
  } catch (error) {
    console.error('Error initializing default settings:', error);
    return errorResponse(res, 'Failed to initialize default settings', 500);
  }
};

module.exports = {
  getSettings,
  getSetting,
  upsertSetting,
  updateSettings,
  deleteSetting,
  getPublicSettings,
  initializeDefaultSettings
};
