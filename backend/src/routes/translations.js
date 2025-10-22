const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming these are still needed for admin routes

// Public route to get all Icelandic translations
router.get('/', translationController.getAllTranslations);

// Public route to search Icelandic translations
router.get('/search/:query', translationController.searchTranslations);

// Public route to get a single Icelandic translation by key
router.get('/:key', translationController.getTranslation);

// Admin routes (require authentication and authorization)
// Assuming 'admin' role is required for CRUD operations
router.post('/', protect, authorize(['admin']), translationController.createTranslation);
router.put('/:id', protect, authorize(['admin']), translationController.updateTranslation);
router.delete('/:id', protect, authorize(['admin']), translationController.deleteTranslation);

module.exports = router;