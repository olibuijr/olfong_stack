const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class TranslationService {
  /**
   * Get all Icelandic translations
   */
  async getAllTranslations() {
    try {
      const translations = await prisma.lang.findMany({
        where: { locale: 'is' },
        orderBy: { key: 'asc' }
      });
      return translations;
    } catch (error) {
      console.error('Error fetching all Icelandic translations:', error);
      throw error;
    }
  }

  /**
   * Get a single Icelandic translation by key
   */
  async getTranslation(key) {
    try {
      const translation = await prisma.lang.findUnique({
        where: {
          key_locale: { // Assuming unique constraint on key and locale
            key,
            locale: 'is'
          }
        }
      });
      return translation;
    } catch (error) {
      console.error(`Error fetching Icelandic translation for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Create a new Icelandic translation
   */
  async createTranslation(key, value) {
    try {
      const translation = await prisma.lang.create({
        data: {
          key,
          locale: 'is',
          value
        }
      });
      return translation;
    } catch (error) {
      console.error(`Error creating Icelandic translation for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing Icelandic translation
   */
  async updateTranslation(id, value) {
    try {
      const translation = await prisma.lang.update({
        where: { id },
        data: { value }
      });
      return translation;
    } catch (error) {
      console.error(`Error updating Icelandic translation with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an Icelandic translation
   */
  async deleteTranslation(id) {
    try {
      const translation = await prisma.lang.delete({
        where: { id }
      });
      return translation;
    } catch (error) {
      console.error(`Error deleting Icelandic translation with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search Icelandic translations
   */
  async searchTranslations(query) {
    try {
      const translations = await prisma.lang.findMany({
        where: {
          locale: 'is',
          OR: [
            { key: { contains: query, mode: 'insensitive' } },
            { value: { contains: query, mode: 'insensitive' } }
          ]
        },
        orderBy: { key: 'asc' }
      });
      return translations;
    } catch (error) {
      console.error(`Error searching Icelandic translations for query "${query}":`, error);
      throw error;
    }
  }
}

module.exports = new TranslationService();