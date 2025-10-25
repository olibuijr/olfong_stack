const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseOrderIssues() {
  console.log('\n=== ORDER SYSTEM DIAGNOSTIC ===\n');

  try {
    // Check 1: Recent orders
    console.log('1. RECENT ORDERS:');
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        shippingOption: true,
        transaction: true,
        items: {
          include: { product: true }
        },
        address: true,
        user: { select: { id: true, email: true, fullName: true } }
      }
    });

    if (recentOrders.length === 0) {
      console.log('   ⚠️  No orders found in database');
    } else {
      recentOrders.forEach((order, idx) => {
        console.log(`\n   Order ${idx + 1}: ${order.orderNumber}`);
        console.log(`   - User: ${order.user.email} (${order.user.fullName})`);
        console.log(`   - Status: ${order.status}`);
        console.log(`   - Total Amount: ${order.totalAmount} ISK`);
        console.log(`   - Shipping Option: ${order.shippingOption?.name || 'NOT SET'}`);
        console.log(`   - Shipping Type: ${order.shippingOption?.type || 'N/A'}`);
        console.log(`   - Delivery Address: ${order.address?.street || (order.pickupTime ? `Pickup at ${order.pickupTime}` : 'NOT SET')}`);
        console.log(`   - Transaction: ${order.transaction ? `${order.transaction.paymentMethod} (${order.transaction.paymentStatus})` : 'NOT SET'}`);
        console.log(`   - Items: ${order.items.length}`);
        order.items.forEach(item => {
          console.log(`     • ${item.product.name} x${item.quantity} @ ${item.price} ISK`);
        });
      });
    }

    // Check 2: Shipping options
    console.log('\n\n2. AVAILABLE SHIPPING OPTIONS:');
    const shippingOptions = await prisma.shippingOption.findMany({
      include: { _count: { select: { orders: true } } }
    });

    if (shippingOptions.length === 0) {
      console.log('   ⚠️  No shipping options configured!');
    } else {
      shippingOptions.forEach(option => {
        console.log(`   - ${option.name} (${option.type}): ${option.fee} ISK, Active: ${option.isActive}, Orders: ${option._count.orders}`);
      });
    }

    // Check 3: Payment methods used
    console.log('\n\n3. PAYMENT METHODS DISTRIBUTION:');
    const transactions = await prisma.transaction.groupBy({
      by: ['paymentMethod', 'paymentStatus'],
      _count: true
    });

    if (transactions.length === 0) {
      console.log('   ⚠️  No transactions found');
    } else {
      transactions.forEach(t => {
        console.log(`   - ${t.paymentMethod} (${t.paymentStatus}): ${t._count} transactions`);
      });
    }

    // Check 4: Delivery orders analysis
    console.log('\n\n4. DELIVERY VS PICKUP ORDERS:');
    const deliveryOrders = await prisma.order.count({
      where: { shippingOption: { type: 'DELIVERY' } }
    });
    const pickupOrders = await prisma.order.count({
      where: { shippingOption: { type: 'PICKUP' } }
    });

    console.log(`   - Delivery Orders: ${deliveryOrders}`);
    console.log(`   - Pickup Orders: ${pickupOrders}`);

    // Check 5: Orders without required fields
    console.log('\n\n5. DATA INTEGRITY CHECKS:');

    const ordersWithoutShipping = await prisma.order.count({
      where: { shippingOptionId: null }
    });

    const ordersWithoutTransaction = await prisma.order.count({
      where: { transaction: null }
    });

    const deliveryOrdersWithoutAddress = await prisma.order.count({
      where: {
        AND: [
          { shippingOption: { type: 'DELIVERY' } },
          { addressId: null }
        ]
      }
    });

    const pickupOrdersWithoutTime = await prisma.order.count({
      where: {
        AND: [
          { shippingOption: { type: 'PICKUP' } },
          { pickupTime: null }
        ]
      }
    });

    console.log(`   - Orders without shipping option: ${ordersWithoutShipping}`);
    console.log(`   - Orders without transaction: ${ordersWithoutTransaction}`);
    console.log(`   - Delivery orders without address: ${deliveryOrdersWithoutAddress}`);
    console.log(`   - Pickup orders without time: ${pickupOrdersWithoutTime}`);

    // Check 6: Order status distribution
    console.log('\n\n6. ORDER STATUS DISTRIBUTION:');
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: true
    });

    statusCounts.forEach(s => {
      console.log(`   - ${s.status}: ${s._count} orders`);
    });

    console.log('\n=== END DIAGNOSTIC ===\n');

  } catch (error) {
    console.error('Error during diagnosis:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseOrderIssues();
