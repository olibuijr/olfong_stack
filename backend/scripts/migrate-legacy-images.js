const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { generateMediaVariants } = require('../src/services/mediaService');

const prisma = new PrismaClient();

// Ensure upload directories exist
const ensureDirectories = () => {
  const baseDir = path.join(__dirname, '../uploads');
  const collections = ['products', 'banners', 'categories'];

  collections.forEach(collection => {
    const collectionDir = path.join(baseDir, collection);
    const originalsDir = path.join(collectionDir, 'originals');
    const thumbnailsDir = path.join(collectionDir, 'thumbnails');
    const webpDir = path.join(collectionDir, 'webp');

    [collectionDir, originalsDir, thumbnailsDir, webpDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  });
};

// Generate file hash for deduplication
const generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

// Download image from URL
const downloadImage = async (url) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MigrationScript/1.0)'
      }
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`Failed to download image from ${url}:`, error.message);
    return null;
  }
};

// Migrate product images
const migrateProductImages = async () => {
  console.log('🔄 Migrating product images...');

  const products = await prisma.product.findMany({
    where: {
      imageUrl: { not: null },
      mediaId: null // Only migrate products without media
    },
    select: {
      id: true,
      name: true,
      imageUrl: true
    }
  });

  console.log(`Found ${products.length} products with legacy images`);

  for (const product of products) {
    try {
      console.log(`Processing product: ${product.name}`);

      const imageBuffer = await downloadImage(product.imageUrl);
      if (!imageBuffer) {
        console.log(`Skipping product ${product.id} - failed to download image`);
        continue;
      }

      const fileHash = generateFileHash(imageBuffer);
      const fileExtension = path.extname(product.imageUrl) || '.jpg';
      const filename = `${uuidv4()}${fileExtension}`;
      const collectionDir = 'products';

      // Check for existing file with same hash
      const existingMedia = await prisma.media.findFirst({
        where: { hash: fileHash, collection: 'PRODUCTS' }
      });

      if (existingMedia) {
        console.log(`Using existing media for product ${product.id}`);
        await prisma.product.update({
          where: { id: product.id },
          data: { mediaId: existingMedia.id }
        });
        continue;
      }

      // Save file to disk
      ensureDirectories();
      const originalPath = path.join(__dirname, '../uploads', collectionDir, 'originals', filename);
      fs.writeFileSync(originalPath, imageBuffer);

      // Get file stats
      const stats = fs.statSync(originalPath);

      // Create media record
      const media = await prisma.media.create({
        data: {
          filename,
          originalName: `${product.name}${fileExtension}`,
          mimeType: `image/${fileExtension.slice(1)}`,
          size: stats.size,
          hash: fileHash,
          collection: 'PRODUCTS',
          url: `/uploads/${collectionDir}/originals/${filename}`,
          path: `${collectionDir}/originals/${filename}`,
          uploadedBy: 1 // System user
        }
      });

      // Update product to reference media
      await prisma.product.update({
        where: { id: product.id },
        data: { mediaId: media.id }
      });

      // Process different formats and sizes asynchronously
      generateMediaVariants(media, originalPath, 'PRODUCTS')
        .then(async (results) => {
          const formats = [];
          const sizes = [];

          for (const result of results) {
            if (result.success) {
              if (result.type === 'format') {
                formats.push({
                  mediaId: media.id,
                  format: result.name,
                  url: result.url,
                  size: result.size
                });
              } else if (result.type === 'size') {
                sizes.push({
                  mediaId: media.id,
                  size: result.name,
                  width: result.width,
                  height: result.height,
                  url: result.url
                });
              }
            }
          }

          // Update media with thumbnail URL if available
          const thumbnailSize = sizes.find(s => s.size === 'thumbnail');
          if (thumbnailSize) {
            await prisma.media.update({
              where: { id: media.id },
              data: { thumbnailUrl: thumbnailSize.url }
            });
          }

          console.log(`✅ Processed media variants for product ${product.id}`);
        })
        .catch(error => {
          console.error(`❌ Failed to process variants for product ${product.id}:`, error);
        });

      console.log(`✅ Migrated product ${product.id}`);
    } catch (error) {
      console.error(`❌ Failed to migrate product ${product.id}:`, error);
    }
  }
};

// Migrate banner images
const migrateBannerImages = async () => {
  console.log('🔄 Migrating banner images...');

  const banners = await prisma.banner.findMany({
    where: {
      imageUrl: { not: null },
      mediaId: null // Only migrate banners without media
    },
    select: {
      id: true,
      title: true,
      imageUrl: true
    }
  });

  console.log(`Found ${banners.length} banners with legacy images`);

  for (const banner of banners) {
    try {
      console.log(`Processing banner: ${banner.title || banner.id}`);

      const imageBuffer = await downloadImage(banner.imageUrl);
      if (!imageBuffer) {
        console.log(`Skipping banner ${banner.id} - failed to download image`);
        continue;
      }

      const fileHash = generateFileHash(imageBuffer);
      const fileExtension = path.extname(banner.imageUrl) || '.jpg';
      const filename = `${uuidv4()}${fileExtension}`;
      const collectionDir = 'banners';

      // Check for existing file with same hash
      const existingMedia = await prisma.media.findFirst({
        where: { hash: fileHash, collection: 'BANNERS' }
      });

      if (existingMedia) {
        console.log(`Using existing media for banner ${banner.id}`);
        await prisma.banner.update({
          where: { id: banner.id },
          data: { mediaId: existingMedia.id }
        });
        continue;
      }

      // Save file to disk
      ensureDirectories();
      const originalPath = path.join(__dirname, '../uploads', collectionDir, 'originals', filename);
      fs.writeFileSync(originalPath, imageBuffer);

      // Get file stats
      const stats = fs.statSync(originalPath);

      // Create media record
      const media = await prisma.media.create({
        data: {
          filename,
          originalName: `${banner.title || 'Banner'}${fileExtension}`,
          mimeType: `image/${fileExtension.slice(1)}`,
          size: stats.size,
          hash: fileHash,
          collection: 'BANNERS',
          url: `/uploads/${collectionDir}/originals/${filename}`,
          path: `${collectionDir}/originals/${filename}`,
          uploadedBy: 1 // System user
        }
      });

      // Update banner to reference media
      await prisma.banner.update({
        where: { id: banner.id },
        data: { mediaId: media.id }
      });

      // Process different formats and sizes asynchronously
      generateMediaVariants(media, originalPath, 'BANNERS')
        .then(async (results) => {
          const formats = [];
          const sizes = [];

          for (const result of results) {
            if (result.success) {
              if (result.type === 'format') {
                formats.push({
                  mediaId: media.id,
                  format: result.name,
                  url: result.url,
                  size: result.size
                });
              } else if (result.type === 'size') {
                sizes.push({
                  mediaId: media.id,
                  size: result.name,
                  width: result.width,
                  height: result.height,
                  url: result.url
                });
              }
            }
          }

          // Update media with thumbnail URL if available
          const thumbnailSize = sizes.find(s => s.size === 'thumbnail');
          if (thumbnailSize) {
            await prisma.media.update({
              where: { id: media.id },
              data: { thumbnailUrl: thumbnailSize.url }
            });
          }

          console.log(`✅ Processed media variants for banner ${banner.id}`);
        })
        .catch(error => {
          console.error(`❌ Failed to process variants for banner ${banner.id}:`, error);
        });

      console.log(`✅ Migrated banner ${banner.id}`);
    } catch (error) {
      console.error(`❌ Failed to migrate banner ${banner.id}:`, error);
    }
  }
};

// Migrate category images
const migrateCategoryImages = async () => {
  console.log('🔄 Migrating category images...');

  const categories = await prisma.category.findMany({
    where: {
      imageUrl: { not: null },
      mediaId: null // Only migrate categories without media
    },
    select: {
      id: true,
      name: true,
      imageUrl: true
    }
  });

  console.log(`Found ${categories.length} categories with legacy images`);

  for (const category of categories) {
    try {
      console.log(`Processing category: ${category.name}`);

      const imageBuffer = await downloadImage(category.imageUrl);
      if (!imageBuffer) {
        console.log(`Skipping category ${category.id} - failed to download image`);
        continue;
      }

      const fileHash = generateFileHash(imageBuffer);
      const fileExtension = path.extname(category.imageUrl) || '.jpg';
      const filename = `${uuidv4()}${fileExtension}`;
      const collectionDir = 'categories';

      // Check for existing file with same hash
      const existingMedia = await prisma.media.findFirst({
        where: { hash: fileHash, collection: 'CATEGORIES' }
      });

      if (existingMedia) {
        console.log(`Using existing media for category ${category.id}`);
        await prisma.category.update({
          where: { id: category.id },
          data: { mediaId: existingMedia.id }
        });
        continue;
      }

      // Save file to disk
      ensureDirectories();
      const originalPath = path.join(__dirname, '../uploads', collectionDir, 'originals', filename);
      fs.writeFileSync(originalPath, imageBuffer);

      // Get file stats
      const stats = fs.statSync(originalPath);

      // Create media record
      const media = await prisma.media.create({
        data: {
          filename,
          originalName: `${category.name}${fileExtension}`,
          mimeType: `image/${fileExtension.slice(1)}`,
          size: stats.size,
          hash: fileHash,
          collection: 'CATEGORIES',
          url: `/uploads/${collectionDir}/originals/${filename}`,
          path: `${collectionDir}/originals/${filename}`,
          uploadedBy: 1 // System user
        }
      });

      // Update category to reference media
      await prisma.category.update({
        where: { id: category.id },
        data: { mediaId: media.id }
      });

      // Process different formats and sizes asynchronously
      generateMediaVariants(media, originalPath, 'CATEGORIES')
        .then(async (results) => {
          const formats = [];
          const sizes = [];

          for (const result of results) {
            if (result.success) {
              if (result.type === 'format') {
                formats.push({
                  mediaId: media.id,
                  format: result.name,
                  url: result.url,
                  size: result.size
                });
              } else if (result.type === 'size') {
                sizes.push({
                  mediaId: media.id,
                  size: result.name,
                  width: result.width,
                  height: result.height,
                  url: result.url
                });
              }
            }
          }

          // Update media with thumbnail URL if available
          const thumbnailSize = sizes.find(s => s.size === 'thumbnail');
          if (thumbnailSize) {
            await prisma.media.update({
              where: { id: media.id },
              data: { thumbnailUrl: thumbnailSize.url }
            });
          }

          console.log(`✅ Processed media variants for category ${category.id}`);
        })
        .catch(error => {
          console.error(`❌ Failed to process variants for category ${category.id}:`, error);
        });

      console.log(`✅ Migrated category ${category.id}`);
    } catch (error) {
      console.error(`❌ Failed to migrate category ${category.id}:`, error);
    }
  }
};

// Main migration function
const runMigration = async () => {
  console.log('🚀 Starting legacy image migration...');

  try {
    await migrateProductImages();
    await migrateBannerImages();
    await migrateCategoryImages();

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration, migrateProductImages, migrateBannerImages, migrateCategoryImages };