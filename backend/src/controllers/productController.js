const { body, oneOf } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');
const { downloadAndSaveImage } = require('./atvrController');

/**
 * Get all products with optional filtering
 */
const getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      minAlcoholVolume,
      maxAlcoholVolume,
      sortBy,
      sortOrder,
      page = 1,
      limit = 20
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      isActive: true,
    };

    if (category) {
      // Find category by name and use its ID
      try {
        const categoryRecord = await prisma.category.findFirst({
          where: { name: category.toUpperCase() }
        });
        if (categoryRecord) {
          where.categoryId = categoryRecord.id;
        }
      } catch (error) {
        console.error('Category lookup error:', error);
        // Continue without category filter if lookup fails
      }
    }

    if (subcategory) {
      // Find subcategory by name and use its ID
      try {
        const subcategoryRecord = await prisma.subcategory.findFirst({
          where: { name: subcategory.toUpperCase() }
        });
        if (subcategoryRecord) {
          where.subcategoryId = subcategoryRecord.id;
        }
      } catch (error) {
        console.error('Subcategory lookup error:', error);
        // Continue without subcategory filter if lookup fails
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameIs: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionIs: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Price filtering
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    // Alcohol volume filtering
    if (minAlcoholVolume || maxAlcoholVolume) {
      where.alcoholVolume = {};
      if (minAlcoholVolume) {
        where.alcoholVolume.gte = parseFloat(minAlcoholVolume);
      }
      if (maxAlcoholVolume) {
        where.alcoholVolume.lte = parseFloat(maxAlcoholVolume);
      }
    }

    // Build orderBy clause
    let orderBy = { createdAt: 'desc' };
    if (sortBy && sortOrder) {
      const validSortFields = ['name', 'price', 'alcoholVolume', 'createdAt'];
      const validSortOrders = ['asc', 'desc'];
      
      if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        include: {
          category: {
            include: {
              vatProfile: true,
            }
          },
          subcategory: true,
        }
      }),
      prisma.product.count({ where }),
    ]);

    // Parse JSON fields for ATVR data
    const parsedProducts = products.map(product => {
      if (product.foodPairings && typeof product.foodPairings === 'string') {
        try {
          product.foodPairings = JSON.parse(product.foodPairings);
        } catch (e) {
          product.foodPairings = [];
        }
      }
      
      if (product.specialAttributes && typeof product.specialAttributes === 'string') {
        try {
          product.specialAttributes = JSON.parse(product.specialAttributes);
        } catch (e) {
          product.specialAttributes = [];
        }
      }
      
      return product;
    });

    return successResponse(res, {
      products: parsedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return errorResponse(res, 'Failed to retrieve products', 500);
  }
};

/**
 * Get product by ID
 */
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          include: {
            vatProfile: true,
          }
        },
        subcategory: true,
      }
    });

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    // Parse JSON fields for ATVR data - both languages
    if (product.foodPairings && typeof product.foodPairings === 'string') {
      try {
        product.foodPairings = JSON.parse(product.foodPairings);
      } catch (e) {
        product.foodPairings = [];
      }
    }

    if (product.foodPairingsIs && typeof product.foodPairingsIs === 'string') {
      try {
        product.foodPairingsIs = JSON.parse(product.foodPairingsIs);
      } catch (e) {
        product.foodPairingsIs = [];
      }
    }

    if (product.specialAttributes && typeof product.specialAttributes === 'string') {
      try {
        product.specialAttributes = JSON.parse(product.specialAttributes);
      } catch (e) {
        product.specialAttributes = [];
      }
    }

    if (product.specialAttributesIs && typeof product.specialAttributesIs === 'string') {
      try {
        product.specialAttributesIs = JSON.parse(product.specialAttributesIs);
      } catch (e) {
        product.specialAttributesIs = [];
      }
    }

    return successResponse(res, product, 'Product retrieved successfully');
  } catch (error) {
    console.error('Get product error:', error);
    return errorResponse(res, 'Failed to retrieve product', 500);
  }
};

/**
 * Create new product (Admin only)
 */
const createProduct = async (req, res) => {
  try {
    console.log('Creating product with body:', JSON.stringify(req.body, null, 2));
    const productData = {
      ...req.body,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      ageRestriction: parseInt(req.body.ageRestriction),
      alcoholContent: req.body.alcoholContent && req.body.alcoholContent !== 'N/A' ? 
        parseFloat(req.body.alcoholContent.replace('%', '')) : null,
      // Handle ATVR fields - comprehensive bilingual support
      volume: req.body.volume,
      volumeIs: req.body.volumeIs,
      country: req.body.country,
      countryIs: req.body.countryIs,
      region: req.body.region,
      regionIs: req.body.regionIs,
      origin: req.body.origin,
      originIs: req.body.originIs,
      producer: req.body.producer,
      producerIs: req.body.producerIs,
      distributor: req.body.distributor,
      distributorIs: req.body.distributorIs,
      packaging: req.body.packaging,
      packagingIs: req.body.packagingIs,
      packagingWeight: req.body.packagingWeight,
      packagingWeightIs: req.body.packagingWeightIs,
      carbonFootprint: req.body.carbonFootprint,
      carbonFootprintIs: req.body.carbonFootprintIs,
      vintage: req.body.vintage,
      grapeVariety: req.body.grapeVariety,
      grapeVarietyIs: req.body.grapeVarietyIs,
      wineStyle: req.body.wineStyle,
      wineStyleIs: req.body.wineStyleIs,
      pricePerLiter: req.body.pricePerLiter,
      pricePerLiterIs: req.body.pricePerLiterIs,
      foodPairings: req.body.foodPairings ? 
        (typeof req.body.foodPairings === 'string' ? JSON.parse(req.body.foodPairings) : req.body.foodPairings) : [],
      foodPairingsIs: req.body.foodPairingsIs ? 
        (typeof req.body.foodPairingsIs === 'string' ? JSON.parse(req.body.foodPairingsIs) : req.body.foodPairingsIs) : [],
      specialAttributes: req.body.specialAttributes ? 
        (typeof req.body.specialAttributes === 'string' ? JSON.parse(req.body.specialAttributes) : req.body.specialAttributes) : [],
      specialAttributesIs: req.body.specialAttributesIs ? 
        (typeof req.body.specialAttributesIs === 'string' ? JSON.parse(req.body.specialAttributesIs) : req.body.specialAttributesIs) : [],
      certifications: req.body.certifications ? 
        (typeof req.body.certifications === 'string' ? JSON.parse(req.body.certifications) : req.body.certifications) : [],
      certificationsIs: req.body.certificationsIs ? 
        (typeof req.body.certificationsIs === 'string' ? JSON.parse(req.body.certificationsIs) : req.body.certificationsIs) : [],
      storeAvailability: req.body.storeAvailability ? JSON.parse(req.body.storeAvailability) : null,
      atvrProductId: req.body.atvrProductId,
      atvrUrl: req.body.atvrUrl,
      atvrImageUrl: req.body.atvrImageUrl,
      availability: req.body.availability || 'available',
      availabilityIs: req.body.availabilityIs
    };

    // Handle category mapping
    if (req.body.categoryId) {
      productData.categoryId = parseInt(req.body.categoryId);
    } else if (req.body.category) {
      // Map ATVR category names to internal category names
      const categoryMapping = {
        'Bjór': 'BEERS',
        'Rauðvín': 'WINE',
        'Hvítvín': 'WINE',
        'Rósavín': 'WINE',
        'Freyðivín': 'WINE',
        'Sterkt áfengi': 'SPIRITS',
        'Líkjör': 'SPIRITS',
        'Síder': 'CIDER_RTD'
      };

      const mappedCategoryName = categoryMapping[req.body.category] || req.body.category.toUpperCase();

      const category = await prisma.category.findFirst({
        where: { name: mappedCategoryName }
      });
      if (category) {
        productData.categoryId = category.id;
      } else {
        // Default to WINE category if not found
        const defaultCategory = await prisma.category.findFirst({
          where: { name: 'WINE' }
        });
        productData.categoryId = defaultCategory?.id || 1;
      }
    }

    // For ATVR imports, automatically assign 24% VAT profile (Standard Rate)
    if (req.body.atvrProductId && !req.body.vatProfileId) {
      productData.vatProfileId = 1; // Standard Rate (24% VAT)
    } else if (req.body.vatProfileId) {
      productData.vatProfileId = parseInt(req.body.vatProfileId);
    }

    // Add image URL if file was uploaded
    if (req.file) {
      productData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Download and save ATVR image if available
    if (productData.atvrImageUrl && !productData.imageUrl) {
      try {
        console.log('Downloading ATVR product image...');
        const media = await downloadAndSaveImage(
          productData.atvrImageUrl,
          productData.name || productData.nameIs || 'Unknown Product',
          productData.atvrProductId || 'unknown',
          req.user.id
        );

        if (media) {
          productData.imageUrl = media.url;
          console.log(`Successfully set product image URL to: ${media.url}`);
        } else {
          console.log('Failed to download ATVR image, product will be created without image');
        }
      } catch (error) {
        console.error('Error downloading ATVR image:', error);
        // Continue without image - non-critical error
      }
    }

    // Remove the category field since we're using categoryId for the relation
    const { category: _, ...productDataForCreate } = productData;
    
    // Remove undefined values and fix array fields to avoid database issues
    Object.keys(productDataForCreate).forEach(key => {
      if (productDataForCreate[key] === undefined) {
        delete productDataForCreate[key];
      }
      // Fix subcategories field - convert empty string to empty array
      if (key === 'subcategories' && productDataForCreate[key] === '') {
        productDataForCreate[key] = [];
      }
    });
    
    const product = await prisma.product.create({
      data: productDataForCreate,
      include: {
        category: true,
      }
    });

    return successResponse(res, product, 'Product created successfully', 201);
  } catch (error) {
    console.error('Create product error:', error);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    return errorResponse(res, `Failed to create product: ${error.message}`, 500);
  }
};

/**
 * Update product (Admin only)
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    if (updateData.ageRestriction) updateData.ageRestriction = parseInt(updateData.ageRestriction);
    if (updateData.categoryId) updateData.categoryId = parseInt(updateData.categoryId);

    // Remove the category field since we're using categoryId for the relation
    delete updateData.category;

    // Convert boolean fields
    if (updateData.isAgeRestricted !== undefined) {
      updateData.isAgeRestricted = updateData.isAgeRestricted === 'true' || updateData.isAgeRestricted === true;
    }
    if (updateData.hasDiscount !== undefined) {
      updateData.hasDiscount = updateData.hasDiscount === 'true' || updateData.hasDiscount === true;
    }

    // Convert numeric discount fields
    if (updateData.originalPrice !== undefined) {
      updateData.originalPrice = parseFloat(updateData.originalPrice) || null;
    }
    if (updateData.discountPercentage !== undefined) {
      updateData.discountPercentage = parseFloat(updateData.discountPercentage) || null;
    }

    // Handle array fields - convert empty strings to empty arrays
    const arrayFields = ['subcategories', 'foodPairings', 'foodPairingsIs', 'specialAttributes', 'specialAttributesIs', 'certifications', 'certificationsIs'];
    arrayFields.forEach(field => {
      if (updateData[field] === '') {
        updateData[field] = [];
      }
    });

    // Remove undefined values to avoid database issues
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Add image URL if file was uploaded
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
      }
    });

    return successResponse(res, product, 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    return errorResponse(res, 'Failed to update product', 500);
  }
};

/**
 * Delete product (Admin only)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(res, null, 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(res, 'Failed to delete product', 500);
  }
};

/**
 * Get discounted products
 */
const getDiscountedProducts = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const now = new Date();

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        hasDiscount: true,
        AND: [
          {
            OR: [
              { discountEndDate: null }, // No end date
              { discountEndDate: { gte: now } } // End date is in the future
            ]
          },
          {
            OR: [
              { discountStartDate: null }, // No start date
              { discountStartDate: { lte: now } } // Start date is in the past or now
            ]
          }
        ]
      },
      take: parseInt(limit),
      orderBy: { discountPercentage: 'desc' },
      include: {
        category: true,
      }
    });

    // Parse JSON fields for ATVR data
    const parsedProducts = products.map(product => {
      if (product.foodPairings && typeof product.foodPairings === 'string') {
        try {
          product.foodPairings = JSON.parse(product.foodPairings);
        } catch (e) {
          product.foodPairings = [];
        }
      }
      
      if (product.specialAttributes && typeof product.specialAttributes === 'string') {
        try {
          product.specialAttributes = JSON.parse(product.specialAttributes);
        } catch (e) {
          product.specialAttributes = [];
        }
      }
      
      return product;
    });

    return successResponse(res, parsedProducts, 'Discounted products retrieved successfully');
  } catch (error) {
    console.error('Get discounted products error:', error);
    return errorResponse(res, 'Failed to retrieve discounted products', 500);
  }
};

/**
 * Set discount on a product (Admin only)
 */
const setProductDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      originalPrice, 
      discountPercentage, 
      discountStartDate, 
      discountEndDate, 
      discountReason, 
      discountReasonIs 
    } = req.body;

    // Validate discount data
    if (!originalPrice || !discountPercentage) {
      return errorResponse(res, 'Original price and discount percentage are required', 400);
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
      return errorResponse(res, 'Discount percentage must be between 0 and 100', 400);
    }

    // Calculate discounted price
    const discountedPrice = originalPrice * (1 - discountPercentage / 100);

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        hasDiscount: true,
        originalPrice: parseFloat(originalPrice),
        discountPercentage: parseFloat(discountPercentage),
        price: discountedPrice,
        discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
        discountEndDate: discountEndDate ? new Date(discountEndDate) : null,
        discountReason: discountReason || null,
        discountReasonIs: discountReasonIs || null,
      },
      include: {
        category: true,
      }
    });

    return successResponse(res, product, 'Product discount set successfully');
  } catch (error) {
    console.error('Set product discount error:', error);
    return errorResponse(res, 'Failed to set product discount', 500);
  }
};

/**
 * Remove discount from a product (Admin only)
 */
const removeProductDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    // First get the current product to access originalPrice
    const currentProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: { originalPrice: true }
    });

    if (!currentProduct) {
      return errorResponse(res, 'Product not found', 404);
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        hasDiscount: false,
        price: currentProduct.originalPrice || 0, // Restore original price
        originalPrice: null,
        discountPercentage: null,
        discountStartDate: null,
        discountEndDate: null,
        discountReason: null,
        discountReasonIs: null,
      },
      include: {
        category: true,
      }
    });

    return successResponse(res, product, 'Product discount removed successfully');
  } catch (error) {
    console.error('Remove product discount error:', error);
    return errorResponse(res, 'Failed to remove product discount', 500);
  }
};

/**
 * Get product categories (deprecated - use /api/categories instead)
 */
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        nameIs: true,
        slug: true,
      }
    });
    
    // Return category names for backward compatibility
    const categoryNames = categories.map(c => c.name);
    return successResponse(res, categoryNames, 'Categories retrieved successfully');
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse(res, 'Failed to retrieve categories', 500);
  }
};

// Validation rules
const createProductValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('nameIs').notEmpty().withMessage('Icelandic product name is required'),
  // Accept either categoryId (preferred) or category (string) to be mapped server-side
  oneOf([
    body('categoryId').isInt({ min: 1 }),
    body('category').isString().notEmpty(),
  ], 'Valid categoryId or category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('ageRestriction').isInt({ min: 18 }).withMessage('Age restriction must be at least 18'),
];

const updateProductValidation = [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('nameIs').optional().notEmpty().withMessage('Icelandic product name cannot be empty'),
  body('categoryId').optional().isInt({ min: 1 }).withMessage('Valid category ID is required'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('ageRestriction').optional().isInt({ min: 18 }).withMessage('Age restriction must be at least 18'),
];

/**
 * Generate product description using AI
 */
const generateDescription = async (req, res) => {
  try {
    const { productName, language } = req.body;

    if (!productName) {
      return errorResponse(res, 'Product name is required', 400);
    }

    if (!['en', 'is'].includes(language)) {
      return errorResponse(res, 'Language must be "en" or "is"', 400);
    }

    const { execSync } = require('child_process');

    try {
      // Generate the prompt based on language
      let description = '';

      if (language === 'en') {
        // For English, use claude CLI to search and generate description
        const prompt = `Search for information about the product "${productName}" online and create a professional product description of 2-3 sentences. Include key characteristics, uses, and any notable features. Keep it concise and marketing-friendly.`;

        const command = `claude --continue --print "${prompt}" --dangerously-skip-permissions --verbose --output-format stream-json`;
        const output = execSync(command, { encoding: 'utf-8' });

        // Parse the JSON output and extract the description text
        try {
          const lines = output.split('\n').filter(line => line.trim());
          const lastLine = lines[lines.length - 1];
          const parsed = JSON.parse(lastLine);

          if (parsed.type === 'text' && parsed.text) {
            description = parsed.text.trim();
          }
        } catch (parseError) {
          // Fallback: use raw output if JSON parsing fails
          description = output.trim();
        }
      } else if (language === 'is') {
        // For Icelandic, first generate in English, then translate using icelandic-text-generator
        const engPrompt = `Search for information about the product "${productName}" online and create a professional product description of 2-3 sentences. Include key characteristics, uses, and any notable features. Keep it concise and marketing-friendly.`;

        const engCommand = `claude --continue --print "${engPrompt}" --dangerously-skip-permissions --verbose --output-format stream-json`;
        const engOutput = execSync(engCommand, { encoding: 'utf-8' });

        let englishDescription = '';
        try {
          const lines = engOutput.split('\n').filter(line => line.trim());
          const lastLine = lines[lines.length - 1];
          const parsed = JSON.parse(lastLine);

          if (parsed.type === 'text' && parsed.text) {
            englishDescription = parsed.text.trim();
          }
        } catch (parseError) {
          englishDescription = engOutput.trim();
        }

        // Now translate using Icelandic text generator
        const translatePrompt = `Translate the following product description to Icelandic. Keep it professional and marketing-friendly: "${englishDescription}"`;

        const transCommand = `claude --continue --print "${translatePrompt}" --dangerously-skip-permissions --verbose --output-format stream-json`;
        const transOutput = execSync(transCommand, { encoding: 'utf-8' });

        try {
          const lines = transOutput.split('\n').filter(line => line.trim());
          const lastLine = lines[lines.length - 1];
          const parsed = JSON.parse(lastLine);

          if (parsed.type === 'text' && parsed.text) {
            description = parsed.text.trim();
          }
        } catch (parseError) {
          description = transOutput.trim();
        }
      }

      if (!description) {
        return errorResponse(res, 'Failed to generate description', 500);
      }

      return successResponse(res, { description }, 'Description generated successfully');
    } catch (error) {
      console.error('Claude CLI error:', error);
      return errorResponse(res, 'Failed to generate description with AI', 500);
    }
  } catch (error) {
    console.error('Generate description error:', error);
    return errorResponse(res, 'Failed to generate description', 500);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getDiscountedProducts,
  setProductDiscount,
  removeProductDiscount,
  getCategories,
  generateDescription,
  createProductValidation,
  updateProductValidation,
};