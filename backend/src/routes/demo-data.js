const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication and admin middleware to all routes
router.use(authenticate);
router.use(authorize('ADMIN'));

// Insert demo data
router.post('/insert', async (req, res) => {
  try {
    console.log('🌱 Starting demo data insertion...');

    // Create demo customers
    const demoCustomers = [
      {
        username: 'demo_customer1',
        email: 'anna.johnson@example.com',
        password: await bcrypt.hash('demo123', 10),
        fullName: 'Anna Johnson',
        role: 'CUSTOMER',
        phone: '+3545551001',
        kennitala: '1234567890'
      },
      {
        username: 'demo_customer2',
        email: 'bjorn.andersson@example.com',
        password: await bcrypt.hash('demo123', 10),
        fullName: 'Björn Andersson',
        role: 'CUSTOMER',
        phone: '+3545551002',
        kennitala: '1234567891'
      },
      {
        username: 'demo_customer3',
        email: 'kristin.petersen@example.com',
        password: await bcrypt.hash('demo123', 10),
        fullName: 'Kristín Petersen',
        role: 'CUSTOMER',
        phone: '+3545551003',
        kennitala: '1234567892'
      },
      {
        username: 'demo_customer4',
        email: 'magnus.thorsteinsson@example.com',
        password: await bcrypt.hash('demo123', 10),
        fullName: 'Magnús Þorsteinsson',
        role: 'CUSTOMER',
        phone: '+3545551004',
        kennitala: '1234567893'
      },
      {
        username: 'demo_customer5',
        email: 'sara.gudmundsdottir@example.com',
        password: await bcrypt.hash('demo123', 10),
        fullName: 'Sara Guðmundsdóttir',
        role: 'CUSTOMER',
        phone: '+3545551005',
        kennitala: '1234567894'
      }
    ];

    for (const customer of demoCustomers) {
      await prisma.user.upsert({
        where: { username: customer.username },
        update: {},
        create: customer,
      });
    }

    console.log('✅ Created demo customers');

    // Get demo customers for addresses
    const customer1 = await prisma.user.findUnique({ where: { username: 'demo_customer1' } });
    const customer2 = await prisma.user.findUnique({ where: { username: 'demo_customer2' } });
    const customer3 = await prisma.user.findUnique({ where: { username: 'demo_customer3' } });
    const customer4 = await prisma.user.findUnique({ where: { username: 'demo_customer4' } });
    const customer5 = await prisma.user.findUnique({ where: { username: 'demo_customer5' } });

    // Create demo addresses
    const demoAddresses = [
      {
        userId: customer1.id,
        label: 'Home',
        street: 'Laugavegur 1',
        city: 'Reykjavík',
        postalCode: '101',
        country: 'Iceland',
        isDefault: true
      },
      {
        userId: customer2.id,
        label: 'Work',
        street: 'Austurstræti 15',
        city: 'Reykjavík',
        postalCode: '101',
        country: 'Iceland',
        isDefault: true
      },
      {
        userId: customer3.id,
        label: 'Home',
        street: 'Skólavörðustígur 8',
        city: 'Reykjavík',
        postalCode: '105',
        country: 'Iceland',
        isDefault: true
      },
      {
        userId: customer4.id,
        label: 'Home',
        street: 'Hverfisgata 22',
        city: 'Reykjavík',
        postalCode: '107',
        country: 'Iceland',
        isDefault: true
      },
      {
        userId: customer5.id,
        label: 'Home',
        street: 'Freyjugata 5',
        city: 'Reykjavík',
        postalCode: '101',
        country: 'Iceland',
        isDefault: true
      }
    ];

    for (const address of demoAddresses) {
      await prisma.address.create({
        data: address,
      });
    }

    console.log('✅ Created demo addresses');

    // Get some products for orders
    const wine1 = await prisma.product.findFirst({ where: { categoryId: 1 } }); // WINE category
    const wine2 = await prisma.product.findFirst({ where: { categoryId: 1, id: { not: wine1?.id } } });
    const beer1 = await prisma.product.findFirst({ where: { categoryId: 2 } }); // BEER category
    const nicotine1 = await prisma.product.findFirst({ where: { categoryId: 5 } }); // NICOTINE category
    const food1 = await prisma.product.findFirst({ where: { categoryId: 8 } }); // FOOD category

    // Get shipping options
    const homeDelivery = await prisma.shippingOption.findFirst({ where: { type: 'DELIVERY' } });
    const storePickup = await prisma.shippingOption.findFirst({ where: { type: 'PICKUP' } });

    // Create demo orders
    const demoOrders = [
      {
        orderNumber: 'OLF-2025-001',
        userId: customer1.id,
        addressId: (await prisma.address.findFirst({ where: { userId: customer1.id } })).id,
        shippingOptionId: homeDelivery?.id,
        status: 'DELIVERED',
        totalAmount: 2850,
        deliveryFee: 2000,
        notes: 'Please ring doorbell twice',
        estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        orderNumber: 'OLF-2025-002',
        userId: customer2.id,
        addressId: (await prisma.address.findFirst({ where: { userId: customer2.id } })).id,
        shippingOptionId: storePickup?.id,
        status: 'COMPLETED',
        totalAmount: 890,
        deliveryFee: 0,
        pickupTime: '18:00',
        estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        orderNumber: 'OLF-2025-003',
        userId: customer3.id,
        addressId: (await prisma.address.findFirst({ where: { userId: customer3.id } })).id,
        shippingOptionId: homeDelivery?.id,
        status: 'OUT_FOR_DELIVERY',
        totalAmount: 1520,
        deliveryFee: 2000,
        notes: 'Fragile items - handle with care',
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        orderNumber: 'OLF-2025-004',
        userId: customer4.id,
        addressId: (await prisma.address.findFirst({ where: { userId: customer4.id } })).id,
        shippingOptionId: homeDelivery?.id,
        status: 'PREPARING',
        totalAmount: 2340,
        deliveryFee: 2000,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        orderNumber: 'OLF-2025-005',
        userId: customer5.id,
        addressId: (await prisma.address.findFirst({ where: { userId: customer5.id } })).id,
        shippingOptionId: storePickup?.id,
        status: 'PENDING',
        totalAmount: 650,
        deliveryFee: 0,
        pickupTime: '16:30',
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        orderNumber: 'OLF-2025-006',
        userId: customer1.id,
        addressId: (await prisma.address.findFirst({ where: { userId: customer1.id } })).id,
        shippingOptionId: homeDelivery?.id,
        status: 'CONFIRMED',
        totalAmount: 1890,
        deliveryFee: 2000,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        orderNumber: 'OLF-2025-007',
        userId: customer2.id,
        addressId: (await prisma.address.findFirst({ where: { userId: customer2.id } })).id,
        shippingOptionId: homeDelivery?.id,
        status: 'CANCELLED',
        totalAmount: 1200,
        deliveryFee: 2000,
        notes: 'Customer requested cancellation',
      },
      {
        orderNumber: 'OLF-2025-008',
        userId: customer3.id,
        addressId: (await prisma.address.findFirst({ where: { userId: customer3.id } })).id,
        shippingOptionId: storePickup?.id,
        status: 'DELIVERED',
        totalAmount: 780,
        deliveryFee: 0,
        pickupTime: '17:00',
        estimatedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      }
    ];

    for (const order of demoOrders) {
      await prisma.order.create({
        data: order,
      });
    }

    console.log('✅ Created demo orders');

    // Create demo order items
    const order1 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-001' } });
    const order2 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-002' } });
    const order3 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-003' } });
    const order4 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-004' } });
    const order5 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-005' } });
    const order6 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-006' } });
    const order7 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-007' } });
    const order8 = await prisma.order.findUnique({ where: { orderNumber: 'OLF-2025-008' } });

    const demoOrderItems = [
      // Order 1 - Wine and snacks
      ...(wine1 ? [{ orderId: order1.id, productId: wine1.id, quantity: 2, price: wine1.price }] : []),
      ...(food1 ? [{ orderId: order1.id, productId: food1.id, quantity: 1, price: food1.price }] : []),

      // Order 2 - Beer
      ...(beer1 ? [{ orderId: order2.id, productId: beer1.id, quantity: 4, price: beer1.price }] : []),

      // Order 3 - Wine and nicotine
      ...(wine2 ? [{ orderId: order3.id, productId: wine2.id, quantity: 1, price: wine2.price }] : []),
      ...(nicotine1 ? [{ orderId: order3.id, productId: nicotine1.id, quantity: 1, price: nicotine1.price }] : []),

      // Order 4 - Mixed items
      ...(wine1 ? [{ orderId: order4.id, productId: wine1.id, quantity: 1, price: wine1.price }] : []),
      ...(beer1 ? [{ orderId: order4.id, productId: beer1.id, quantity: 2, price: beer1.price }] : []),
      ...(food1 ? [{ orderId: order4.id, productId: food1.id, quantity: 1, price: food1.price }] : []),

      // Order 5 - Food only
      ...(food1 ? [{ orderId: order5.id, productId: food1.id, quantity: 2, price: food1.price }] : []),

      // Order 6 - Wine collection
      ...(wine1 ? [{ orderId: order6.id, productId: wine1.id, quantity: 3, price: wine1.price }] : []),
      ...(wine2 ? [{ orderId: order6.id, productId: wine2.id, quantity: 1, price: wine2.price }] : []),

      // Order 7 - Cancelled order
      ...(beer1 ? [{ orderId: order7.id, productId: beer1.id, quantity: 6, price: beer1.price }] : []),

      // Order 8 - Nicotine products
      ...(nicotine1 ? [{ orderId: order8.id, productId: nicotine1.id, quantity: 2, price: nicotine1.price }] : [])
    ];

    for (const item of demoOrderItems) {
      await prisma.orderItem.create({
        data: item,
      });
    }

    console.log('✅ Created demo order items');

    res.json({
      success: true,
      message: 'Demo data inserted successfully'
    });

  } catch (error) {
    console.error('Error inserting demo data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to insert demo data',
      error: error.message
    });
  }
});

// Remove demo data
router.delete('/remove', async (req, res) => {
  try {
    console.log('🗑️ Starting demo data removal...');

    // Get demo customer IDs
    const demoCustomers = await prisma.user.findMany({
      where: {
        username: {
          startsWith: 'demo_customer'
        }
      },
      select: { id: true }
    });

    const demoCustomerIds = demoCustomers.map(customer => customer.id);

    if (demoCustomerIds.length === 0) {
      return res.json({
        success: true,
        message: 'No demo data found to remove'
      });
    }

    // Delete in correct order (respecting foreign key constraints)

    // Delete order items for demo orders
    await prisma.orderItem.deleteMany({
      where: {
        order: {
          userId: {
            in: demoCustomerIds
          }
        }
      }
    });

    // Delete demo orders
    await prisma.order.deleteMany({
      where: {
        userId: {
          in: demoCustomerIds
        }
      }
    });

    // Delete demo addresses
    await prisma.address.deleteMany({
      where: {
        userId: {
          in: demoCustomerIds
        }
      }
    });

    // Delete demo customers
    await prisma.user.deleteMany({
      where: {
        username: {
          startsWith: 'demo_customer'
        }
      }
    });

    console.log('✅ Removed demo data');

    res.json({
      success: true,
      message: 'Demo data removed successfully'
    });

  } catch (error) {
    console.error('Error removing demo data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove demo data',
      error: error.message
    });
  }
});

module.exports = router;