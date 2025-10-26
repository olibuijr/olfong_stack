const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importEnglishTranslations() {
  try {
    const batchDir = 'translation-batches-en';
    let totalImported = 0;
    let totalErrors = 0;

    // Find all -en.json batch files
    const files = fs.readdirSync(batchDir)
      .filter(f => f.match(/batch-\d{3}-en\.json/))
      .sort();

    console.log(`📦 Found ${files.length} English translation batches\n`);

    for (const file of files) {
      const filePath = path.join(batchDir, file);
      let translations;

      try {
        translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (error) {
        console.error(`❌ Failed to parse ${file}:`, error.message);
        continue;
      }

      const batchNum = file.match(/batch-(\d{3})/)[1];
      const entryCount = Object.keys(translations).length;
      console.log(`⚙️  Processing batch ${batchNum} (${entryCount} entries)...`);

      let imported = 0;
      let errors = 0;

      // Import each translation
      for (const [key, value] of Object.entries(translations)) {
        try {
          await prisma.lang.upsert({
            where: {
              key_locale: {
                key,
                locale: 'en'
              }
            },
            update: { value },
            create: {
              key,
              locale: 'en',
              value
            }
          });
          imported++;
        } catch (error) {
          errors++;
          console.error(`  Error importing ${key}:`, error.code);
        }
      }

      console.log(`  ✅ Imported/Upserted: ${imported}, Errors: ${errors}`);
      totalImported += imported;
      totalErrors += errors;
    }

    console.log(`\n✨ Import complete!`);
    console.log(`📊 Total imported/upserted: ${totalImported}`);
    console.log(`❌ Total errors: ${totalErrors}`);

    // Verify final count
    const final = await prisma.lang.count({
      where: { locale: 'en' }
    });
    console.log(`📈 Final English translations in database: ${final}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importEnglishTranslations();
