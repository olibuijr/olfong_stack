const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testOrderFixes() {
  console.log('\n=== TESTING ORDER FIXES ===\n');

  try {
    // Get the most recent order
    const order = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        shippingOption: true,
        transaction: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        deliveryPerson: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      console.log('❌ No orders found to test');
      process.exit(1);
    }

    console.log(`Testing Order: ${order.orderNumber}\n`);

    // Check 1: Payment information
    console.log('✓ CHECK 1: PAYMENT INFORMATION');
    if (order.transaction) {
      console.log(`  - Payment Method: ${order.transaction.paymentMethod}`);
      console.log(`  - Payment Status: ${order.transaction.paymentStatus}`);
      console.log(`  - Amount: ${order.transaction.amount} ISK`);
      console.log(`  ✓ Payment data is present\n`);
    } else {
      console.log(`  ❌ NO TRANSACTION DATA FOUND\n`);
    }

    // Check 2: Shipping information
    console.log('✓ CHECK 2: SHIPPING INFORMATION');
    if (order.shippingOption) {
      console.log(`  - Shipping Method: ${order.shippingOption.name}`);
      console.log(`  - Type: ${order.shippingOption.type}`);
      console.log(`  - Fee: ${order.shippingOption.fee} ISK`);
      console.log(`  - Active: ${order.shippingOption.isActive}`);
      console.log(`  ✓ Shipping option data is present\n`);
    } else {
      console.log(`  ❌ NO SHIPPING OPTION DATA FOUND\n`);
    }

    // Check 3: Delivery address (for delivery orders)
    console.log('✓ CHECK 3: DELIVERY ADDRESS');
    if (order.shippingOption?.type === 'delivery') {
      if (order.address) {
        console.log(`  - Street: ${order.address.street}`);
        console.log(`  - City: ${order.address.city}`);
        console.log(`  - Postal Code: ${order.address.postalCode}`);
        console.log(`  ✓ Address data is present\n`);
      } else {
        console.log(`  ❌ ADDRESS DATA MISSING FOR DELIVERY ORDER\n`);
      }
    } else if (order.shippingOption?.type === 'pickup') {
      if (order.pickupTime) {
        console.log(`  - Pickup Time: ${order.pickupTime}`);
        console.log(`  ✓ Pickup time is present\n`);
      } else {
        console.log(`  ❌ PICKUP TIME MISSING FOR PICKUP ORDER\n`);
      }
    }

    // Check 4: Order items
    console.log('✓ CHECK 4: ORDER ITEMS');
    console.log(`  - Total Items: ${order.items.length}`);
    order.items.forEach((item, idx) => {
      console.log(`    ${idx + 1}. ${item.product.name} x${item.quantity} @ ${item.price} ISK = ${item.price * item.quantity} ISK`);
    });
    console.log();

    // Check 5: Order summary
    console.log('✓ CHECK 5: ORDER SUMMARY');
    console.log(`  - Order Number: ${order.orderNumber}`);
    console.log(`  - Customer: ${order.user.fullName} (${order.user.email})`);
    console.log(`  - Status: ${order.status}`);
    console.log(`  - Total Amount: ${order.totalAmount} ISK`);
    console.log(`  - Items Subtotal: ${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ISK`);
    console.log(`  - Shipping Cost: ${order.shippingOption?.fee || 0} ISK`);
    console.log();

    // Check 6: Delivery person (if assigned)
    if (order.deliveryPerson) {
      console.log('✓ CHECK 6: DELIVERY PERSON');
      console.log(`  - Name: ${order.deliveryPerson.fullName}`);
      console.log(`  - Phone: ${order.deliveryPerson.phone}`);
      console.log();
    }

    // Summary
    console.log('=== TEST SUMMARY ===');
    const allTestsPassed = order.transaction && order.shippingOption &&
                          (order.shippingOption.type === 'pickup' ? order.pickupTime : order.address);

    if (allTestsPassed) {
      console.log('✓ ALL CRITICAL DATA FIELDS PRESENT');
      console.log('✓ Order has payment information');
      console.log('✓ Order has shipping information');
      console.log('✓ Order has delivery/pickup details');
      console.log('✓ FIXES ARE WORKING CORRECTLY');
    } else {
      console.log('❌ SOME DATA FIELDS ARE MISSING');
      if (!order.transaction) console.log('  - Missing: Transaction/Payment data');
      if (!order.shippingOption) console.log('  - Missing: Shipping option data');
      if (order.shippingOption?.type === 'delivery' && !order.address) console.log('  - Missing: Delivery address');
      if (order.shippingOption?.type === 'pickup' && !order.pickupTime) console.log('  - Missing: Pickup time');
    }

    console.log('\n=== END TEST ===\n');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderFixes();
