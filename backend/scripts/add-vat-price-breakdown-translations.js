const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = [
  { key: 'productDetailPage.priceBeforeVat', en: 'Price before VAT', is: 'Verð fyrir VSK' },
  { key: 'productDetailPage.vatAmount', en: 'VAT Amount', is: 'VSK upphæð' },
  { key: 'productDetailPage.totalPrice', en: 'Total Price (incl. VAT)', is: 'Heildarverð (með VSK)' },
];

async function addTranslations() {
  console.log('Adding VAT price breakdown translations...\n');

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

    console.log('\n✓ All VAT price breakdown translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
