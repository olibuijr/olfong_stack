const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSettings() {
  try {
    console.log('Testing settings table...');
    
    // Try to create a simple setting
    const setting = await prisma.setting.create({
      data: {
        key: 'TEST_KEY',
        value: 'test_value',
        description: 'Test setting',
        category: 'GENERAL',
        isEncrypted: false,
        isPublic: true
      }
    });
    
    console.log('Created setting:', setting);
    
    // Try to fetch settings
    const settings = await prisma.setting.findMany();
    console.log('All settings:', settings);
    
    // Clean up
    await prisma.setting.delete({
      where: { key: 'TEST_KEY' }
    });
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error testing settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSettings();
