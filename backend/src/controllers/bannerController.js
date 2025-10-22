const { body } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get all banners
 */
const getBanners = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    
    const where = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });

    return successResponse(res, banners, 'Banners retrieved successfully');
  } catch (error) {
    console.error('Get banners error:', error);
    return errorResponse(res, 'Failed to retrieve banners', 500);
  }
};

/**
 * Get banner by ID
 */
const getBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(id) }
    });

    if (!banner) {
      return errorResponse(res, 'Banner not found', 404);
    }

    return successResponse(res, banner, 'Banner retrieved successfully');
  } catch (error) {
    console.error('Get banner error:', error);
    return errorResponse(res, 'Failed to retrieve banner', 500);
  }
};

/**
 * Create new banner (Admin only)
 */
const createBanner = async (req, res) => {
  try {
    const { title, titleIs, description, descriptionIs, imageUrl, alt, link, sortOrder } = req.body;

    const bannerData = {
      title,
      titleIs,
      description,
      descriptionIs,
      imageUrl,
      alt,
      link,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
    };

    const banner = await prisma.banner.create({
      data: bannerData,
    });

    return successResponse(res, banner, 'Banner created successfully', 201);
  } catch (error) {
    console.error('Create banner error:', error);
    return errorResponse(res, 'Failed to create banner', 500);
  }
};

/**
 * Update banner (Admin only)
 */
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.sortOrder) {
      updateData.sortOrder = parseInt(updateData.sortOrder);
    }

    const banner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return successResponse(res, banner, 'Banner updated successfully');
  } catch (error) {
    console.error('Update banner error:', error);
    if (error.code === 'P2025') {
      return errorResponse(res, 'Banner not found', 404);
    }
    return errorResponse(res, 'Failed to update banner', 500);
  }
};

/**
 * Delete banner (Admin only)
 */
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.banner.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(res, null, 'Banner deleted successfully');
  } catch (error) {
    console.error('Delete banner error:', error);
    if (error.code === 'P2025') {
      return errorResponse(res, 'Banner not found', 404);
    }
    return errorResponse(res, 'Failed to delete banner', 500);
  }
};

/**
 * Toggle banner active status (Admin only)
 */
const toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(id) }
    });

    if (!banner) {
      return errorResponse(res, 'Banner not found', 404);
    }

    const updatedBanner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: { isActive: !banner.isActive }
    });

    return successResponse(res, updatedBanner, 'Banner status updated successfully');
  } catch (error) {
    console.error('Toggle banner status error:', error);
    return errorResponse(res, 'Failed to update banner status', 500);
  }
};

/**
 * Get featured banners for homepage
 */
const getFeaturedBanners = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        isFeatured: true
      },
      orderBy: { featuredOrder: 'asc' }
    });

    return successResponse(res, banners, 'Featured banners retrieved successfully');
  } catch (error) {
    console.error('Get featured banners error:', error);
    return errorResponse(res, 'Failed to retrieve featured banners', 500);
  }
};

/**
 * Set banner as featured (Admin only)
 */
const setFeaturedBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { featuredOrder } = req.body;

    // If setting a specific position, remove any existing banner from that position
    if (featuredOrder) {
      await prisma.banner.updateMany({
        where: { featuredOrder: parseInt(featuredOrder) },
        data: { isFeatured: false, featuredOrder: null }
      });
    }

    const updatedBanner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: {
        isFeatured: true,
        featuredOrder: featuredOrder ? parseInt(featuredOrder) : null
      }
    });

    return successResponse(res, updatedBanner, 'Banner set as featured successfully');
  } catch (error) {
    console.error('Set featured banner error:', error);
    if (error.code === 'P2025') {
      return errorResponse(res, 'Banner not found', 404);
    }
    return errorResponse(res, 'Failed to set banner as featured', 500);
  }
};

/**
 * Remove banner from featured (Admin only)
 */
const removeFeaturedBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedBanner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: {
        isFeatured: false,
        featuredOrder: null
      }
    });

    return successResponse(res, updatedBanner, 'Banner removed from featured successfully');
  } catch (error) {
    console.error('Remove featured banner error:', error);
    if (error.code === 'P2025') {
      return errorResponse(res, 'Banner not found', 404);
    }
    return errorResponse(res, 'Failed to remove banner from featured', 500);
  }
};

// Validation rules
const createBannerValidation = [
  body('imageUrl').notEmpty().withMessage('Image URL is required'),
];

const updateBannerValidation = [
  body('imageUrl').optional().notEmpty().withMessage('Image URL cannot be empty'),
];

module.exports = {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  getFeaturedBanners,
  setFeaturedBanner,
  removeFeaturedBanner,
  createBannerValidation,
  updateBannerValidation,
};
