const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth');

const {
  uploadMedia,
  getMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  bulkDeleteMedia
} = require('../controllers/mediaController');

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer for file uploads with enhanced validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Use basic upload middleware - validation handled in controller
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
}).single('file');

// All media routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Upload media
router.post('/upload', upload, uploadMedia);

// Get media list with pagination and filtering
router.get('/', getMedia);

// Get single media item
router.get('/:id', getMediaById);

// Update media metadata
router.put('/:id', updateMedia);

// Delete media
router.delete('/:id', deleteMedia);

// Bulk delete media
router.post('/bulk-delete', bulkDeleteMedia);

module.exports = router;