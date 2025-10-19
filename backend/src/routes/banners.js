const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  createBannerValidation,
  updateBannerValidation
} = require('../controllers/bannerController');
const { validate } = require('../middleware/validator');

// Public routes
router.get('/', getBanners);
router.get('/:id', getBanner);

// Admin routes
router.post('/', 
  authenticate, 
  authorize('ADMIN'), 
  createBannerValidation, 
  validate, 
  createBanner
);

router.put('/:id', 
  authenticate, 
  authorize('ADMIN'), 
  updateBannerValidation, 
  validate, 
  updateBanner
);

router.delete('/:id', 
  authenticate, 
  authorize('ADMIN'), 
  deleteBanner
);

router.patch('/:id/toggle', 
  authenticate, 
  authorize('ADMIN'), 
  toggleBannerStatus
);

module.exports = router;
