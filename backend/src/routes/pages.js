const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getPages,
  getPublicPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  reorderPages,
  toggleVisibility,
  createPageValidation,
  updatePageValidation
} = require('../controllers/pageController');
const { validate } = require('../middleware/validator');

// Public routes (no auth required)
router.get('/public', getPublicPages);
router.get('/slug/:slug', getPageBySlug);

// Admin routes (require authentication and admin role)
router.get('/',
  authenticate,
  authorize('ADMIN'),
  getPages
);

router.post('/',
  authenticate,
  authorize('ADMIN'),
  createPageValidation,
  validate,
  createPage
);

router.get('/:id',
  authenticate,
  authorize('ADMIN'),
  getPageById
);

router.put('/:id',
  authenticate,
  authorize('ADMIN'),
  updatePageValidation,
  validate,
  updatePage
);

router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  deletePage
);

router.put('/reorder',
  authenticate,
  authorize('ADMIN'),
  reorderPages
);

router.patch('/:id/visibility',
  authenticate,
  authorize('ADMIN'),
  toggleVisibility
);

module.exports = router;
