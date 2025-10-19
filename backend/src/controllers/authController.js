const bcrypt = require('bcrypt');
const { body } = require('express-validator');
const { generateToken } = require('../utils/jwt');
const { verifyKenniIdToken, deriveDobFromKennitala } = require('../utils/kenni');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { username, password, fullName, phone, age } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return errorResponse(res, 'Username already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        phone,
        age,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        phone: true,
      },
    });

    // Generate token
    const token = generateToken({ userId: user.id });

    return successResponse(res, { user, token }, 'User registered successfully');
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 'Registration failed', 500);
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken({ userId: user.id });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(res, { user: userWithoutPassword, token }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        phone: true,
        age: true,
        kennitala: true,
        dob: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Failed to retrieve profile', 500);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, age } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        phone,
        age,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        phone: true,
        age: true,
        kennitala: true,
        dob: true,
      },
    });

    return successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

// Validation rules
const registerValidation = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').optional().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('age').optional().isInt({ min: 13 }).withMessage('Age must be at least 13'),
];

const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
  body('fullName').optional().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('age').optional().isInt({ min: 13 }).withMessage('Age must be at least 13'),
];

/**
 * Kenni IDP login - exchange ID token for local session JWT
 */
const kenniLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return errorResponse(res, 'idToken is required', 400);
    }

    const claims = await verifyKenniIdToken(idToken);

    // Common OIDC fields
    const subject = claims.sub;
    const fullName = claims.name || [claims.given_name, claims.family_name].filter(Boolean).join(' ') || null;
    const phone = claims.phone_number || claims.phone || null;
    const kennitala = claims.kennitala || claims.national_id || null;

    // Derive DOB if available or from kennitala
    let dob = null;
    if (claims.birthdate) {
      const d = new Date(claims.birthdate + 'T00:00:00Z');
      dob = isNaN(d.getTime()) ? null : d;
    }
    if (!dob && kennitala) {
      dob = deriveDobFromKennitala(kennitala);
    }

    // Upsert user by idpSubject, fallback to kennitala, fallback to phone
    // Also keep admin/delivery users by username/password untouched
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { idpSubject: subject },
          kennitala ? { kennitala } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean),
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          idpProvider: 'kenni',
          idpSubject: subject,
          fullName: fullName || user.fullName,
          phone: phone || user.phone,
          kennitala: kennitala || user.kennitala,
          dob: dob || user.dob,
          idpRaw: JSON.stringify(claims),
        },
      });
    } else {
      // Create username from subject if needed
      const username = `kenni_${subject}`;
      user = await prisma.user.create({
        data: {
          username,
          password: null,
          role: 'CUSTOMER',
          fullName,
          phone,
          kennitala,
          dob,
          idpProvider: 'kenni',
          idpSubject: subject,
          idpRaw: JSON.stringify(claims),
        },
      });
    }

    const token = generateToken({ userId: user.id });

    const { password, ...safeUser } = user;
    return successResponse(res, { user: safeUser, token }, 'Login successful');
  } catch (err) {
    console.error('Kenni login error:', err);
    return errorResponse(res, 'Kenni login failed', 401);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  kenniLogin,
  registerValidation,
  loginValidation,
  updateProfileValidation,
};