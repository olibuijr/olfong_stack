const translationService = require('../services/translationService');

class TranslationController {
  /**
   * GET /api/translations - Get all translations for a locale (defaults to IS)
   * Query params: ?locale=is|en
   */
  async getAllTranslations(req, res) {
    try {
      const locale = req.query.locale || 'is'; // Default to Icelandic
      const translations = await translationService.getAllTranslations(locale);
      res.json({ success: true, data: translations, locale });
    } catch (error) {
      console.error('Error in getAllTranslations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch translations',
        details: error.message
      });
    }
  }

  /**
   * GET /api/translations/all - Get translations for both IS and EN
   */
  async getAllTranslationsMultiLang(req, res) {
    try {
      const translations = await translationService.getAllTranslationsMultiLang();

      // Group by locale for easier frontend consumption
      const grouped = {
        is: translations.filter(t => t.locale === 'is'),
        en: translations.filter(t => t.locale === 'en')
      };

      res.json({ success: true, data: grouped });
    } catch (error) {
      console.error('Error in getAllTranslationsMultiLang:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch multi-language translations',
        details: error.message
      });
    }
  }

  /**
   * GET /api/translations/search/:query - Search translations
   * Query params: ?locale=is|en
   */
  async searchTranslations(req, res) {
    try {
      const { query } = req.params;
      const locale = req.query.locale || 'is';
      const translations = await translationService.searchTranslations(query, locale);
      res.json({ success: true, data: translations, locale });
    } catch (error) {
      console.error('Error in searchTranslations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search translations',
        details: error.message
      });
    }
  }

  /**
   * GET /api/translations/:key - Get single translation by key
   * Query params: ?locale=is|en
   */
  async getTranslation(req, res) {
    try {
      const { key } = req.params;
      const locale = req.query.locale || 'is';
      const translation = await translationService.getTranslation(key, locale);

      if (!translation) {
        return res.status(404).json({
          success: false,
          error: 'Translation not found'
        });
      }

      res.json({ success: true, data: translation });
    } catch (error) {
      console.error('Error in getTranslation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch translation',
        details: error.message
      });
    }
  }

  /**
   * POST /api/translations - Create new translation
   * Body: { key, value, locale? }
   */
  async createTranslation(req, res) {
    try {
      const { key, value, locale = 'is' } = req.body;

      // Validate required fields
      if (!key || !value) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: key, value'
        });
      }

      // Validate locale
      if (!['is', 'en'].includes(locale)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid locale. Must be "is" or "en"'
        });
      }

      const translation = await translationService.createTranslation(key, value, locale);

      res.status(201).json({
        success: true,
        data: translation,
        message: 'Translation created successfully'
      });
    } catch (error) {
      console.error('Error in createTranslation:', error);

      if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({
          success: false,
          error: 'Translation with this key and locale already exists'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create translation',
        details: error.message
      });
    }
  }

  /**
   * POST /api/translations/upsert - Create or update translation
   * Body: { key, value, locale? }
   */
  async upsertTranslation(req, res) {
    try {
      const { key, value, locale = 'is' } = req.body;

      // Validate required fields
      if (!key || !value) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: key, value'
        });
      }

      // Validate locale
      if (!['is', 'en'].includes(locale)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid locale. Must be "is" or "en"'
        });
      }

      const translation = await translationService.upsertTranslation(key, value, locale);

      res.json({
        success: true,
        data: translation,
        message: 'Translation upserted successfully'
      });
    } catch (error) {
      console.error('Error in upsertTranslation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upsert translation',
        details: error.message
      });
    }
  }

  /**
   * POST /api/translations/batch - Batch upsert translations
   * Body: { translations: [{ key, value, locale? }] }
   */
  async batchUpsertTranslations(req, res) {
    try {
      const { translations } = req.body;

      // Validate input
      if (!Array.isArray(translations) || translations.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Translations array is required and must not be empty'
        });
      }

      // Validate each translation
      for (const t of translations) {
        if (!t.key || !t.value) {
          return res.status(400).json({
            success: false,
            error: 'Each translation must have key and value'
          });
        }
        if (t.locale && !['is', 'en'].includes(t.locale)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid locale. Must be "is" or "en"'
          });
        }
      }

      const results = await translationService.batchUpsertTranslations(translations);

      res.json({
        success: true,
        data: results,
        message: `Successfully upserted ${results.length} translations`
      });
    } catch (error) {
      console.error('Error in batchUpsertTranslations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to batch upsert translations',
        details: error.message
      });
    }
  }

  /**
   * PUT /api/translations/:id - Update translation by ID
   * Body: { value }
   */
  async updateTranslation(req, res) {
    try {
      const { id } = req.params;
      const { value } = req.body;

      // Validate required fields
      if (!value) {
        return res.status(400).json({
          success: false,
          error: 'Value is required'
        });
      }

      const translation = await translationService.updateTranslation(id, value);

      res.json({
        success: true,
        data: translation,
        message: 'Translation updated successfully'
      });
    } catch (error) {
      console.error('Error in updateTranslation:', error);

      if (error.code === 'P2025') { // Record not found
        return res.status(404).json({
          success: false,
          error: 'Translation not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update translation',
        details: error.message
      });
    }
  }

  /**
   * PUT /api/translations/key/:key - Update translation by key and locale
   * Body: { value }
   * Query params: ?locale=is|en
   */
  async updateTranslationByKey(req, res) {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const locale = req.query.locale || 'is';

      // Validate required fields
      if (!value) {
        return res.status(400).json({
          success: false,
          error: 'Value is required'
        });
      }

      const translation = await translationService.updateTranslationByKey(key, value, locale);

      res.json({
        success: true,
        data: translation,
        message: 'Translation updated successfully'
      });
    } catch (error) {
      console.error('Error in updateTranslationByKey:', error);

      if (error.code === 'P2025') { // Record not found
        return res.status(404).json({
          success: false,
          error: 'Translation not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update translation',
        details: error.message
      });
    }
  }

  /**
   * DELETE /api/translations/:id - Delete translation by ID
   */
  async deleteTranslation(req, res) {
    try {
      const { id } = req.params;

      await translationService.deleteTranslation(id);

      res.json({
        success: true,
        message: 'Translation deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteTranslation:', error);

      if (error.code === 'P2025') { // Record not found
        return res.status(404).json({
          success: false,
          error: 'Translation not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete translation',
        details: error.message
      });
    }
  }

  /**
   * DELETE /api/translations/key/:key - Delete translation by key and locale
   * Query params: ?locale=is|en
   */
  async deleteTranslationByKey(req, res) {
    try {
      const { key } = req.params;
      const locale = req.query.locale || 'is';

      await translationService.deleteTranslationByKey(key, locale);

      res.json({
        success: true,
        message: 'Translation deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteTranslationByKey:', error);

      if (error.code === 'P2025') { // Record not found
        return res.status(404).json({
          success: false,
          error: 'Translation not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete translation',
        details: error.message
      });
    }
  }

  /**
   * GET /api/translations/stats - Get translation statistics
   */
  async getStats(req, res) {
    try {
      const stats = await translationService.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch translation statistics',
        details: error.message
      });
    }
  }

  /**
   * GET /api/translations/export - Export translations
   * Query params: ?format=json|csv&locale=is|en
   */
  async exportTranslations(req, res) {
    try {
      const { format = 'json', locale } = req.query;

      if (format === 'csv') {
        const csv = await translationService.exportToCSV();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=translations.csv');
        res.send(csv);
      } else {
        const data = await translationService.exportToJSON(locale);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=translations_${locale || 'all'}.json`);
        res.json(data);
      }
    } catch (error) {
      console.error('Error in exportTranslations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export translations',
        details: error.message
      });
    }
  }

  /**
   * POST /api/translations/import - Import translations
   * Body: { data, format: 'json'|'csv' }
   */
  async importTranslations(req, res) {
    try {
      const { data, format = 'json' } = req.body;

      if (!data) {
        return res.status(400).json({
          success: false,
          error: 'Data is required for import'
        });
      }

      let result;
      if (format === 'csv') {
        result = await translationService.importFromCSV(data);
      } else {
        result = await translationService.importFromJSON(data);
      }

      res.json({
        success: true,
        data: result,
        message: `Successfully imported ${result.imported} translations`
      });
    } catch (error) {
      console.error('Error in importTranslations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to import translations',
        details: error.message
      });
    }
  }
}

module.exports = new TranslationController();