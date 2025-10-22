const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMissingTranslations() {
  const missingKeys = [
    { key: 'navigation.shop', section: 'navigation', en: 'Shop', is: '' },
    { key: 'navigation.login', section: 'navigation', en: 'Login', is: '' },
    { key: 'navigation.wine', section: 'navigation', en: 'Wine', is: '' },
    { key: 'navigation.beer', section: 'navigation', en: 'Beer', is: '' },
    { key: 'search.placeholder', section: 'search', en: 'Search for products...', is: '' },
    { key: 'delivery.title', section: 'delivery', en: 'Delivery Options', is: '' },
    { key: 'aria.mainNavigation', section: 'aria', en: 'Main navigation', is: '' },
    { key: 'aria.homepage', section: 'aria', en: 'Homepage', is: '' },
    { key: 'aria.logo', section: 'aria', en: 'Ölföng logo', is: '' }
  ];

  console.log('Adding missing translation keys...');

  for (const key of missingKeys) {
    // Check if EN exists
    const enExists = await prisma.translation.findFirst({
      where: { key: key.key, language: 'en' }
    });
    
    if (!enExists) {
      await prisma.translation.create({
        data: {
          key: key.key,
          language: 'en',
          value: key.en,
          section: key.section
        }
      });
      console.log('✓ Added EN:', key.key, '=', key.en);
    } else {
      console.log('  EN exists:', key.key);
    }
    
    // Check if IS exists
    const isExists = await prisma.translation.findFirst({
      where: { key: key.key, language: 'is' }
    });
    
    if (!isExists) {
      await prisma.translation.create({
        data: {
          key: key.key,
          language: 'is',
          value: key.is,
          section: key.section
        }
      });
      console.log('✓ Added IS:', key.key, '(empty)');
    } else {
      console.log('  IS exists:', key.key);
    }
  }
  
  console.log('\nDone!');
  await prisma.$disconnect();
}

addMissingTranslations().catch(console.error);

