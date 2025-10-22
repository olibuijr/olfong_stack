const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMissingEnglishTranslations() {
  try {
    console.log('🔍 Finding missing English translations...');

    // Get all Icelandic translations
    const icelandicTranslations = await prisma.translation.findMany({
      where: { language: 'is' },
      select: {
        key: true,
        section: true,
        value: true
      }
    });

    console.log(`📊 Found ${icelandicTranslations.length} Icelandic translations`);

    const missingTranslations = [];
    let checkedCount = 0;

    // Check each Icelandic translation for missing English counterpart
    for (const icelandicTrans of icelandicTranslations) {
      // Check if English translation exists for this key
      const englishTranslation = await prisma.translation.findUnique({
        where: {
          key_language: {
            key: icelandicTrans.key,
            language: 'en'
          }
        }
      });

      if (!englishTranslation) {
        missingTranslations.push({
          key: icelandicTrans.key,
          section: icelandicTrans.section,
          language: 'en',
          value: icelandicTrans.value, // Use Icelandic value as placeholder
          createdBy: 'system'
        });
      }

      checkedCount++;
      if (checkedCount % 100 === 0) {
        console.log(`   Checked ${checkedCount}/${icelandicTranslations.length} translations...`);
      }
    }

    console.log(`⚠️  Found ${missingTranslations.length} missing English translations`);

    if (missingTranslations.length === 0) {
      console.log('✅ All Icelandic translations have English counterparts!');
      return;
    }

    // Create missing English translations
    console.log('💾 Creating missing English translations...');

    const batchSize = 100;
    let createdCount = 0;

    for (let i = 0; i < missingTranslations.length; i += batchSize) {
      const batch = missingTranslations.slice(i, i + batchSize);

      const result = await prisma.translation.createMany({
        data: batch,
        skipDuplicates: true
      });

      createdCount += result.count;
      console.log(`   📦 Created batch ${Math.ceil((i + 1) / batchSize)}: ${result.count} translations`);
    }

    console.log(`✅ Successfully created ${createdCount} missing English translations`);

    // Get final statistics
    const [totalCount, enCount, isCount] = await Promise.all([
      prisma.translation.count(),
      prisma.translation.count({ where: { language: 'en' } }),
      prisma.translation.count({ where: { language: 'is' } })
    ]);

    console.log(`📈 Updated statistics:`);
    console.log(`   Total translations: ${totalCount}`);
    console.log(`   English translations: ${enCount}`);
    console.log(`   Icelandic translations: ${isCount}`);

    // Show some examples of what was created
    if (missingTranslations.length > 0) {
      console.log('\n📝 Examples of created translations:');
      const examples = missingTranslations.slice(0, 5);
      examples.forEach(example => {
        console.log(`   ${example.key}: "${example.value}"`);
      });

      if (missingTranslations.length > 5) {
        console.log(`   ... and ${missingTranslations.length - 5} more`);
      }
    }

  } catch (error) {
    console.error('❌ Error during process:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingEnglishTranslations();