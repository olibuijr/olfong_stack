const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const translations = {
  en: {
    'adminCategories.editCategory': 'Edit Category',
    'adminCategories.categoryImage': 'Category Image',
    'adminCategories.categoryImageFromProduct': 'Category Image (from Product)',
    'adminCategories.selectFromMedia': 'Select from Media',
    'adminCategories.changeImage': 'Change Image',
    'adminCategories.removeImage': 'Remove',
    'adminPlaceholders.enterNameEn': 'Enter category name in English',
    'adminPlaceholders.enterNameIs': 'Enter category name in Icelandic',
    'adminPlaceholders.enterSlugEn': 'Enter slug (lowercase, no spaces)',
    'adminPlaceholders.enterDescriptionEn': 'Enter description in English',
    'adminPlaceholders.enterDescriptionIs': 'Enter description in Icelandic',
    'adminPlaceholders.enterIcon': 'Enter an emoji or icon',
    'adminPlaceholders.enterSortOrder': 'Enter sort order (number)',
  },
  is: {
    'adminCategories.editCategory': 'Breyta flokki',
    'adminCategories.categoryImage': 'Mynd flokks',
    'adminCategories.categoryImageFromProduct': 'Mynd flokks (úr vöru)',
    'adminCategories.selectFromMedia': 'Velja úr miðlum',
    'adminCategories.changeImage': 'Breyta mynd',
    'adminCategories.removeImage': 'Eyða',
    'adminPlaceholders.enterNameEn': 'Sláðu inn heiti flokks á ensku',
    'adminPlaceholders.enterNameIs': 'Sláðu inn heiti flokks á íslensku',
    'adminPlaceholders.enterSlugEn': 'Sláðu inn vefslóðarheiti (lítil stafi, engin bil)',
    'adminPlaceholders.enterDescriptionEn': 'Sláðu inn lýsingu á ensku',
    'adminPlaceholders.enterDescriptionIs': 'Sláðu inn lýsingu á íslensku',
    'adminPlaceholders.enterIcon': 'Sláðu inn tjaldmerkið eða táknmynd',
    'adminPlaceholders.enterSortOrder': 'Sláðu inn röðunarnúmer',
  }
};

async function addTranslations() {
  try {
    let addedCount = 0;
    let updatedCount = 0;

    for (const [locale, keys] of Object.entries(translations)) {
      for (const [key, value] of Object.entries(keys)) {
        try {
          // Check if translation exists
          const existing = await prisma.lang.findUnique({
            where: {
              key_locale: {
                key,
                locale
              }
            }
          });

          if (existing) {
            // Update if different
            if (existing.value !== value) {
              await prisma.lang.update({
                where: {
                  key_locale: {
                    key,
                    locale
                  }
                },
                data: { value }
              });
              updatedCount++;
              console.log(`✓ Updated: ${locale} - ${key}`);
            }
          } else {
            // Create new
            await prisma.lang.create({
              data: {
                key,
                locale,
                value
              }
            });
            addedCount++;
            console.log(`✓ Added: ${locale} - ${key}`);
          }
        } catch (error) {
          console.error(`✗ Error with ${locale} - ${key}:`, error.message);
        }
      }
    }

    console.log(`\n✓ Translation sync completed!`);
    console.log(`  - Added: ${addedCount}`);
    console.log(`  - Updated: ${updatedCount}`);
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addTranslations();
