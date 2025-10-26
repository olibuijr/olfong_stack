const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  generateProductImage,
  getGenerationStatus,
  batchGenerateImages,
  generateVariations,
  getAISettings,
  updateAISettings,
  handleWebhook,
  linkProductToMedia
} = require('../controllers/aiImageController');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Single image generation
router.post('/generate/:mediaId', generateProductImage);

// Get generation status
router.get('/status/:jobId', getGenerationStatus);

// Batch generation
router.post('/batch', batchGenerateImages);

// A/B testing variations
router.post('/variations/:mediaId', generateVariations);

// Settings
router.get('/settings', getAISettings);
router.put('/settings', updateAISettings);

// Link product to media
router.put('/link-product', linkProductToMedia);

// Webhook (no auth required)
router.post('/webhook', handleWebhook);

module.exports = router;
