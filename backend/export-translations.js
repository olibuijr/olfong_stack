const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportTranslations() {
  try {
    // Get all English translations ordered by key
    const englishTranslations = await prisma.lang.findMany({
      where: { locale: 'en' },
      orderBy: { key: 'asc' }
    });

    console.log(`Found ${englishTranslations.length} English translations`);

    // Create a JSON structure with English keys and empty Icelandic values
    const exportData = englishTranslations.reduce((acc, item) => {
      acc[item.key] = {
        en: item.value,
        is: '' // Empty Icelandic string to be filled
      };
      return acc;
    }, {});

    // Write to file
    const filename = path.join(__dirname, '..', 'translations-export.json');
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`✓ Exported ${englishTranslations.length} translations to ${filename}`);

  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportTranslations();
