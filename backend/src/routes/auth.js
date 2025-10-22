const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  register,
  login,
  getProfile,
  updateProfile,
  kenniLogin,
  dummyLogin,
  registerValidation,
  loginValidation,
  updateProfileValidation,
} = require('../controllers/authController');

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/kenni/login', kenniLogin);
router.post('/dummy/login', dummyLogin);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, validate, updateProfile);

module.exports = router;

