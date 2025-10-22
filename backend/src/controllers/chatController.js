const { successResponse, errorResponse } = require('../utils/response');
const prisma = require('../config/database');
const ChatService = require('../services/chatService');

/**
 * Get conversations for the current user
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { page = 1, limit = 20, status = 'ACTIVE' } = req.query;
    const skip = (page - 1) * limit;

    // For admin and delivery users, show all conversations
    // For regular users, show only their conversations
    const whereClause = userRole === 'ADMIN' || userRole === 'DELIVERY' 
      ? { status }
      : {
          participants: {
            some: {
              userId,
              isActive: true,
            },
          },
          status,
        };

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                receiverId: userId,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const total = await prisma.conversation.count({
      where: whereClause,
    });

    return successResponse(res, {
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return errorResponse(res, 'Failed to fetch conversations', 500);
  }
};

/**
 * Get messages for a specific conversation
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Check if user is participant in this conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId,
        },
      },
    });

    if (!participant || !participant.isActive) {
      return errorResponse(res, 'Access denied to this conversation', 403);
    }

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: parseInt(conversationId) },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: parseInt(limit),
    });

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        conversationId: parseInt(conversationId),
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Update participant's last read time
    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });

    return successResponse(res, { messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return errorResponse(res, 'Failed to fetch messages', 500);
  }
};

/**
 * Send a message
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'TEXT', metadata } = req.body;
    const senderId = req.user.id;
    const userRole = req.user.role;

    // Check if user is participant in this conversation
    let participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId: senderId,
        },
      },
    });

    // If not a participant, check if user is admin/delivery and auto-join
    if (!participant || !participant.isActive) {
      if (['ADMIN', 'DELIVERY'].includes(userRole)) {
        // Auto-join admin/delivery users to conversations
        if (participant) {
          // Reactivate existing participant
          await prisma.conversationParticipant.update({
            where: { id: participant.id },
            data: { isActive: true, joinedAt: new Date() },
          });
        } else {
          // Create new participant
          await prisma.conversationParticipant.create({
            data: {
              conversationId: parseInt(conversationId),
              userId: senderId,
              role: userRole,
            },
          });
        }
      } else {
        return errorResponse(res, 'Access denied to this conversation', 403);
      }
    }

    // Get other participants to determine receiver
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: parseInt(conversationId),
        userId: { not: senderId },
        isActive: true,
      },
    });

    const receiverId = otherParticipants.length === 1 ? otherParticipants[0].userId : null;

    const message = await prisma.chatMessage.create({
      data: {
        conversationId: parseInt(conversationId),
        senderId,
        receiverId,
        content,
        messageType,
        metadata,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    // Update conversation's last message time
    await prisma.conversation.update({
      where: { id: parseInt(conversationId) },
      data: { lastMessageAt: new Date() },
    });

    // Emit socket event for real-time updates
    await ChatService.emitNewMessage(message);

    return successResponse(res, message, 'Message sent successfully');
  } catch (error) {
    console.error('Send message error:', error);
    return errorResponse(res, 'Failed to send message', 500);
  }
};

/**
 * Create a new conversation (for customers to start chat with store)
 */
const createConversation = async (req, res) => {
  try {
    const { title, type = 'SUPPORT' } = req.body;
    const userId = req.user.id;

    // Check if user already has an active support conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: 'SUPPORT',
        status: 'ACTIVE',
        participants: {
          some: {
            userId,
            isActive: true,
          },
        },
      },
    });

    if (existingConversation) {
      return successResponse(res, existingConversation, 'Existing conversation found');
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        title,
        type,
        participants: {
          create: {
            userId,
            role: 'PARTICIPANT',
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return successResponse(res, conversation, 'Conversation created successfully');
  } catch (error) {
    console.error('Create conversation error:', error);
    return errorResponse(res, 'Failed to create conversation', 500);
  }
};

/**
 * Join conversation (for admin/delivery staff)
 */
const joinConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only admin and delivery staff can join conversations
    if (!['ADMIN', 'DELIVERY'].includes(userRole)) {
      return errorResponse(res, 'Access denied', 403);
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId,
        },
      },
    });

    if (existingParticipant) {
      if (existingParticipant.isActive) {
        // Already a participant, just return success
        console.log(`User ${userId} is already a participant in conversation ${conversationId}`);
      } else {
        // Reactivate participant
        await prisma.conversationParticipant.update({
          where: { id: existingParticipant.id },
          data: { isActive: true, joinedAt: new Date() },
        });
      }
    } else {
      // Add as new participant
      await prisma.conversationParticipant.create({
        data: {
          conversationId: parseInt(conversationId),
          userId,
          role: userRole,
        },
      });
    }

    // Get updated conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: parseInt(conversationId) },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return successResponse(res, conversation, 'Joined conversation successfully');
  } catch (error) {
    console.error('Join conversation error:', error);
    return errorResponse(res, 'Failed to join conversation', 500);
  }
};

/**
 * Update conversation status (for admin)
 */
const updateConversationStatus = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status } = req.body;
    const userRole = req.user.role;

    // Only admin can update conversation status
    if (userRole !== 'ADMIN') {
      return errorResponse(res, 'Access denied', 403);
    }

    const updateData = {};
    if (status) updateData.status = status;

    const conversation = await prisma.conversation.update({
      where: { id: parseInt(conversationId) },
      data: updateData,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // Emit socket event for real-time updates
    await ChatService.emitConversationUpdate(conversation);

    return successResponse(res, conversation, 'Conversation updated successfully');
  } catch (error) {
    console.error('Update conversation error:', error);
    return errorResponse(res, 'Failed to update conversation', 500);
  }
};

/**
 * Get unread message count for user
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await prisma.chatMessage.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return successResponse(res, { unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    return errorResponse(res, 'Failed to get unread count', 500);
  }
};

/**
 * Mark messages as read for a conversation
 */
const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Mark all unread messages in this conversation as read
    await prisma.chatMessage.updateMany({
      where: {
        conversationId: parseInt(conversationId),
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Emit read status to other devices
    await ChatService.emitMessageRead(conversationId, null, userId);

    return successResponse(res, { success: true }, 'Messages marked as read');
  } catch (error) {
    console.error('Mark messages as read error:', error);
    return errorResponse(res, 'Failed to mark messages as read', 500);
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  joinConversation,
  updateConversationStatus,
  getUnreadCount,
  markMessagesAsRead,
};
