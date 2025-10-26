const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function safeQuery(model) {
  try {
    if (prisma[model]) {
      return await prisma[model].findMany();
    }
    return [];
  } catch (error) {
    console.warn(`⚠️  Skipping ${model}: ${error.message}`);
    return [];
  }
}

async function exportDatabase() {
  console.log('📤 Exporting database state...\n');

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

    const data = {
      exportedAt: new Date().toISOString(),
      users: await safeQuery('user'),
      categories: await safeQuery('category'),
      subcategories: await safeQuery('subcategory'),
      products: await safeQuery('product'),
      productImages: await safeQuery('productImage'),
      banners: await safeQuery('banner'),
      settings: await safeQuery('setting'),
      langs: await safeQuery('lang'),
      shippingMethods: await safeQuery('shippingMethod'),
      shippingRates: await safeQuery('shippingRate'),
      addresses: await safeQuery('address'),
      carts: await safeQuery('cart'),
      cartItems: await safeQuery('cartItem'),
      orders: await safeQuery('order'),
      orderItems: await safeQuery('orderItem'),
      paymentGateways: await safeQuery('paymentGateway'),
      vatProfiles: await safeQuery('vatProfile'),
      discounts: await safeQuery('discount'),
      notifications: await safeQuery('notification'),
      conversations: await safeQuery('conversation'),
      chatMessages: await safeQuery('chatMessage'),
    };

    // Save to backups folder with timestamp
    const backupPath = path.join(__dirname, '../backups/db-exports', `backup-${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));

    // Also save as database-export.json for seed.js
    const seedPath = path.join(__dirname, '../prisma/database-export.json');
    fs.writeFileSync(seedPath, JSON.stringify(data, null, 2));

    console.log(`✅ Database exported successfully!\n`);
    console.log(`📍 Timestamped backup: ${backupPath}`);
    console.log(`📍 Seed backup: ${seedPath}\n`);
    console.log(`📊 Data exported:`);
    console.log(`  - Users: ${data.users.length}`);
    console.log(`  - Categories: ${data.categories.length}`);
    console.log(`  - Products: ${data.products.length}`);
    console.log(`  - Translations: ${data.langs.length}`);
    console.log(`  - Payment Gateways: ${data.paymentGateways.length}`);
    console.log(`  - Orders: ${data.orders.length}`);
    console.log(`  - Banners: ${data.banners.length}`);
    console.log(`  - Settings: ${data.settings.length}`);
    console.log(`  - Shipping Methods: ${data.shippingMethods.length}`);
    console.log(`\n💾 Backup complete! Safe to make schema changes now.`);

  } catch (error) {
    console.error('❌ Error exporting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportDatabase();
