const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class TranslationService {
  /**
   * Get all translations for a specific locale (default IS)
   */
  async getAllTranslations(locale = 'is') {
    try {
      const translations = await prisma.lang.findMany({
        where: { locale },
        orderBy: { key: 'asc' }
      });
      return translations;
    } catch (error) {
      console.error(`Error fetching all translations for locale ${locale}:`, error);
      throw error;
    }
  }

  /**
   * Get translations for both IS and EN
   */
  async getAllTranslationsMultiLang() {
    try {
      const translations = await prisma.lang.findMany({
        where: {
          locale: { in: ['is', 'en'] }
        },
        orderBy: [
          { key: 'asc' },
          { locale: 'asc' }
        ]
      });
      return translations;
    } catch (error) {
      console.error('Error fetching multi-language translations:', error);
      throw error;
    }
  }

  /**
   * Get a single translation by key and locale
   */
  async getTranslation(key, locale = 'is') {
    try {
      const translation = await prisma.lang.findUnique({
        where: {
          key_locale: { // Assuming unique constraint on key and locale
            key,
            locale
          }
        }
      });
      return translation;
    } catch (error) {
      console.error(`Error fetching translation for key ${key} and locale ${locale}:`, error);
      throw error;
    }
  }

  /**
   * Create a new translation for specified locale
   */
  async createTranslation(key, value, locale = 'is') {
    try {
      const translation = await prisma.lang.create({
        data: {
          key,
          locale,
          value
        }
      });
      return translation;
    } catch (error) {
      console.error(`Error creating translation for key ${key} and locale ${locale}:`, error);
      throw error;
    }
  }

  /**
   * Upsert translation - create or update if exists
   */
  async upsertTranslation(key, value, locale = 'is') {
    try {
      const translation = await prisma.lang.upsert({
        where: {
          key_locale: {
            key,
            locale
          }
        },
        update: {
          value
        },
        create: {
          key,
          locale,
          value
        }
      });
      return translation;
    } catch (error) {
      console.error(`Error upserting translation for key ${key} and locale ${locale}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing translation by ID
   */
  async updateTranslation(id, value) {
    try {
      const translation = await prisma.lang.update({
        where: { id },
        data: { value }
      });
      return translation;
    } catch (error) {
      console.error(`Error updating translation with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update translation by key and locale
   */
  async updateTranslationByKey(key, value, locale = 'is') {
    try {
      const translation = await prisma.lang.update({
        where: {
          key_locale: {
            key,
            locale
          }
        },
        data: { value }
      });
      return translation;
    } catch (error) {
      console.error(`Error updating translation for key ${key} and locale ${locale}:`, error);
      throw error;
    }
  }

  /**
   * Delete a translation by ID
   */
  async deleteTranslation(id) {
    try {
      const translation = await prisma.lang.delete({
        where: { id }
      });
      return translation;
    } catch (error) {
      console.error(`Error deleting translation with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete translation by key and locale
   */
  async deleteTranslationByKey(key, locale = 'is') {
    try {
      const translation = await prisma.lang.delete({
        where: {
          key_locale: {
            key,
            locale
          }
        }
      });
      return translation;
    } catch (error) {
      console.error(`Error deleting translation for key ${key} and locale ${locale}:`, error);
      throw error;
    }
  }

  /**
   * Search translations in specified locale
   */
  async searchTranslations(query, locale = 'is') {
    try {
      const translations = await prisma.lang.findMany({
        where: {
          locale,
          OR: [
            { key: { contains: query, mode: 'insensitive' } },
            { value: { contains: query, mode: 'insensitive' } }
          ]
        },
        orderBy: { key: 'asc' }
      });
      return translations;
    } catch (error) {
      console.error(`Error searching translations for query "${query}" in locale ${locale}:`, error);
      throw error;
    }
  }

  /**
   * Batch create or update translations
   */
  async batchUpsertTranslations(translations) {
    try {
      const results = [];
      for (const { key, value, locale = 'is' } of translations) {
        const result = await this.upsertTranslation(key, value, locale);
        results.push(result);
      }
      return results;
    } catch (error) {
      console.error('Error batch upserting translations:', error);
      throw error;
    }
  }

  /**
   * Get translation statistics
   */
  async getStats() {
    try {
      const [total, icelandicCount, englishCount, uniqueKeys] = await Promise.all([
        prisma.lang.count(),
        prisma.lang.count({ where: { locale: 'is' } }),
        prisma.lang.count({ where: { locale: 'en' } }),
        prisma.lang.groupBy({
          by: ['key'],
          _count: { key: true }
        })
      ]);

      // Find keys with missing translations
      const isKeys = await prisma.lang.findMany({
        where: { locale: 'is' },
        select: { key: true }
      });

      const enKeys = await prisma.lang.findMany({
        where: { locale: 'en' },
        select: { key: true }
      });

      const isKeySet = new Set(isKeys.map(t => t.key));
      const enKeySet = new Set(enKeys.map(t => t.key));

      const missingInEnglish = isKeys.filter(k => !enKeySet.has(k.key)).length;
      const missingInIcelandic = enKeys.filter(k => !isKeySet.has(k.key)).length;

      // Get sections (based on key prefixes)
      const sections = {};
      uniqueKeys.forEach(({ key }) => {
        const section = key.split('.')[0];
        sections[section] = (sections[section] || 0) + 1;
      });

      return {
        total,
        byLocale: {
          is: icelandicCount,
          en: englishCount
        },
        uniqueKeys: uniqueKeys.length,
        missingTranslations: {
          missingInEnglish,
          missingInIcelandic
        },
        sections,
        completeness: {
          overall: uniqueKeys.length > 0 ?
            ((Math.min(icelandicCount, englishCount) / uniqueKeys.length) * 100).toFixed(2) : 0,
          icelandic: uniqueKeys.length > 0 ?
            ((icelandicCount / uniqueKeys.length) * 100).toFixed(2) : 0,
          english: uniqueKeys.length > 0 ?
            ((englishCount / uniqueKeys.length) * 100).toFixed(2) : 0
        }
      };
    } catch (error) {
      console.error('Error getting translation stats:', error);
      throw error;
    }
  }

  /**
   * Export translations to JSON
   */
  async exportToJSON(locale = null) {
    try {
      const where = locale ? { locale } : {};
      const translations = await prisma.lang.findMany({
        where,
        orderBy: [
          { locale: 'asc' },
          { key: 'asc' }
        ]
      });

      if (locale) {
        // For single locale, return key-value pairs
        const result = {};
        translations.forEach(t => {
          result[t.key] = t.value;
        });
        return result;
      } else {
        // For all locales, group by locale
        const result = { is: {}, en: {} };
        translations.forEach(t => {
          if (result[t.locale]) {
            result[t.locale][t.key] = t.value;
          }
        });
        return result;
      }
    } catch (error) {
      console.error('Error exporting translations to JSON:', error);
      throw error;
    }
  }

  /**
   * Export translations to CSV
   */
  async exportToCSV() {
    try {
      const translations = await prisma.lang.findMany({
        orderBy: [
          { key: 'asc' },
          { locale: 'asc' }
        ]
      });

      // Group by key
      const grouped = {};
      translations.forEach(t => {
        if (!grouped[t.key]) {
          grouped[t.key] = { key: t.key, is: '', en: '' };
        }
        grouped[t.key][t.locale] = t.value;
      });

      // Convert to CSV
      const rows = Object.values(grouped);
      const csv = [
        'key,icelandic,english',
        ...rows.map(row =>
          `"${row.key}","${row.is.replace(/"/g, '""')}","${row.en.replace(/"/g, '""')}"`
        )
      ].join('\n');

      return csv;
    } catch (error) {
      console.error('Error exporting translations to CSV:', error);
      throw error;
    }
  }

  /**
   * Import translations from JSON
   */
  async importFromJSON(data) {
    try {
      const translations = [];

      // Handle different JSON formats
      if (typeof data === 'object' && !Array.isArray(data)) {
        // Format 1: { is: { key: value }, en: { key: value } }
        if (data.is && data.en) {
          Object.entries(data.is).forEach(([key, value]) => {
            translations.push({ key, value, locale: 'is' });
          });
          Object.entries(data.en).forEach(([key, value]) => {
            translations.push({ key, value, locale: 'en' });
          });
        }
        // Format 2: { key: value } - assume Icelandic
        else {
          Object.entries(data).forEach(([key, value]) => {
            translations.push({ key, value, locale: 'is' });
          });
        }
      }
      // Format 3: [{ key, value, locale }]
      else if (Array.isArray(data)) {
        translations.push(...data);
      }

      const results = await this.batchUpsertTranslations(translations);
      return {
        imported: results.length,
        translations: results
      };
    } catch (error) {
      console.error('Error importing translations from JSON:', error);
      throw error;
    }
  }

  /**
   * Import translations from CSV
   */
  async importFromCSV(csvData) {
    try {
      const lines = csvData.split('\n').filter(line => line.trim());
      const translations = [];

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Parse CSV line (handle quoted values)
        const match = line.match(/^"([^"]*)","([^"]*)","([^"]*)"/);
        if (match) {
          const [, key, isValue, enValue] = match;
          if (key && isValue) {
            translations.push({
              key: key.replace(/""/g, '"'),
              value: isValue.replace(/""/g, '"'),
              locale: 'is'
            });
          }
          if (key && enValue) {
            translations.push({
              key: key.replace(/""/g, '"'),
              value: enValue.replace(/""/g, '"'),
              locale: 'en'
            });
          }
        }
      }

      const results = await this.batchUpsertTranslations(translations);
      return {
        imported: results.length,
        translations: results
      };
    } catch (error) {
      console.error('Error importing translations from CSV:', error);
      throw error;
    }
  }
}

module.exports = new TranslationService();