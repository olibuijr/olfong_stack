const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = [
  { key: 'adminSettings.logoColorMode', en: 'Logo Color Mode', is: 'Litur merkis' },
  { key: 'adminSettings.logoNoInversion', en: 'No inversion', is: 'Engin breyting' },
  { key: 'adminSettings.logoThemeAware', en: 'Invert on dark theme', is: 'Snúa við á dökku þema' },
  { key: 'adminSettings.logoAlwaysInvert', en: 'Always invert', is: 'Alltaf snúa við' }
];

async function addTranslations() {
  console.log('Adding logo inversion translations...\n');

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

    console.log('\n✓ All logo inversion translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
