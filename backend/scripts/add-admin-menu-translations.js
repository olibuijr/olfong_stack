const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const adminMenuTranslations = [
  // Sales section
  { key: 'adminMenu.sales', is: 'Sölur', en: 'Sales' },
  { key: 'adminMenu.orders', is: 'Pantanir', en: 'Orders' },
  { key: 'adminMenu.pointOfSale', is: 'Sölustaður', en: 'Point of Sale' },
  { key: 'adminMenu.deliveries', is: 'Afhendingar', en: 'Deliveries' },

  // Catalog section
  { key: 'adminMenu.catalog', is: 'Vörulisti', en: 'Catalog' },
  { key: 'adminMenu.products', is: 'Vörur', en: 'Products' },
  { key: 'adminMenu.categories', is: 'Flokkar', en: 'Categories' },
  { key: 'adminMenu.media', is: 'Myndefni', en: 'Media' },

  // Analytics section
  { key: 'adminMenu.analytics', is: 'Greiningar', en: 'Analytics' },
  { key: 'adminMenu.analyticsLink', is: 'Greiningar', en: 'Analytics' },
  { key: 'adminMenu.customers', is: 'Viðskiptavinir', en: 'Customers' },
  { key: 'adminMenu.reports', is: 'Skýrslur', en: 'Reports' },

  // Content section
  { key: 'adminMenu.content', is: 'Innihald', en: 'Content' },
  { key: 'adminMenu.banners', is: 'Borðar', en: 'Banners' },
  { key: 'adminMenu.messages', is: 'Skilaboð', en: 'Messages' },
  { key: 'adminMenu.notifications', is: 'Tilkynningar', en: 'Notifications' },

  // Settings section
  { key: 'adminMenu.settingsSection', is: 'Stillingar', en: 'Settings' },
  { key: 'adminMenu.general', is: 'Almennt', en: 'General' },
  { key: 'adminMenu.payment', is: 'Greiðslur', en: 'Payment' },
  { key: 'adminMenu.receipts', is: 'Kvittanir', en: 'Receipts' },

  // System section
  { key: 'adminMenu.system', is: 'Kerfi', en: 'System' },
  { key: 'adminMenu.translations', is: 'Þýðingar', en: 'Translations' },
  { key: 'adminMenu.demoData', is: 'Sýnisgögn', en: 'Demo Data' },

  // Header and footer text
  { key: 'adminMenu.dashboard', is: 'Mælaborð', en: 'Dashboard' },
  { key: 'adminMenu.manageBusinessSettings', is: 'Hafðu umsjón með fyrirtækinu og stillingum', en: 'Manage your business and settings' },
  { key: 'adminMenu.helpText', is: 'Vantar þig hjálp? Kíktu í', en: 'Need help? Check the' },
  { key: 'adminMenu.supportCenter', is: 'þjónustuverið', en: 'support center' },
];

async function main() {
  console.log('🌱 Adding admin menu translations...\n');

  let added = 0;
  let skipped = 0;

  for (const translation of adminMenuTranslations) {
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

      console.log(`✅ ${translation.key}`);
      added += 2;
    } catch (error) {
      console.error(`❌ Error adding translation ${translation.key}:`, error.message);
      skipped += 2;
    }
  }

  console.log(`\n✨ Translation seeding complete!`);
  console.log(`📊 Summary:`);
  console.log(`   ✅ Added/Updated: ${added}`);
  console.log(`   ⚠️  Skipped/Errors: ${skipped}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('\n❌ Fatal error:', e);
    process.exit(1);
  });
