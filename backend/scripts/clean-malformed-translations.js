const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanMalformedTranslations() {
  try {
    console.log('🧹 Starting cleanup of malformed translations...');

    // Get current counts
    const totalBefore = await prisma.translation.count();
    console.log(`📊 Total translations before cleanup: ${totalBefore}`);

    // Define patterns for malformed keys that should be removed
    const malformedPatterns = [
      // Single characters or symbols
      /^[^\w]+$/,
      // Keys that look like URLs or paths
      /^\/.*$/,
      // Keys with template literals
      /\$\{.*\}/,
      // Keys that are just numbers or special chars
      /^[^a-zA-Z]*$/,
      // Very short keys (1-2 chars) that aren't meaningful
      /^[a-zA-Z]{1,2}$/,
      // Keys with unusual characters
      /[<>{}[\]()]/,
      // Keys that start with dots
      /^\./,
      // Keys that are just punctuation
      /^[.,;:!?]+$/,
    ];

    // Get all translations
    const allTranslations = await prisma.translation.findMany({
      select: { id: true, key: true, language: true, value: true }
    });

    // Filter out malformed translations
    const malformedIds = new Set();

    for (const translation of allTranslations) {
      const key = translation.key;

      // Check if key matches any malformed pattern
      const isMalformed = malformedPatterns.some(pattern => pattern.test(key));

      // Also check for keys that are too generic or meaningless
      const isMeaningless = key.length < 3 ||
                           key === key.toUpperCase() && key.length < 5 ||
                           /^\d+$/.test(key);

      if (isMalformed || isMeaningless) {
        malformedIds.add(translation.id);
      }
    }

    console.log(`🗑️  Found ${malformedIds.size} malformed translations to remove`);

    if (malformedIds.size > 0) {
      // Show some examples before deletion
      const examples = allTranslations
        .filter(t => malformedIds.has(t.id))
        .slice(0, 10)
        .map(t => `"${t.key}": "${t.value}" (${t.language})`);

      console.log('📝 Examples of malformed translations:');
      examples.forEach(example => console.log(`   - ${example}`));

      // Delete malformed translations
      const deleteResult = await prisma.translation.deleteMany({
        where: {
          id: {
            in: Array.from(malformedIds)
          }
        }
      });

      console.log(`✅ Deleted ${deleteResult.count} malformed translations`);
    }

    // Get final counts
    const totalAfter = await prisma.translation.count();
    const [enCount, isCount] = await Promise.all([
      prisma.translation.count({ where: { language: 'en' } }),
      prisma.translation.count({ where: { language: 'is' } })
    ]);

    console.log(`📈 Final statistics:`);
    console.log(`   Total translations: ${totalAfter} (removed ${totalBefore - totalAfter})`);
    console.log(`   English translations: ${enCount}`);
    console.log(`   Icelandic translations: ${isCount}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanMalformedTranslations();