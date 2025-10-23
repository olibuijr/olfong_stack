const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateThursdayHours() {
  try {
    // Get current opening hours
    const setting = await prisma.setting.findUnique({
      where: { key: 'openingHours' }
    });

    if (setting) {
      const openingHours = JSON.parse(setting.value);
      console.log('Current Thursday hours:', openingHours.thursday);

      // Update Thursday opening time to 09:00
      openingHours.thursday.open = '09:00';

      // Save back to database
      await prisma.setting.update({
        where: { key: 'openingHours' },
        data: { value: JSON.stringify(openingHours) }
      });

      console.log('Updated Thursday hours:', openingHours.thursday);
      console.log('Successfully updated Thursday opening time to 09:00');
    } else {
      console.log('No opening hours setting found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateThursdayHours();
