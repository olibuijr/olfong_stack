const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  joinConversation,
  updateConversationStatus,
  getUnreadCount,
} = require('../controllers/chatController');

const router = express.Router();

// Validation middleware
const sendMessageValidation = [
  body('content').notEmpty().withMessage('Message content is required'),
  body('messageType').optional().isIn(['TEXT', 'IMAGE', 'FILE', 'SYSTEM']).withMessage('Invalid message type'),
];

const createConversationValidation = [
  body('title').optional().isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
  body('type').optional().isIn(['SUPPORT', 'ADMIN', 'DELIVERY']).withMessage('Invalid conversation type'),
  body('priority').optional().isIn(['LOW', 'NORMAL', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
];

const updateConversationValidation = [
  body('status').optional().isIn(['ACTIVE', 'ARCHIVED', 'RESOLVED']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'NORMAL', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
];

// All routes require authentication
router.use(authenticate);

// Get user's conversations
router.get('/conversations', getConversations);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Create new conversation (for customers)
router.post('/conversations', createConversationValidation, validate, createConversation);

// Join conversation (for admin/delivery)
router.post('/conversations/:conversationId/join', joinConversation);

// Update conversation status (for admin)
router.patch('/conversations/:conversationId', updateConversationValidation, validate, updateConversationStatus);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Send message
router.post('/conversations/:conversationId/messages', sendMessageValidation, validate, sendMessage);

module.exports = router;
