const { body } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Update user's location (for delivery personnel)
 */
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy, heading, speed } = req.body;
    const userId = req.user.id;

    // Verify user is delivery personnel
    if (req.user.role !== 'DELIVERY') {
      return errorResponse(res, 'Only delivery personnel can update location', 403);
    }

    // Update or create location record
    const location = await prisma.location.upsert({
      where: { userId },
      update: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        heading: heading ? parseFloat(heading) : null,
        speed: speed ? parseFloat(speed) : null,
      },
      create: {
        userId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        heading: heading ? parseFloat(heading) : null,
        speed: speed ? parseFloat(speed) : null,
      },
    });

    return successResponse(res, location, 'Location updated successfully');
  } catch (error) {
    console.error('Update location error:', error);
    return errorResponse(res, 'Failed to update location', 500);
  }
};

/**
 * Get delivery person's current location
 */
const getDeliveryLocation = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;

    // Verify delivery person exists
    const deliveryPerson = await prisma.user.findUnique({
      where: { id: parseInt(deliveryPersonId) },
      select: { id: true, role: true },
    });

    if (!deliveryPerson || deliveryPerson.role !== 'DELIVERY') {
      return errorResponse(res, 'Delivery person not found', 404);
    }

    const location = await prisma.location.findUnique({
      where: { userId: parseInt(deliveryPersonId) },
    });

    if (!location) {
      return errorResponse(res, 'Location not available', 404);
    }

    return successResponse(res, location, 'Location retrieved successfully');
  } catch (error) {
    console.error('Get delivery location error:', error);
    return errorResponse(res, 'Failed to retrieve location', 500);
  }
};

/**
 * Get all active delivery personnel locations (Admin only)
 */
const getAllDeliveryLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            phone: true,
            role: true,
          },
        },
      },
      where: {
        user: {
          role: 'DELIVERY',
        },
      },
    });

    return successResponse(res, locations, 'Delivery locations retrieved successfully');
  } catch (error) {
    console.error('Get all delivery locations error:', error);
    return errorResponse(res, 'Failed to retrieve delivery locations', 500);
  }
};

// Validation rules
const locationValidation = [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('accuracy').optional().isFloat({ min: 0 }).withMessage('Accuracy must be a positive number'),
  body('heading').optional().isFloat({ min: 0, max: 360 }).withMessage('Heading must be between 0 and 360'),
  body('speed').optional().isFloat({ min: 0 }).withMessage('Speed must be a positive number'),
];

module.exports = {
  updateLocation,
  getDeliveryLocation,
  getAllDeliveryLocations,
  locationValidation,
};

