const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDefaultShippingOptions() {
  console.log('🌱 Starting seeding of default shipping options...');

  const defaultShippingOptions = [
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
    for (const option of defaultShippingOptions) {
      // Check if shipping option already exists
      const existing = await prisma.shippingOption.findFirst({
        where: { name: option.name }
      });

      if (existing) {
        console.log(`⚠️  Default shipping option "${option.name}" already exists, ensuring it's active...`);
        // Ensure it's active
        await prisma.shippingOption.update({
          where: { id: existing.id },
          data: { isActive: true }
        });
        continue;
      }

      // Create new default shipping option
      const created = await prisma.shippingOption.create({
        data: option
      });

      console.log('✅ Created default shipping option:', created.name);
    }

    console.log('🎉 Default shipping options seeding completed successfully!');
    console.log('📋 Default shipping options:');
    console.log('   - Home Delivery: 500 ISK (1-2 days delivery)');
    console.log('   - Store Pickup: Free (1 day pickup)');

  } catch (error) {
    console.error('❌ Error seeding default shipping options:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedDefaultShippingOptions()
    .then(() => {
      console.log('✅ Default shipping options seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Default shipping options seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDefaultShippingOptions };