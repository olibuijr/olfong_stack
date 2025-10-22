const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting integration seeding...');

  // Create Uniconta integration
  const unicontaIntegration = await prisma.integration.upsert({
    where: { name: 'uniconta' },
    update: {},
    create: {
      name: 'uniconta',
      displayName: 'Uniconta Integration',
      provider: 'uniconta',
      isEnabled: false,
      isActive: true,
      sortOrder: 1,
      baseUrl: 'https://api.uniconta.com',
      environment: 'sandbox',
      description: 'Integration with Uniconta ERP system for accounting and inventory management',
      version: '1.0.0',
      config: JSON.stringify({
        syncProducts: true,
        syncCustomers: true,
        syncOrders: true,
        syncInventory: true,
        autoSync: false,
        syncInterval: 3600, // 1 hour in seconds
        batchSize: 100
      })
    }
  });

  console.log('✅ Created Uniconta integration:', unicontaIntegration.displayName);

  // Create ATVR integration (if not exists)
  const atvrIntegration = await prisma.integration.upsert({
    where: { name: 'atvr' },
    update: {},
    create: {
      name: 'atvr',
      displayName: 'ATVR Integration',
      provider: 'atvr',
      isEnabled: false,
      isActive: true,
      sortOrder: 2,
      baseUrl: 'https://api.atvr.is',
      environment: 'production',
      description: 'Integration with ATVR (Áfengis- og tóbaksverslun ríkisins) for product data and compliance',
      version: '1.0.0',
      config: JSON.stringify({
        syncProducts: true,
        syncCategories: true,
        autoSync: false,
        syncInterval: 86400, // 24 hours in seconds
        batchSize: 50
      })
    }
  });

  console.log('✅ Created ATVR integration:', atvrIntegration.displayName);

  // Create Kenni IDP integration (if not exists)
  const kenniIntegration = await prisma.integration.upsert({
    where: { name: 'kenni' },
    update: {},
    create: {
      name: 'kenni',
      displayName: 'Kenni IDP Integration',
      provider: 'kenni',
      isEnabled: true, // This one is enabled by default
      isActive: true,
      sortOrder: 3,
      baseUrl: 'https://idp.kenni.is',
      environment: 'production',
      description: 'Integration with Kenni IDP for user authentication and identity verification',
      version: '1.0.0',
      config: JSON.stringify({
        autoSync: true,
        syncInterval: 300, // 5 minutes in seconds
        verifyAge: true,
        verifyIdentity: true
      })
    }
  });

  console.log('✅ Created Kenni IDP integration:', kenniIntegration.displayName);

  console.log('🎉 Integration seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding integrations:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
















