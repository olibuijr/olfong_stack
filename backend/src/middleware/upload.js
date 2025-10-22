const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Collection-specific validation rules
const collectionRules = {
  PRODUCTS: {
    allowedTypes: /jpeg|jpg|png|gif|webp|avif/,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
  },
  CATEGORIES: {
    allowedTypes: /jpeg|jpg|png|gif|webp|avif/,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
  },
  BANNERS: {
    allowedTypes: /jpeg|jpg|png|gif|webp|avif/,
    maxSize: 15 * 1024 * 1024, // 15MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
  },
  PROFILE: {
    allowedTypes: /jpeg|jpg|png|gif|webp|avif/,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
  },
  DOCUMENTS: {
    allowedTypes: /pdf|doc|docx|txt|rtf|xls|xlsx|ppt|pptx|csv/,
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/csv'
    ]
  },
  VIDEOS: {
    allowedTypes: /mp4|avi|mov|wmv|flv|webm|mkv/,
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: [
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/webm',
      'video/x-matroska'
    ]
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Dynamic file filter based on collection
const createFileFilter = (collection) => {
  return (req, file, cb) => {
    const rules = collectionRules[collection] || collectionRules.PRODUCTS;

    // Check file extension
    const extname = rules.allowedTypes.test(path.extname(file.originalname).toLowerCase());

    // Check MIME type
    const mimetype = rules.allowedMimeTypes.includes(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      const allowedExtensions = rules.allowedTypes.toString().replace(/[/^$]/g, '').split('|').join(', ');
      cb(new Error(`Invalid file type for ${collection} collection. Allowed types: ${allowedExtensions}`));
    }
  };
};

// Create collection-specific upload middleware
const createUploadMiddleware = (collection = 'PRODUCTS') => {
  const rules = collectionRules[collection] || collectionRules.PRODUCTS;

  return multer({
    storage,
    limits: {
      fileSize: rules.maxSize,
    },
    fileFilter: createFileFilter(collection),
  });
};

// Default upload middleware (for backward compatibility)
const upload = createUploadMiddleware();

// Export both the factory function and default middleware
module.exports = upload;
module.exports.createUploadMiddleware = createUploadMiddleware;
module.exports.collectionRules = collectionRules;



