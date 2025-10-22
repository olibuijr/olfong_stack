const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearTranslations() {
  try {
    console.log('🗑️  Starting translation cleanup...');

    // Get counts before deletion
    const [translationCount, historyCount] = await Promise.all([
      prisma.translation.count(),
      prisma.translationHistory.count()
    ]);

    console.log(`📊 Found ${translationCount} translations and ${historyCount} history entries`);

    // Clear existing translations and history
    await prisma.translationHistory.deleteMany({});
    await prisma.translation.deleteMany({});

    console.log('✅ All translations and history cleared successfully');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearTranslations();