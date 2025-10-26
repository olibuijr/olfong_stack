const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignVatProfiles() {
  console.log('Assigning VAT profiles to categories...\n');

  try {
    // Get the Standard Rate VAT profile
    const standardRate = await prisma.vatProfile.findFirst({
      where: { name: 'Standard Rate' }
    });

    if (!standardRate) {
      console.error('Standard Rate VAT profile not found');
      return;
    }

    console.log(`Found VAT Profile: ${standardRate.name} (${standardRate.vatRate}%)`);

    // List of wine categories that should use the standard rate
    const categories = ['LIGHT WINES', 'WINE', 'RED WINE', 'WHITE WINE', 'ROSÉ WINE'];

    for (const categoryName of categories) {
      const category = await prisma.category.findFirst({
        where: { name: categoryName }
      });

      if (category) {
        await prisma.category.update({
          where: { id: category.id },
          data: { vatProfileId: standardRate.id }
        });
        console.log(`✓ Assigned VAT profile to: ${categoryName}`);
      }
    }

    console.log('\n✓ VAT profiles assigned successfully!');
  } catch (error) {
    console.error('Error assigning VAT profiles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

assignVatProfiles();
