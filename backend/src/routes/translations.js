const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes - anyone can read translations

// GET /api/translations - Get all translations for a locale (defaults to IS)
// Query params: ?locale=is|en
router.get('/', translationController.getAllTranslations);

// GET /api/translations/all - Get translations for both IS and EN grouped
router.get('/all', translationController.getAllTranslationsMultiLang);

// GET /api/translations/search/:query - Search translations
// Query params: ?locale=is|en
router.get('/search/:query', translationController.searchTranslations);

// GET /api/translations/stats - Get translation statistics
router.get('/stats', translationController.getStats);

// GET /api/translations/export - Export translations
// Query params: ?format=json|csv&locale=is|en
router.get('/export', authenticate, authorize(), translationController.exportTranslations);

// GET /api/translations/:key - Get single translation by key
// Query params: ?locale=is|en
router.get('/:key', translationController.getTranslation);

// Admin routes - require authentication

// POST /api/translations - Create new translation
// Body: { key, value, locale? }
router.post('/', authenticate, authorize(), translationController.createTranslation);

// POST /api/translations/upsert - Create or update translation
// Body: { key, value, locale? }
router.post('/upsert', authenticate, authorize(), translationController.upsertTranslation);

// POST /api/translations/batch - Batch upsert translations
// Body: { translations: [{ key, value, locale? }] }
router.post('/batch', authenticate, authorize(), translationController.batchUpsertTranslations);

// POST /api/translations/import - Import translations
// Body: { data, format: 'json'|'csv' }
router.post('/import', authenticate, authorize(), translationController.importTranslations);

// POST /api/translations/generate - Generate translations using Gemini
// Body: { sourceLocale: 'is'|'en', targetLocale: 'is'|'en', keys?: string[] }
router.post('/generate', authenticate, authorize(), translationController.generateTranslations);

// POST /api/translations/generate-stream - Generate translations with streaming progress (SSE)
// Body: { sourceLocale: 'is'|'en', targetLocale: 'is'|'en', keys?: string[] }
router.post('/generate-stream', authenticate, authorize(), translationController.generateTranslationsStream);

// POST /api/translations/translate-item - Translate a single item using Gemini
// Body: { key: string, sourceLocale: 'is'|'en', targetLocale: 'is'|'en', value: string }
router.post('/translate-item', authenticate, authorize(), translationController.translateItem);

// POST /api/translations/translate-item-stream - Translate single item with streaming progress (SSE)
// Body: { key: string, sourceLocale: 'is'|'en', targetLocale: 'is'|'en', value: string }
router.post('/translate-item-stream', authenticate, authorize(), translationController.translateItemStream);

// PUT /api/translations/:id - Update translation by ID
// Body: { value }
router.put('/:id', authenticate, authorize(), translationController.updateTranslation);

// PUT /api/translations/key/:key - Update translation by key and locale
// Body: { value }
// Query params: ?locale=is|en
router.put('/key/:key', authenticate, authorize(), translationController.updateTranslationByKey);

// DELETE /api/translations/:id - Delete translation by ID
router.delete('/:id', authenticate, authorize(), translationController.deleteTranslation);

// DELETE /api/translations/key/:key - Delete translation by key and locale
// Query params: ?locale=is|en
router.delete('/key/:key', authenticate, authorize(), translationController.deleteTranslationByKey);

module.exports = router;