const { body } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get user's addresses
 */
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return successResponse(res, addresses, 'Addresses retrieved successfully');
  } catch (error) {
    console.error('Get user addresses error:', error);
    return errorResponse(res, 'Failed to retrieve addresses', 500);
  }
};

/**
 * Create new address
 */
const createAddress = async (req, res) => {
  try {
    const {
      label,
      street,
      city,
      postalCode,
      country = 'Iceland',
      latitude,
      longitude,
      isDefault = false,
    } = req.body;
    const userId = req.user.id;

    // If setting as default, unset other default addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label,
        street,
        city,
        postalCode,
        country,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isDefault,
      },
    });

    return successResponse(res, address, 'Address created successfully', 201);
  } catch (error) {
    console.error('Create address error:', error);
    return errorResponse(res, 'Failed to create address', 500);
  }
};

/**
 * Update address
 */
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      label,
      street,
      city,
      postalCode,
      country,
      latitude,
      longitude,
      isDefault,
    } = req.body;
    const userId = req.user.id;

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: parseInt(id), userId },
    });

    if (!existingAddress) {
      return errorResponse(res, 'Address not found', 404);
    }

    // If setting as default, unset other default addresses
    if (isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: parseInt(id) },
      data: {
        label,
        street,
        city,
        postalCode,
        country,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isDefault,
      },
    });

    return successResponse(res, address, 'Address updated successfully');
  } catch (error) {
    console.error('Update address error:', error);
    return errorResponse(res, 'Failed to update address', 500);
  }
};

/**
 * Delete address
 */
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: parseInt(id), userId },
    });

    if (!address) {
      return errorResponse(res, 'Address not found', 404);
    }

    await prisma.address.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(res, null, 'Address deleted successfully');
  } catch (error) {
    console.error('Delete address error:', error);
    return errorResponse(res, 'Failed to delete address', 500);
  }
};

// Validation rules
const addressValidation = [
  body('label').notEmpty().withMessage('Address label is required'),
  body('street').notEmpty().withMessage('Street address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('postalCode').notEmpty().withMessage('Postal code is required'),
  body('country').optional().isLength({ min: 2, max: 50 }).withMessage('Country must be 2-50 characters'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
];

module.exports = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  addressValidation,
};

