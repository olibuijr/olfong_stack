const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
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
} = require('../controllers/notificationController');

// All routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', getNotifications);

// Get notification preferences
router.get('/preferences/settings', getNotificationPreferences);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Mark single notification as unread
router.put('/:id/unread', markAsUnread);

// Mark multiple as read
router.post('/bulk/read', markMultipleAsRead);

// Mark multiple as unread
router.post('/bulk/unread', markMultipleAsUnread);

// Archive single notification
router.put('/:id/archive', archiveNotification);

// Archive multiple
router.post('/bulk/archive', archiveMultiple);

// Unarchive single notification
router.put('/:id/unarchive', unarchiveNotification);

// Delete single notification
router.delete('/:id', deleteNotification);

// Delete multiple
router.post('/bulk/delete', deleteMultiple);

// Save notification preferences
router.post('/preferences/settings', saveNotificationPreferences);

module.exports = router;
