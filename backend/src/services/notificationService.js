const prisma = require('../config/database');

class NotificationService {
  /**
   * Create a new notification
   * @param {Object} data - Notification data
   * @param {string} data.type - Notification type (order, payment, delivery, system, security, marketing)
   * @param {string} data.priority - Priority level (high, medium, low)
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @param {number|null} data.userId - User ID (null for broadcast)
   * @param {Object} data.metadata - Additional metadata
   * @returns {Promise<Object>} Created notification
   */
  static async createNotification({
    type,
    priority = 'medium',
    title,
    message,
    userId = null,
    metadata = null
  }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type,
          priority,
          title,
          message,
          userId,
          metadata
        }
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create order notification
   */
  static async createOrderNotification(orderId, userId, status, orderNumber) {
    try {
      let title, message, priority = 'medium';

      switch (status) {
        case 'PENDING':
          title = 'New Order Received';
          message = `Order #${orderNumber} has been placed and is pending confirmation`;
          priority = 'high';
          break;
        case 'CONFIRMED':
          title = 'Order Confirmed';
          message = `Order #${orderNumber} has been confirmed and is being prepared`;
          break;
        case 'PREPARING':
          title = 'Order Being Prepared';
          message = `Order #${orderNumber} is being prepared for delivery`;
          break;
        case 'OUT_FOR_DELIVERY':
          title = 'Order Out for Delivery';
          message = `Order #${orderNumber} is now out for delivery`;
          priority = 'medium';
          break;
        case 'DELIVERED':
          title = 'Order Delivered';
          message = `Order #${orderNumber} has been successfully delivered`;
          break;
        case 'CANCELLED':
          title = 'Order Cancelled';
          message = `Order #${orderNumber} has been cancelled`;
          priority = 'medium';
          break;
        default:
          return null;
      }

      return await this.createNotification({
        type: 'order',
        priority,
        title,
        message,
        userId,
        metadata: {
          orderId,
          orderNumber,
          status
        }
      });
    } catch (error) {
      console.error('Error creating order notification:', error);
      throw error;
    }
  }

  /**
   * Create payment notification
   */
  static async createPaymentNotification(orderId, orderNumber, status, userId) {
    try {
      let title, message, priority = 'high';

      switch (status) {
        case 'COMPLETED':
          title = 'Payment Successful';
          message = `Payment for Order #${orderNumber} has been processed successfully`;
          priority = 'medium';
          break;
        case 'FAILED':
          title = 'Payment Failed';
          message = `Payment for Order #${orderNumber} failed. Please update your payment method.`;
          priority = 'high';
          break;
        case 'PENDING':
          title = 'Payment Pending';
          message = `Payment for Order #${orderNumber} is pending`;
          break;
        case 'REFUNDED':
          title = 'Refund Processed';
          message = `Refund for Order #${orderNumber} has been processed`;
          priority = 'medium';
          break;
        default:
          return null;
      }

      return await this.createNotification({
        type: 'payment',
        priority,
        title,
        message,
        userId,
        metadata: {
          orderId,
          orderNumber,
          status
        }
      });
    } catch (error) {
      console.error('Error creating payment notification:', error);
      throw error;
    }
  }

  /**
   * Create delivery notification
   */
  static async createDeliveryNotification(orderId, orderNumber, status, userId) {
    try {
      let title, message, priority = 'medium';

      switch (status) {
        case 'SCHEDULED':
          title = 'Delivery Scheduled';
          message = `Delivery for Order #${orderNumber} has been scheduled`;
          break;
        case 'PROCESSING':
          title = 'Delivery Processing';
          message = `Order #${orderNumber} is being processed for delivery`;
          break;
        case 'DELIVERED':
          title = 'Delivery Completed';
          message = `Order #${orderNumber} has been delivered`;
          break;
        case 'FAILED':
          title = 'Delivery Failed';
          message = `Delivery for Order #${orderNumber} failed. We will try again soon.`;
          priority = 'high';
          break;
        case 'SKIPPED':
          title = 'Delivery Skipped';
          message = `Delivery for Order #${orderNumber} has been skipped`;
          break;
        default:
          return null;
      }

      return await this.createNotification({
        type: 'delivery',
        priority,
        title,
        message,
        userId,
        metadata: {
          orderId,
          orderNumber,
          status
        }
      });
    } catch (error) {
      console.error('Error creating delivery notification:', error);
      throw error;
    }
  }

  /**
   * Create system notification (broadcast to all admins)
   */
  static async createSystemNotification(title, message, priority = 'medium', metadata = null) {
    try {
      return await this.createNotification({
        type: 'system',
        priority,
        title,
        message,
        userId: null, // Broadcast to admins
        metadata
      });
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw error;
    }
  }

  /**
   * Create security notification (broadcast to all admins)
   */
  static async createSecurityNotification(title, message, metadata = null) {
    try {
      return await this.createNotification({
        type: 'security',
        priority: 'high',
        title,
        message,
        userId: null, // Broadcast to admins
        metadata
      });
    } catch (error) {
      console.error('Error creating security notification:', error);
      throw error;
    }
  }

  /**
   * Create marketing notification
   */
  static async createMarketingNotification(title, message, userId = null) {
    try {
      return await this.createNotification({
        type: 'marketing',
        priority: 'low',
        title,
        message,
        userId,
        metadata: null
      });
    } catch (error) {
      console.error('Error creating marketing notification:', error);
      throw error;
    }
  }

  /**
   * Create low stock alert
   */
  static async createLowStockAlert(productId, productName, stockLevel) {
    try {
      return await this.createSystemNotification(
        'Low Stock Alert',
        `${productName} is running low with only ${stockLevel} items remaining`,
        'medium',
        { productId, productName, stockLevel }
      );
    } catch (error) {
      console.error('Error creating low stock alert:', error);
      throw error;
    }
  }

  /**
   * Create subscription notification
   */
  static async createSubscriptionNotification(subscriptionId, userId, status) {
    try {
      let title, message, priority = 'medium';

      switch (status) {
        case 'ACTIVE':
          title = 'Subscription Activated';
          message = 'Your subscription has been activated and will renew automatically';
          break;
        case 'PAUSED':
          title = 'Subscription Paused';
          message = 'Your subscription has been paused';
          break;
        case 'CANCELLED':
          title = 'Subscription Cancelled';
          message = 'Your subscription has been cancelled';
          break;
        default:
          return null;
      }

      return await this.createNotification({
        type: 'order',
        priority,
        title,
        message,
        userId,
        metadata: { subscriptionId, status }
      });
    } catch (error) {
      console.error('Error creating subscription notification:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    try {
      return await prisma.notification.updateMany({
        where: {
          OR: [
            { userId },
            { userId: null }
          ],
          isRead: false,
          isArchived: false
        },
        data: { isRead: true }
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Get unread count for user
   */
  static async getUnreadCount(userId) {
    try {
      return await prisma.notification.count({
        where: {
          OR: [
            { userId },
            { userId: null }
          ],
          isRead: false,
          isArchived: false
        }
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Clean up old archived notifications (older than 30 days)
   */
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      return await prisma.notification.deleteMany({
        where: {
          isArchived: true,
          createdAt: { lt: cutoffDate }
        }
      });
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
