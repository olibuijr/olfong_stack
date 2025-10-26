const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existing) {
      console.log('✓ Admin user already exists');
      await prisma.$disconnect();
      return;
    }

    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin', // In production, this should be hashed
        fullName: 'Admin User',
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user created successfully');
    console.log(`  - Username: ${admin.username}`);
    console.log(`  - Email: ${admin.email}`);
    console.log(`  - Role: ${admin.role}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
