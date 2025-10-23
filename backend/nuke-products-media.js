const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function nukeProductsAndMedia() {
  try {
    console.log('🗑️  Starting cleanup...\n');

    // Delete all media in PRODUCTS collection
    const mediaResult = await prisma.media.deleteMany({
      where: { collection: 'PRODUCTS' }
    });
    console.log(`✓ Deleted ${mediaResult.count} media files`);

    // Delete all products
    const productResult = await prisma.product.deleteMany({});
    console.log(`✓ Deleted ${productResult.count} products`);

    console.log('\n✓ Done! All products and media have been deleted.');
    console.log('You can now start fresh with new products and media.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

nukeProductsAndMedia();
