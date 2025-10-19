const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get all shipping options
 */
const getShippingOptions = async (req, res) => {
  try {
    const shippingOptions = await prisma.shippingOption.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    // Map isActive to isEnabled for frontend compatibility
    const formattedOptions = shippingOptions.map(option => ({
      ...option,
      isEnabled: option.isActive,
    }));

    return successResponse(res, formattedOptions, 'Shipping options retrieved successfully');
  } catch (error) {
    console.error('Get shipping options error:', error);
    return errorResponse(res, 'Failed to retrieve shipping options', 500);
  }
};

/**
 * Get shipping option by ID
 */
const getShippingOption = async (req, res) => {
  try {
    const { id } = req.params;
    const shippingOption = await prisma.shippingOption.findUnique({
      where: { id: parseInt(id) },
    });

    if (!shippingOption) {
      return errorResponse(res, 'Shipping option not found', 404);
    }

    return successResponse(res, shippingOption, 'Shipping option retrieved successfully');
  } catch (error) {
    console.error('Get shipping option error:', error);
    return errorResponse(res, 'Failed to retrieve shipping option', 500);
  }
};

/**
 * Create shipping option
 */
const createShippingOption = async (req, res) => {
  try {
    const { name, nameIs, description, descriptionIs, type, fee, estimatedDays, cutoffTime, sortOrder } = req.body;

    const shippingOption = await prisma.shippingOption.create({
      data: {
        name,
        nameIs,
        description,
        descriptionIs,
        type: type || 'DELIVERY',
        fee: fee || 0,
        estimatedDays,
        cutoffTime,
        sortOrder: sortOrder || 0,
      },
    });

    return successResponse(res, shippingOption, 'Shipping option created successfully', 201);
  } catch (error) {
    console.error('Create shipping option error:', error);
    return errorResponse(res, 'Failed to create shipping option', 500);
  }
};

/**
 * Update shipping option
 */
const updateShippingOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nameIs, description, descriptionIs, type, fee, isActive, isEnabled, estimatedDays, cutoffTime, sortOrder } = req.body;

    // Handle both isActive and isEnabled for compatibility
    const activeStatus = isActive !== undefined ? isActive : isEnabled;

    const shippingOption = await prisma.shippingOption.update({
      where: { id: parseInt(id) },
      data: {
        name,
        nameIs,
        description,
        descriptionIs,
        type,
        fee,
        isActive: activeStatus,
        estimatedDays,
        cutoffTime,
        sortOrder,
      },
    });

    return successResponse(res, shippingOption, 'Shipping option updated successfully');
  } catch (error) {
    console.error('Update shipping option error:', error);
    if (error.code === 'P2025') {
      return errorResponse(res, 'Shipping option not found', 404);
    }
    return errorResponse(res, 'Failed to update shipping option', 500);
  }
};

/**
 * Delete shipping option
 */
const deleteShippingOption = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.shippingOption.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(res, null, 'Shipping option deleted successfully');
  } catch (error) {
    console.error('Delete shipping option error:', error);
    if (error.code === 'P2025') {
      return errorResponse(res, 'Shipping option not found', 404);
    }
    return errorResponse(res, 'Failed to delete shipping option', 500);
  }
};

/**
 * Toggle shipping option enabled status
 */
const toggleShippingOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { isEnabled } = req.body;

    const shippingOption = await prisma.shippingOption.update({
      where: { id: parseInt(id) },
      data: { isActive: isEnabled },
    });

    return successResponse(res, shippingOption, `Shipping option ${isEnabled ? 'enabled' : 'disabled'} successfully`);
  } catch (error) {
    console.error('Toggle shipping option error:', error);
    if (error.code === 'P2025') {
      return errorResponse(res, 'Shipping option not found', 404);
    }
    return errorResponse(res, 'Failed to toggle shipping option', 500);
  }
};

/**
 * Get active shipping options for frontend
 */
const getActiveShippingOptions = async (req, res) => {
  try {
    const shippingOptions = await prisma.shippingOption.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        nameIs: true,
        description: true,
        descriptionIs: true,
        type: true,
        fee: true,
        isActive: true,
        estimatedDays: true,
        cutoffTime: true,
      },
    });

    // Map isActive to isEnabled for frontend compatibility
    const formattedOptions = shippingOptions.map(option => ({
      ...option,
      isEnabled: option.isActive,
    }));

    return successResponse(res, formattedOptions, 'Active shipping options retrieved successfully');
  } catch (error) {
    console.error('Get active shipping options error:', error);
    return errorResponse(res, 'Failed to retrieve shipping options', 500);
  }
};

module.exports = {
  getShippingOptions,
  getShippingOption,
  createShippingOption,
  updateShippingOption,
  toggleShippingOption,
  deleteShippingOption,
  getActiveShippingOptions,
};