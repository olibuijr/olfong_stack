const { validationResult, body } = require('express-validator');
const { errorResponse } = require('../utils/response');

/**
 * Middleware to handle validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }
  
  next();
};

/**
 * Validation rules for payment gateway
 */
const validatePaymentGateway = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('displayName')
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Display name must be between 2 and 100 characters'),
  
         body('provider')
           .notEmpty()
           .withMessage('Provider is required')
           .isIn(['valitor', 'rapyd', 'stripe', 'paypal', 'netgiro'])
           .withMessage('Provider must be one of: valitor, rapyd, stripe, paypal, netgiro'),
  
  body('isEnabled')
    .optional()
    .isBoolean()
    .withMessage('isEnabled must be a boolean'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  body('merchantId')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Merchant ID must be between 1 and 100 characters'),
  
  body('apiKey')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('API key must be between 1 and 500 characters'),
  
  body('secretKey')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Secret key must be between 1 and 500 characters'),
  
  body('webhookSecret')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Webhook secret must be between 1 and 500 characters'),
  
  body('environment')
    .optional()
    .isIn(['sandbox', 'production'])
    .withMessage('Environment must be either sandbox or production'),
  
  body('supportedCurrencies')
    .optional()
    .isArray()
    .withMessage('Supported currencies must be an array'),
  
  body('supportedCountries')
    .optional()
    .isArray()
    .withMessage('Supported countries must be an array'),
  
  body('supportedMethods')
    .optional()
    .isArray()
    .withMessage('Supported methods must be an array'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('logoUrl')
    .optional()
    .isURL()
    .withMessage('Logo URL must be a valid URL'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  
  body('documentation')
    .optional()
    .isURL()
    .withMessage('Documentation must be a valid URL'),
  
  validate
];

module.exports = { validate, validatePaymentGateway };


