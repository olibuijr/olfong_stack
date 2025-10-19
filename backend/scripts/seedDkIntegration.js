const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDkIntegration() {
  try {
    console.log('Seeding DK integration...');

    // Check if DK integration already exists
    const existingIntegration = await prisma.integration.findFirst({
      where: { provider: 'dk' }
    });

    if (existingIntegration) {
      console.log('DK integration already exists, skipping...');
      return;
    }

    // Create DK integration
    const dkIntegration = await prisma.integration.create({
      data: {
        name: 'dk_integration',
        displayName: 'DK Integration',
        provider: 'dk',
        description: 'DK integration for data synchronization and API connectivity',
        baseUrl: 'https://api.dk.com',
        environment: 'sandbox',
        isEnabled: false,
        sortOrder: 2,
        config: JSON.stringify({
          supportedFeatures: ['products', 'customers', 'orders', 'inventory'],
          supportedSyncTypes: ['products', 'customers', 'inventory'],
          apiVersion: 'v1',
          rateLimit: 1000,
          timeout: 30000
        })
      }
    });

    console.log('DK integration created successfully:', dkIntegration);
  } catch (error) {
    console.error('Error seeding DK integration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDkIntegration();
