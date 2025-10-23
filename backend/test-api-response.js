const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAPIResponse() {
  try {
    // Simulate what the API endpoint does
    const settings = await prisma.setting.findMany({
      where: { category: 'BUSINESS' }
    });

    console.log('Settings found:', settings.length);

    const openingHoursSetting = settings.find(s => s.key === 'openingHours');

    if (openingHoursSetting) {
      console.log('\nOpening Hours Setting:');
      console.log('Key:', openingHoursSetting.key);
      console.log('Raw Value:', openingHoursSetting.value);

      const parsed = JSON.parse(openingHoursSetting.value);
      console.log('\nThursday from parsed value:', parsed.thursday);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIResponse();
