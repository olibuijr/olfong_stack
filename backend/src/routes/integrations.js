const express = require('express');
const router = express.Router();
const {
  getIntegrations,
  getIntegration,
  upsertIntegration,
  updateIntegration,
  toggleIntegration,
  testIntegration,
  getIntegrationStatus,
  syncIntegration,
  deleteIntegration
} = require('../controllers/integrationController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all integrations
router.get('/', getIntegrations);

// Get integration by ID
router.get('/:id', getIntegration);

// Create or update integration
router.post('/', upsertIntegration);

// Update integration
router.put('/:id', updateIntegration);

// Toggle integration enabled status
router.patch('/:id/toggle', toggleIntegration);

// Test integration connection
router.post('/:id/test', testIntegration);

// Get integration status
router.get('/:id/status', getIntegrationStatus);

// Sync data from integration
router.post('/:id/sync', syncIntegration);

// Delete integration
router.delete('/:id', deleteIntegration);

module.exports = router;
