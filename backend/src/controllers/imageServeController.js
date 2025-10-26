const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { successResponse, errorResponse } = require('../utils/response');
const { getResponsiveImageData } = require('../services/responsiveImageService');

const prisma = new PrismaClient();

// CDN/Media base URL configuration
const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || process.env.BASE_URL || 'http://localhost:5000';

/**
 * Stream an image file with proper caching headers
 */
const streamImage = async (req, res) => {
  try {
    const { id, variant } = req.params;
    const format = req.query.format || 'webp'; // webp or jpeg

    // Get media record
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        mediaFormats: true,
        mediaSizes: true
      }
    });

    if (!media) {
      return errorResponse(res, 'Image not found', 404);
    }

    // Determine file path based on variant and format
    let filePath;

    if (!variant || variant === 'original') {
      // Serve original file
      filePath = media.path;
    } else {
      // Serve variant - check mediaFormats and mediaSizes
      const mediaFormat = media.mediaFormats?.find(
        mf => mf.format === format && mf.size === variant
      );

      if (mediaFormat && mediaFormat.path) {
        filePath = mediaFormat.path;
      } else {
        // Fallback to original if variant doesn't exist
        filePath = media.path;
      }
    }

    // Ensure file exists
    if (!filePath || !fs.existsSync(filePath)) {
      return errorResponse(res, 'Image file not found', 404);
    }

    // Set caching headers
    const maxAge = 1 * 365 * 24 * 60 * 60 * 1000; // 1 year
    res.set({
      'Cache-Control': `public, max-age=${maxAge}`,
      'Content-Type': getMimeType(format),
      'ETag': media.hash || generateETag(filePath)
    });

    // Handle If-None-Match for conditional requests
    if (req.headers['if-none-match'] === media.hash) {
      return res.status(304).end();
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      if (!res.headersSent) {
        errorResponse(res, 'Error serving image', 500);
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error('Error in streamImage:', error);
    errorResponse(res, 'Error serving image', 500);
  }
};

/**
 * Get responsive image metadata with srcset and sizes
 */
const getResponsiveImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Get media record
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        mediaFormats: true,
        mediaSizes: true
      }
    });

    if (!media) {
      return errorResponse(res, 'Image not found', 404);
    }

    // Generate responsive image data
    const responsiveData = getResponsiveImageData(media, MEDIA_BASE_URL);

    return successResponse(res, responsiveData, 200);
  } catch (error) {
    console.error('Error in getResponsiveImage:', error);
    errorResponse(res, 'Error fetching image metadata', 500);
  }
};

/**
 * Get all image variants for a media item
 */
const getImageVariants = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        mediaFormats: true,
        mediaSizes: true
      }
    });

    if (!media) {
      return errorResponse(res, 'Image not found', 404);
    }

    // Build variant URLs
    const variants = {
      original: {
        url: `${MEDIA_BASE_URL}/api/images/${id}?format=webp`,
        width: media.width,
        height: media.height,
        size: media.size,
        mimeType: media.mimeType
      }
    };

    // Add format variants
    if (media.mediaFormats && media.mediaFormats.length > 0) {
      media.mediaFormats.forEach(format => {
        const key = `${format.size}_${format.format}`;
        variants[key] = {
          url: `${MEDIA_BASE_URL}/api/images/${id}/${format.size}?format=${format.format}`,
          size: format.size,
          format: format.format,
          width: format.width,
          height: format.height,
          fileSize: format.fileSize
        };
      });
    }

    return successResponse(res, variants, 200);
  } catch (error) {
    console.error('Error in getImageVariants:', error);
    errorResponse(res, 'Error fetching variants', 500);
  }
};

/**
 * Helper function to get MIME type from format
 */
const getMimeType = (format) => {
  const mimeTypes = {
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    pdf: 'application/pdf',
    mp4: 'video/mp4',
    webm: 'video/webm'
  };
  return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
};

/**
 * Helper function to generate ETag
 */
const generateETag = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return `"${stats.ino}-${stats.size}-${stats.mtime.getTime()}"`;
  } catch {
    return `"${Date.now()}"`;
  }
};

module.exports = {
  streamImage,
  getResponsiveImage,
  getImageVariants
};
