const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const improvedIcelandicTranslations = [
  // Page titles and descriptions
  { key: 'discounts.title', is: 'Afslættir' },
  { key: 'discounts.description', is: 'Umsjón með vöruafsláttum og sértilboðum' },
  { key: 'discounts.createDiscount', is: 'Stofna afslátt' },
  { key: 'discounts.newDiscount', is: '+ Nýr afslátt' },

  // Summary Cards
  { key: 'discounts.summary.productsOnDiscount', is: 'Vörur á afslætti' },
  { key: 'discounts.summary.totalSaved', is: 'Samtals sparað' },
  { key: 'discounts.summary.averageDiscount', is: 'Meðalafsláttur' },
  { key: 'discounts.summary.expiringCount', is: 'Afslættir sem renna út fljótlega' },

  // Status Badges
  { key: 'discounts.badges.active', is: 'Í gildi' },
  { key: 'discounts.badges.scheduled', is: 'Áætlaður' },
  { key: 'discounts.badges.expiring', is: 'Rennur út fljótlega' },
  { key: 'discounts.badges.expired', is: 'Útrunninn' },

  // Action Buttons
  { key: 'discounts.actions.editDetails', is: 'Breyta upplýsingum' },
  { key: 'discounts.actions.extend', is: 'Framlengja' },
  { key: 'discounts.actions.remove', is: 'Fjarlægja' },

  // Status Filters
  { key: 'discounts.statusActive', is: 'Í gildi' },
  { key: 'discounts.statusScheduled', is: 'Áætlaður' },
  { key: 'discounts.statusExpiringsoon', is: 'Rennur út fljótlega' },
  { key: 'discounts.statusExpired', is: 'Útrunninn' },

  // Discount Reason Templates - Improved
  { key: 'discounts.reasons.seasonalSale', is: 'Tímabundin útsala' },
  { key: 'discounts.reasons.clearance', is: 'Rýmingarsala' },
  { key: 'discounts.reasons.bundleDeal', is: 'Pakkatilboð' },
  { key: 'discounts.reasons.customerLoyalty', is: 'Vildarkjör' },
  { key: 'discounts.reasons.stockReduction', is: 'Lagerhreinsun' },
  { key: 'discounts.reasons.newItemLaunch', is: 'Ný vara' },

  // Confirmations
  { key: 'discounts.confirm.removeDiscount', is: 'Ertu viss um að þú viljir fjarlægja þennan afslátt? Ekki er hægt að afturkalla þessa aðgerð.' },

  // Empty State
  { key: 'discounts.messages.noDiscounts', is: 'Engir afslættir ennþá' },
  { key: 'discounts.messages.noDiscountsDescription', is: 'Stofnaðu þinn fyrsta afslátt til að bjóða viðskiptavinum sérstök verð' },
];

async function main() {
  console.log('🌱 Updating discount translations with authentic Icelandic...\n');

  let updated = 0;
  let failed = 0;

  for (const translation of improvedIcelandicTranslations) {
    try {
      await prisma.lang.update({
        where: {
          key_locale: {
            key: translation.key,
            locale: 'is'
          }
        },
        data: {
          value: translation.is
        }
      });

      console.log(`✅ Updated: ${translation.key}`);
      updated++;
    } catch (error) {
      console.error(`❌ Error updating ${translation.key}:`, error.message);
      failed++;
    }
  }

  console.log(`\n✨ Translation update complete!`);
  console.log(`📊 Summary:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ❌ Failed: ${failed}`);
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
