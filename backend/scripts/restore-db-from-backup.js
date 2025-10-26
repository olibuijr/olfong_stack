const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreDatabase(backupFile) {
  if (!backupFile) {
    console.error('❌ Usage: node scripts/restore-db-from-backup.js <backup-filename.json>');
    console.error('\nAvailable backups:');
    const backupDir = path.join(__dirname, '../backups/db-exports');
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
    files.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  }

  const backupPath = path.join(__dirname, '../backups/db-exports', backupFile);
  const seedPath = path.join(__dirname, '../prisma/database-export.json');

  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup file not found: ${backupPath}`);
    process.exit(1);
  }

  console.log(`⚠️  WARNING: This will DELETE all current data and restore from backup!`);
  console.log(`📍 Backup file: ${backupPath}`);
  console.log(`\nPlease confirm you want to restore by rerunning with --confirm flag\n`);
  console.log(`Usage: node scripts/restore-db-from-backup.js ${backupFile} --confirm\n`);

  if (process.argv[3] !== '--confirm') {
    process.exit(0);
  }

  try {
    console.log('📥 Loading backup data...');
    const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    console.log('🗑️  Clearing current database...');
    // Delete in reverse order of dependencies
    await prisma.notification.deleteMany({});
    await prisma.chatMessage.deleteMany({});
    await prisma.conversationParticipant.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.discount.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.shippingRate.deleteMany({});
    await prisma.shippingMethod.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.subcategory.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.paymentGateway.deleteMany({});
    await prisma.vatProfile.deleteMany({});
    await prisma.setting.deleteMany({});
    await prisma.lang.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.banner.deleteMany({});

    console.log('📝 Restoring data from backup...');

    // Restore in correct order
    if (data.users?.length) {
      await prisma.user.createMany({ data: data.users });
      console.log(`  ✓ Restored ${data.users.length} users`);
    }

    if (data.vatProfiles?.length) {
      await prisma.vatProfile.createMany({ data: data.vatProfiles });
      console.log(`  ✓ Restored ${data.vatProfiles.length} VAT profiles`);
    }

    if (data.categories?.length) {
      await prisma.category.createMany({ data: data.categories });
      console.log(`  ✓ Restored ${data.categories.length} categories`);
    }

    if (data.subcategories?.length) {
      await prisma.subcategory.createMany({ data: data.subcategories });
      console.log(`  ✓ Restored ${data.subcategories.length} subcategories`);
    }

    if (data.products?.length) {
      await prisma.product.createMany({ data: data.products });
      console.log(`  ✓ Restored ${data.products.length} products`);
    }

    if (data.productImages?.length) {
      await prisma.productImage.createMany({ data: data.productImages });
      console.log(`  ✓ Restored ${data.productImages.length} product images`);
    }

    if (data.paymentGateways?.length) {
      await prisma.paymentGateway.createMany({ data: data.paymentGateways });
      console.log(`  ✓ Restored ${data.paymentGateways.length} payment gateways`);
    }

    if (data.banners?.length) {
      await prisma.banner.createMany({ data: data.banners });
      console.log(`  ✓ Restored ${data.banners.length} banners`);
    }

    if (data.settings?.length) {
      await prisma.setting.createMany({ data: data.settings });
      console.log(`  ✓ Restored ${data.settings.length} settings`);
    }

    if (data.langs?.length) {
      await prisma.lang.createMany({ data: data.langs });
      console.log(`  ✓ Restored ${data.langs.length} translations`);
    }

    if (data.shippingMethods?.length) {
      await prisma.shippingMethod.createMany({ data: data.shippingMethods });
      console.log(`  ✓ Restored ${data.shippingMethods.length} shipping methods`);
    }

    if (data.shippingRates?.length) {
      await prisma.shippingRate.createMany({ data: data.shippingRates });
      console.log(`  ✓ Restored ${data.shippingRates.length} shipping rates`);
    }

    if (data.addresses?.length) {
      await prisma.address.createMany({ data: data.addresses });
      console.log(`  ✓ Restored ${data.addresses.length} addresses`);
    }

    if (data.carts?.length) {
      await prisma.cart.createMany({ data: data.carts });
      console.log(`  ✓ Restored ${data.carts.length} carts`);
    }

    if (data.cartItems?.length) {
      await prisma.cartItem.createMany({ data: data.cartItems });
      console.log(`  ✓ Restored ${data.cartItems.length} cart items`);
    }

    if (data.discounts?.length) {
      await prisma.discount.createMany({ data: data.discounts });
      console.log(`  ✓ Restored ${data.discounts.length} discounts`);
    }

    if (data.orders?.length) {
      await prisma.order.createMany({ data: data.orders });
      console.log(`  ✓ Restored ${data.orders.length} orders`);
    }

    if (data.orderItems?.length) {
      await prisma.orderItem.createMany({ data: data.orderItems });
      console.log(`  ✓ Restored ${data.orderItems.length} order items`);
    }

    if (data.conversations?.length) {
      await prisma.conversation.createMany({ data: data.conversations });
      console.log(`  ✓ Restored ${data.conversations.length} conversations`);
    }

    if (data.chatMessages?.length) {
      await prisma.chatMessage.createMany({ data: data.chatMessages });
      console.log(`  ✓ Restored ${data.chatMessages.length} chat messages`);
    }

    // Also save as seed file
    fs.writeFileSync(seedPath, JSON.stringify(data, null, 2));

    console.log(`\n✅ Database restoration complete!`);
    console.log(`📝 Seed data updated: ${seedPath}`);

  } catch (error) {
    console.error('❌ Error restoring database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const backupFile = process.argv[2];
restoreDatabase(backupFile);
