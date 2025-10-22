const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');

  try {
    // Remove test shipping options (but preserve defaults)
    const shippingDeleted = await prisma.shippingOption.deleteMany({
      where: {
        OR: [
          { name: { startsWith: 'Test' } },
          { name: { startsWith: 'Validation' } },
          { name: { contains: 'Test' } },
          { name: { startsWith: 'Express Delivery' } },
          { name: { startsWith: 'Hraðsending' } }
        ],
        AND: {
          name: { notIn: ['Home Delivery', 'Store Pickup'] } // Preserve defaults
        }
      }
    });

    // Remove test products
    const productsDeleted = await prisma.product.deleteMany({
      where: {
        name: { startsWith: 'Test Product' }
      }
    });

    // Remove test categories
    const categoriesDeleted = await prisma.category.deleteMany({
      where: {
        name: { startsWith: 'Test Category' }
      }
    });

    console.log(`✅ Cleaned up ${shippingDeleted.count} shipping options, ${productsDeleted.count} products, ${categoriesDeleted.count} categories`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupTestData()
    .then(() => {
      console.log('✅ Test data cleanup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test data cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupTestData };