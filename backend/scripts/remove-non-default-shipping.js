const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeNonDefaultShippingOptions() {
  console.log('🗑️  Starting removal of non-default shipping options...');

  try {
    // Define which shipping options to keep (default ones)
    const defaultShippingNames = ['Home Delivery', 'Store Pickup'];

    // Find all shipping options that are NOT in the default list
    const nonDefaultOptions = await prisma.shippingOption.findMany({
      where: {
        name: {
          notIn: defaultShippingNames
        }
      }
    });

    console.log(`Found ${nonDefaultOptions.length} non-default shipping options to remove:`);
    nonDefaultOptions.forEach(option => {
      console.log(`  - ${option.name} (${option.id})`);
    });

    // Remove non-default shipping options
    const deleteResult = await prisma.shippingOption.deleteMany({
      where: {
        name: {
          notIn: defaultShippingNames
        }
      }
    });

    console.log(`✅ Deleted ${deleteResult.count} non-default shipping options`);

    // Ensure default shipping options are active
    const updateResult = await prisma.shippingOption.updateMany({
      where: {
        name: {
          in: defaultShippingNames
        }
      },
      data: {
        isActive: true
      }
    });

    console.log(`✅ Ensured ${updateResult.count} default shipping options are active`);

    // Show remaining shipping options
    const remainingOptions = await prisma.shippingOption.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    console.log('\n📋 Remaining shipping options:');
    remainingOptions.forEach(option => {
      console.log(`  - ${option.name}: ${option.fee} ISK (${option.isActive ? 'Active' : 'Inactive'})`);
    });

    console.log('🎉 Non-default shipping options removal completed successfully!');

  } catch (error) {
    console.error('❌ Error removing non-default shipping options:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the removal function
if (require.main === module) {
  removeNonDefaultShippingOptions()
    .then(() => {
      console.log('✅ Non-default shipping options removal completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Non-default shipping options removal failed:', error);
      process.exit(1);
    });
}

module.exports = { removeNonDefaultShippingOptions };