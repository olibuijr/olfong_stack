const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');

const {
  streamImage,
  getResponsiveImage,
  getImageVariants
} = require('../controllers/imageServeController');

const {
  searchAndDownloadImages
} = require('../controllers/imageSearchController');

// Stream image by ID with caching
// GET /api/images/:id?format=webp
// GET /api/images/:id/medium?format=webp
router.get('/:id/:variant?', streamImage);

// Get responsive image metadata (srcset, sizes)
// GET /api/images/responsive/:id
router.get('/responsive/:id', getResponsiveImage);

// Get all variants for an image
// GET /api/images/variants/:id
router.get('/variants/:id', getImageVariants);

// Search and download images (requires auth)
// POST /api/images/search
router.post('/search', authenticate, searchAndDownloadImages);

// Legacy: Serve static images from public directory
router.get('/public/:filename', (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(__dirname, '../../../web/public', filename);

  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ message: 'Image not found' });
  }

  // Set appropriate headers
  res.setHeader('Content-Type', 'image/webp');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

  // Send file
  res.sendFile(imagePath);
});

module.exports = router;