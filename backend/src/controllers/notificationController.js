const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');

/**
 * Get all notifications for current user (admin and user notifications)
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = '', type = '', limit = 50, offset = 0 } = req.query;

    const where = {
      OR: [
        { userId: userId }, // User's personal notifications
        { userId: null } // Broadcast/admin notifications
      ]
    };

    // Apply status filter
    if (status === 'unread') {
      where.isRead = false;
    } else if (status === 'read') {
      where.isRead = true;
    } else if (status === 'archived') {
      where.isArchived = true;
    }

    // Apply type filter (exclude archived by default unless specifically requested)
    if (type) {
      where.type = type;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.notification.count({ where });

    // Return as array with metadata (matches expected API response structure)
    const response = notifications.map(n => ({
      ...n,
      id: parseInt(n.id)
    }));

    return successResponse(res, response, 'Notifications retrieved successfully');
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse(res, 'Failed to retrieve notifications', 500);
  }
};

/**
 * Mark single notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    if (notification.userId !== userId && notification.userId !== null) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });

    return successResponse(res, updated, 'Notification marked as read');
  } catch (error) {
    console.error('Mark as read error:', error);
    return errorResponse(res, 'Failed to mark notification as read', 500);
  }
};

/**
 * Mark single notification as unread
 */
const markAsUnread = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    if (notification.userId !== userId && notification.userId !== null) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: false }
    });

    return successResponse(res, updated, 'Notification marked as unread');
  } catch (error) {
    console.error('Mark as unread error:', error);
    return errorResponse(res, 'Failed to mark notification as unread', 500);
  }
};

/**
 * Mark multiple notifications as read
 */
const markMultipleAsRead = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Invalid request: ids must be a non-empty array', 400);
    }

    // Verify ownership of all notifications
    const notifications = await prisma.notification.findMany({
      where: { id: { in: ids.map(id => parseInt(id)) } }
    });

    for (const notification of notifications) {
      if (notification.userId !== userId && notification.userId !== null) {
        return errorResponse(res, 'Unauthorized to update some notifications', 403);
      }
    }

    const updated = await prisma.notification.updateMany({
      where: { id: { in: ids.map(id => parseInt(id)) } },
      data: { isRead: true }
    });

    return successResponse(res, updated, `${updated.count} notifications marked as read`);
  } catch (error) {
    console.error('Mark multiple as read error:', error);
    return errorResponse(res, 'Failed to mark notifications as read', 500);
  }
};

/**
 * Mark multiple notifications as unread
 */
const markMultipleAsUnread = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Invalid request: ids must be a non-empty array', 400);
    }

    // Verify ownership of all notifications
    const notifications = await prisma.notification.findMany({
      where: { id: { in: ids.map(id => parseInt(id)) } }
    });

    for (const notification of notifications) {
      if (notification.userId !== userId && notification.userId !== null) {
        return errorResponse(res, 'Unauthorized to update some notifications', 403);
      }
    }

    const updated = await prisma.notification.updateMany({
      where: { id: { in: ids.map(id => parseInt(id)) } },
      data: { isRead: false }
    });

    return successResponse(res, updated, `${updated.count} notifications marked as unread`);
  } catch (error) {
    console.error('Mark multiple as unread error:', error);
    return errorResponse(res, 'Failed to mark notifications as unread', 500);
  }
};

/**
 * Archive single notification
 */
const archiveNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    if (notification.userId !== userId && notification.userId !== null) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isArchived: true }
    });

    return successResponse(res, updated, 'Notification archived');
  } catch (error) {
    console.error('Archive notification error:', error);
    return errorResponse(res, 'Failed to archive notification', 500);
  }
};

/**
 * Archive multiple notifications
 */
const archiveMultiple = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Invalid request: ids must be a non-empty array', 400);
    }

    // Verify ownership of all notifications
    const notifications = await prisma.notification.findMany({
      where: { id: { in: ids.map(id => parseInt(id)) } }
    });

    for (const notification of notifications) {
      if (notification.userId !== userId && notification.userId !== null) {
        return errorResponse(res, 'Unauthorized to update some notifications', 403);
      }
    }

    const updated = await prisma.notification.updateMany({
      where: { id: { in: ids.map(id => parseInt(id)) } },
      data: { isArchived: true }
    });

    return successResponse(res, updated, `${updated.count} notifications archived`);
  } catch (error) {
    console.error('Archive multiple error:', error);
    return errorResponse(res, 'Failed to archive notifications', 500);
  }
};

/**
 * Unarchive single notification
 */
const unarchiveNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    if (notification.userId !== userId && notification.userId !== null) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isArchived: false }
    });

    return successResponse(res, updated, 'Notification unarchived');
  } catch (error) {
    console.error('Unarchive notification error:', error);
    return errorResponse(res, 'Failed to unarchive notification', 500);
  }
};

/**
 * Delete single notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    if (notification.userId !== userId && notification.userId !== null) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });

    return successResponse(res, null, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    return errorResponse(res, 'Failed to delete notification', 500);
  }
};

/**
 * Delete multiple notifications
 */
const deleteMultiple = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Invalid request: ids must be a non-empty array', 400);
    }

    // Verify ownership of all notifications
    const notifications = await prisma.notification.findMany({
      where: { id: { in: ids.map(id => parseInt(id)) } }
    });

    for (const notification of notifications) {
      if (notification.userId !== userId && notification.userId !== null) {
        return errorResponse(res, 'Unauthorized to delete some notifications', 403);
      }
    }

    const deleted = await prisma.notification.deleteMany({
      where: { id: { in: ids.map(id => parseInt(id)) } }
    });

    return successResponse(res, deleted, `${deleted.count} notifications deleted successfully`);
  } catch (error) {
    console.error('Delete multiple error:', error);
    return errorResponse(res, 'Failed to delete notifications', 500);
  }
};

/**
 * Get notification preferences for current user
 */
const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
          orderUpdates: true,
          systemAlerts: true,
          marketing: false,
          securityAlerts: true
        }
      });
    }

    return successResponse(res, preferences, 'Notification preferences retrieved successfully');
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return errorResponse(res, 'Failed to retrieve notification preferences', 500);
  }
};

/**
 * Save notification preferences
 */
const saveNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      emailEnabled,
      pushEnabled,
      smsEnabled,
      orderUpdates,
      systemAlerts,
      marketing,
      securityAlerts
    } = req.body;

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (preferences) {
      preferences = await prisma.notificationPreference.update({
        where: { userId },
        data: {
          emailEnabled: emailEnabled ?? preferences.emailEnabled,
          pushEnabled: pushEnabled ?? preferences.pushEnabled,
          smsEnabled: smsEnabled ?? preferences.smsEnabled,
          orderUpdates: orderUpdates ?? preferences.orderUpdates,
          systemAlerts: systemAlerts ?? preferences.systemAlerts,
          marketing: marketing ?? preferences.marketing,
          securityAlerts: securityAlerts ?? preferences.securityAlerts
        }
      });
    } else {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          emailEnabled: emailEnabled ?? true,
          pushEnabled: pushEnabled ?? true,
          smsEnabled: smsEnabled ?? false,
          orderUpdates: orderUpdates ?? true,
          systemAlerts: systemAlerts ?? true,
          marketing: marketing ?? false,
          securityAlerts: securityAlerts ?? true
        }
      });
    }

    return successResponse(res, preferences, 'Notification preferences saved successfully');
  } catch (error) {
    console.error('Save notification preferences error:', error);
    return errorResponse(res, 'Failed to save notification preferences', 500);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAsUnread,
  markMultipleAsRead,
  markMultipleAsUnread,
  archiveNotification,
  archiveMultiple,
  unarchiveNotification,
  deleteNotification,
  deleteMultiple,
  getNotificationPreferences,
  saveNotificationPreferences
};
