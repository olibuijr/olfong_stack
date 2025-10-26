const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = [
  { key: 'productDetailPage.vatInformation', en: 'VAT Information', is: 'VSK Upplýsingar' },
  { key: 'productDetailPage.vatProfile', en: 'VAT Profile', is: 'VSK Snið' },
  { key: 'productDetailPage.vatRate', en: 'VAT Rate', is: 'VSK hlutfall' },
];

async function addTranslations() {
  console.log('Adding product detail VAT translations...\n');

  try {
    for (const { key, en, is } of translations) {
      // Add English translation
      await prisma.lang.upsert({
        where: { key_locale: { key, locale: 'en' } },
        update: { value: en },
        create: { key, locale: 'en', value: en }
      });

      // Add Icelandic translation
      await prisma.lang.upsert({
        where: { key_locale: { key, locale: 'is' } },
        update: { value: is },
        create: { key, locale: 'is', value: is }
      });

      console.log(`✓ Added/Updated: ${key}`);
    }

    console.log('\n✓ All product detail VAT translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
