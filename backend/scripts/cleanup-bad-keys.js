const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupBadKeys() {
  console.log('Cleaning up bad translation keys...');
  
  const result = await prisma.translation.deleteMany({
    where: {
      key: ''
    }
  });
  
  console.log('✓ Deleted', result.count, 'translations with empty keys');
  await prisma.$disconnect();
}

cleanupBadKeys().catch(console.error);

