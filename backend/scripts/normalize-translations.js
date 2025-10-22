const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

class TranslationNormalizer {
  /**
   * Normalize translation keys to follow the new format
   * - Convert to lowercase
   * - Replace spaces/underscores with dots where appropriate
   * - Ensure proper hierarchical structure
   * - Remove route-like prefixes
   */
  normalizeKey(key) {
    if (!key) return key;

    let normalized = key.toLowerCase();

    // Remove route-like prefixes
    normalized = normalized.replace(/^\/+/, '');

    // Replace common separators with dots
    normalized = normalized.replace(/[-_\s]+/g, '.');

    // Remove consecutive dots
    normalized = normalized.replace(/\.{2,}/g, '.');

    // Remove leading/trailing dots
    normalized = normalized.replace(/^\.+|\.+$/g, '');

    // Ensure starts with letter
    if (!/^[a-z]/.test(normalized)) {
      normalized = 'key.' + normalized;
    }

    return normalized;
  }

  /**
   * Map old keys to new normalized keys
   */
  getKeyMapping() {
    return {
      // Common mappings for known problematic keys
      'adminuser': 'admin.user',
      'admindashboard': 'adminDashboard',
      'adminnavigation': 'adminNavigation',
      'adminsettings': 'adminSettings',
      'admincategories': 'adminCategories',
      'admincustomers': 'adminCustomers',
      'adminorders': 'adminOrders',
      'adminanalytics': 'adminAnalytics',
      'adminreports': 'adminReports',
      'adminchat': 'adminChat',
      'admintranslations': 'adminTranslations',
      'adminlabels': 'adminLabels',
      'adminlayout': 'adminLayout',
      'adminmedia': 'adminMedia',
      'adminnotifications': 'adminNotifications',
      'adminpage': 'adminPage',
      'adminplaceholders': 'adminPlaceholders',
      'adminproducts': 'adminProducts',
      'adminproductsPage': 'adminProductsPage',
      'adminsidebar': 'adminSidebar',
      'ageRestriction': 'ageRestriction',
      'ageVerification': 'ageVerification',
      'aria': 'aria',
      'atvrImport': 'atvrImport',
      'auth': 'auth',
      'authExtra': 'authExtra',
      'cart': 'cart',
      'cartPage': 'cartPage',
      'categories': 'categories',
      'category': 'category',
      'chat': 'chat',
      'checkoutPage': 'checkoutPage',
      'common': 'common',
      'csv': 'csv',
      'demoData': 'demoData',
      'delivery': 'delivery',
      'error': 'error',
      'error_description': 'error.description',
      'footer': 'footer',
      'hero': 'hero',
      'home': 'home',
      'id_token': 'auth.idToken',
      'imageSearchModal': 'imageSearchModal',
      'is-IS': 'language.is',
      'join-admin-room': 'chat.joinAdminRoom',
      'join-conversation': 'chat.joinConversation',
      'json': 'json',
      'language': 'language',
      'navigation': 'navigation',
      'order': 'order',
      'orderDetailPage': 'orderDetailPage',
      'orders': 'orders',
      'ordersPage': 'ordersPage',
      'pdf': 'pdf',
      'pos': 'pos',
      'product': 'product',
      'productDetailPage': 'productDetailPage',
      'products': 'products',
      'productsPage': 'productsPage',
      'profile': 'profile',
      'profilePage': 'profilePage',
      'receipts': 'receipts',
      'relative': 'relative',
      'search': 'search',
      'section': 'section',
      'shipping': 'shipping',
      'smtp-settings': 'smtpSettings',
      'state': 'state',
      'subcategories': 'subcategories',
      'subcategory': 'subcategory',
      'subscription': 'subscription',
      'test': 'test',
      'tooltips': 'tooltips',
      'typing-start': 'chat.typingStart',
      'typing-stop': 'chat.typingStop',
      'whyUs': 'whyUs'
    };
  }

  /**
   * Load translations from backup JSON files
   */
  async loadBackupTranslations() {
    try {
      const backupsDir = path.join(__dirname, '../../backups');
      const enPath = path.join(backupsDir, 'en-translations.json');
      const isPath = path.join(backupsDir, 'is-translations.json');

      const [enExists, isExists] = await Promise.all([
        fs.access(enPath).then(() => true).catch(() => false),
        fs.access(isPath).then(() => true).catch(() => false)
      ]);

      const backupData = {};

      if (enExists) {
        const enContent = await fs.readFile(enPath, 'utf8');
        backupData.en = JSON.parse(enContent);
        console.log(`Loaded ${Object.keys(backupData.en).length} English backup translations`);
      }

      if (isExists) {
        const isContent = await fs.readFile(isPath, 'utf8');
        backupData.is = JSON.parse(isContent);
        console.log(`Loaded ${Object.keys(backupData.is).length} Icelandic backup translations`);
      }

      return backupData;
    } catch (error) {
      console.error('Error loading backup translations:', error);
      return {};
    }
  }

  /**
   * Load current DB translations
   */
  async loadDbTranslations() {
    try {
      const translations = await prisma.translation.findMany({
        orderBy: [
          { section: 'asc' },
          { key: 'asc' }
        ]
      });

      const grouped = { en: {}, is: {} };
      translations.forEach(t => {
        if (!grouped[t.language]) grouped[t.language] = {};
        grouped[t.language][t.key] = t.value;
      });

      console.log(`Loaded ${Object.keys(grouped.en).length} English DB translations`);
      console.log(`Loaded ${Object.keys(grouped.is).length} Icelandic DB translations`);

      return grouped;
    } catch (error) {
      console.error('Error loading DB translations:', error);
      throw error;
    }
  }

  /**
   * Flatten nested object to dot notation
   */
  flattenObject(obj, prefix = '') {
    const flattened = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = String(value);
      }
    }

    return flattened;
  }

  /**
   * Normalize and merge translations
   */
  async normalizeAndMerge() {
    try {
      console.log('Starting translation normalization...');

      // Load all sources
      const [backupData, dbData] = await Promise.all([
        this.loadBackupTranslations(),
        this.loadDbTranslations()
      ]);

      // Flatten backup data if nested
      const flattenedBackups = {};
      if (backupData.en) {
        flattenedBackups.en = this.flattenObject(backupData.en);
      }
      if (backupData.is) {
        flattenedBackups.is = this.flattenObject(backupData.is);
      }

      // Combine sources (prefer DB over backups, normalize keys)
      const normalizedTranslations = [];
      const keyMap = {};

      // Process all unique keys
      const allKeys = new Set([
        ...Object.keys(dbData.en || {}),
        ...Object.keys(dbData.is || {}),
        ...Object.keys(flattenedBackups.en || {}),
        ...Object.keys(flattenedBackups.is || {})
      ]);

      for (const originalKey of allKeys) {
        const normalizedKey = this.normalizeKey(originalKey);
        const section = normalizedKey.split('.')[0];

        // Track mapping for future reference
        if (originalKey !== normalizedKey) {
          keyMap[originalKey] = normalizedKey;
        }

        // English translation (prefer DB, fallback to backup)
        const enValue = dbData.en?.[originalKey] ||
                       flattenedBackups.en?.[originalKey] ||
                       dbData.en?.[normalizedKey] ||
                       flattenedBackups.en?.[normalizedKey] ||
                       '';

        if (enValue || originalKey.includes('en') || normalizedKey.includes('en')) {
          normalizedTranslations.push({
            key: normalizedKey,
            section,
            language: 'en',
            value: enValue,
            description: `Normalized from: ${originalKey}`,
            createdBy: 'system'
          });
        }

        // Icelandic translation (prefer DB, fallback to backup, allow empty)
        const isValue = dbData.is?.[originalKey] ||
                       flattenedBackups.is?.[originalKey] ||
                       dbData.is?.[normalizedKey] ||
                       flattenedBackups.is?.[normalizedKey] ||
                       '';

        normalizedTranslations.push({
          key: normalizedKey,
          section,
          language: 'is',
          value: isValue,
          description: `Normalized from: ${originalKey}`,
          createdBy: 'system'
        });
      }

      // Remove duplicates (same key+language)
      const uniqueTranslations = [];
      const seen = new Set();

      for (const translation of normalizedTranslations) {
        const key = `${translation.key}-${translation.language}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueTranslations.push(translation);
        }
      }

      console.log(`Prepared ${uniqueTranslations.length} normalized translations`);

      // Save mapping file
      const mappingPath = path.join(__dirname, '../../backups/normalized_keymap.json');
      await fs.writeFile(mappingPath, JSON.stringify(keyMap, null, 2));
      console.log(`Saved key mapping to ${mappingPath}`);

      // Clear existing translations and insert normalized ones
      console.log('Clearing existing translations...');
      await prisma.translation.deleteMany({});
      await prisma.translationHistory.deleteMany({});

      console.log('Inserting normalized translations...');
      const result = await prisma.translation.createMany({
        data: uniqueTranslations
      });

      console.log(`Successfully normalized ${result.count} translations`);
      return { count: result.count, mapping: keyMap };

    } catch (error) {
      console.error('Error in normalization:', error);
      throw error;
    }
  }

  /**
   * Main execution method
   */
  async run() {
    try {
      const result = await this.normalizeAndMerge();
      console.log('Normalization completed successfully!');
      console.log(`Processed ${result.count} translations`);
      console.log('Key mapping saved for future reference');

      await prisma.$disconnect();
      return result;
    } catch (error) {
      console.error('Normalization failed:', error);
      await prisma.$disconnect();
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const normalizer = new TranslationNormalizer();
  normalizer.run()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = TranslationNormalizer;
