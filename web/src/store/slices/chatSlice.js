import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for chat operations
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (params = {}) => {
    const response = await api.get('/chat/conversations', { params });
    return response.data?.data || response.data;
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data?.data || response.data;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content, messageType = 'TEXT', metadata }) => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
      content,
      messageType,
      metadata
    });
    return response.data.data;
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (conversationData) => {
    const response = await api.post('/chat/conversations', conversationData);
    return response.data.data;
  }
);

export const joinConversation = createAsyncThunk(
  'chat/joinConversation',
  async (conversationId) => {
    const response = await api.post(`/chat/conversations/${conversationId}/join`);
    return response.data.data;
  }
);

export const updateConversationStatus = createAsyncThunk(
  'chat/updateConversationStatus',
  async ({ conversationId, status, priority }) => {
    const response = await api.patch(`/chat/conversations/${conversationId}`, {
      status,
      priority
    });
    return response.data.data;
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'chat/fetchUnreadCount',
  async () => {
    const response = await api.get('/chat/unread-count');
    return response.data.unreadCount;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    currentConversation: null,
    messages: [],
    unreadCount: 0,
    isLoading: false,
    isTyping: false,
    otherUserTyping: false,
    error: null,
    // UI state
    isWidgetOpen: false,
    isWidgetMinimized: false,
    // Filters and pagination
    filters: {
      status: 'ACTIVE',
      type: '',
      priority: ''
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  },
  reducers: {
    // UI actions
    toggleWidget: (state) => {
      state.isWidgetOpen = !state.isWidgetOpen;
      if (state.isWidgetOpen) {
        state.isWidgetMinimized = false;
      }
    },
    minimizeWidget: (state) => {
      state.isWidgetMinimized = !state.isWidgetMinimized;
    },
    closeWidget: (state) => {
      state.isWidgetOpen = false;
      state.isWidgetMinimized = false;
    },
    
    // Conversation actions
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
      state.messages = [];
    },
    
    // Message actions
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action) => {
      const { messageId, updates } = action.payload;
      const messageIndex = state.messages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        state.messages[messageIndex] = { ...state.messages[messageIndex], ...updates };
      }
    },
    markMessageAsRead: (state, action) => {
      const messageId = action.payload;
      const message = state.messages.find(msg => msg.id === messageId);
      if (message) {
        message.isRead = true;
        message.readAt = new Date().toISOString();
      }
    },
    
    // Typing indicators
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    setOtherUserTyping: (state, action) => {
      state.otherUserTyping = action.payload;
    },
    
    // Real-time updates
    handleNewMessage: (state, action) => {
      const { message, conversationId } = action.payload;
      
      // Add message to current conversation if it matches
      if (state.currentConversation?.id === conversationId) {
        state.messages.push(message);
      }
      
      // Update conversation in list
      const conversationIndex = state.conversations.findIndex(conv => conv.id === conversationId);
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessageAt = message.createdAt;
        state.conversations[conversationIndex].messages = [message];
      }
      
      // Update unread count if message is from another user
      if (message.senderId !== action.payload.currentUserId) {
        state.unreadCount += 1;
      }
    },
    
    handleConversationUpdate: (state, action) => {
      const updatedConversation = action.payload;
      const index = state.conversations.findIndex(conv => conv.id === updatedConversation.id);
      if (index !== -1) {
        state.conversations[index] = updatedConversation;
      }
      
      // Update current conversation if it matches
      if (state.currentConversation?.id === updatedConversation.id) {
        state.currentConversation = updatedConversation;
      }
    },
    
    handleUserTyping: (state, action) => {
      const { userId, isTyping, currentUserId } = action.payload;
      if (userId !== currentUserId) {
        state.otherUserTyping = isTyping;
      }
    },
    
    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    
    clearFilters: (state) => {
      state.filters = {
        status: 'ACTIVE',
        type: '',
        priority: ''
      };
      state.pagination.page = 1;
    },
    
    // Pagination
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset state
    resetChat: (state) => {
      state.conversations = [];
      state.currentConversation = null;
      state.messages = [];
      state.unreadCount = 0;
      state.isWidgetOpen = false;
      state.isWidgetMinimized = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.conversations;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.error.message;
      })
      
      // Create conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
        state.currentConversation = action.payload;
        state.messages = [];
      })
      
      // Join conversation
      .addCase(joinConversation.fulfilled, (state, action) => {
        const updatedConversation = action.payload;
        const index = state.conversations.findIndex(conv => conv.id === updatedConversation.id);
        if (index !== -1) {
          state.conversations[index] = updatedConversation;
        }
      })
      
      // Update conversation status
      .addCase(updateConversationStatus.fulfilled, (state, action) => {
        const updatedConversation = action.payload;
        const index = state.conversations.findIndex(conv => conv.id === updatedConversation.id);
        if (index !== -1) {
          state.conversations[index] = updatedConversation;
        }
        
        if (state.currentConversation?.id === updatedConversation.id) {
          state.currentConversation = updatedConversation;
        }
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  }
});

export const {
  toggleWidget,
  minimizeWidget,
  closeWidget,
  setCurrentConversation,
  addMessage,
  updateMessage,
  markMessageAsRead,
  setTyping,
  setOtherUserTyping,
  handleNewMessage,
  handleConversationUpdate,
  handleUserTyping,
  setFilters,
  clearFilters,
  setPage,
  clearError,
  resetChat
} = chatSlice.actions;

export default chatSlice.reducer;
