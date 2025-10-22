const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMediaUrls() {
  try {
    console.log('🔧 Fixing media URLs...');
    
    // Get all media with relative URLs
    const mediaItems = await prisma.media.findMany({
      where: {
        OR: [
          { url: { startsWith: '/uploads/' } },
          { thumbnailUrl: { startsWith: '/uploads/' } }
        ]
      }
    });

    console.log(`Found ${mediaItems.length} media items to fix`);

    for (const media of mediaItems) {
      const updates = {};
      
      if (media.url && media.url.startsWith('/uploads/')) {
        updates.url = 'http://localhost:5000' + media.url;
      }
      
      if (media.thumbnailUrl && media.thumbnailUrl.startsWith('/uploads/')) {
        updates.thumbnailUrl = 'http://localhost:5000' + media.thumbnailUrl;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.media.update({
          where: { id: media.id },
          data: updates
        });
        console.log(`✅ Fixed media: ${media.originalName}`);
      }
    }

    // Fix format URLs
    const formats = await prisma.mediaFormat.findMany({
      where: { url: { startsWith: '/uploads/' } }
    });

    console.log(`Found ${formats.length} formats to fix`);

    for (const format of formats) {
      await prisma.mediaFormat.update({
        where: { id: format.id },
        data: {
          url: 'http://localhost:5000' + format.url
        }
      });
    }

    // Fix size URLs
    const sizes = await prisma.mediaSize.findMany({
      where: { url: { startsWith: '/uploads/' } }
    });

    console.log(`Found ${sizes.length} sizes to fix`);

    for (const size of sizes) {
      await prisma.mediaSize.update({
        where: { id: size.id },
        data: {
          url: 'http://localhost:5000' + size.url
        }
      });
    }

    console.log('✅ All media URLs fixed successfully');
  } catch (error) {
    console.error('❌ Error fixing URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMediaUrls();