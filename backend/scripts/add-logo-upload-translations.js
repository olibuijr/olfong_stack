const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = [
  { key: 'adminSettings.logoUploadedSuccessfully', en: 'Logo uploaded successfully', is: 'Merki hlaðið upp með góðum árangri' },
  { key: 'adminSettings.invalidFileType', en: 'Please upload a valid image file', is: 'Vinsamlegast hlaðið upp gildri myndaskomu' },
  { key: 'adminSettings.logoUploadFailed', en: 'Failed to upload logo', is: 'Mistókst að hlaða upp merki' }
];

async function addTranslations() {
  console.log('Adding logo upload translations...\n');

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

    console.log('\n✓ All logo upload translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
