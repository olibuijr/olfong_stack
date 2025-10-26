/**
 * Responsive Image Service
 * Generates srcset, sizes, and picture element data for responsive images
 */

const COLLECTION_SIZES = {
  PRODUCTS: {
    sizes: ['thumbnail', 'medium', 'large', 'full'],
    dimensions: {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 400, height: 400 },
      large: { width: 800, height: 800 },
      full: { width: null, height: null }
    },
    sizes_attr: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  },
  CATEGORIES: {
    sizes: ['thumbnail', 'medium', 'full'],
    dimensions: {
      thumbnail: { width: 200, height: 200 },
      medium: { width: 400, height: 400 },
      full: { width: null, height: null }
    },
    sizes_attr: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  },
  BANNERS: {
    sizes: ['mobile', 'tablet', 'desktop'],
    dimensions: {
      mobile: { width: 640, height: 320 },
      tablet: { width: 1024, height: 512 },
      desktop: { width: 1920, height: 960 }
    },
    sizes_attr: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw'
  },
  PROFILE: {
    sizes: ['thumbnail', 'medium'],
    dimensions: {
      thumbnail: { width: 100, height: 100 },
      medium: { width: 300, height: 300 }
    },
    sizes_attr: '100px'
  },
  TEMP: {
    sizes: ['thumbnail', 'full'],
    dimensions: {
      thumbnail: { width: 150, height: 150 },
      full: { width: null, height: null }
    },
    sizes_attr: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  }
};

/**
 * Generate responsive image data (srcset, sizes) for a media item
 * @param {Object} media - Media record with formats and sizes
 * @param {string} baseUrl - Base URL for image serving
 * @returns {Object} Responsive image data
 */
const getResponsiveImageData = (media, baseUrl) => {
  const collection = media.collection || 'PRODUCTS';
  const config = COLLECTION_SIZES[collection] || COLLECTION_SIZES.PRODUCTS;

  // Generate srcset for WebP and JPEG
  const srcsetWebP = generateSrcset(media, baseUrl, 'webp', config.sizes);
  const srcsetJpeg = generateSrcset(media, baseUrl, 'jpeg', config.sizes);

  // Get dimensions
  const width = media.width;
  const height = media.height;
  const aspectRatio = width && height ? (width / height).toFixed(3) : null;

  return {
    id: media.id,
    collection: collection,
    originalUrl: `${baseUrl}/api/images/${media.id}?format=webp`,

    // Primary image (WebP)
    src: `${baseUrl}/api/images/${media.id}?format=webp`,
    srcset: srcsetWebP,

    // Picture element data for fallback
    picture: {
      webp: {
        srcset: srcsetWebP,
        type: 'image/webp'
      },
      jpeg: {
        srcset: srcsetJpeg,
        type: 'image/jpeg'
      },
      img: {
        src: `${baseUrl}/api/images/${media.id}/medium?format=jpeg`,
        alt: media.alt || media.originalName,
        title: media.caption || media.originalName
      }
    },

    // Responsive image attributes
    sizes: config.sizes_attr,
    width: width,
    height: height,
    aspectRatio: aspectRatio,

    // Metadata
    alt: media.alt || media.originalName,
    caption: media.caption || null,
    description: media.description || null,
    mimeType: media.mimeType,
    originalName: media.originalName,
    fileSize: media.size
  };
};

/**
 * Generate srcset string with multiple sizes and formats
 * @param {Object} media - Media record
 * @param {string} baseUrl - Base URL
 * @param {string} format - Image format (webp, jpeg)
 * @param {Array} sizes - Available sizes
 * @returns {string} srcset string
 */
const generateSrcset = (media, baseUrl, format, sizes) => {
  const srcsetParts = [];

  // Original file
  srcsetParts.push(`${baseUrl}/api/images/${media.id}?format=${format} ${media.width}w`);

  // Process variants
  if (media.mediaFormats && media.mediaFormats.length > 0) {
    media.mediaFormats
      .filter(mf => mf.format === format)
      .sort((a, b) => (a.width || 0) - (b.width || 0))
      .forEach(variant => {
        const width = variant.width || media.width;
        srcsetParts.push(`${baseUrl}/api/images/${media.id}/${variant.size}?format=${format} ${width}w`);
      });
  }

  return srcsetParts.join(', ');
};

/**
 * Generate picture element HTML
 * @param {Object} media - Media record
 * @param {string} baseUrl - Base URL
 * @returns {Object} Picture element data
 */
const generatePictureData = (media, baseUrl) => {
  const responsiveData = getResponsiveImageData(media, baseUrl);

  return {
    sources: [
      {
        srcset: responsiveData.picture.webp.srcset,
        type: responsiveData.picture.webp.type,
        sizes: responsiveData.sizes
      },
      {
        srcset: responsiveData.picture.jpeg.srcset,
        type: responsiveData.picture.jpeg.type,
        sizes: responsiveData.sizes
      }
    ],
    img: {
      ...responsiveData.picture.img,
      srcset: responsiveData.picture.jpeg.srcset,
      sizes: responsiveData.sizes,
      width: responsiveData.width,
      height: responsiveData.height
    }
  };
};

/**
 * Get image variants for a specific collection
 * @param {string} collection - Collection type
 * @returns {Array} Available sizes for collection
 */
const getCollectionSizes = (collection) => {
  const config = COLLECTION_SIZES[collection];
  return config ? config.sizes : COLLECTION_SIZES.PRODUCTS.sizes;
};

/**
 * Get responsive image data for list of media items
 * @param {Array} mediaList - Array of media records
 * @param {string} baseUrl - Base URL
 * @returns {Array} Array of responsive image data
 */
const getResponsiveImagesList = (mediaList, baseUrl) => {
  return mediaList.map(media => getResponsiveImageData(media, baseUrl));
};

module.exports = {
  getResponsiveImageData,
  generateSrcset,
  generatePictureData,
  getCollectionSizes,
  getResponsiveImagesList
};
