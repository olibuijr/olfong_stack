const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Get all staff (Admin only)
 */
const getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause - get only ADMIN and DELIVERY users
    const where = {
      role: {
        in: ['ADMIN', 'DELIVERY']
      }
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && ['ADMIN', 'DELIVERY'].includes(role)) {
      where.role = role;
    }

    // Get staff count for pagination
    const total = await prisma.user.count({ where });

    // Get staff
    const staff = await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(res, {
      staff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting staff:', error);
    return errorResponse(res, 'Error retrieving staff', 500);
  }
};

/**
 * Get staff by ID
 */
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!staff || !['ADMIN', 'DELIVERY'].includes(staff.role)) {
      return errorResponse(res, 'Staff member not found', 404);
    }

    return successResponse(res, { staff });
  } catch (error) {
    console.error('Error getting staff by ID:', error);
    return errorResponse(res, 'Error retrieving staff member', 500);
  }
};

/**
 * Create staff
 */
const createStaff = async (req, res) => {
  try {
    const { username, email, fullName, phone, role } = req.body;

    // Validate required fields
    if (!username || !fullName) {
      return errorResponse(res, 'Username and full name are required', 400);
    }

    // Validate role
    if (!['ADMIN', 'DELIVERY'].includes(role)) {
      return errorResponse(res, 'Invalid role. Must be ADMIN or DELIVERY', 400);
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return errorResponse(res, 'Username already exists', 400);
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingEmail) {
        return errorResponse(res, 'Email already exists', 400);
      }
    }

    // Generate a temporary password (should be changed on first login)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create new staff member
    const staff = await prisma.user.create({
      data: {
        username,
        email: email || null,
        fullName,
        phone: phone || null,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log the temporary password (in production, send via email)
    console.log(`New staff member created: ${username}`);
    console.log(`Temporary password: ${tempPassword}`);
    console.log(`⚠️  Please save this password and share it securely with the user`);

    return successResponse(res, {
      staff,
      message: 'Staff member created successfully',
      tempPassword: tempPassword // Include temp password in response for display
    }, 201);
  } catch (error) {
    console.error('Error creating staff:', error);
    return errorResponse(res, 'Error creating staff member', 500);
  }
};

/**
 * Update staff
 */
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, fullName, phone, role } = req.body;

    // Verify staff member exists
    const existingStaff = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingStaff || !['ADMIN', 'DELIVERY'].includes(existingStaff.role)) {
      return errorResponse(res, 'Staff member not found', 404);
    }

    // Validate role if provided
    if (role && !['ADMIN', 'DELIVERY'].includes(role)) {
      return errorResponse(res, 'Invalid role. Must be ADMIN or DELIVERY', 400);
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingStaff.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingEmail) {
        return errorResponse(res, 'Email already exists', 400);
      }
    }

    // Update staff member
    const updatedStaff = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(email && { email }),
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(role && { role }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(res, { staff: updatedStaff }, 200);
  } catch (error) {
    console.error('Error updating staff:', error);
    return errorResponse(res, 'Error updating staff member', 500);
  }
};

/**
 * Delete staff
 */
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify staff member exists
    const existingStaff = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingStaff || !['ADMIN', 'DELIVERY'].includes(existingStaff.role)) {
      return errorResponse(res, 'Staff member not found', 404);
    }

    // Prevent deleting the last admin
    if (existingStaff.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });

      if (adminCount <= 1) {
        return errorResponse(res, 'Cannot delete the last admin user', 400);
      }
    }

    // Delete the staff member
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    return successResponse(res, { message: 'Staff member deleted successfully' }, 200);
  } catch (error) {
    console.error('Error deleting staff:', error);
    return errorResponse(res, 'Error deleting staff member', 500);
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};
