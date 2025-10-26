const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/response');
const { generateMediaVariants } = require('../services/mediaService');
const { getResponsiveImageData } = require('../services/responsiveImageService');

const prisma = new PrismaClient();

// CDN/Media base URL configuration
const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || process.env.BASE_URL || 'http://localhost:5000';

// Collection configurations
const COLLECTION_CONFIGS = {
  PRODUCTS: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },
  CATEGORIES: {
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  BANNERS: {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  PROFILE: {
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  TEMP: {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  }
};

/**
 * Search for images online (e.g., from Unsplash, Pexels, etc.)
 * and download them into the media library
 */
const searchAndDownloadImages = async (req, res) => {
  try {
    const { query, collection, provider = 'unsplash', limit = 10 } = req.body;
    const userId = req.user?.id;

    if (!query || !collection) {
      return errorResponse(res, 'Query and collection are required', 400);
    }

    if (!COLLECTION_CONFIGS[collection]) {
      return errorResponse(res, 'Invalid collection type', 400);
    }

    // Validate provider
    const supportedProviders = ['unsplash', 'pexels'];
    if (!supportedProviders.includes(provider)) {
      return errorResponse(res, 'Provider not supported', 400);
    }

    // Get images based on provider
    let images = [];
    if (provider === 'unsplash') {
      images = await searchUnsplash(query, limit);
    } else if (provider === 'pexels') {
      images = await searchPexels(query, limit);
    }

    if (!images || images.length === 0) {
      return successResponse(res, { downloaded: [], errors: [] }, 200);
    }

    // Download and process images
    const results = await Promise.allSettled(
      images.map(imageUrl => downloadAndProcessImage(imageUrl, collection, userId))
    );

    const downloaded = [];
    const errors = [];

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled' && result.value) {
        downloaded.push(result.value);
      } else {
        errors.push({
          url: images[idx],
          error: result.reason?.message || 'Failed to download'
        });
      }
    });

    return successResponse(res, { downloaded, errors }, 200);
  } catch (error) {
    console.error('Error in searchAndDownloadImages:', error);
    errorResponse(res, 'Error searching images', 500);
  }
};

/**
 * Search Unsplash for images
 */
const searchUnsplash = async (query, limit) => {
  try {
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!apiKey) {
      console.warn('Unsplash API key not configured');
      return [];
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&client_id=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results?.map(img => img.urls.regular) || [];
  } catch (error) {
    console.error('Error searching Unsplash:', error);
    return [];
  }
};

/**
 * Search Pexels for images
 */
const searchPexels = async (query, limit) => {
  try {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      console.warn('Pexels API key not configured');
      return [];
    }

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${limit}`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.photos?.map(img => img.src.original) || [];
  } catch (error) {
    console.error('Error searching Pexels:', error);
    return [];
  }
};

/**
 * Download image from URL and process it
 */
const downloadAndProcessImage = async (imageUrl, collection, userId) => {
  try {
    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const mimeType = response.headers.get('content-type') || 'image/jpeg';

    // Validate
    const config = COLLECTION_CONFIGS[collection];
    if (buffer.length > config.maxSize) {
      throw new Error('File size exceeds limit');
    }

    if (!config.allowedTypes.includes(mimeType)) {
      throw new Error('Invalid file type');
    }

    // Generate hash for deduplication
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Check if already exists
    const existing = await prisma.media.findFirst({
      where: { hash }
    });

    if (existing) {
      return existing;
    }

    // Save original file
    const uploadsDir = path.join(__dirname, '../../uploads');
    const collectionDir = path.join(uploadsDir, collection.toLowerCase());
    const originalsDir = path.join(collectionDir, 'originals');

    if (!fs.existsSync(originalsDir)) {
      fs.mkdirSync(originalsDir, { recursive: true });
    }

    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    const filePath = path.join(originalsDir, filename);

    // Convert to JPEG and save
    const metadata = await sharp(buffer)
      .jpeg({ quality: 90 })
      .toFile(filePath);

    // Create media record
    const media = await prisma.media.create({
      data: {
        filename: filename,
        originalName: path.basename(imageUrl).split('?')[0] || filename,
        mimeType: 'image/jpeg',
        size: metadata.size,
        width: metadata.width,
        height: metadata.height,
        collection: collection,
        hash: hash,
        url: `${MEDIA_BASE_URL}/api/images/${uuidv4()}`,
        path: filePath,
        uploadedBy: userId || null
      }
    });

    // Generate variants
    await generateMediaVariants(filePath, collection, media.id);

    // Get updated media with responsive data
    const updatedMedia = await prisma.media.findUnique({
      where: { id: media.id },
      include: {
        mediaFormats: true,
        mediaSizes: true
      }
    });

    return {
      ...updatedMedia,
      responsiveData: getResponsiveImageData(updatedMedia, MEDIA_BASE_URL)
    };
  } catch (error) {
    console.error('Error downloading/processing image:', error);
    throw error;
  }
};

module.exports = {
  searchAndDownloadImages
};
