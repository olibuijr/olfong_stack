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

  /**
   * Generate translations using Claude CLI
   */
  async generateTranslations(sourceLocale, targetLocale, keysToTranslate, onProgress = null) {
    try {
      const { execSync } = require('child_process');
      const fs = require('fs');
      const path = require('path');

      // Get source translations
      let sourceTranslations;
      if (keysToTranslate && keysToTranslate.length > 0) {
        sourceTranslations = await prisma.lang.findMany({
          where: {
            locale: sourceLocale,
            key: { in: keysToTranslate }
          }
        });
      } else {
        sourceTranslations = await prisma.lang.findMany({
          where: { locale: sourceLocale }
        });
      }

      if (sourceTranslations.length === 0) {
        return {
          generated: 0,
          translations: [],
          message: 'No source translations found'
        };
      }

      // Check if target translations already exist and skip them
      const existingTargets = await prisma.lang.findMany({
        where: {
          locale: targetLocale,
          key: { in: sourceTranslations.map(t => t.key) }
        },
        select: { key: true }
      });

      const existingKeys = new Set(existingTargets.map(t => t.key));
      const toTranslate = sourceTranslations.filter(t => !existingKeys.has(t.key));

      if (toTranslate.length === 0) {
        return {
          generated: 0,
          translations: [],
          message: 'All translations already exist'
        };
      }

      // Process items one at a time
      const translationResults = [];
      let totalWords = 0;
      const sourceLabel = sourceLocale === 'is' ? 'Icelandic' : 'English';
      const targetLabel = targetLocale === 'is' ? 'Icelandic' : 'English';

      const startMsg = `Processing ${toTranslate.length} items one at a time`;
      console.log(startMsg);
      if (onProgress) onProgress({ type: 'log', message: startMsg });

      for (let idx = 0; idx < toTranslate.length; idx++) {
        const item = toTranslate[idx];

        try {
          const preparingMsg = `[${idx + 1}/${toTranslate.length}] Preparing to translate "${item.key}"...`;
          console.log(preparingMsg);
          if (onProgress) onProgress({ type: 'log', message: preparingMsg });

          const prompt = `You are a professional UI translation expert. Translate this single ${sourceLabel} UI text to ${targetLabel}. Return ONLY the translated text, nothing else. Do not include quotes.

"${item.key}": "${item.value}"`;

          try {
            // Call Claude CLI
            const tempPromptFile = path.join('/tmp', `claude-item-${Date.now()}-${idx}.txt`);
            fs.writeFileSync(tempPromptFile, prompt);

            const translatingMsg = `[${idx + 1}/${toTranslate.length}] Calling Claude to translate "${item.key}"...`;
            console.log(translatingMsg);
            if (onProgress) onProgress({ type: 'log', message: translatingMsg });

            const result = execSync(`claude -p "$(cat ${tempPromptFile})" --dangerously-skip-permissions`, {
              encoding: 'utf8',
              maxBuffer: 10 * 1024 * 1024,
              shell: '/bin/bash',
              timeout: 30000
            });

            // Clean up temp file
            fs.unlinkSync(tempPromptFile);

            const translatedValue = result.trim();

            if (translatedValue && translatedValue.length > 0) {
              translationResults.push({
                key: item.key,
                locale: targetLocale,
                value: translatedValue
              });

              // Count words
              const wordCount = translatedValue.split(/\s+/).length;
              totalWords += wordCount;

              const progressMsg = `[${idx + 1}/${toTranslate.length}] Translated "${item.key}" (${wordCount} words, total: ${totalWords})`;
              console.log(progressMsg);
              if (onProgress) onProgress({ type: 'log', message: progressMsg });
            }
          } catch (error) {
            // Clean up temp file if it still exists
            if (fs.existsSync(tempPromptFile)) {
              fs.unlinkSync(tempPromptFile);
            }
            const errorMsg = `Error translating item ${idx + 1} (${item.key}): ${error.message}`;
            console.error(errorMsg);
            if (onProgress) onProgress({ type: 'error', message: errorMsg });
          }

          // Add delay between items to avoid rate limiting
          if (idx < toTranslate.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          const errorMsg = `Error processing item ${idx + 1}: ${error.message}`;
          console.error(errorMsg);
          if (onProgress) onProgress({ type: 'error', message: errorMsg });
        }
      }

      // Upsert all translated entries into database
      const upsertResults = await this.batchUpsertTranslations(translationResults);

      const finalMsg = `Generated ${upsertResults.length} translations from ${toTranslate.length} source entries`;
      console.log(finalMsg);
      if (onProgress) onProgress({ type: 'log', message: finalMsg });

      return {
        generated: upsertResults.length,
        translations: upsertResults,
        message: finalMsg
      };
    } catch (error) {
      console.error('Error generating translations:', error);
      throw error;
    }
  }

  /**
   * Translate a single item using Claude CLI
   */
  async translateItem(key, sourceLocale, targetLocale, value, onProgress = null) {
    try {
      const { execSync } = require('child_process');
      const fs = require('fs');
      const path = require('path');

      const sourceLabel = sourceLocale === 'is' ? 'Icelandic' : 'English';
      const targetLabel = targetLocale === 'is' ? 'Icelandic' : 'English';

      const startMsg = `Translating "${key}" from ${sourceLabel} to ${targetLabel}...`;
      console.log(startMsg);
      if (onProgress) onProgress({ type: 'log', message: startMsg });

      const prompt = `You are a professional UI translation expert. Translate this single ${sourceLabel} UI text to ${targetLabel}. Return ONLY the translated text, nothing else.

"${key}": "${value}"`;

      try {
        // Call Claude CLI
        const tempPromptFile = path.join('/tmp', `claude-item-${Date.now()}.txt`);
        fs.writeFileSync(tempPromptFile, prompt);

        const result = execSync(`claude -p "$(cat ${tempPromptFile})" --dangerously-skip-permissions`, {
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024,
          shell: '/bin/bash',
          timeout: 30000
        });

        // Clean up temp file
        fs.unlinkSync(tempPromptFile);

        const translatedValue = result.trim();

        // Check if translation is empty
        if (!translatedValue || translatedValue.length === 0) {
          const emptyMsg = `Error: Claude returned empty translation for "${key}"`;
          console.error(emptyMsg);
          if (onProgress) onProgress({ type: 'error', message: emptyMsg });
          throw new Error(emptyMsg);
        }

        const wordCount = translatedValue.split(/\s+/).length;

        const progressMsg = `Translated "${key}" (${wordCount} words)`;
        console.log(progressMsg);
        if (onProgress) onProgress({ type: 'log', message: progressMsg });

        // Upsert the translation
        const upserted = await this.upsertTranslation(key, translatedValue, targetLocale);

        const successMsg = `Successfully saved translation for "${key}"`;
        console.log(successMsg);
        if (onProgress) onProgress({ type: 'log', message: successMsg });

        return {
          key,
          locale: targetLocale,
          value: translatedValue,
          translation: upserted
        };
      } catch (error) {
        // Clean up temp file if it still exists
        if (fs.existsSync(tempPromptFile)) {
          fs.unlinkSync(tempPromptFile);
        }
        const errorMsg = `Error translating "${key}": ${error.message}`;
        console.error(errorMsg);
        if (onProgress) onProgress({ type: 'error', message: errorMsg });
        throw error;
      }
    } catch (error) {
      console.error('Error translating item:', error);
      throw error;
    }
  }
}

module.exports = new TranslationService();