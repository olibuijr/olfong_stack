const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Download image from URL and save to server
 */
const downloadImage = async (req, res) => {
  try {
    const { imageUrl, source, photographer, photographerUrl } = req.body;

    if (!imageUrl) {
      return errorResponse(res, 'Image URL is required', 400);
    }

    // Validate URL
    try {
      new URL(imageUrl);
    } catch (error) {
      return errorResponse(res, 'Invalid image URL', 400);
    }

    // Generate unique filename
    const fileExtension = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const filename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(__dirname, '../../uploads', filename);

    // Ensure uploads directory exists
    const uploadsDir = path.dirname(filePath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Download image
    await new Promise((resolve, reject) => {
      const protocol = imageUrl.startsWith('https:') ? https : http;
      
      const request = protocol.get(imageUrl, (response) => {
        // Check if response is successful
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        // Check content type
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
          reject(new Error('URL does not point to an image'));
          return;
        }

        // Check file size (limit to 10MB)
        const contentLength = parseInt(response.headers['content-length']);
        if (contentLength && contentLength > 10 * 1024 * 1024) {
          reject(new Error('Image file too large (max 10MB)'));
          return;
        }

        const fileStream = fs.createWriteStream(filePath);
        let downloadedSize = 0;

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          // Check file size during download
          if (downloadedSize > 10 * 1024 * 1024) {
            fileStream.destroy();
            fs.unlinkSync(filePath);
            reject(new Error('Image file too large (max 10MB)'));
            return;
          }
        });

        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });

        fileStream.on('error', (error) => {
          fs.unlinkSync(filePath);
          reject(error);
        });

        response.pipe(fileStream);
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Download timeout'));
      });
    });

    // Verify file was created and is valid
    if (!fs.existsSync(filePath)) {
      return errorResponse(res, 'Failed to save image', 500);
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      fs.unlinkSync(filePath);
      return errorResponse(res, 'Downloaded file is empty', 400);
    }

    // Generate response
    const serverImageUrl = `/uploads/${filename}`;
    
    // Save metadata for attribution
    const metadata = {
      originalUrl: imageUrl,
      source,
      photographer,
      photographerUrl,
      downloadedAt: new Date().toISOString(),
      filename
    };

    const metadataPath = path.join(__dirname, '../../uploads', `${filename}.meta.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return successResponse(res, {
      imageUrl: serverImageUrl,
      filename,
      metadata
    }, 'Image downloaded successfully');

  } catch (error) {
    console.error('Download image error:', error);
    return errorResponse(res, `Failed to download image: ${error.message}`, 500);
  }
};

/**
 * Get image metadata
 */
const getImageMetadata = async (req, res) => {
  try {
    const { filename } = req.params;
    const metadataPath = path.join(__dirname, '../../uploads', `${filename}.meta.json`);

    if (!fs.existsSync(metadataPath)) {
      return errorResponse(res, 'Image metadata not found', 404);
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    return successResponse(res, metadata, 'Image metadata retrieved successfully');

  } catch (error) {
    console.error('Get image metadata error:', error);
    return errorResponse(res, 'Failed to retrieve image metadata', 500);
  }
};

/**
 * Delete image and its metadata
 */
const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);
    const metadataPath = path.join(__dirname, '../../uploads', `${filename}.meta.json`);

    // Delete image file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete metadata file
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }

    return successResponse(res, null, 'Image deleted successfully');

  } catch (error) {
    console.error('Delete image error:', error);
    return errorResponse(res, 'Failed to delete image', 500);
  }
};

/**
 * List all images with metadata
 */
const listImages = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return successResponse(res, { images: [] }, 'No images found');
    }

    const files = fs.readdirSync(uploadsDir);
    const images = [];

    for (const file of files) {
      if (file.endsWith('.meta.json')) {
        const metadataPath = path.join(uploadsDir, file);
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        
        // Check if image file still exists
        const imagePath = path.join(uploadsDir, metadata.filename);
        if (fs.existsSync(imagePath)) {
          const stats = fs.statSync(imagePath);
          images.push({
            ...metadata,
            size: stats.size,
            createdAt: stats.birthtime,
            updatedAt: stats.mtime
          });
        }
      }
    }

    // Sort by creation date (newest first)
    images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return successResponse(res, { images }, 'Images retrieved successfully');

  } catch (error) {
    console.error('List images error:', error);
    return errorResponse(res, 'Failed to retrieve images', 500);
  }
};

module.exports = {
  downloadImage,
  getImageMetadata,
  deleteImage,
  listImages
};
