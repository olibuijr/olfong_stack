const { body } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get all categories
 */
const getCategories = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    
    const where = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true }
        },
        subcategories: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: {
              select: { products: true }
            }
          }
        }
      }
    });

    return successResponse(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse(res, 'Failed to retrieve categories', 500);
  }
};

/**
 * Get category by ID
 */
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return errorResponse(res, 'Category not found', 404);
    }

    return successResponse(res, category, 'Category retrieved successfully');
  } catch (error) {
    console.error('Get category error:', error);
    return errorResponse(res, 'Failed to retrieve category', 500);
  }
};

/**
 * Create new category (Admin only)
 */
const createCategory = async (req, res) => {
  try {
    const {
      name,
      nameIs,
      slug,
      description,
      descriptionIs,
      icon,
      sortOrder,
      imageUrl,
      metaTitle,
      metaTitleIs,
      metaDescription,
      metaDescriptionIs,
      hasDiscount,
      discountPercentage,
      discountStartDate,
      discountEndDate,
      discountReason,
      discountReasonIs,
    } = req.body;

    const categoryData = {
      name: name.toUpperCase(),
      nameIs,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      descriptionIs,
      icon,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      // SEO fields
      metaTitle,
      metaTitleIs,
      metaDescription,
      metaDescriptionIs,
      // Discount fields
      hasDiscount: hasDiscount === true || hasDiscount === 'true',
      discountPercentage: discountPercentage ? parseFloat(discountPercentage) : null,
      discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
      discountEndDate: discountEndDate ? new Date(discountEndDate) : null,
      discountReason,
      discountReasonIs,
    };

    // Add image URL if file was uploaded or if imageUrl was provided in request body
    if (req.file) {
      categoryData.imageUrl = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      categoryData.imageUrl = imageUrl;
    }

    const category = await prisma.category.create({
      data: categoryData,
    });

    return successResponse(res, category, 'Category created successfully', 201);
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'P2002') {
      return errorResponse(res, 'Category with this name or slug already exists', 400);
    }
    return errorResponse(res, 'Failed to create category', 500);
  }
};

/**
 * Update category (Admin only)
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.name) {
      updateData.name = updateData.name.toUpperCase();
    }
    if (updateData.sortOrder) {
      updateData.sortOrder = parseInt(updateData.sortOrder);
    }

    // Handle discount percentage
    if (updateData.discountPercentage !== undefined) {
      updateData.discountPercentage = updateData.discountPercentage ? parseFloat(updateData.discountPercentage) : null;
    }

    // Handle discount dates
    if (updateData.discountStartDate !== undefined) {
      updateData.discountStartDate = updateData.discountStartDate ? new Date(updateData.discountStartDate) : null;
    }
    if (updateData.discountEndDate !== undefined) {
      updateData.discountEndDate = updateData.discountEndDate ? new Date(updateData.discountEndDate) : null;
    }

    // Handle hasDiscount boolean
    if (updateData.hasDiscount !== undefined) {
      updateData.hasDiscount = updateData.hasDiscount === true || updateData.hasDiscount === 'true';
    }

    // Add image URL if file was uploaded or if imageUrl was provided in request body
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    } else if (updateData.imageUrl === null) {
      // Allow clearing imageUrl when explicitly set to null
      updateData.imageUrl = null;
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return successResponse(res, category, 'Category updated successfully');
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 'P2002') {
      return errorResponse(res, 'Category with this name or slug already exists', 400);
    }
    if (error.code === 'P2025') {
      return errorResponse(res, 'Category not found', 404);
    }
    return errorResponse(res, 'Failed to update category', 500);
  }
};

/**
 * Delete category (Admin only)
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const categoryWithProducts = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!categoryWithProducts) {
      return errorResponse(res, 'Category not found', 404);
    }

    // Prevent deletion of Tilboðin (discounted products) category
    if (categoryWithProducts.slug === 'tilbodin' || categoryWithProducts.name === 'TILBOÐIN') {
      return errorResponse(res, 'Cannot delete the Tilboðin category as it is required for displaying discounted products', 400);
    }

    if (categoryWithProducts._count.products > 0) {
      return errorResponse(res, 'Cannot delete category with existing products', 400);
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(res, null, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    return errorResponse(res, 'Failed to delete category', 500);
  }
};

// Validation rules
const createCategoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('nameIs').notEmpty().withMessage('Icelandic category name is required'),
  body('slug').optional().matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
];

const updateCategoryValidation = [
  body('name').optional().notEmpty().withMessage('Category name cannot be empty'),
  body('nameIs').optional().notEmpty().withMessage('Icelandic category name cannot be empty'),
  body('slug').optional().matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
];

/**
 * Get subcategories by category ID
 */
const getSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    if (!categoryId) {
      return errorResponse(res, 'Category ID is required', 400);
    }

    const subcategories = await prisma.subcategory.findMany({
      where: {
        categoryId: parseInt(categoryId),
        isActive: true
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return successResponse(res, subcategories, 'Subcategories retrieved successfully');
  } catch (error) {
    console.error('Get subcategories error:', error);
    return errorResponse(res, 'Failed to retrieve subcategories', 500);
  }
};

module.exports = {
  getCategories,
  getCategory,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createCategoryValidation,
  updateCategoryValidation,
};
