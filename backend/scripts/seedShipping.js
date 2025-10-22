const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedShippingOptions() {
  console.log('🌱 Starting shipping options seeding...');

  const shippingOptions = [
    {
      name: 'Home Delivery',
      nameIs: 'Heimsending',
      description: 'Delivery to your home address within 1-2 business days',
      descriptionIs: 'Sending heim á heimilisfang þitt innan 1-2 virkra daga',
      type: 'DELIVERY',
      fee: 500,
      isActive: true,
      sortOrder: 1,
      estimatedDays: 2,
      cutoffTime: '14:00'
    },
    {
      name: 'Store Pickup',
      nameIs: 'Afhending í verslun',
      description: 'Pick up your order at our store location',
      descriptionIs: 'Sæktu pöntun þína í verslun okkar',
      type: 'PICKUP',
      fee: 0,
      isActive: true,
      sortOrder: 2,
      estimatedDays: 1,
      cutoffTime: '17:00'
    }
  ];

  try {
    for (const option of shippingOptions) {
      // Check if shipping option already exists
      const existing = await prisma.shippingOption.findFirst({
        where: { name: option.name }
      });

      if (existing) {
        console.log(`⚠️  Shipping option "${option.name}" already exists, skipping...`);
        continue;
      }

      // Create new shipping option
      const created = await prisma.shippingOption.create({
        data: option
      });

      console.log('✅ Created shipping option:', created.name);
    }

    console.log('🎉 Shipping options seeding completed successfully!');
    console.log('📋 Summary:');
    console.log('   - Home Delivery: 500 ISK (1-2 days)');
    console.log('   - Store Pickup: Free (1 day)');

  } catch (error) {
    console.error('❌ Error seeding shipping options:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedShippingOptions()
    .then(() => {
      console.log('✅ Shipping options seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Shipping options seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedShippingOptions };