const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/response');
const { generateMediaVariants } = require('../services/mediaService');
const sharp = require('sharp');

// CDN/Media base URL configuration
const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || process.env.BASE_URL || 'http://localhost:5000';

const prisma = new PrismaClient();

// Media collection configurations
const COLLECTION_CONFIGS = {
  PRODUCTS: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    sizes: ['thumbnail', 'medium', 'large', 'full'],
    formats: ['webp', 'jpeg']
  },
  CATEGORIES: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    sizes: ['thumbnail', 'medium', 'full'],
    formats: ['webp', 'jpeg']
  },
  BANNERS: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    sizes: ['mobile', 'tablet', 'desktop'],
    formats: ['webp', 'jpeg']
  },
  PROFILE: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    sizes: ['thumbnail', 'medium'],
    formats: ['webp', 'jpeg']
  },
  DOCUMENTS: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    sizes: ['full'],
    formats: []
  },
  VIDEOS: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/avi'],
    sizes: ['full'],
    formats: ['webm']
  },
  TEMP: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'],
    sizes: ['thumbnail', 'full'],
    formats: ['webp', 'jpeg']
  }
};

// Ensure upload directories exist
const ensureDirectories = () => {
  const baseDir = path.join(__dirname, '../../uploads');
  const collections = Object.keys(COLLECTION_CONFIGS);

  collections.forEach(collection => {
    const collectionDir = path.join(baseDir, collection.toLowerCase());
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



// Upload media file
const uploadMedia = async (req, res) => {
  try {
    const { collection, alt, caption, description } = req.body;
    const file = req.file;

    if (!file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    if (!collection || !COLLECTION_CONFIGS[collection]) {
      return errorResponse(res, 'Invalid collection type', 400);
    }

    const config = COLLECTION_CONFIGS[collection];

    // Validate file type
    if (!config.allowedTypes.includes(file.mimetype)) {
      return errorResponse(res, `File type not allowed for ${collection}`, 400);
    }

    // Validate file size
    if (file.size > config.maxSize) {
      return errorResponse(res, `File too large. Max size: ${config.maxSize / 1024 / 1024}MB`, 400);
    }

    // Generate file hash for deduplication
    const fileHash = generateFileHash(fs.readFileSync(file.path));

    // Check for existing file with same hash
    const existingMedia = await prisma.media.findFirst({
      where: { hash: fileHash, collection: collection }
    });

    if (existingMedia) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      return successResponse(res, {
        media: existingMedia,
        message: 'File already exists, using existing media'
      });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    const collectionDir = collection.toLowerCase();

    // Create directory structure
    ensureDirectories();

    // Move file to collection directory
    const originalPath = path.join(__dirname, '../../uploads', collectionDir, 'originals', filename);
    fs.renameSync(file.path, originalPath);

    // Get image dimensions if it's an image
    let width = null;
    let height = null;
    if (file.mimetype.startsWith('image/')) {
      try {
        const metadata = await sharp(originalPath).metadata();
        width = metadata.width;
        height = metadata.height;
      } catch (error) {
        console.error('Error processing image metadata:', error);
        // Clean up the file if metadata extraction fails
        if (fs.existsSync(originalPath)) {
          fs.unlinkSync(originalPath);
        }
        return errorResponse(res, 'Invalid image file or unsupported format', 400);
      }
    }

    // Create media record
    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        width,
        height,
        alt: alt || null,
        caption: caption || null,
        description: description || null,
        collection: collection,
        hash: fileHash,
        url: `${MEDIA_BASE_URL}/uploads/${collectionDir}/originals/${filename}`,
        path: `${collectionDir}/originals/${filename}`,
        uploadedBy: req.user.id
      }
    });

    // Process different formats and sizes asynchronously
    generateMediaVariants(media, originalPath, collection)
      .then(async (results) => {
        // Save processing results to database
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

        // Save formats and sizes
        if (formats.length > 0) {
          await prisma.mediaFormat.createMany({ data: formats });
        }
        if (sizes.length > 0) {
          await prisma.mediaSize.createMany({ data: sizes });
        }
      })
      .catch(error => {
        console.error('Media processing error:', error);
      });

    return successResponse(res, { media }, 'Media uploaded successfully');

  } catch (error) {
    console.error('Upload media error:', error);
    return errorResponse(res, `Failed to upload media: ${error.message}`, 500);
  }
};



// Get media list with pagination and filtering
const getMedia = async (req, res) => {
  try {
    const {
      collection,
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};
    if (collection) {
      where.collection = collection;
    }
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.media.count({ where });

    // Get media with relations
    const media = await prisma.media.findMany({
      where,
      include: {
        formats: true,
        sizes: true,
        uploadedByUser: {
          select: { id: true, username: true, fullName: true }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limitNum
    });

    return successResponse(res, {
      media,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get media error:', error);
    return errorResponse(res, 'Failed to retrieve media', 500);
  }
};

// Get single media item
const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        formats: true,
        sizes: true,
        uploadedByUser: {
          select: { id: true, username: true, fullName: true }
        }
      }
    });

    if (!media) {
      return errorResponse(res, 'Media not found', 404);
    }

    return successResponse(res, { media });

  } catch (error) {
    console.error('Get media by ID error:', error);
    return errorResponse(res, 'Failed to retrieve media', 500);
  }
};

// Update media metadata
const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { alt, caption, description } = req.body;

    const media = await prisma.media.update({
      where: { id },
      data: {
        alt: alt !== undefined ? alt : undefined,
        caption: caption !== undefined ? caption : undefined,
        description: description !== undefined ? description : undefined
      },
      include: {
        formats: true,
        sizes: true
      }
    });

    return successResponse(res, { media }, 'Media updated successfully');

  } catch (error) {
    console.error('Update media error:', error);
    return errorResponse(res, 'Failed to update media', 500);
  }
};

// Delete media
const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    // Get media record
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        formats: true,
        sizes: true
      }
    });

    if (!media) {
      return errorResponse(res, 'Media not found', 404);
    }

    // Check if media is in use
    const usageCount = await checkMediaUsage(media);
    if (usageCount > 0) {
      return errorResponse(res, 'Cannot delete media that is currently in use', 400);
    }

    // Delete files from filesystem
    const collectionDir = media.collection.toLowerCase();

    // Delete original file
    const originalPath = path.join(__dirname, '../../uploads', media.path);
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }

    // Delete processed files
    media.formats.forEach(format => {
      const formatPath = path.join(__dirname, '../../uploads', collectionDir, format.format.toLowerCase(), `${media.id}.${format.format}`);
      if (fs.existsSync(formatPath)) {
        fs.unlinkSync(formatPath);
      }
    });

    media.sizes.forEach(size => {
      const sizePath = path.join(__dirname, '../../uploads', collectionDir, 'thumbnails', `${media.id}_${size.size}.webp`);
      if (fs.existsSync(sizePath)) {
        fs.unlinkSync(sizePath);
      }
    });

    // Delete from database
    await prisma.media.delete({ where: { id } });

    return successResponse(res, null, 'Media deleted successfully');

  } catch (error) {
    console.error('Delete media error:', error);
    return errorResponse(res, 'Failed to delete media', 500);
  }
};

// Check if media is being used
const checkMediaUsage = async (media) => {
  try {
    let usageCount = 0;

    // Check products
    if (media.collection === 'PRODUCTS') {
      usageCount += await prisma.product.count({
        where: { mediaId: media.id }
      });
    }

    // Check categories
    if (media.collection === 'CATEGORIES') {
      usageCount += await prisma.category.count({
        where: { mediaId: media.id }
      });
    }

    // Check banners
    if (media.collection === 'BANNERS') {
      usageCount += await prisma.banner.count({
        where: { mediaId: media.id }
      });
    }

    return usageCount;
  } catch (error) {
    console.error('Check media usage error:', error);
    return 0;
  }
};

// Bulk delete media
const bulkDeleteMedia = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Media IDs array is required', 400);
    }

    const results = [];
    let deletedCount = 0;

    for (const id of ids) {
      try {
        // Get media record
        const media = await prisma.media.findUnique({
          where: { id },
          include: { formats: true, sizes: true }
        });

        if (!media) {
          results.push({ id, success: false, error: 'Media not found' });
          continue;
        }

        // Check usage
        const usageCount = await checkMediaUsage(media);
        if (usageCount > 0) {
          results.push({ id, success: false, error: 'Media is in use' });
          continue;
        }

        // Delete files and database record
        await deleteMediaFiles(media);
        await prisma.media.delete({ where: { id } });

        results.push({ id, success: true });
        deletedCount++;
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    return successResponse(res, {
      results,
      deletedCount,
      totalRequested: ids.length
    }, `Successfully deleted ${deletedCount} of ${ids.length} media items`);

  } catch (error) {
    console.error('Bulk delete media error:', error);
    return errorResponse(res, 'Failed to bulk delete media', 500);
  }
};

// Helper function to delete media files
const deleteMediaFiles = async (media) => {
  const collectionDir = media.collection.toLowerCase();

  // Delete original file
  const originalPath = path.join(__dirname, '../../uploads', media.path);
  if (fs.existsSync(originalPath)) {
    fs.unlinkSync(originalPath);
  }

  // Delete processed files
  media.formats.forEach(format => {
    const formatPath = path.join(__dirname, '../../uploads', collectionDir, format.format.toLowerCase(), `${media.id}.${format.format}`);
    if (fs.existsSync(formatPath)) {
      fs.unlinkSync(formatPath);
    }
  });

  media.sizes.forEach(size => {
    const sizePath = path.join(__dirname, '../../uploads', collectionDir, 'thumbnails', `${media.id}_${size.size}.webp`);
    if (fs.existsSync(sizePath)) {
      fs.unlinkSync(sizePath);
    }
  });
};

module.exports = {
  uploadMedia,
  getMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  bulkDeleteMedia
};