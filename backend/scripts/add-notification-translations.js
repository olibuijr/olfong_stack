require('dotenv').config();
const prisma = require('../src/config/database');

async function addTranslations() {
  try {
    console.log('Adding missing notification translations...');

    const translations = [
      // English
      { key: 'adminNotifications.unreadCount', locale: 'en', value: '{{count}} Unread' },
      { key: 'adminNotifications.archivedCount', locale: 'en', value: '{{count}} Archived' },
      { key: 'adminNotifications.totalCount', locale: 'en', value: '{{count}} Total' },

      // Icelandic
      { key: 'adminNotifications.unreadCount', locale: 'is', value: '{{count}} Ólesin' },
      { key: 'adminNotifications.archivedCount', locale: 'is', value: '{{count}} Geymt' },
      { key: 'adminNotifications.totalCount', locale: 'is', value: '{{count}} Alls' },
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
