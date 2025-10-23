const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSearch() {
  try {
    const searchTerm = 'Egils Gull';

    // First, check if product exists
    const product = await prisma.product.findUnique({
      where: { id: 437 },
      select: { id: true, name: true, nameIs: true, isActive: true }
    });

    console.log('Product 437:', JSON.stringify(product, null, 2));

    // Now test the search query
    const where = {
      isActive: true,
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { nameIs: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { descriptionIs: { contains: searchTerm, mode: 'insensitive' } }
      ]
    };

    console.log('\nSearch where clause:', JSON.stringify(where, null, 2));

    const results = await prisma.product.findMany({
      where,
      select: { id: true, name: true, nameIs: true, isActive: true }
    });

    console.log('\nSearch results:', JSON.stringify(results, null, 2));
    console.log(`\nFound ${results.length} products`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSearch();
