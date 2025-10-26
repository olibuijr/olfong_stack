require('dotenv').config();
const prisma = require('../src/config/database');

async function addTranslations() {
  try {
    console.log('Adding VAT translations...');

    const translations = [
      // English - Checkout VAT
      { key: 'checkout.subtotal', locale: 'en', value: 'Subtotal' },
      { key: 'checkout.vat', locale: 'en', value: 'VAT' },
      { key: 'checkout.shipping', locale: 'en', value: 'Shipping' },
      { key: 'checkout.total', locale: 'en', value: 'Total' },
      { key: 'checkout.totalWithVat', locale: 'en', value: 'Total (including VAT)' },

      // English - Receipt VAT
      { key: 'receipt.basePrice', locale: 'en', value: 'Base Price' },
      { key: 'receipt.vatAmount', locale: 'en', value: 'VAT Amount' },
      { key: 'receipt.totalBeforeVat', locale: 'en', value: 'Subtotal' },
      { key: 'receipt.totalWithVat', locale: 'en', value: 'Total' },

      // Icelandic - Checkout VAT
      { key: 'checkout.subtotal', locale: 'is', value: 'Undirsamtals' },
      { key: 'checkout.vat', locale: 'is', value: 'VSK' },
      { key: 'checkout.shipping', locale: 'is', value: 'Sendingarkostnaður' },
      { key: 'checkout.total', locale: 'is', value: 'Samtals' },
      { key: 'checkout.totalWithVat', locale: 'is', value: 'Samtals (með VSK)' },

      // Icelandic - Receipt VAT
      { key: 'receipt.basePrice', locale: 'is', value: 'Grunnverð' },
      { key: 'receipt.vatAmount', locale: 'is', value: 'VSK upphæð' },
      { key: 'receipt.totalBeforeVat', locale: 'is', value: 'Undirsamtals' },
      { key: 'receipt.totalWithVat', locale: 'is', value: 'Samtals' },
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

    console.log('✓ All VAT translations added successfully');
  } catch (error) {
    console.error('Error adding translations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
