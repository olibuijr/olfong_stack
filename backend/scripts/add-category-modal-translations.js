const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categoryModalTranslations = [
  // Category Modal - Titles
  { key: 'adminCategories.editCategory', is: 'Breyta flokki', en: 'Edit Category' },
  { key: 'adminCategories.newCategory', is: 'Nýr flokkur', en: 'New Category' },

  // Category Modal - Tab Labels
  { key: 'adminCategories.basicInfo', is: 'Grunnupplýsingar', en: 'Basic Info' },
  { key: 'adminCategories.images', is: 'Myndir', en: 'Images' },
  { key: 'adminCategories.seo', is: 'SEO', en: 'SEO' },
  { key: 'adminCategories.discounts', is: 'Afslættir', en: 'Discounts' },

  // Basic Info Tab
  { key: 'adminCategories.nameEn', is: 'Nafn (EN) *', en: 'Name (EN) *' },
  { key: 'adminCategories.nameIs', is: 'Nafn (IS) *', en: 'Name (IS) *' },
  { key: 'adminCategories.slug', is: 'Slúg (URL) *', en: 'Slug (URL) *' },
  { key: 'adminCategories.descriptionEn', is: 'Lýsing (EN)', en: 'Description (EN)' },
  { key: 'adminCategories.descriptionIs', is: 'Lýsing (IS)', en: 'Description (IS)' },
  { key: 'adminCategories.icon', is: 'Tákn', en: 'Icon' },
  { key: 'adminCategories.sortOrder', is: 'Röð', en: 'Sort Order' },
  { key: 'adminCategories.active', is: 'Virk flokkur', en: 'Active Category' },

  // Images Tab
  { key: 'adminCategories.imagesHelp', is: 'Bættu við myndum fyrir þennan flokk', en: 'Add images for this category' },
  { key: 'adminCategories.noImages', is: 'Engar myndir valdar', en: 'No images selected' },
  { key: 'adminCategories.selectImages', is: 'Veldu myndir', en: 'Select Images' },

  // SEO Tab
  { key: 'adminCategories.seoHelp', is: 'Stilltu SEO gögn fyrir betra leitarvélaeftirlit', en: 'Configure SEO data for better search engine visibility' },
  { key: 'adminCategories.metaTitleEn', is: 'Meta titill (EN)', en: 'Meta Title (EN)' },
  { key: 'adminCategories.metaTitleIs', is: 'Meta titill (IS)', en: 'Meta Title (IS)' },
  { key: 'adminCategories.metaDescEn', is: 'Meta lýsing (EN)', en: 'Meta Description (EN)' },
  { key: 'adminCategories.metaDescIs', is: 'Meta lýsing (IS)', en: 'Meta Description (IS)' },
  { key: 'adminCategories.charCount', is: 'Stafir: {count}/{max}', en: 'Characters: {count}/{max}' },

  // Discounts Tab
  { key: 'adminCategories.discountHelp', is: 'Stilltu almenna afslátt fyrir þennan flokk', en: 'Configure category-wide discount settings' },
  { key: 'adminCategories.enableCategoryDiscount', is: 'Virkja afslátt fyrir flokk', en: 'Enable Discount for this Category' },
  { key: 'adminCategories.discountPercentage', is: 'Afsláttur (%) *', en: 'Discount Percentage (%) *' },
  { key: 'adminCategories.discountStartDate', is: 'Upphafsdagur afsláttar', en: 'Discount Start Date' },
  { key: 'adminCategories.discountEndDate', is: 'Lokadagur afsláttar', en: 'Discount End Date' },
  { key: 'adminCategories.discountReasonEn', is: 'Ástæða afsláttar (EN)', en: 'Discount Reason (EN)' },
  { key: 'adminCategories.discountReasonIs', is: 'Ástæða afsláttar (IS)', en: 'Discount Reason (IS)' },
  { key: 'adminCategories.enableDiscountMessage', is: 'Virkjaðu afslátt til að stilla afsláttar fyrir þennan flokk', en: 'Enable discount to configure discount settings for this category' },

  // Form Actions
  { key: 'adminCategories.save', is: 'Vista flokk', en: 'Save Category' },
  { key: 'adminCategories.cancel', is: 'Hætta við', en: 'Cancel' },
  { key: 'adminCategories.unsavedChanges', is: 'Þú hefur óvistað breytingar', en: 'You have unsaved changes' },
  { key: 'adminCategories.saveSuccess', is: 'Flokkur vistaður', en: 'Category saved successfully' },
  { key: 'adminCategories.saveError', is: 'Villa við að vista flokk', en: 'Error saving category' },
];

async function main() {
  console.log('🌱 Adding category modal translations...\n');

  let added = 0;
  let skipped = 0;

  for (const translation of categoryModalTranslations) {
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
