const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Generate order number (same as in orderController.js)
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OLF-${timestamp}-${random}`;
};

async function seedAnalyticsData() {
  console.log('📊 Seeding analytics test data...');

  try {
    // Get existing users, products, and addresses
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      take: 10
    });

    const products = await prisma.product.findMany({
      take: 20,
      where: { isActive: true }
    });

    const addresses = await prisma.address.findMany({
      take: 10
    });

    if (customers.length === 0 || products.length === 0) {
      console.log('❌ Not enough customers or products to create test orders');
      return;
    }

    console.log(`Found ${customers.length} customers, ${products.length} products, ${addresses.length} addresses`);

    // Create test orders over the last 90 days
    const orders = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const customer = customers[Math.floor(Math.random() * customers.length)];
      const address = addresses.length > 0 ? addresses[Math.floor(Math.random() * addresses.length)] : null;

      // Random order status with realistic distribution
      const statuses = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPED', 'PROCESSING', 'PENDING', 'CANCELLED'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: customer.id,
          addressId: address?.id,
          totalAmount: 0, // Will be calculated from order items
          status: status,
          createdAt: orderDate,
          updatedAt: orderDate
        }
      });

      // Add 1-5 random unique products to the order
      const numItems = Math.floor(Math.random() * 5) + 1;
      const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffledProducts.slice(0, numItems);

      let orderTotal = 0;

      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = product.price;

        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: quantity,
            price: price
          }
        });

        orderTotal += price * quantity;
      }

      // Update order total
      await prisma.order.update({
        where: { id: order.id },
        data: { totalAmount: orderTotal }
      });

      orders.push(order);
    }

    console.log(`✅ Created ${orders.length} test orders for analytics`);

    // Create some additional users if needed
    if (customers.length < 20) {
      console.log('👥 Creating additional test customers...');
      for (let i = 0; i < 15; i++) {
        const daysAgo = Math.floor(Math.random() * 90);
        const createdDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        await prisma.user.create({
          data: {
            username: `testcustomer${i + customers.length}`,
            email: `test${i + customers.length}@example.com`,
            fullName: `Test Customer ${i + customers.length}`,
            role: 'CUSTOMER',
            createdAt: createdDate
          }
        });
      }
      console.log('✅ Created additional test customers');
    }

  } catch (error) {
    console.error('❌ Seeding analytics data failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedAnalyticsData()
    .then(() => {
      console.log('✅ Analytics data seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Analytics data seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAnalyticsData };