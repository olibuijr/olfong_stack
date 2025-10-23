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
  getFeaturedBanners,
  getHeroBanner,
  setFeaturedBanner,
  removeFeaturedBanner,
  createBannerValidation,
  updateBannerValidation
} = require('../controllers/bannerController');
const { validate } = require('../middleware/validator');

// Public routes
router.get('/', getBanners);
router.get('/featured', getFeaturedBanners);
router.get('/hero/active', getHeroBanner);
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

router.patch('/:id/featured',
  authenticate,
  authorize('ADMIN'),
  setFeaturedBanner
);

router.delete('/:id/featured',
  authenticate,
  authorize('ADMIN'),
  removeFeaturedBanner
);

module.exports = router;
