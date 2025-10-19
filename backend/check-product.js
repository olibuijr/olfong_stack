const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProduct() {
  try {
    const product = await prisma.product.findUnique({
      where: { id: 2 },
      include: {
        category: true,
      }
    });
    
    console.log('Product data:');
    console.log(JSON.stringify(product, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduct();
