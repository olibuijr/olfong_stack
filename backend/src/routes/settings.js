const express = require('express');
const router = express.Router();
const {
  getSettings,
  getSetting,
  upsertSetting,
  updateSettings,
  deleteSetting,
  getPublicSettings,
  getOpeningHours,
  initializeDefaultSettings
} = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Public routes - no auth required
router.get('/public', getPublicSettings);
router.get('/opening-hours', getOpeningHours);

// All other routes require authentication
router.use(authenticate);

// Get all settings or by category
router.get('/', 
  query('category').optional().isString().trim(),
  validate,
  getSettings
);

// Get single setting
router.get('/:key',
  param('key').isString().trim().notEmpty(),
  validate,
  getSetting
);

// Create or update single setting (Admin only)
router.post('/',
  authorize('ADMIN'),
  body('key').isString().trim().notEmpty(),
  body('value').optional().isString(),
  body('description').optional().isString().trim(),
  body('category').optional().isString().trim(),
  body('isEncrypted').optional().isBoolean(),
  body('isPublic').optional().isBoolean(),
  validate,
  upsertSetting
);

// Update multiple settings (Admin only)
router.put('/',
  authorize('ADMIN'),
  body('settings').isArray(),
  body('settings.*.key').isString().trim().notEmpty(),
  body('settings.*.value').optional().isString(),
  body('settings.*.description').optional().isString().trim(),
  body('settings.*.category').optional().isString().trim(),
  body('settings.*.isEncrypted').optional().isBoolean(),
  body('settings.*.isPublic').optional().isBoolean(),
  validate,
  updateSettings
);

// Delete setting (Admin only)
router.delete('/:key',
  authorize('ADMIN'),
  param('key').isString().trim().notEmpty(),
  validate,
  deleteSetting
);

// Initialize default settings (Admin only)
router.post('/initialize',
  authorize('ADMIN'),
  initializeDefaultSettings
);

module.exports = router;
