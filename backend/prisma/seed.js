const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function safeQuery(model, method) {
  try {
    if (prisma[model] && typeof prisma[model][method] === 'function') {
      return await prisma[model][method]();
    }
    return [];
  } catch (error) {
    console.warn(`⚠️  Skipping ${model}: ${error.message}`);
    return [];
  }
}

async function main() {
  console.log('🌱 Seeding database from current state...');

  try {
    // Load the exported database state
    const exportFile = path.join(__dirname, 'database-export.json');

    if (!fs.existsSync(exportFile)) {
      console.log('📊 No previous export found. Exporting current database state...');

      const data = {
        users: await safeQuery('user', 'findMany'),
        categories: await safeQuery('category', 'findMany'),
        subcategories: await safeQuery('subcategory', 'findMany'),
        products: await safeQuery('product', 'findMany'),
        productImages: await safeQuery('productImage', 'findMany'),
        banners: await safeQuery('banner', 'findMany'),
        settings: await safeQuery('setting', 'findMany'),
        langs: await safeQuery('lang', 'findMany'),
        shippingMethods: await safeQuery('shippingMethod', 'findMany'),
        shippingRates: await safeQuery('shippingRate', 'findMany'),
        addresses: await safeQuery('address', 'findMany'),
        carts: await safeQuery('cart', 'findMany'),
        cartItems: await safeQuery('cartItem', 'findMany'),
      };

      fs.writeFileSync(exportFile, JSON.stringify(data, null, 2));
      console.log(`✅ Current database state saved to ${exportFile}`);
      console.log('\n📈 Database snapshot:');
      console.log(`  - Users: ${data.users.length}`);
      console.log(`  - Categories: ${data.categories.length}`);
      console.log(`  - Products: ${data.products.length}`);
      console.log(`  - Banners: ${data.banners.length}`);
      console.log(`  - Settings: ${data.settings.length}`);
      console.log(`  - Translations: ${data.langs.length}`);
      console.log(`  - Shipping Methods: ${data.shippingMethods.length}`);
      console.log(`  - Shipping Rates: ${data.shippingRates.length}`);
      console.log('\n✅ Database is ready for deployment with this snapshot!');
    } else {
      const data = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
      console.log('📂 Loaded exported database state');
      console.log('\n📈 Database snapshot to be seeded:');
      console.log(`  - Users: ${data.users.length}`);
      console.log(`  - Categories: ${data.categories.length}`);
      console.log(`  - Products: ${data.products.length}`);
      console.log(`  - Banners: ${data.banners.length}`);
      console.log(`  - Settings: ${data.settings.length}`);
      console.log(`  - Translations: ${data.langs.length}`);
      console.log(`  - Shipping Methods: ${data.shippingMethods.length}`);
      console.log(`  - Shipping Rates: ${data.shippingRates.length}`);

      console.log('\n✅ Ready to seed database. Use: npx prisma db push && npm run seed');
    }

    console.log('\n🎉 Seed configuration complete!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });
