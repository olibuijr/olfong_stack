const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const {
  getReceiptSettings,
  updateReceiptSettings,
  uploadReceiptLogo,
  deleteReceiptLogo,
  upload
} = require('../controllers/receiptSettingsController');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET receipt settings
router.get('/', getReceiptSettings);

// UPDATE receipt settings
router.put('/', updateReceiptSettings);

// UPLOAD logo
router.post('/logo', upload.single('logo'), uploadReceiptLogo);

// DELETE logo
router.delete('/logo', deleteReceiptLogo);

module.exports = router;
