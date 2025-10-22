const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function backupTranslations() {
  try {
    console.log('🔄 Starting translation backup...');

    // Get all translations
    const translations = await prisma.translation.findMany({
      orderBy: [
        { section: 'asc' },
        { key: 'asc' }
      ]
    });

    console.log(`📊 Found ${translations.length} translations to backup`);

    // Group by language and flatten into nested objects
    const grouped = translations.reduce((acc, translation) => {
      if (!acc[translation.language]) {
        acc[translation.language] = {};
      }

      // Convert dot notation key to nested object
      const keys = translation.key.split('.');
      let current = acc[translation.language];

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = translation.value;

      return acc;
    }, {});

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../../backups');
    await fs.mkdir(backupDir, { recursive: true });

    // Write backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `translations_backup_${timestamp}.json`);

    await fs.writeFile(backupFile, JSON.stringify(grouped, null, 2), 'utf8');

    console.log(`✅ Backup created successfully: ${backupFile}`);
    console.log(`📈 Backup contains ${Object.keys(grouped).length} languages`);

    // Log statistics
    for (const [lang, data] of Object.entries(grouped)) {
      const count = JSON.stringify(data).split('"').length / 2; // Rough count of keys
      console.log(`   ${lang}: ~${count} translation keys`);
    }

  } catch (error) {
    console.error('❌ Error during backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupTranslations();