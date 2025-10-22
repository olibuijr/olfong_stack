const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Encryption utilities
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
const ALGORITHM = 'aes-256-cbc';

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Get SMTP settings (without decrypted password)
 */
const getSMTPSettings = async (req, res) => {
  try {
    let settings = await prisma.sMTPSettings.findFirst();
    
    // If no settings exist, return empty structure
    if (!settings) {
      return successResponse(res, { 
        settings: {
          host: '',
          port: 587,
          secure: false,
          username: '',
          password: '', // Empty for security
          fromEmail: '',
          fromName: 'Ölföng',
          fromNameIs: 'Ölföng',
          isEnabled: false
        }
      }, 'SMTP settings retrieved successfully');
    }

    // Return settings without decrypted password for security
    const safeSettings = {
      id: settings.id,
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      username: settings.username,
      password: '', // Never return the actual password
      fromEmail: settings.fromEmail,
      fromName: settings.fromName,
      fromNameIs: settings.fromNameIs,
      isEnabled: settings.isEnabled,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt
    };

    return successResponse(res, { settings: safeSettings }, 'SMTP settings retrieved successfully');
  } catch (error) {
    console.error('Get SMTP settings error:', error);
    return errorResponse(res, 'Failed to retrieve SMTP settings', 500);
  }
};

/**
 * Update SMTP settings
 */
const updateSMTPSettings = async (req, res) => {
  try {
    const {
      host,
      port,
      secure,
      username,
      password,
      fromEmail,
      fromName,
      fromNameIs,
      isEnabled
    } = req.body;

    // Validate required fields
    if (!host || !username || !fromEmail) {
      return errorResponse(res, 'Host, username, and from email are required', 400);
    }

    // Encrypt password if provided
    let encryptedPassword = '';
    if (password && password.trim() !== '') {
      encryptedPassword = encrypt(password);
    } else {
      // If no password provided, keep existing one
      const existingSettings = await prisma.sMTPSettings.findFirst();
      if (existingSettings) {
        encryptedPassword = existingSettings.password;
      }
    }

    // Update or create settings
    const settings = await prisma.sMTPSettings.upsert({
      where: { id: 1 },
      update: {
        host,
        port: port || 587,
        secure: secure || false,
        username,
        password: encryptedPassword,
        fromEmail,
        fromName: fromName || 'Ölföng',
        fromNameIs: fromNameIs || 'Ölföng',
        isEnabled: isEnabled || false
      },
      create: {
        host,
        port: port || 587,
        secure: secure || false,
        username,
        password: encryptedPassword,
        fromEmail,
        fromName: fromName || 'Ölföng',
        fromNameIs: fromNameIs || 'Ölföng',
        isEnabled: isEnabled || false
      }
    });

    // Return settings without password
    const safeSettings = {
      id: settings.id,
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      username: settings.username,
      password: '', // Never return the actual password
      fromEmail: settings.fromEmail,
      fromName: settings.fromName,
      fromNameIs: settings.fromNameIs,
      isEnabled: settings.isEnabled,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt
    };

    return successResponse(res, { settings: safeSettings }, 'SMTP settings updated successfully');
  } catch (error) {
    console.error('Update SMTP settings error:', error);
    return errorResponse(res, 'Failed to update SMTP settings', 500);
  }
};

/**
 * Test SMTP connection
 */
const testSMTPConnection = async (req, res) => {
  try {
    const { host, port, secure, username, password, fromEmail } = req.body;

    // Validate required fields
    if (!host || !username || !password || !fromEmail) {
      return errorResponse(res, 'Host, username, password, and from email are required for testing', 400);
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host,
      port: port || 587,
      secure: secure || false,
      auth: {
        user: username,
        pass: password
      }
    });

    // Test connection
    await transporter.verify();

    // Send test email
    const testEmail = {
      from: `"Ölföng" <${fromEmail}>`,
      to: fromEmail, // Send to self for testing
      subject: 'SMTP Test Email - Ölföng',
      text: 'This is a test email to verify SMTP configuration.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">SMTP Test Email</h2>
          <p>This is a test email to verify that your SMTP configuration is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Host: ${host}</li>
            <li>Port: ${port || 587}</li>
            <li>Secure: ${secure ? 'Yes' : 'No'}</li>
            <li>Username: ${username}</li>
            <li>From: ${fromEmail}</li>
            <li>Timestamp: ${new Date().toISOString()}</li>
          </ul>
          <p>If you received this email, your SMTP settings are configured correctly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated test email from Ölföng POS System.</p>
        </div>
      `
    };

    await transporter.sendMail(testEmail);

    return successResponse(res, { 
      message: 'SMTP connection successful and test email sent',
      details: {
        host,
        port: port || 587,
        secure: secure || false,
        username,
        fromEmail
      }
    }, 'SMTP test successful');
  } catch (error) {
    console.error('SMTP test error:', error);
    return errorResponse(res, `SMTP test failed: ${error.message}`, 400);
  }
};

/**
 * Get SMTP transporter for use in other services
 */
const getSMTPTransporter = async () => {
  try {
    const settings = await prisma.sMTPSettings.findFirst();
    
    if (!settings || !settings.isEnabled) {
      throw new Error('SMTP settings not configured or disabled');
    }

    const decryptedPassword = decrypt(settings.password);

    return nodemailer.createTransporter({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.username,
        pass: decryptedPassword
      }
    });
  } catch (error) {
    console.error('Error creating SMTP transporter:', error);
    throw error;
  }
};

module.exports = {
  getSMTPSettings,
  updateSMTPSettings,
  testSMTPConnection,
  getSMTPTransporter
};
