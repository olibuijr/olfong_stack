const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const discountTranslations = [
  // Navigation
  { key: 'adminNavigation.discounts', is: 'Afslættir', en: 'Discounts' },

  // Page titles and descriptions
  { key: 'discounts.title', is: 'Afslættir', en: 'Discounts' },
  { key: 'discounts.description', is: 'Stjórnaðu afslætti á vörum og sérstökum tilboðum', en: 'Manage product discounts and special offers' },
  { key: 'discounts.createDiscount', is: 'Búa til afslátt', en: 'Create Discount' },
  { key: 'discounts.newDiscount', is: '+ Nýr afslátt', en: '+ New Discount' },

  // Summary Cards
  { key: 'discounts.summary.productsOnDiscount', is: 'Vörur með afslætti', en: 'Products on Discount' },
  { key: 'discounts.summary.totalSaved', is: 'Samtals sparað', en: 'Total Saved' },
  { key: 'discounts.summary.averageDiscount', is: 'Meðal afsláttur', en: 'Average Discount' },
  { key: 'discounts.summary.expiringCount', is: 'Afslættir sem renna út', en: 'Discounts Expiring Soon' },

  // Alerts
  { key: 'discounts.alerts.expiredDiscounts', is: 'Þú ert með {{count}} útrunna afslætti. [Hreinsa]', en: 'You have {{count}} expired discounts. [Clean Up Expired]' },
  { key: 'discounts.alerts.expiringDiscounts', is: '{{count}} afslættir renna út innan 7 daga. [Framlengja allt]', en: '{{count}} discounts expiring in the next 7 days. [Extend All]' },

  // Filters
  { key: 'discounts.search', is: 'Leita að vörum...', en: 'Search products...' },
  { key: 'discounts.filterByStatus', is: 'Sía eftir stöðu', en: 'Filter by Status' },
  { key: 'discounts.filterByCategory', is: 'Sía eftir flokki', en: 'Filter by Category' },
  { key: 'discounts.results', is: '{{count}} niðurstöður', en: '{{count}} results' },
  { key: 'discounts.allStatuses', is: 'Allar stöður', en: 'All Statuses' },
  { key: 'discounts.statusActive', is: 'Virk núna', en: 'Active Now' },
  { key: 'discounts.statusScheduled', is: 'Áætluð', en: 'Scheduled' },
  { key: 'discounts.statusExpiringsoon', is: 'Rennur út bráðlega', en: 'Expiring Soon' },
  { key: 'discounts.statusExpired', is: 'Útrunnin', en: 'Expired' },
  { key: 'discounts.allCategories', is: 'Allir flokkar', en: 'All Categories' },

  // Table Headers
  { key: 'discounts.table.product', is: 'Vara', en: 'Product' },
  { key: 'discounts.table.category', is: 'Flokkur', en: 'Category' },
  { key: 'discounts.table.originalPrice', is: 'Upprunalegt verð', en: 'Original Price' },
  { key: 'discounts.table.discountPercent', is: 'Afsláttur %', en: 'Discount %' },
  { key: 'discounts.table.amountSaved', is: 'Sparað', en: 'Amount Saved' },
  { key: 'discounts.table.currentPrice', is: 'Núverandi verð', en: 'Current Price' },
  { key: 'discounts.table.status', is: 'Staða', en: 'Status' },
  { key: 'discounts.table.daysRemaining', is: 'Dagar eftir', en: 'Days Remaining' },
  { key: 'discounts.table.actions', is: 'Aðgerðir', en: 'Actions' },

  // Status Badges
  { key: 'discounts.badges.active', is: 'Virk', en: 'Active' },
  { key: 'discounts.badges.scheduled', is: 'Áætluð', en: 'Scheduled' },
  { key: 'discounts.badges.expiring', is: 'Rennur út', en: 'Expiring' },
  { key: 'discounts.badges.expired', is: 'Útrunnin', en: 'Expired' },

  // Action Buttons
  { key: 'discounts.actions.editDetails', is: 'Breyta upplýsingum', en: 'Edit Details' },
  { key: 'discounts.actions.extend', is: 'Framlengja', en: 'Extend' },
  { key: 'discounts.actions.extend7', is: '+ 7 dagar', en: '+ 7 Days' },
  { key: 'discounts.actions.extend14', is: '+ 14 dagar', en: '+ 14 Days' },
  { key: 'discounts.actions.extend30', is: '+ 30 dagar', en: '+ 30 Days' },
  { key: 'discounts.actions.remove', is: 'Fjarlægja', en: 'Remove' },
  { key: 'discounts.actions.viewProduct', is: 'Skoðun vöru', en: 'View Product' },
  { key: 'discounts.actions.removeAll', is: 'Fjarlægja allt', en: 'Remove All' },
  { key: 'discounts.actions.extendAll', is: 'Framlengja allt', en: 'Extend All' },
  { key: 'discounts.actions.clearSelection', is: 'Hreinsa val', en: 'Clear Selection' },
  { key: 'discounts.actions.bulkRemoveAll', is: 'Fjarlægja allt sem valið var', en: 'Remove All Selected' },
  { key: 'discounts.actions.bulkExtend7', is: 'Framlengja öll +7 dagar', en: 'Extend All +7 Days' },

  // Modal
  { key: 'discounts.modal.createTitle', is: 'Búa til afslátt', en: 'Create Discount' },
  { key: 'discounts.modal.editTitle', is: 'Breyta afslætti', en: 'Edit Discount' },
  { key: 'discounts.modal.selectProduct', is: 'Velja vöru', en: 'Select Product' },
  { key: 'discounts.modal.selectProductPlaceholder', is: 'Veldu vöru...', en: 'Choose a product...' },
  { key: 'discounts.modal.originalPrice', is: 'Upprunalegt verð', en: 'Original Price' },
  { key: 'discounts.modal.discountPercentage', is: 'Afsláttur %', en: 'Discount Percentage' },
  { key: 'discounts.modal.discountPercent', is: 'Afsláttur %', en: 'Discount %' },
  { key: 'discounts.modal.discountStartDate', is: 'Upphafsdagur (valfrjálst)', en: 'Start Date (Optional)' },
  { key: 'discounts.modal.discountEndDate', is: 'Lokadagur (valfrjálst)', en: 'End Date (Optional)' },
  { key: 'discounts.modal.discountReason', is: 'Ástæða - Enska (valfrjálst)', en: 'Reason - English (Optional)' },
  { key: 'discounts.modal.discountReasonIs', is: 'Ástæða - Íslenska (valfrjálst)', en: 'Reason - Icelandic (Optional)' },
  { key: 'discounts.modal.selectReason', is: 'Veldu ástæðu...', en: 'Select a reason...' },
  { key: 'discounts.modal.reasonCustom', is: 'Sérsniðið...', en: 'Custom...' },
  { key: 'discounts.modal.preview', is: 'Verðskoðun', en: 'Price Preview' },
  { key: 'discounts.modal.previewOriginal', is: 'Upprunalegt verð', en: 'Original Price' },
  { key: 'discounts.modal.previewDiscount', is: 'Afsláttur', en: 'Discount' },
  { key: 'discounts.modal.previewFinal', is: 'Lokaveðmál', en: 'Final Price' },
  { key: 'discounts.modal.required', is: 'Nauðsynlegt', en: 'Required' },
  { key: 'discounts.modal.optional', is: 'Valfrjálst', en: 'Optional' },
  { key: 'discounts.modal.cancel', is: 'Hætta við', en: 'Cancel' },
  { key: 'discounts.modal.submit', is: 'Búa til afslátt', en: 'Create Discount' },
  { key: 'discounts.modal.submitEdit', is: 'Uppfæra afslátt', en: 'Update Discount' },
  { key: 'discounts.modal.loading', is: 'Vista...', en: 'Saving...' },

  // Discount Reason Templates
  { key: 'discounts.reasons.seasonalSale', is: 'Árstíðabundin sala', en: 'Seasonal Sale' },
  { key: 'discounts.reasons.clearance', is: 'Útsölu', en: 'Clearance' },
  { key: 'discounts.reasons.bundleDeal', is: 'Búnt tilboð', en: 'Bundle Deal' },
  { key: 'discounts.reasons.customerLoyalty', is: 'Tryggð viðskiptavina', en: 'Customer Loyalty' },
  { key: 'discounts.reasons.stockReduction', is: 'Minnkun birgða', en: 'Stock Reduction' },
  { key: 'discounts.reasons.newItemLaunch', is: 'Ný vara sem hleypt er út', en: 'New Item Launch' },

  // Confirmations
  { key: 'discounts.confirm.removeDiscount', is: 'Ertu viss um að þú viljir fjarlægja þennan afslátt? Þetta er ekki hægt að afturkalla.', en: 'Are you sure you want to remove this discount? This cannot be undone.' },
  { key: 'discounts.confirm.removeBulk', is: 'Ertu viss um að þú viljir fjarlægja afslætti frá {{count}} vörum?', en: 'Are you sure you want to remove discounts from {{count}} products?' },

  // Messages
  { key: 'discounts.messages.extendedSuccessfully', is: 'Afslátt framlengt með góðum árangri', en: 'Discount extended successfully' },
  { key: 'discounts.messages.noDiscounts', is: 'Engar afslættir ennþá', en: 'No discounts yet' },
  { key: 'discounts.messages.noDiscountsDescription', is: 'Búðu til þinn fyrsta afslátt til að bjóða viðskiptavinum sérstök verð', en: 'Create your first discount to offer special prices to customers' },
  { key: 'discounts.messages.selectProduct', is: 'Vinsamlegast veldu vöru', en: 'Please select a product' },
  { key: 'discounts.messages.invalidDiscount', is: 'Afsláttur verður að vera á milli 0-100%', en: 'Discount must be between 0-100%' },
  { key: 'discounts.messages.startAfterEnd', is: 'Upphafsdagur getur ekki verið eftir lokadegi', en: 'Start date cannot be after end date' },

  // Import/Export
  { key: 'discounts.import', is: 'Flytja inn CSV', en: 'Import CSV' },
  { key: 'discounts.export', is: 'Flytja út CSV', en: 'Export CSV' },
  { key: 'discounts.importSuccess', is: 'Flyttu inn {{count}} afslætti með góðum árangri', en: 'Successfully imported {{count}} discounts' },
  { key: 'discounts.importError', is: 'Bilun við innflutning afslætta: {{error}}', en: 'Failed to import discounts: {{error}}' },
];

async function main() {
  console.log('🌱 Adding discount translations...\n');

  let added = 0;
  let skipped = 0;

  for (const translation of discountTranslations) {
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
