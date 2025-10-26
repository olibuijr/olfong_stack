const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = [
  { key: 'adminAnalytics.totalVat', en: 'Total VAT', is: 'Samtals VSK' },
  { key: 'adminAnalytics.ofRevenue', en: 'of revenue', is: 'af tekjum' },
  { key: 'adminAnalytics.revenueBeforeVat', en: 'Revenue (before VAT)', is: 'Tekjur (fyrir VSK)' },
  { key: 'adminAnalytics.netRevenue', en: 'Net revenue', is: 'Hreinar tekjur' },
  { key: 'adminAnalytics.averageVatRate', en: 'Average VAT Rate', is: 'Meðaltal VSK hlutfalls' },
  { key: 'adminAnalytics.acrossAllOrders', en: 'across all orders', is: 'yfir allar pantanir' },
  { key: 'adminAnalytics.ofVat', en: 'of VAT', is: 'af VSK' },
];

async function addTranslations() {
  console.log('Adding analytics VAT translations...\n');

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

    console.log('\n✓ All analytics VAT translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
