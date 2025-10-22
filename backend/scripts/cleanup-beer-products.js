const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupBeerProducts() {
  console.log('🧹 Cleaning up existing beer products...');

  try {
    // Get beer category
    const beerCategory = await prisma.category.findFirst({
      where: { name: 'BEER' }
    });

    if (!beerCategory) {
      console.log('No BEER category found, skipping cleanup');
      return;
    }

    // Delete products in beer category
    const deletedProducts = await prisma.product.deleteMany({
      where: { categoryId: beerCategory.id }
    });

    console.log(`✅ Deleted ${deletedProducts.count} beer products`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupBeerProducts();