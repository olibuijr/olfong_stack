const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOpeningHours() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'openingHours' }
    });

    if (setting) {
      console.log('Opening Hours Setting:');
      console.log('Key:', setting.key);
      console.log('Value:', setting.value);
      console.log('\nParsed Value:');
      const parsed = JSON.parse(setting.value);
      console.log(JSON.stringify(parsed, null, 2));
      console.log('\nThursday hours:', parsed.thursday);
    } else {
      console.log('No opening hours setting found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOpeningHours();
