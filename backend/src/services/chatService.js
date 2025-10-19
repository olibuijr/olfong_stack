const prisma = require('../config/database');

class ChatService {
  static io = null;

  static setIO(ioInstance) {
    this.io = ioInstance;
  }
  /**
   * Emit new message to conversation participants
   */
  static async emitNewMessage(message) {
    try {
      // Get conversation participants
      const participants = await prisma.conversationParticipant.findMany({
        where: {
          conversationId: message.conversationId,
          isActive: true,
        },
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
      });

      if (!this.io) return;

      // Emit to conversation room
      this.io.to(`conversation-${message.conversationId}`).emit('new-message', {
        message,
        conversationId: message.conversationId,
      });

      // Emit to individual user rooms for notifications
      participants.forEach(participant => {
        if (participant.userId !== message.senderId) {
          this.io.to(`user-${participant.userId}`).emit('chat-notification', {
            message,
            conversationId: message.conversationId,
            unreadCount: 1,
          });
        }
      });

      // Notify admin room if message is from customer
      const sender = await prisma.user.findUnique({
        where: { id: message.senderId },
        select: { role: true },
      });

      if (sender?.role === 'CUSTOMER') {
        this.io.to('admin-room').emit('new-customer-message', {
          message,
          conversationId: message.conversationId,
        });
      }

      console.log(`New message emitted to conversation ${message.conversationId}`);
    } catch (error) {
      console.error('Error emitting new message:', error);
    }
  }

  /**
   * Emit conversation status update
   */
  static async emitConversationUpdate(conversation) {
    try {
      // Get conversation participants
      const participants = await prisma.conversationParticipant.findMany({
        where: {
          conversationId: conversation.id,
          isActive: true,
        },
      });

      if (!this.io) return;

      // Emit to conversation room
      this.io.to(`conversation-${conversation.id}`).emit('conversation-updated', {
        conversation,
      });

      // Emit to individual user rooms
      participants.forEach(participant => {
        this.io.to(`user-${participant.userId}`).emit('conversation-updated', {
          conversation,
        });
      });

      // Emit to admin room
      this.io.to('admin-room').emit('conversation-updated', {
        conversation,
      });

      console.log(`Conversation update emitted for conversation ${conversation.id}`);
    } catch (error) {
      console.error('Error emitting conversation update:', error);
    }
  }

  /**
   * Emit typing indicator
   */
  static emitTypingIndicator(conversationId, userId, isTyping) {
    try {
      if (!this.io) return;
      this.io.to(`conversation-${conversationId}`).emit('user-typing', {
        userId,
        isTyping,
        conversationId,
      });
    } catch (error) {
      console.error('Error emitting typing indicator:', error);
    }
  }

  /**
   * Emit message read status
   */
  static async emitMessageRead(conversationId, messageId, userId) {
    try {
      if (!this.io) return;
      this.io.to(`conversation-${conversationId}`).emit('message-read', {
        messageId,
        userId,
        conversationId,
        readAt: new Date(),
      });
    } catch (error) {
      console.error('Error emitting message read status:', error);
    }
  }

  /**
   * Get conversation participants for notifications
   */
  static async getConversationParticipants(conversationId) {
    try {
      return await prisma.conversationParticipant.findMany({
        where: {
          conversationId,
          isActive: true,
        },
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
      });
    } catch (error) {
      console.error('Error getting conversation participants:', error);
      return [];
    }
  }
}

module.exports = ChatService;
