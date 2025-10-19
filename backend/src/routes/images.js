const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Serve static images from public directory
router.get('/:filename', (req, res) => {
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