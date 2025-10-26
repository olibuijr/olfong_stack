const { body } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get all pages (Admin)
 */
const getPages = async (req, res) => {
  try {
    const { search, status, sortOrder = 'asc' } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { titleIs: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const pages = await prisma.page.findMany({
      where,
      include: {
        featuredImage: {
          select: {
            id: true,
            url: true,
            filename: true,
            alt: true
          }
        }
      },
      orderBy: { sortOrder: sortOrder === 'desc' ? 'desc' : 'asc' }
    });

    return successResponse(res, pages, 'Pages retrieved successfully');
  } catch (error) {
    console.error('Get pages error:', error);
    return errorResponse(res, 'Failed to retrieve pages', 500);
  }
};

/**
 * Get published and visible pages (Public)
 */
const getPublicPages = async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      where: {
        status: 'PUBLISHED',
        isVisible: true
      },
      select: {
        id: true,
        title: true,
        titleIs: true,
        slug: true,
        status: true,
        sortOrder: true,
        isVisible: true,
        featuredImage: {
          select: {
            id: true,
            url: true,
            filename: true,
            alt: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    return successResponse(res, pages, 'Public pages retrieved successfully');
  } catch (error) {
    console.error('Get public pages error:', error);
    return errorResponse(res, 'Failed to retrieve public pages', 500);
  }
};

/**
 * Get page by ID (Admin)
 */
const getPageById = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await prisma.page.findUnique({
      where: { id: parseInt(id) },
      include: {
        featuredImage: true
      }
    });

    if (!page) {
      return errorResponse(res, 'Page not found', 404);
    }

    return successResponse(res, page, 'Page retrieved successfully');
  } catch (error) {
    console.error('Get page by ID error:', error);
    return errorResponse(res, 'Failed to retrieve page', 500);
  }
};

/**
 * Get page by slug (Public)
 */
const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        featuredImage: true
      }
    });

    if (!page || page.status !== 'PUBLISHED') {
      return errorResponse(res, 'Page not found', 404);
    }

    return successResponse(res, page, 'Page retrieved successfully');
  } catch (error) {
    console.error('Get page by slug error:', error);
    return errorResponse(res, 'Failed to retrieve page', 500);
  }
};

/**
 * Create new page (Admin)
 */
const createPage = async (req, res) => {
  try {
    const {
      title,
      titleIs,
      slug,
      content,
      contentIs,
      status = 'DRAFT',
      isVisible = true,
      sortOrder = 0,
      featuredImageId,
      metaTitle,
      metaTitleIs,
      metaDescription,
      metaDescriptionIs,
      canonicalUrl
    } = req.body;

    // Validate required fields
    if (!title || !titleIs || !slug || !content || !contentIs) {
      return errorResponse(res, 'Title, slug, and content (EN/IS) are required', 400);
    }

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    });

    if (existingPage) {
      return errorResponse(res, 'Page with this slug already exists', 400);
    }

    const pageData = {
      title,
      titleIs,
      slug,
      content,
      contentIs,
      status,
      isVisible,
      sortOrder: parseInt(sortOrder) || 0,
      metaTitle,
      metaTitleIs,
      metaDescription,
      metaDescriptionIs,
      canonicalUrl
    };

    if (featuredImageId) {
      pageData.featuredImageId = featuredImageId;
    }

    const page = await prisma.page.create({
      data: pageData,
      include: {
        featuredImage: true
      }
    });

    return successResponse(res, page, 'Page created successfully', 201);
  } catch (error) {
    console.error('Create page error:', error);
    return errorResponse(res, 'Failed to create page', 500);
  }
};

/**
 * Update page (Admin)
 */
const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      titleIs,
      slug,
      content,
      contentIs,
      status,
      isVisible,
      sortOrder,
      featuredImageId,
      metaTitle,
      metaTitleIs,
      metaDescription,
      metaDescriptionIs,
      canonicalUrl
    } = req.body;

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { id: parseInt(id) }
    });

    if (!page) {
      return errorResponse(res, 'Page not found', 404);
    }

    // If slug is being changed, check for duplicates
    if (slug && slug !== page.slug) {
      const existingPage = await prisma.page.findUnique({
        where: { slug }
      });

      if (existingPage) {
        return errorResponse(res, 'Page with this slug already exists', 400);
      }
    }

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (titleIs !== undefined) updateData.titleIs = titleIs;
    if (slug !== undefined) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (contentIs !== undefined) updateData.contentIs = contentIs;
    if (status !== undefined) updateData.status = status;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaTitleIs !== undefined) updateData.metaTitleIs = metaTitleIs;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (metaDescriptionIs !== undefined) updateData.metaDescriptionIs = metaDescriptionIs;
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl;
    if (featuredImageId !== undefined) updateData.featuredImageId = featuredImageId || null;

    const updatedPage = await prisma.page.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        featuredImage: true
      }
    });

    return successResponse(res, updatedPage, 'Page updated successfully');
  } catch (error) {
    console.error('Update page error:', error);
    return errorResponse(res, 'Failed to update page', 500);
  }
};

/**
 * Delete page (Admin)
 */
const deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { id: parseInt(id) }
    });

    if (!page) {
      return errorResponse(res, 'Page not found', 404);
    }

    await prisma.page.delete({
      where: { id: parseInt(id) }
    });

    return successResponse(res, null, 'Page deleted successfully');
  } catch (error) {
    console.error('Delete page error:', error);
    return errorResponse(res, 'Failed to delete page', 500);
  }
};

/**
 * Reorder pages by updating sortOrder (Admin)
 */
const reorderPages = async (req, res) => {
  try {
    const { pageOrders } = req.body;

    if (!Array.isArray(pageOrders) || pageOrders.length === 0) {
      return errorResponse(res, 'Page orders array is required', 400);
    }

    // Update all pages in parallel
    const updatePromises = pageOrders.map(({ id, sortOrder }) =>
      prisma.page.update({
        where: { id: parseInt(id) },
        data: { sortOrder: parseInt(sortOrder) }
      })
    );

    await Promise.all(updatePromises);

    // Fetch updated pages
    const pages = await prisma.page.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        featuredImage: {
          select: {
            id: true,
            url: true,
            filename: true,
            alt: true
          }
        }
      }
    });

    return successResponse(res, pages, 'Pages reordered successfully');
  } catch (error) {
    console.error('Reorder pages error:', error);
    return errorResponse(res, 'Failed to reorder pages', 500);
  }
};

/**
 * Toggle page visibility (Admin)
 */
const toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await prisma.page.findUnique({
      where: { id: parseInt(id) }
    });

    if (!page) {
      return errorResponse(res, 'Page not found', 404);
    }

    const updatedPage = await prisma.page.update({
      where: { id: parseInt(id) },
      data: { isVisible: !page.isVisible },
      include: {
        featuredImage: true
      }
    });

    return successResponse(res, updatedPage, 'Page visibility toggled successfully');
  } catch (error) {
    console.error('Toggle page visibility error:', error);
    return errorResponse(res, 'Failed to toggle page visibility', 500);
  }
};

// Validation rules
const createPageValidation = [
  body('title').notEmpty().withMessage('Title (English) is required'),
  body('titleIs').notEmpty().withMessage('Title (Icelandic) is required'),
  body('slug').notEmpty().withMessage('Slug is required'),
  body('content').notEmpty().withMessage('Content (English) is required'),
  body('contentIs').notEmpty().withMessage('Content (Icelandic) is required')
];

const updatePageValidation = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('slug').optional().notEmpty().withMessage('Slug cannot be empty')
];

module.exports = {
  getPages,
  getPublicPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  reorderPages,
  toggleVisibility,
  createPageValidation,
  updatePageValidation
};
