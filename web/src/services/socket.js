import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      // Connect to the backend server via proxy for Socket.IO
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      // Remove /api from the URL for Socket.IO connection
      const backendUrl = apiUrl.replace('/api', '');
      this.socket = io(backendUrl, {
        transports: ['websocket'],
        timeout: 20000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('Connected to server');
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('Disconnected from server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.isConnected = false;
      });

      this.socket.on('connect_timeout', () => {
        console.error('Connection timeout');
        this.isConnected = false;
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join user room for notifications
  joinUserRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-user-room', userId);
    }
  }

  // Join admin room
  joinAdminRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-admin-room');
    }
  }

  // Join delivery room
  joinDeliveryRoom(deliveryPersonId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-delivery-room', deliveryPersonId);
    }
  }

  // Listen for order status updates
  onOrderStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('order-status-update', callback);
    }
  }

  // Listen for delivery location updates
  onDeliveryLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('delivery-location-update', callback);
    }
  }

  // Update location (for delivery personnel)
  updateLocation(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('location-update', data);
    }
  }

  // Update order status
  updateOrderStatus(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('order-status-update', data);
    }
  }

  // Chat-specific methods
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-conversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-conversation', conversationId);
    }
  }

  emitTypingStart(conversationId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-start', { conversationId, userId });
    }
  }

  emitTypingStop(conversationId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-stop', { conversationId, userId });
    }
  }

  // Listen for chat events
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onConversationUpdate(callback) {
    if (this.socket) {
      this.socket.on('conversation-updated', callback);
    }
  }

  // Generic on method for any event
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  onChatNotification(callback) {
    if (this.socket) {
      this.socket.on('chat-notification', callback);
    }
  }

  // Remove event listeners
  removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Alias for removeListener to match Socket.IO API
  off(event, callback) {
    this.removeListener(event, callback);
  }

  // Generic emit method
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Socket not connected. Cannot emit event: ${event}`);
    }
  }

  // Check if socket is connected
  isSocketConnected() {
    return this.socket && this.isConnected;
  }
}

export default new SocketService();

