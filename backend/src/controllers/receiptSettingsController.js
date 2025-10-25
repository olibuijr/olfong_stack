const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/receipts');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * Get receipt settings
 */
const getReceiptSettings = async (req, res) => {
  try {
    let settings = await prisma.receiptSettings.findFirst();
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.receiptSettings.create({
        data: {
          companyName: 'Ölföng',
          companyNameIs: 'Ölföng',
          companyAddress: 'Reykjavík, Iceland',
          companyAddressIs: 'Reykjavík, Ísland',
          companyPhone: '+354 555 1234',
          companyEmail: 'info@olfong.is',
          companyWebsite: 'www.olfong.is',
          taxId: '1234567890',
          headerColor: '#1e40af',
          accentColor: '#3b82f6',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          footerText: 'Thank you for your business!',
          footerTextIs: 'Takk fyrir viðskiptin!',
          showBarcode: true,
          showQrCode: true,
          template: 'modern',
          paperSize: '80mm'
        }
      });
    }

    return successResponse(res, { settings }, 'Receipt settings retrieved successfully');
  } catch (error) {
    console.error('Get receipt settings error:', error);
    return errorResponse(res, 'Failed to retrieve receipt settings', 500);
  }
};

/**
 * Update receipt settings
 */
const updateReceiptSettings = async (req, res) => {
  try {
    const {
      logoUrl,
      logoInversion,
      companyName,
      companyNameIs,
      companyAddress,
      companyAddressIs,
      companyPhone,
      companyEmail,
      companyWebsite,
      taxId,
      headerColor,
      accentColor,
      fontFamily,
      fontSize,
      footerText,
      footerTextIs,
      showBarcode,
      showQrCode,
      template,
      paperSize
    } = req.body;

    // Validate required fields
    if (!companyName || !companyNameIs) {
      return errorResponse(res, 'Company name is required in both languages', 400);
    }

    // Update or create settings
    const settings = await prisma.receiptSettings.upsert({
      where: { id: 1 },
      update: {
        logoUrl,
        logoInversion: logoInversion || 'none',
        companyName,
        companyNameIs,
        companyAddress,
        companyAddressIs,
        companyPhone,
        companyEmail,
        companyWebsite,
        taxId,
        headerColor: headerColor || '#1e40af',
        accentColor: accentColor || '#3b82f6',
        fontFamily: fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: fontSize || '14px',
        footerText,
        footerTextIs,
        showBarcode: showBarcode !== undefined ? showBarcode : true,
        showQrCode: showQrCode !== undefined ? showQrCode : true,
        template: template || 'modern',
        paperSize: paperSize || '80mm'
      },
      create: {
        companyName,
        companyNameIs,
        companyAddress,
        companyAddressIs,
        companyPhone,
        companyEmail,
        companyWebsite,
        taxId,
        headerColor: headerColor || '#1e40af',
        accentColor: accentColor || '#3b82f6',
        fontFamily: fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: fontSize || '14px',
        footerText,
        footerTextIs,
        showBarcode: showBarcode !== undefined ? showBarcode : true,
        showQrCode: showQrCode !== undefined ? showQrCode : true,
        template: template || 'modern',
        paperSize: paperSize || '80mm',
        logoUrl,
        logoInversion: logoInversion || 'none'
      }
    });

    return successResponse(res, { settings }, 'Receipt settings updated successfully');
  } catch (error) {
    console.error('Update receipt settings error:', error);
    return errorResponse(res, 'Failed to update receipt settings', 500);
  }
};

/**
 * Upload receipt logo
 */
const uploadReceiptLogo = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const logoUrl = `/uploads/receipts/${req.file.filename}`;
    
    // Update settings with new logo URL
    const settings = await prisma.receiptSettings.upsert({
      where: { id: 1 },
      update: { logoUrl },
      create: {
        companyName: 'Ölföng',
        companyNameIs: 'Ölföng',
        logoUrl
      }
    });

    return successResponse(res, { 
      settings,
      logoUrl,
      message: 'Logo uploaded successfully' 
    }, 'Logo uploaded successfully');
  } catch (error) {
    console.error('Upload logo error:', error);
    return errorResponse(res, 'Failed to upload logo', 500);
  }
};

/**
 * Delete receipt logo
 */
const deleteReceiptLogo = async (req, res) => {
  try {
    const settings = await prisma.receiptSettings.findFirst();
    
    if (settings && settings.logoUrl) {
      // Delete file from filesystem
      const logoPath = path.join(__dirname, '../../uploads/receipts', path.basename(settings.logoUrl));
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }

      // Update settings to remove logo URL
      const updatedSettings = await prisma.receiptSettings.update({
        where: { id: settings.id },
        data: { logoUrl: null }
      });

      return successResponse(res, { settings: updatedSettings }, 'Logo deleted successfully');
    }

    return errorResponse(res, 'No logo to delete', 404);
  } catch (error) {
    console.error('Delete logo error:', error);
    return errorResponse(res, 'Failed to delete logo', 500);
  }
};

module.exports = {
  getReceiptSettings,
  updateReceiptSettings,
  uploadReceiptLogo,
  deleteReceiptLogo,
  upload // Export multer middleware for use in routes
};
