const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = [
  // Receipt Settings Labels
  { key: 'adminSettings.companyInformation', en: 'Company Information', is: 'Fyrirtækjaupplýsingar' },
  { key: 'adminSettings.companyNameEnglish', en: 'Company Name (English)', is: 'Nafn fyrirtækis (enska)' },
  { key: 'adminSettings.companyNameIcelandic', en: 'Company Name (Icelandic)', is: 'Nafn fyrirtækis (íslenska)' },
  { key: 'adminSettings.addressEnglish', en: 'Address (English)', is: 'Heimilisfang (enska)' },
  { key: 'adminSettings.addressIcelandic', en: 'Address (Icelandic)', is: 'Heimilisfang (íslenska)' },
  { key: 'adminSettings.phone', en: 'Phone', is: 'Sími' },
  { key: 'adminSettings.email', en: 'Email', is: 'Netfang' },
  { key: 'adminSettings.website', en: 'Website', is: 'Vefsíða' },
  { key: 'adminSettings.taxId', en: 'Tax ID', is: 'VSK númer' },
  { key: 'adminSettings.logo', en: 'Logo', is: 'Merki' },
  { key: 'adminSettings.currentLogo', en: 'Current logo', is: 'Núverandi merki' },
  { key: 'adminSettings.remove', en: 'Remove', is: 'Fjarlægja' },
  { key: 'adminSettings.designColors', en: 'Design & Colors', is: 'Hönnun og litir' },
  { key: 'adminSettings.headerColor', en: 'Header Color', is: 'Litur á haus' },
  { key: 'adminSettings.accentColor', en: 'Accent Color', is: 'Áherslulitur' },
  { key: 'adminSettings.fontFamily', en: 'Font Family', is: 'Leturgerð' },
  { key: 'adminSettings.fontSize', en: 'Font Size', is: 'Leturstærð' },
  { key: 'adminSettings.templateLayout', en: 'Template & Layout', is: 'Sniðmát og útlit' },
  { key: 'adminSettings.templateStyle', en: 'Template Style', is: 'Stíll sniðmáts' },
  { key: 'adminSettings.paperSize', en: 'Paper Size', is: 'Pappírsstærð' },
  { key: 'adminSettings.saving', en: 'Saving...', is: 'Vistar...' }
];

async function addTranslations() {
  console.log('Adding receipt settings translations...\n');

  try {
    for (const { key, en, is } of translations) {
      // Add English translation
      const enResult = await prisma.lang.upsert({
        where: { key_locale: { key, locale: 'en' } },
        update: { value: en },
        create: { key, locale: 'en', value: en }
      });

      // Add Icelandic translation
      const isResult = await prisma.lang.upsert({
        where: { key_locale: { key, locale: 'is' } },
        update: { value: is },
        create: { key, locale: 'is', value: is }
      });

      console.log(`✓ Added/Updated: ${key}`);
    }

    console.log('\n✓ All receipt settings translations added successfully!');
  } catch (error) {
    console.error('Error adding translations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
