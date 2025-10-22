const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const {
  getSMTPSettings,
  updateSMTPSettings,
  testSMTPConnection
} = require('../controllers/smtpSettingsController');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET SMTP settings
router.get('/', getSMTPSettings);

// UPDATE SMTP settings
router.put('/', updateSMTPSettings);

// TEST SMTP connection
router.post('/test', testSMTPConnection);

module.exports = router;
