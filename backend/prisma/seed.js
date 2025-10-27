const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
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
        shippingOptions: await safeQuery('shippingOption', 'findMany'),
        vatProfiles: await safeQuery('vatProfile', 'findMany'),
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
      console.log(`  - Shipping Options: ${data.shippingOptions.length}`);
      console.log(`  - VAT Profiles: ${data.vatProfiles.length}`);
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
      console.log(`  - Shipping Options: ${data.shippingOptions.length}`);
      console.log(`  - VAT Profiles: ${data.vatProfiles.length}`);

      // Clear existing data (order matters due to foreign keys)
      console.log('\n🗑️  Clearing existing data...');
      // eslint-disable-next-line no-empty
      try { await prisma.cartItem.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.cart.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.orderItem.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.order.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.address.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.shippingRate.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.shippingOption.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.productImage.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.product.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.subcategory.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.category.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.lang.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.user.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.banner.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.setting.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.paymentGateway.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.notification.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.chatMessage.deleteMany({}); } catch (e) {}
      // eslint-disable-next-line no-empty
      try { await prisma.conversation.deleteMany({}); } catch (e) {}
      console.log('✅ Cleared existing data');

      // Seed data in correct order
      console.log('\n📝 Seeding data...');

      // Seed users (hash passwords)
      if (data.users && data.users.length > 0) {
        for (const user of data.users) {
          const userData = { ...user };
          // Hash password if it's not already hashed
          if (userData.password && !userData.password.startsWith('$2b$')) {
            userData.password = await bcrypt.hash(userData.password, 10);
          }
          try {
            // Try to create, but if it already exists, update it
            await prisma.user.upsert({
              where: { username: userData.username },
              update: userData,
              create: userData
            });
          } catch (e) {
            console.warn(`    ⚠️  Could not seed user ${userData.username}: ${e.message}`);
          }
        }
        console.log(`  ✅ Seeded ${data.users.length} users`);
      }

      // Seed translations
      if (data.langs && data.langs.length > 0) {
        for (const lang of data.langs) {
          try {
            await prisma.lang.upsert({
              where: { key_locale: { key: lang.key, locale: lang.locale } },
              update: lang,
              create: lang
            });
          } catch (e) {
            console.warn(`    ⚠️  Could not seed translation ${lang.key} (${lang.locale}): ${e.message}`);
          }
        }
        console.log(`  ✅ Seeded ${data.langs.length} translations`);
      }

      // Seed payment gateways
      if (data.paymentGateways && data.paymentGateways.length > 0) {
        for (const gateway of data.paymentGateways) {
          await prisma.paymentGateway.create({ data: gateway });
        }
        console.log(`  ✅ Seeded ${data.paymentGateways.length} payment gateways`);
      }

      // Seed categories if present
      if (data.categories && data.categories.length > 0) {
        for (const category of data.categories) {
          await prisma.category.create({ data: category });
        }
        console.log(`  ✅ Seeded ${data.categories.length} categories`);
      }

      // Seed subcategories if present
      if (data.subcategories && data.subcategories.length > 0) {
        for (const subcategory of data.subcategories) {
          await prisma.subcategory.create({ data: subcategory });
        }
        console.log(`  ✅ Seeded ${data.subcategories.length} subcategories`);
      }

      // Seed products if present
      if (data.products && data.products.length > 0) {
        for (const product of data.products) {
          await prisma.product.create({ data: product });
        }
        console.log(`  ✅ Seeded ${data.products.length} products`);
      }

      // Seed product images if present
      if (data.productImages && data.productImages.length > 0) {
        for (const image of data.productImages) {
          await prisma.productImage.create({ data: image });
        }
        console.log(`  ✅ Seeded ${data.productImages.length} product images`);
      }

      // Seed banners if present
      if (data.banners && data.banners.length > 0) {
        for (const banner of data.banners) {
          await prisma.banner.create({ data: banner });
        }
        console.log(`  ✅ Seeded ${data.banners.length} banners`);
      }

      // Seed settings if present
      if (data.settings && data.settings.length > 0) {
        for (const setting of data.settings) {
          await prisma.setting.create({ data: setting });
        }
        console.log(`  ✅ Seeded ${data.settings.length} settings`);
      }

      // Seed shipping methods if present
      if (data.shippingMethods && data.shippingMethods.length > 0) {
        for (const method of data.shippingMethods) {
          await prisma.shippingMethod.create({ data: method });
        }
        console.log(`  ✅ Seeded ${data.shippingMethods.length} shipping methods`);
      }

      // Seed shipping rates if present
      if (data.shippingRates && data.shippingRates.length > 0) {
        for (const rate of data.shippingRates) {
          await prisma.shippingRate.create({ data: rate });
        }
        console.log(`  ✅ Seeded ${data.shippingRates.length} shipping rates`);
      }

      // Seed shipping options if present
      if (data.shippingOptions && data.shippingOptions.length > 0) {
        for (const option of data.shippingOptions) {
          await prisma.shippingOption.create({ data: option });
        }
        console.log(`  ✅ Seeded ${data.shippingOptions.length} shipping options`);
      }

      // Seed VAT profiles if present
      if (data.vatProfiles && data.vatProfiles.length > 0) {
        for (const profile of data.vatProfiles) {
          try {
            await prisma.vatProfile.upsert({
              where: { id: profile.id },
              update: profile,
              create: profile
            });
          } catch (e) {
            console.warn(`    ⚠️  Could not seed VAT profile ${profile.id}: ${e.message}`);
          }
        }
        console.log(`  ✅ Seeded ${data.vatProfiles.length} VAT profiles`);
      }

      console.log('\n✅ Database seeding complete!');
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
