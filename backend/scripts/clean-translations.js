const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanTranslations() {
  console.log('Starting translation cleanup...');

  try {
    // Get all translations
    const allTranslations = await prisma.translation.findMany({
      orderBy: [
        { key: 'asc' },
        { language: 'asc' },
        { updatedAt: 'desc' }
      ]
    });

    console.log(`Found ${allTranslations.length} total translations`);

    // Group by key and language to find duplicates
    const grouped = {};
    allTranslations.forEach(translation => {
      const key = `${translation.key}:${translation.language}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(translation);
    });

    // Find duplicates
    const duplicates = Object.values(grouped).filter(group => group.length > 1);
    console.log(`Found ${duplicates.length} duplicate key+language combinations`);

    // Remove duplicates, keeping the most recent one
    for (const duplicateGroup of duplicates) {
      const toDelete = duplicateGroup.slice(1); // Keep the first (most recent), delete the rest
      for (const translation of toDelete) {
        console.log(`Deleting duplicate: ${translation.key} (${translation.language}) - "${translation.value}"`);
        await prisma.translation.delete({
          where: { id: translation.id }
        });
      }
    }

    // Find conflicting parent keys (keys that exist alongside their child keys)
    const allKeys = await prisma.translation.findMany({
      select: { key: true },
      distinct: ['key']
    });

    const keySet = new Set(allKeys.map(k => k.key));
    const keysToDelete = [];

    for (const key of keySet) {
      // Check if this key has children
      const hasChildren = Array.from(keySet).some(otherKey =>
        otherKey.startsWith(key + '.') && otherKey !== key
      );

      if (hasChildren) {
        console.log(`Found parent key with children: ${key}`);
        keysToDelete.push(key);
      }
    }

    // Delete conflicting parent keys
    for (const key of keysToDelete) {
      console.log(`Deleting conflicting parent key: ${key}`);
      await prisma.translation.deleteMany({
        where: { key }
      });
    }

    // Get final count
    const finalCount = await prisma.translation.count();
    console.log(`Cleanup complete. Final translation count: ${finalCount}`);

    // Show some statistics
    const byLanguage = await prisma.translation.groupBy({
      by: ['language'],
      _count: { id: true }
    });

    console.log('Translations by language:');
    byLanguage.forEach(lang => {
      console.log(`  ${lang.language}: ${lang._count.id}`);
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanTranslations();