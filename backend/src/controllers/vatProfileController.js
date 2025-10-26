const { body } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get all VAT profiles
 */
const getVatProfiles = async (req, res) => {
  try {
    const profiles = await prisma.vatProfile.findMany({
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            nameIs: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    return successResponse(res, { profiles }, 'VAT profiles fetched successfully');
  } catch (error) {
    console.error('Error fetching VAT profiles:', error);
    return errorResponse(res, 'Failed to fetch VAT profiles', 500);
  }
};

/**
 * Get single VAT profile by ID
 */
const getVatProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await prisma.vatProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            nameIs: true
          }
        }
      }
    });

    if (!profile) {
      return errorResponse(res, 'VAT profile not found', 404);
    }

    return successResponse(res, { profile }, 'VAT profile fetched successfully');
  } catch (error) {
    console.error('Error fetching VAT profile:', error);
    return errorResponse(res, 'Failed to fetch VAT profile', 500);
  }
};

/**
 * Create new VAT profile
 */
const createVatProfile = async (req, res) => {
  try {
    const { name, nameIs, description, descriptionIs, vatRate, isDefault, categoryIds = [] } = req.body;

    // If this is being set as default, unset other defaults
    if (isDefault) {
      await prisma.vatProfile.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    // Create the profile
    const profile = await prisma.vatProfile.create({
      data: {
        name,
        nameIs,
        description,
        descriptionIs,
        vatRate: parseFloat(vatRate),
        isDefault: isDefault || false,
        categories: categoryIds.length > 0 ? {
          connect: categoryIds.map(id => ({ id: parseInt(id) }))
        } : undefined
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            nameIs: true
          }
        }
      }
    });

    return successResponse(res, { profile }, 'VAT profile created successfully', 201);
  } catch (error) {
    console.error('Error creating VAT profile:', error);
    return errorResponse(res, 'Failed to create VAT profile', 500);
  }
};

/**
 * Update VAT profile
 */
const updateVatProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nameIs, description, descriptionIs, vatRate, isDefault, categoryIds = [] } = req.body;

    // Check if profile exists
    const existingProfile = await prisma.vatProfile.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProfile) {
      return errorResponse(res, 'VAT profile not found', 404);
    }

    // If this is being set as default, unset other defaults
    if (isDefault && !existingProfile.isDefault) {
      await prisma.vatProfile.updateMany({
        where: {
          isDefault: true,
          id: { not: parseInt(id) }
        },
        data: { isDefault: false }
      });
    }

    // Update the profile
    const profile = await prisma.vatProfile.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(nameIs && { nameIs }),
        ...(description !== undefined && { description }),
        ...(descriptionIs !== undefined && { descriptionIs }),
        ...(vatRate !== undefined && { vatRate: parseFloat(vatRate) }),
        ...(isDefault !== undefined && { isDefault }),
        // Disconnect all categories first, then connect new ones
        categories: categoryIds.length > 0 ? {
          set: categoryIds.map(id => ({ id: parseInt(id) }))
        } : { set: [] }
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            nameIs: true
          }
        }
      }
    });

    return successResponse(res, { profile }, 'VAT profile updated successfully');
  } catch (error) {
    console.error('Error updating VAT profile:', error);
    return errorResponse(res, 'Failed to update VAT profile', 500);
  }
};

/**
 * Delete VAT profile
 */
const deleteVatProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if profile exists
    const existingProfile = await prisma.vatProfile.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProfile) {
      return errorResponse(res, 'VAT profile not found', 404);
    }

    // Prevent deletion if this is the only profile or if categories are assigned
    const categoriesCount = await prisma.category.count({
      where: { vatProfileId: parseInt(id) }
    });

    if (categoriesCount > 0) {
      return errorResponse(res, 'Cannot delete profile with assigned categories. Reassign categories first.', 400);
    }

    // Delete the profile
    await prisma.vatProfile.delete({
      where: { id: parseInt(id) }
    });

    return successResponse(res, {}, 'VAT profile deleted successfully');
  } catch (error) {
    console.error('Error deleting VAT profile:', error);
    return errorResponse(res, 'Failed to delete VAT profile', 500);
  }
};

/**
 * Assign categories to a VAT profile
 */
const assignCategoriesToProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryIds = [] } = req.body;

    // Check if profile exists
    const profile = await prisma.vatProfile.findUnique({
      where: { id: parseInt(id) }
    });

    if (!profile) {
      return errorResponse(res, 'VAT profile not found', 404);
    }

    // First, disconnect any categories that are not in the new list
    await prisma.category.updateMany({
      where: {
        vatProfileId: parseInt(id),
        id: { notIn: categoryIds.map(id => parseInt(id)) }
      },
      data: { vatProfileId: null }
    });

    // Connect new categories
    await prisma.category.updateMany({
      where: {
        id: { in: categoryIds.map(id => parseInt(id)) }
      },
      data: { vatProfileId: parseInt(id) }
    });

    // Get updated profile with categories
    const updatedProfile = await prisma.vatProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            nameIs: true
          }
        }
      }
    });

    return successResponse(res, { profile: updatedProfile }, 'Categories assigned to profile successfully');
  } catch (error) {
    console.error('Error assigning categories to profile:', error);
    return errorResponse(res, 'Failed to assign categories to profile', 500);
  }
};

// Validation middleware
const createVatProfileValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('nameIs').notEmpty().withMessage('Icelandic name is required'),
  body('vatRate').isFloat({ min: 0, max: 100 }).withMessage('VAT rate must be between 0 and 100'),
];

const updateVatProfileValidation = [
  body('name').optional().notEmpty(),
  body('nameIs').optional().notEmpty(),
  body('vatRate').optional().isFloat({ min: 0, max: 100 }),
];

module.exports = {
  getVatProfiles,
  getVatProfile,
  createVatProfile,
  updateVatProfile,
  deleteVatProfile,
  assignCategoriesToProfile,
  createVatProfileValidation,
  updateVatProfileValidation
};
