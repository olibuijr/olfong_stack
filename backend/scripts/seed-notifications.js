require('dotenv').config();
const prisma = require('../src/config/database');

async function seedNotifications() {
  try {
    console.log('Seeding test notifications...');

    // Get first admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('No admin user found. Skipping notification seeding.');
      return;
    }

    // Create test notifications with bilingual support
    const notifications = [
      {
        type: 'order',
        priority: 'high',
        title: 'New Order Received',
        message: 'Order #1001 has been placed by a customer for ISK 5,500',
        userId: null, // Broadcast to all admins
        metadata: {
          orderId: 1,
          orderNumber: 'ORD-001',
          status: 'PENDING',
          titleIs: 'Ný pöntun móttekin',
          messageIs: 'Pöntun #1001 hefur verið gerð af viðskiptavini fyrir 5.500 kr.'
        }
      },
      {
        type: 'payment',
        priority: 'high',
        title: 'Payment Failed',
        message: 'Payment for Order #1000 failed. Customer needs to update payment method.',
        userId: null,
        metadata: {
          orderId: 1000,
          orderNumber: 'ORD-000',
          status: 'FAILED',
          titleIs: 'Greiðsla mistókst',
          messageIs: 'Greiðsla fyrir pöntun #1000 mistókst. Viðskiptavinur þarf að uppfæra greiðslumáta.'
        }
      },
      {
        type: 'delivery',
        priority: 'medium',
        title: 'Delivery Completed',
        message: 'Order #999 has been successfully delivered',
        userId: null,
        metadata: {
          orderId: 999,
          orderNumber: 'ORD-999',
          status: 'DELIVERED',
          titleIs: 'Afhending lokið',
          messageIs: 'Pöntun #999 hefur verið afhent'
        }
      },
      {
        type: 'system',
        priority: 'medium',
        title: 'Low Stock Alert',
        message: 'Product stock is running low with only 3 items remaining',
        userId: null,
        metadata: {
          productId: 1,
          productName: 'Sample Product',
          stockLevel: 3,
          titleIs: 'Viðvörun um lágt birgðamagn',
          messageIs: 'Birgðir vöru eru að klárast með aðeins 3 einingar eftir'
        }
      },
      {
        type: 'security',
        priority: 'high',
        title: 'Suspicious Login Attempt',
        message: 'Multiple failed login attempts detected',
        userId: null,
        metadata: {
          attempts: 5,
          account: 'admin',
          titleIs: 'Grunsamleg innskráningartilraun',
          messageIs: 'Margar misheppnaðar innskráningartilraunir greindar'
        }
      },
      {
        type: 'marketing',
        priority: 'low',
        title: 'New Customer Registration',
        message: 'A new customer has registered for an account',
        userId: null,
        metadata: {
          customerId: 1,
          titleIs: 'Ný viðskiptavinaskráning',
          messageIs: 'Nýr viðskiptavinur hefur skráð sig fyrir reikningi'
        }
      },
      {
        type: 'order',
        priority: 'medium',
        title: 'Order Confirmed',
        message: 'Order #998 has been confirmed and is being prepared',
        userId: adminUser.id,
        metadata: {
          orderId: 998,
          orderNumber: 'ORD-998',
          status: 'CONFIRMED',
          titleIs: 'Pöntun staðfest',
          messageIs: 'Pöntun #998 hefur verið staðfest og er í undirbúningi'
        }
      },
      {
        type: 'system',
        priority: 'medium',
        title: 'Server Maintenance Scheduled',
        message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM',
        userId: null,
        metadata: {
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          titleIs: 'Áætlað viðhald á netþjóni',
          messageIs: 'Áætlað viðhald fer fram í nótt frá 02:00 til 04:00'
        }
      }
    ];

    // Clear existing notifications (optional)
    await prisma.notification.deleteMany({});

    // Create notifications
    const created = await prisma.notification.createMany({
      data: notifications
    });

    console.log(`✓ Successfully seeded ${created.count} notifications`);

    // Create default notification preferences for admin if not exist
    const existing = await prisma.notificationPreference.findUnique({
      where: { userId: adminUser.id }
    });

    if (!existing) {
      await prisma.notificationPreference.create({
        data: {
          userId: adminUser.id,
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
          orderUpdates: true,
          systemAlerts: true,
          marketing: false,
          securityAlerts: true
        }
      });
      console.log('✓ Created default notification preferences for admin');
    }

  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedNotifications();
