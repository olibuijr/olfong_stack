const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function uploadEgilsGull() {
  try {
    // Check if original file exists in uploads/products/originals
    const originalPath = '/home/olibuijr/Projects/olfong_stack/backend/uploads/products/originals/Egils Gull_01448.jpeg';
    
    if (!fs.existsSync(originalPath)) {
      console.log('Original file not found at:', originalPath);
      console.log('Checking what files exist in originals:');
      const originalsDir = '/home/olibuijr/Projects/olfong_stack/backend/uploads/products/originals';
      if (fs.existsSync(originalsDir)) {
        fs.readdirSync(originalsDir).forEach(f => console.log(`  - ${f}`));
      }
      return;
    }

    const fileStats = fs.statSync(originalPath);
    
    // Create media record for the Egils Gull image
    const media = await prisma.media.create({
      data: {
        filename: 'Egils Gull_01448.jpeg',
        originalName: 'Egils Gull_01448.jpeg',
        mimeType: 'image/jpeg',
        size: fileStats.size,
        collection: 'PRODUCTS',
        url: '/uploads/products/originals/Egils Gull_01448.jpeg',
        path: originalPath,
        uploadedBy: 1, // Admin user
      }
    });

    console.log('Created media record:', media.id, media.filename);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

uploadEgilsGull();
