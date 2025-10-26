const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = [
  { key: 'adminCategories.vat', en: 'VAT', is: 'VSK' },
  { key: 'adminCategories.vatProfile', en: 'VAT Profile', is: 'VSK Snið' },
  { key: 'adminCategories.selectVatProfile', en: 'Select a VAT Profile', is: 'Veldu VSK Snið' },
  { key: 'adminCategories.vatHelp', en: 'Select a VAT profile to apply to all products in this category. The VAT rate will be calculated based on the selected profile.', is: 'Veldu VSK snið til að nota fyrir allar vörur í þessum flokki. VSK hlutfallið verður reiknað út frá völdu sniði.' },
  { key: 'adminCategories.vatProfileHelp', en: 'The VAT rate will be applied to all products in this category.', is: 'VSK hlutfallið verður notað fyrir allar vörur í þessum flokki.' },
  { key: 'adminCategories.selectedVatProfile', en: 'Selected VAT Profile', is: 'Valið VSK Snið' },
];

async function addTranslations() {
  console.log('Adding category VAT translations...\n');

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

    console.log('\n✓ All category VAT translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
