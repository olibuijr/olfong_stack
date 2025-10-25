const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const OLD_BASE_URL = 'http://localhost:5000';
const NEW_BASE_URL = 'http://192.168.8.62:5000';

async function updateImageUrls() {
  console.log('Updating image URLs from localhost to network IP...');

  try {
    // Update products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { imageUrl: { contains: OLD_BASE_URL } },
          { atvrImageUrl: { contains: OLD_BASE_URL } }
        ]
      }
    });

    console.log(`Found ${products.length} products with localhost URLs`);

    for (const product of products) {
      const updates = {};

      if (product.imageUrl && product.imageUrl.includes(OLD_BASE_URL)) {
        updates.imageUrl = product.imageUrl.replace(OLD_BASE_URL, NEW_BASE_URL);
      }

      if (product.atvrImageUrl && product.atvrImageUrl.includes(OLD_BASE_URL)) {
        updates.atvrImageUrl = product.atvrImageUrl.replace(OLD_BASE_URL, NEW_BASE_URL);
      }

      if (Object.keys(updates).length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: updates
        });
      }
    }

    // Update categories
    const categories = await prisma.category.findMany({
      where: {
        imageUrl: { contains: OLD_BASE_URL }
      }
    });

    console.log(`Found ${categories.length} categories with localhost URLs`);

    for (const category of categories) {
      await prisma.category.update({
        where: { id: category.id },
        data: {
          imageUrl: category.imageUrl.replace(OLD_BASE_URL, NEW_BASE_URL)
        }
      });
    }

    // Update banners
    const banners = await prisma.banner.findMany({
      where: {
        imageUrl: { contains: OLD_BASE_URL }
      }
    });

    console.log(`Found ${banners.length} banners with localhost URLs`);

    for (const banner of banners) {
      await prisma.banner.update({
        where: { id: banner.id },
        data: {
          imageUrl: banner.imageUrl.replace(OLD_BASE_URL, NEW_BASE_URL)
        }
      });
    }

    // Update media formats
    const mediaFormats = await prisma.mediaFormat.findMany({
      where: {
        url: { contains: OLD_BASE_URL }
      }
    });

    console.log(`Found ${mediaFormats.length} media formats with localhost URLs`);

    for (const format of mediaFormats) {
      await prisma.mediaFormat.update({
        where: { id: format.id },
        data: {
          url: format.url.replace(OLD_BASE_URL, NEW_BASE_URL)
        }
      });
    }

    // Update media sizes
    const mediaSizes = await prisma.mediaSize.findMany({
      where: {
        url: { contains: OLD_BASE_URL }
      }
    });

    console.log(`Found ${mediaSizes.length} media sizes with localhost URLs`);

    for (const size of mediaSizes) {
      await prisma.mediaSize.update({
        where: { id: size.id },
        data: {
          url: size.url.replace(OLD_BASE_URL, NEW_BASE_URL)
        }
      });
    }

    console.log('✅ Successfully updated all image URLs!');
  } catch (error) {
    console.error('Error updating image URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateImageUrls();
