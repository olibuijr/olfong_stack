const express = require('express');
const router = express.Router();
const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all staff (Admin only)
router.get('/', authenticate, authorize('ADMIN'), getAllStaff);

// Get staff by ID (Admin only)
router.get('/:id', authenticate, authorize('ADMIN'), getStaffById);

// Create staff (Admin only)
router.post('/', authenticate, authorize('ADMIN'), createStaff);

// Update staff (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), updateStaff);

// Delete staff (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteStaff);

module.exports = router;
