const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const productModalTranslations = [
  // Product Modal - Discounts Tab
  { key: 'productModal.discounts.tabLabel', is: 'Afslættir', en: 'Discounts' },
  { key: 'productModal.discounts.enableDiscount', is: 'Virkja afslátt fyrir þessa vöru', en: 'Enable Discount for this Product' },
  { key: 'productModal.discounts.originalPrice', is: 'Upprunalegt verð (kr) *', en: 'Original Price (kr) *' },
  { key: 'productModal.discounts.discountPercentage', is: 'Afsláttur (%) *', en: 'Discount Percentage (%) *' },
  { key: 'productModal.discounts.startDate', is: 'Upphafsdagur afsláttar', en: 'Discount Start Date' },
  { key: 'productModal.discounts.endDate', is: 'Lokadagur afsláttar', en: 'Discount End Date' },
  { key: 'productModal.discounts.reasonEn', is: 'Ástæða afsláttar (EN)', en: 'Discount Reason (EN)' },
  { key: 'productModal.discounts.reasonIs', is: 'Ástæða afsláttar (IS)', en: 'Discount Reason (IS)' },
  { key: 'productModal.discounts.reasonPlaceholder', is: 'T.d., Tímabundin útsala, Rýmingarsala', en: 'e.g., Seasonal Sale, Clearance' },
  { key: 'productModal.discounts.reasonIsPlaceholder', is: 'T.d., Tímabundin útsala, Rýmingarsala', en: 'e.g., Seasonal Sale, Clearance' },
  { key: 'productModal.discounts.emptyStateMessage', is: 'Virkjaðu afslátt til að stilla afsláttar fyrir þessa vöru', en: 'Enable discount to configure discount settings for this product' },
];

async function main() {
  console.log('🌱 Adding product modal discount translations...\n');

  let added = 0;
  let skipped = 0;

  for (const translation of productModalTranslations) {
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
