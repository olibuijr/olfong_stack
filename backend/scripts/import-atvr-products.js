const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const cheerio = require('cheerio');

const prisma = new PrismaClient();

// Category configurations
const CATEGORY_CONFIGS = {
  WINE: {
    atvrSearchTerm: 'rauðvín',
    olfongUrl: 'https://olfong.is/voruflokkar/vin/',
    categoryName: 'WINE',
    dataFile: path.join(__dirname, '../../wine-import-data.json'),
    ageRestriction: 20
  },
  SPIRITS: {
    atvrSearchTerm: 'vodka',
    olfongUrl: 'https://olfong.is/voruflokkar/sterkt-afengi/',
    categoryName: 'SPIRITS',
    dataFile: path.join(__dirname, '../../spirits-import-data.json'),
    ageRestriction: 20
  },
  NON_ALCOHOLIC: {
    atvrSearchTerm: 'sóði',
    olfongUrl: 'https://olfong.is/voruflokkar/alkoholfri-drykkir/',
    categoryName: 'NON_ALCOHOLIC',
    dataFile: path.join(__dirname, '../../non-alcoholic-import-data.json'),
    ageRestriction: null
  }
};

// Configuration
const UPLOADS_DIR = path.join(__dirname, '../uploads/products');
const ATVR_BASE_URL = 'http://localhost:5000/api/atvr';

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function main() {
  const categoryName = process.argv[2]?.toUpperCase();

  if (!categoryName || !CATEGORY_CONFIGS[categoryName]) {
    console.error('❌ Usage: node import-atvr-products.js <CATEGORY>');
    console.error('Available categories:', Object.keys(CATEGORY_CONFIGS).join(', '));
    process.exit(1);
  }

  const config = CATEGORY_CONFIGS[categoryName];
  console.log(`🚀 Starting ATVR ${categoryName} Import with Olfong Images...`);

  try {
    // Phase 1: Get ATVR products
    console.log(`📊 Phase 1: Collecting ATVR ${categoryName.toLowerCase()} products...`);
    const atvrProducts = await getATVRProducts(config);
    console.log(`Found ${atvrProducts.length} ${categoryName.toLowerCase()} products from ATVR`);

    // Save ATVR data to file
    fs.writeFileSync(config.dataFile, JSON.stringify(atvrProducts, null, 2));
    console.log(`💾 Saved ATVR data to ${config.dataFile}`);

    // Phase 2: Get Olfong images
    console.log('🖼️ Phase 2: Collecting product images from Olfong...');
    const olfongImages = await getOlfongImages(config);
    console.log(`Found ${Object.keys(olfongImages).length} product images from Olfong`);

    // Phase 3: Match and merge data
    console.log('🔗 Phase 3: Matching ATVR products with Olfong images...');
    const mergedProducts = await matchProductsWithImages(atvrProducts, olfongImages);
    console.log(`Successfully matched ${mergedProducts.length} products`);

    // Phase 4: Download and process images
    console.log('💾 Phase 4: Downloading and processing images...');
    await downloadAndProcessImages(mergedProducts);

    // Phase 5: Import to database
    console.log('💾 Phase 5: Importing products to database...');
    const results = await importProductsToDatabase(mergedProducts, config);

    console.log('✅ Import completed successfully!');
    console.log(`📊 Results: ${results.imported} imported, ${results.skipped} skipped, ${results.errors} errors`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get products from ATVR API
async function getATVRProducts(config) {
  try {
    console.log(`Searching ATVR for ${config.categoryName.toLowerCase()} products...`);
    const response = await axios.post(`${ATVR_BASE_URL}/search`, {
      searchTerm: config.atvrSearchTerm
    }, {
      timeout: 30000
    });

    const products = response.data.data?.products || [];
    console.log(`Found ${products.length} initial ${config.categoryName.toLowerCase()} products`);

    // Get detailed information for each product
    const detailedProducts = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        console.log(`Getting details for product ${i + 1}/${products.length}: ${product.name}`);
        const detailResponse = await axios.get(`${ATVR_BASE_URL}/product/${product.id}?language=is`, {
          timeout: 15000
        });
        // Merge the detailed data with the original product info
        const detailedProduct = {
          ...product,
          ...detailResponse.data.data,
          // Ensure we have both name and nameIs
          name: detailResponse.data.data.name || product.name,
          nameIs: detailResponse.data.data.nameIs || detailResponse.data.data.name || product.name
        };
        detailedProducts.push(detailedProduct);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`⚠️ Failed to get details for product ${product.id}:`, error.message);
        // Still add basic product info
        detailedProducts.push(product);
      }
    }

    return detailedProducts;
  } catch (error) {
    console.error('Failed to get ATVR products:', error);
    throw new Error(`Failed to get ATVR products: ${error.message}`);
  }
}

// Scrape product images from Olfong
async function getOlfongImages(config) {
  try {
    console.log('Fetching Olfong page with axios...');

    const response = await axios.get(config.olfongUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'is-IS,is;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const images = {};

    // Extract products from the HTML
    $('.product, [class*="product"]').each((i, el) => {
      const $el = $(el);
      const img = $el.find('img').first();
      const title = $el.find('h3, h2, .product-title, .woocommerce-loop-product__title').first();

      if (img.length && title.length) {
        const imageUrl = img.attr('src');
        const productName = title.text().trim();

        if (imageUrl && productName && !images[productName]) {
          // Ensure full URL
          const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `https://olfong.is${imageUrl}`;
          images[productName] = fullImageUrl;
        }
      }
    });

    console.log(`Found ${Object.keys(images).length} products from Olfong`);
    console.log('Sample Olfong product names:', Object.keys(images).slice(0, 10));
    return images;

  } catch (error) {
    console.error('Failed to scrape Olfong images:', error);
    throw new Error(`Failed to scrape Olfong images: ${error.message}`);
  }
}

// Match ATVR products with Olfong images
function matchProductsWithImages(atvrProducts, olfongImages) {
  const matched = [];
  const unmatched = [];

  console.log('Starting product matching...');
  console.log('ATVR products to match:', atvrProducts.map(p => p.name || p.nameIs).slice(0, 5));

  for (const atvrProduct of atvrProducts) {
    const atvrName = normalizeProductName(atvrProduct.name || atvrProduct.nameIs || '');
    let bestMatch = null;
    let bestScore = 0;
    let matchedImageName = '';

    // Try exact match first
    if (olfongImages[atvrName]) {
      bestMatch = olfongImages[atvrName];
      bestScore = 1;
      matchedImageName = atvrName;
    } else {
      // Try fuzzy matching
      for (const [olfongName, imageUrl] of Object.entries(olfongImages)) {
        const olfongNormalized = normalizeProductName(olfongName);
        const score = calculateMatchScore(atvrName, olfongNormalized);

        if (score > bestScore && score > 0.4) { // Even lower threshold for better matching
          bestMatch = imageUrl;
          bestScore = score;
          matchedImageName = olfongName;
        }
      }
    }

    if (bestMatch) {
      matched.push({
        ...atvrProduct,
        olfongImageUrl: bestMatch,
        matchScore: bestScore,
        matchedImageName: matchedImageName
      });
      console.log(`✅ Matched: "${atvrName}" -> "${matchedImageName}" (score: ${bestScore.toFixed(2)})`);
    } else {
      unmatched.push(atvrProduct);
      console.warn(`⚠️ No image match found for: "${atvrName}"`);
    }
  }

  console.log(`\n📊 Matching Results:`);
  console.log(`✅ Matched: ${matched.length}`);
  console.log(`⚠️ Unmatched: ${unmatched.length}`);

  return matched;
}

// Normalize product names for matching
function normalizeProductName(name) {
  if (!name) return '';

  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace special characters with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/\b\d+(ml|l|cl|hl)\b/g, '') // Remove volume measurements
    .replace(/\b\d+\s*(ml|l|cl|hl)\b/g, '') // Remove volume with spaces
    .replace(/\b\d+[.,]\d*\s*(ml|l|cl|hl)\b/g, '') // Remove decimal volumes
    .replace(/\b\d+[.,]\d*\b/g, '') // Remove other numbers
    .replace(/\s+/g, ' ') // Normalize spaces again
    .trim();
}

// Calculate similarity score between two product names
function calculateMatchScore(name1, name2) {
  if (!name1 || !name2) return 0;

  const words1 = name1.split(' ');
  const words2 = name2.split(' ');

  let matches = 0;
  for (const word1 of words1) {
    if (word1.length < 3) continue; // Skip short words

    for (const word2 of words2) {
      if (word2.length < 3) continue;

      if (word1 === word2 ||
          word1.includes(word2) ||
          word2.includes(word1) ||
          levenshteinDistance(word1, word2) <= 2) {
        matches++;
        break;
      }
    }
  }

  return matches / Math.max(words1.length, words2.length);
}

// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str2.length];
}

// Download and process images using Media system
async function downloadAndProcessImages(products) {
  console.log('Setting up image processing...');

  // Get system user for uploads
  let systemUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!systemUser) {
    // Create system user if none exists
    systemUser = await prisma.user.create({
      data: {
        username: 'system',
        email: 'system@olfong.is',
        password: '$2b$10$dummy.hash.for.system.user', // You should generate a proper hash
        fullName: 'System User',
        role: 'ADMIN'
      }
    });
    console.log('Created system user for media uploads');
  }

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    if (product.olfongImageUrl) {
      try {
        console.log(`Processing image ${i + 1}/${products.length}: ${product.name || product.nameIs}`);

        // Download image data
        const response = await axios.get(product.olfongImageUrl, {
          responseType: 'arraybuffer',
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        const imageBuffer = Buffer.from(response.data);
        const filename = generateImageFilename(product.name || product.nameIs);
        const filepath = path.join(UPLOADS_DIR, filename);

        // Get image metadata
        const metadata = await sharp(imageBuffer).metadata();

        // Create Media record
        const mediaRecord = await prisma.media.create({
          data: {
            filename: filename,
            originalName: filename,
            mimeType: metadata.format === 'jpeg' ? 'image/jpeg' : `image/${metadata.format}`,
            size: imageBuffer.length,
            width: metadata.width,
            height: metadata.height,
            collection: 'PRODUCTS',
            entityId: null, // Will be set after product creation
            entityType: 'Product',
            url: `/uploads/products/${filename}`,
            path: `uploads/products/${filename}`,
            uploadedBy: systemUser.id,
            isActive: true
          }
        });

        // Save original image
        await sharp(imageBuffer)
          .webp({ quality: 85 })
          .toFile(filepath);

        // Generate thumbnail
        const thumbnailFilename = filename.replace('.webp', '-thumb.webp');
        const thumbnailPath = path.join(UPLOADS_DIR, thumbnailFilename);

        await sharp(imageBuffer)
          .resize(300, 300, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 80 })
          .toFile(thumbnailPath);

        // Create MediaSize record for thumbnail
        await prisma.mediaSize.create({
          data: {
            mediaId: mediaRecord.id,
            size: 'thumbnail',
            width: 300,
            height: 300,
            url: `/uploads/products/${thumbnailFilename}`
          }
        });

        // Update media record with thumbnail
        await prisma.media.update({
          where: { id: mediaRecord.id },
          data: {
            thumbnailUrl: `/uploads/products/${thumbnailFilename}`
          }
        });

        // Store media ID for later product linking
        product.mediaId = mediaRecord.id;

        console.log(`✅ Created media record: ${filename}`);

      } catch (error) {
        console.warn(`⚠️ Failed to process image for ${product.name || product.nameIs}:`, error.message);
        product.mediaId = null;
      }
    }
  }
}

// Generate consistent filename for product images
function generateImageFilename(productName) {
  if (!productName) return `product-${Date.now()}.webp`;

  const normalized = productName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .replace(/\b\d+(ml|l|cl)\b/g, '') // Remove volume measurements
    .replace(/\b\d+\s*(ml|l|cl)\b/g, '') // Remove volume with spaces
    .trim()
    .substring(0, 50); // Limit length

  return `${normalized}.webp`;
}

// Import products to database
async function importProductsToDatabase(products, config) {
  const results = { imported: 0, skipped: 0, errors: 0 };

  // Get category
  const category = await prisma.category.findFirst({
    where: { name: config.categoryName }
  });

  if (!category) {
    throw new Error(`${config.categoryName} category not found. Please run category seeding first.`);
  }

  console.log(`Found ${config.categoryName} category: ${category.name} (ID: ${category.id})`);

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    try {
      console.log(`Importing product ${i + 1}/${products.length}: ${product.name || product.nameIs}`);

      // Check if product already exists (by ATVR ID or name)
      const existingProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { atvrProductId: product.atvrProductId },
            { name: product.name }
          ]
        }
      });

      if (existingProduct) {
        console.log(`⏭️ Skipping existing product: ${product.name}`);
        results.skipped++;
        continue;
      }

      // Prepare product data
      const productData = {
        name: product.name,
        nameIs: product.nameIs || product.name,
        description: product.description || `${product.name} - Quality ${config.categoryName.toLowerCase()} from ${product.country || 'Iceland'}`,
        descriptionIs: product.descriptionIs || product.description,
        categoryId: category.id,
        price: parseFloat(product.price) || 0,
        stock: 100, // Default stock
        alcoholContent: product.alcoholContent ? parseFloat(product.alcoholContent) : null,
        volume: product.volume,
        country: product.country,
        countryIs: product.countryIs || product.country,
        producer: product.producer,
        producerIs: product.producerIs || product.producer,
        mediaId: product.mediaId, // Link to Media record
        atvrProductId: product.atvrProductId,
        atvrUrl: product.atvrUrl,
        atvrImageUrl: product.atvrImageUrl,
        isActive: true,
        ageRestriction: config.ageRestriction,
        availability: product.availability || 'available',
        availabilityIs: product.availabilityIs || 'Til ráðstöfunar'
      };

      // Add optional fields if they exist
      if (product.foodPairings && Array.isArray(product.foodPairings) && product.foodPairings.length > 0) {
        productData.foodPairings = product.foodPairings;
      }
      if (product.foodPairingsIs && Array.isArray(product.foodPairingsIs) && product.foodPairingsIs.length > 0) {
        productData.foodPairingsIs = product.foodPairingsIs;
      }
      if (product.specialAttributes && Array.isArray(product.specialAttributes) && product.specialAttributes.length > 0) {
        productData.specialAttributes = product.specialAttributes;
      }
      if (product.specialAttributesIs && Array.isArray(product.specialAttributesIs) && product.specialAttributesIs.length > 0) {
        productData.specialAttributesIs = product.specialAttributesIs;
      }

      // Create product
      const createdProduct = await prisma.product.create({
        data: productData
      });

      // Update media record with product ID
      if (product.mediaId) {
        await prisma.media.update({
          where: { id: product.mediaId },
          data: {
            entityId: createdProduct.id.toString(),
            entityType: 'Product'
          }
        });
      }

      console.log(`✅ Imported: ${product.name} (ID: ${createdProduct.id})`);
      results.imported++;

    } catch (error) {
      console.error(`❌ Failed to import ${product.name}:`, error.message);
      results.errors++;
    }
  }

  return results;
}

// Run the import
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, getATVRProducts, getOlfongImages, matchProductsWithImages };