const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = [
  { key: 'adminSettings.solidColor', en: 'Solid Color', is: 'Solid litur' },
  { key: 'adminSettings.gradientColor', en: 'Gradient', is: 'Liturkva' },
  { key: 'adminSettings.customGradient', en: 'Custom Gradient', is: 'Sérsniðin liturkva' },
  { key: 'adminSettings.gradientHelpText', en: 'Example: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', is: 'Dæmi: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }
];

async function addTranslations() {
  console.log('Adding gradient color translations...\n');

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

    console.log('\n✓ All gradient color translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
