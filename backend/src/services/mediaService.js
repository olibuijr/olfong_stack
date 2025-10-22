const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// CDN/Media base URL configuration
const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || process.env.BASE_URL || 'http://localhost:5000';

// Image processing configurations
const IMAGE_CONFIGS = {
  // Product images
  PRODUCTS: {
    thumbnail: { width: 150, height: 150, fit: 'cover' },
    medium: { width: 400, height: 400, fit: 'inside' },
    large: { width: 800, height: 800, fit: 'inside' },
    full: { width: null, height: null, fit: 'inside' }
  },

  // Category images
  CATEGORIES: {
    thumbnail: { width: 200, height: 200, fit: 'cover' },
    medium: { width: 400, height: 400, fit: 'inside' },
    full: { width: null, height: null, fit: 'inside' }
  },

  // Banner images
  BANNERS: {
    mobile: { width: 640, height: 320, fit: 'cover' },
    tablet: { width: 1024, height: 512, fit: 'cover' },
    desktop: { width: 1920, height: 960, fit: 'cover' }
  },

  // Profile pictures
  PROFILE: {
    thumbnail: { width: 100, height: 100, fit: 'cover' },
    medium: { width: 300, height: 300, fit: 'inside' }
  },

  // Temp files
  TEMP: {
    thumbnail: { width: 150, height: 150, fit: 'cover' },
    full: { width: null, height: null, fit: 'inside' }
  }
};

// Supported output formats
const SUPPORTED_FORMATS = {
  webp: { quality: 85 },
  jpeg: { quality: 85 },
  avif: { quality: 80 }
};

/**
 * Process an image with Sharp
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to output image
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Processing result
 */
const processImage = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      width,
      height,
      fit = 'inside',
      format = 'webp',
      quality = 85,
      progressive = true
    } = options;

    let sharpInstance = sharp(inputPath);

    // Resize if dimensions specified
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit,
        withoutEnlargement: true,
        position: 'center'
      });
    }

    // Set format and quality
    if (format === 'webp') {
      sharpInstance = sharpInstance.webp({
        quality,
        effort: 6, // Higher effort for better compression
        smartSubsample: true
      });
    } else if (format === 'jpeg') {
      sharpInstance = sharpInstance.jpeg({
        quality,
        progressive,
        mozjpeg: true
      });
    } else if (format === 'avif') {
      sharpInstance = sharpInstance.avif({
        quality,
        effort: 6
      });
    }

    // Process and save
    const info = await sharpInstance.toFile(outputPath);

    return {
      success: true,
      path: outputPath,
      size: info.size,
      width: info.width,
      height: info.height,
      format: info.format
    };

  } catch (error) {
    console.error('Image processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate all required sizes and formats for a media item
 * @param {Object} media - Media database record
 * @param {string} inputPath - Path to original file
 * @param {string} collection - Media collection type
 * @returns {Promise<Array>} - Array of processing results
 */
const generateMediaVariants = async (media, inputPath, collection) => {
  const results = [];
  const config = IMAGE_CONFIGS[collection];

  if (!config) {
    console.warn(`No configuration found for collection: ${collection}`);
    return results;
  }

  const collectionDir = collection.toLowerCase();
  const baseOutputDir = path.join(__dirname, '../../uploads', collectionDir);

  // Ensure output directories exist
  const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  };

  // Generate different sizes
  for (const [sizeName, sizeConfig] of Object.entries(config)) {
    const sizeDir = path.join(baseOutputDir, 'thumbnails');
    ensureDir(sizeDir);

    const outputFilename = `${media.id}_${sizeName}.webp`;
    const outputPath = path.join(sizeDir, outputFilename);

    const result = await processImage(inputPath, outputPath, {
      ...sizeConfig,
      format: 'webp'
    });

    if (result.success) {
      results.push({
        type: 'size',
        name: sizeName,
        ...result,
        url: `${MEDIA_BASE_URL}/uploads/${collectionDir}/thumbnails/${outputFilename}`
      });
    }
  }

  // Generate different formats (keeping original size)
  const formatsDir = path.join(baseOutputDir, 'webp');
  ensureDir(formatsDir);

  for (const format of ['webp', 'jpeg']) {
    if (format === 'webp') continue; // WebP is already generated above

    const outputFilename = `${media.id}.${format}`;
    const outputPath = path.join(formatsDir, outputFilename);

    const result = await processImage(inputPath, outputPath, {
      format,
      quality: SUPPORTED_FORMATS[format].quality
    });

    if (result.success) {
      results.push({
        type: 'format',
        name: format,
        ...result,
        url: `${MEDIA_BASE_URL}/uploads/${collectionDir}/${format}/${outputFilename}`
      });
    }
  }

  return results;
};

/**
 * Get image metadata
 * @param {string} filePath - Path to image file
 * @returns {Promise<Object>} - Image metadata
 */
const getImageMetadata = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: fs.statSync(filePath).size,
      colorspace: metadata.colourspace,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation
    };
  } catch (error) {
    console.error('Failed to get image metadata:', error);
    return null;
  }
};

/**
 * Optimize image for web delivery
 * @param {string} inputPath - Input image path
 * @param {string} outputPath - Output image path
 * @param {Object} options - Optimization options
 * @returns {Promise<Object>} - Optimization result
 */
const optimizeImage = async (inputPath, outputPath, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format = 'webp'
  } = options;

  return processImage(inputPath, outputPath, {
    width: maxWidth,
    height: maxHeight,
    fit: 'inside',
    format,
    quality
  });
};

/**
 * Create a thumbnail from video (placeholder for future video processing)
 * @param {string} videoPath - Path to video file
 * @param {string} thumbnailPath - Path to save thumbnail
 * @returns {Promise<Object>} - Thumbnail creation result
 */
const createVideoThumbnail = async () => {
  // For now, return a placeholder result
  // In a real implementation, you would use ffmpeg or similar
  return {
    success: false,
    error: 'Video thumbnail generation not implemented yet'
  };
};

/**
 * Clean up temporary files
 * @param {string} filePath - Path to file to delete
 */
const cleanupTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Failed to cleanup temp file:', error);
  }
};

/**
 * Get supported collections
 * @returns {Array} - Array of supported collection names
 */
const getSupportedCollections = () => {
  return Object.keys(IMAGE_CONFIGS);
};

/**
 * Validate collection type
 * @param {string} collection - Collection to validate
 * @returns {boolean} - Whether collection is valid
 */
const isValidCollection = (collection) => {
  return getSupportedCollections().includes(collection);
};

module.exports = {
  processImage,
  generateMediaVariants,
  getImageMetadata,
  optimizeImage,
  createVideoThumbnail,
  cleanupTempFile,
  getSupportedCollections,
  isValidCollection,
  IMAGE_CONFIGS,
  SUPPORTED_FORMATS
};