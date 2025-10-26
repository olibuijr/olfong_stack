require('dotenv').config();
const prisma = require('../src/config/database');

async function addTranslations() {
  try {
    console.log('Adding missing notification type translations...');

    const translations = [
      // English
      { key: 'adminNotifications.order', locale: 'en', value: 'Order' },
      { key: 'adminNotifications.payment', locale: 'en', value: 'Payment' },

      // Icelandic
      { key: 'adminNotifications.order', locale: 'is', value: 'Pöntun' },
      { key: 'adminNotifications.payment', locale: 'is', value: 'Greiðsla' },
    ];

    for (const translation of translations) {
      // Check if it already exists
      const existing = await prisma.lang.findUnique({
        where: {
          key_locale: {
            key: translation.key,
            locale: translation.locale,
          },
        },
      });

      if (!existing) {
        await prisma.lang.create({
          data: translation,
        });
        console.log(`✓ Created: ${translation.key} (${translation.locale})`);
      } else {
        console.log(`✓ Already exists: ${translation.key} (${translation.locale})`);
      }
    }

    console.log('✓ All translations added successfully');
  } catch (error) {
    console.error('Error adding translations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
