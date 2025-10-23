const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function createEgilsGullEntry() {
  try {
    // The original JPEG file is 953c18b1-fcc8-4ccb-a6c8-a9b204097477.jpeg
    const originalFile = '/home/olibuijr/Projects/olfong_stack/backend/uploads/products/originals/953c18b1-fcc8-4ccb-a6c8-a9b204097477.jpeg';
    
    if (!fs.existsSync(originalFile)) {
      console.log('File not found');
      return;
    }

    const fileStats = fs.statSync(originalFile);

    // Create media record
    const media = await prisma.media.create({
      data: {
        filename: 'Egils Gull_01448.jpeg',
        originalName: 'Egils Gull_01448.jpeg',
        mimeType: 'image/jpeg',
        size: fileStats.size,
        width: 400,
        height: 500,
        collection: 'PRODUCTS',
        url: '/uploads/products/Egils Gull_01448.jpeg',
        path: originalFile,
        uploadedBy: 1,
        isActive: true
      }
    });

    console.log('✓ Created media record:', media.id);
    console.log('  Filename:', media.filename);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createEgilsGullEntry();
