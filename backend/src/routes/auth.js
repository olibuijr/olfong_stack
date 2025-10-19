const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  register,
  login,
  getProfile,
  updateProfile,
  kenniLogin,
  registerValidation,
  loginValidation,
  updateProfileValidation,
} = require('../controllers/authController');

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/kenni/login', kenniLogin);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, validate, updateProfile);

module.exports = router;

