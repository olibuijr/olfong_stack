const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = [
  { key: 'adminSettings.vatProfiles', en: 'VAT Profiles & Categories', is: 'VSK Snið & Flokkar' },
  { key: 'adminSettings.addProfile', en: 'Add Profile', is: 'Bæta við sniði' },
  { key: 'adminSettings.createNewVatProfile', en: 'Create New VAT Profile', is: 'Búa til nýtt VSK snið' },
  { key: 'adminSettings.editVatProfile', en: 'Edit VAT Profile', is: 'Breyta VSK sniði' },
  { key: 'adminSettings.nameEnglish', en: 'Name (English)', is: 'Heiti (Enska)' },
  { key: 'adminSettings.nameIcelandic', en: 'Name (Icelandic)', is: 'Heiti (Íslenska)' },
  { key: 'adminSettings.vatRatePercent', en: 'VAT Rate (%)', is: 'VSK hlutfall (%)' },
  { key: 'adminSettings.setAsDefault', en: 'Set as Default', is: 'Stilla sem sjálfgefið' },
  { key: 'adminSettings.descriptionEnglish', en: 'Description (English)', is: 'Lýsing (Enska)' },
  { key: 'adminSettings.descriptionIcelandic', en: 'Description (Icelandic)', is: 'Lýsing (Íslenska)' },
  { key: 'adminSettings.assignCategories', en: 'Assign Categories', is: 'Úthluta flokkum' },
  { key: 'adminSettings.noCategoriesAvailable', en: 'No categories available', is: 'Engir flokkar tiltækir' },
  { key: 'adminSettings.saveProfile', en: 'Save Profile', is: 'Vista snið' },
  { key: 'adminSettings.cancel', en: 'Cancel', is: 'Hætta við' },
  { key: 'adminSettings.noVatProfilesCreated', en: 'No VAT profiles created yet', is: 'Engin VSK snið búin til ennþá' },
  { key: 'adminSettings.vatRateLabel', en: 'VAT Rate:', is: 'VSK hlutfall:' },
  { key: 'adminSettings.categories', en: 'Categories:', is: 'Flokkar:' },
  { key: 'adminSettings.edit', en: 'Edit', is: 'Breyta' },
  { key: 'adminSettings.delete', en: 'Delete', is: 'Eyða' },
  { key: 'adminSettings.saving', en: 'Saving...', is: 'Vista...' },
];

async function addTranslations() {
  console.log('Adding VAT profile translations...\n');

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

    console.log('\n✓ All VAT profile translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
