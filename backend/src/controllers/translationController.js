const translationService = require('../services/translationService');

class TranslationController {
  /**
   * GET /api/translations - Get all Icelandic translations
   */
  async getAllTranslations(req, res) {
    try {
      const translations = await translationService.getAllTranslations();
      res.json({ success: true, data: translations });
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
   * GET /api/translations/search/:query - Search Icelandic translations
   */
  async searchTranslations(req, res) {
    try {
      const { query } = req.params;
      const translations = await translationService.searchTranslations(query);
      res.json({ success: true, data: translations });
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
   * GET /api/translations/:key - Get single Icelandic translation
   */
  async getTranslation(req, res) {
    try {
      const { key } = req.params;
      const translation = await translationService.getTranslation(key);

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
   * POST /api/translations - Create new Icelandic translation
   */
  async createTranslation(req, res) {
    try {
      const { key, value } = req.body;

      // Validate required fields
      if (!key || !value) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: key, value'
        });
      }

      const translation = await translationService.createTranslation(key, value);

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
   * PUT /api/translations/:id - Update Icelandic translation
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
   * DELETE /api/translations/:id - Delete Icelandic translation
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
}

module.exports = new TranslationController();