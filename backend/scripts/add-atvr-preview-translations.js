const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const atvrImportTranslations = [
  // ATVR Import Modal - Preview section
  { key: 'atvrImport.alcoholContent', is: 'Alkóhólprósenta', en: 'Alcohol Content' },
  { key: 'atvrImport.distributor', is: 'Dreifimaður', en: 'Distributor' },
  { key: 'atvrImport.packaging', is: 'Umbúðir', en: 'Packaging' },
  { key: 'atvrImport.availability', is: 'Framboð', en: 'Availability' },
  { key: 'atvrImport.specialAttributes', is: 'Sérstakir eiginleikar', en: 'Special Attributes' },
  { key: 'atvrImport.viewOnATVR', is: 'Skoðaðu á ATVR', en: 'View on ATVR' },
];

async function main() {
  console.log('🌱 Adding ATVR import preview translations...\n');

  let added = 0;
  let skipped = 0;

  for (const translation of atvrImportTranslations) {
    try {
      // Upsert Icelandic translation
      await prisma.lang.upsert({
        where: {
          key_locale: {
            key: translation.key,
            locale: 'is'
          }
        },
        update: {
          value: translation.is
        },
        create: {
          key: translation.key,
          locale: 'is',
          value: translation.is
        }
      });

      // Upsert English translation
      await prisma.lang.upsert({
        where: {
          key_locale: {
            key: translation.key,
            locale: 'en'
          }
        },
        update: {
          value: translation.en
        },
        create: {
          key: translation.key,
          locale: 'en',
          value: translation.en
        }
      });

      added++;
    } catch (error) {
      console.error(`Error adding translation for ${translation.key}:`, error.message);
      skipped++;
    }
  }

  console.log(`\n✅ Added/Updated: ${added} translations`);
  if (skipped > 0) {
    console.log(`⚠️  Skipped: ${skipped} translations`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
