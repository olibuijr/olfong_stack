import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  Smile, 
  Minimize2, 
  Maximize2,
  Circle,
  MoreVertical,
  Phone,
  Video,
  Search,
  Archive,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import socketService from '../../services/socket';
import api from '../../services/api';
import './ChatWidget.css';

const ChatWidget = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Widget state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  // Chat state
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when widget opens
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      // Connect to socket service
      socketService.connect();
      initializeChat();
    }
  }, [isOpen, isAuthenticated, user]);

  // Socket event listeners
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // New message received
    const handleNewMessage = (data) => {
      const { message, conversationId } = data;
      
      if (currentConversation?.id === conversationId) {
        setMessages(prev => [...prev, message]);
      }
      
      // Update conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessageAt: message.createdAt, messages: [message] }
            : conv
        )
      );
      
      // Update unread count
      if (user && message.senderId !== user.id) {
        setUnreadCount(prev => prev + 1);
        toast.success(t('chat.newMessage'));
      }
    };

    // User typing indicator
    const handleUserTyping = (data) => {
      if (user && data.userId !== user.id) {
        setOtherUserTyping(data.isTyping);
      }
    };

    // Conversation updates
    const handleConversationUpdate = (data) => {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === data.conversation.id ? data.conversation : conv
        )
      );
    };

    socketService.on('new-message', handleNewMessage);
    socketService.on('user-typing', handleUserTyping);
    socketService.on('conversation-updated', handleConversationUpdate);

    return () => {
      socketService.removeListener('new-message', handleNewMessage);
      socketService.removeListener('user-typing', handleUserTyping);
      socketService.removeListener('conversation-updated', handleConversationUpdate);
    };
  }, [isAuthenticated, currentConversation, user, t]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      console.log('Initializing chat for user:', user);
      
      // Get user's conversations
      const conversationsResponse = await api.get('/chat/conversations');
      console.log('Conversations response:', conversationsResponse.data);
      setConversations(conversationsResponse.data.conversations);
      
      // Get unread count
      const unreadResponse = await api.get('/chat/unread-count');
      setUnreadCount(unreadResponse.data.unreadCount);
      
      // If no conversations, create a new one for all users
      if (conversationsResponse.data.conversations.length === 0) {
        console.log('No conversations found, creating new one');
        await createNewConversation();
      } else if (conversationsResponse.data.conversations.length > 0) {
        // Load the most recent conversation
        const recentConv = conversationsResponse.data.conversations[0];
        console.log('Loading recent conversation:', recentConv);
        setCurrentConversation(recentConv);
        await loadMessages(recentConv.id);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error(t('chat.initializationError'));
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      console.log('Creating new conversation for user:', user);
      const response = await api.post('/chat/conversations', {
        title: t('chat.supportChat'),
        type: 'SUPPORT',
        priority: 'NORMAL'
      });
      
      const newConversation = response.data;
      console.log('New conversation created:', newConversation);
      setCurrentConversation(newConversation);
      setConversations([newConversation]);
      setMessages([]);
      
      // Join conversation room
      if (socketService.isSocketConnected()) {
        socketService.emit('join-conversation', newConversation.id);
      } else {
        console.warn('Socket not connected, cannot join conversation room');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error(t('chat.createConversationError'));
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(response.data.messages);
      
      // Join conversation room
      if (socketService.isSocketConnected()) {
        socketService.emit('join-conversation', conversationId);
      } else {
        console.warn('Socket not connected, cannot join conversation room');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error(t('chat.loadMessagesError'));
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    try {
      const response = await api.post(`/chat/conversations/${currentConversation.id}/messages`, {
        content: newMessage.trim(),
        messageType: 'TEXT'
      });

      const message = response.data;
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Clear typing indicator
      setIsTyping(false);
      if (user && socketService.isSocketConnected()) {
        socketService.emit('typing-stop', {
          conversationId: currentConversation.id,
          userId: user.id
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('chat.sendMessageError'));
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && currentConversation && user && socketService.isSocketConnected()) {
      setIsTyping(true);
      socketService.emit('typing-start', {
        conversationId: currentConversation.id,
        userId: user.id
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (currentConversation && user && socketService.isSocketConnected()) {
        socketService.emit('typing-stop', {
          conversationId: currentConversation.id,
          userId: user.id
        });
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('chat.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('chat.yesterday');
    } else {
      return date.toLocaleDateString();
    }
  };

  const getOtherParticipant = () => {
    if (!currentConversation || !user) return null;
    return currentConversation.participants.find(p => p.userId !== user.id)?.user;
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="chat-widget">
      {/* Chat Button */}
      <button 
        className={`chat-button ${isOpen ? 'open' : ''}`}
        onClick={toggleWidget}
        title={t('chat.openChat')}
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <span className="chat-notification-badge">{unreadCount}</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <MessageCircle size={20} />
              </div>
              <div className="chat-header-text">
                <h3>{t('chat.support')}</h3>
                {otherUserTyping && (
                  <p className="typing-indicator">{t('chat.typing')}</p>
                )}
              </div>
            </div>
            <div className="chat-header-actions">
              <button 
                onClick={toggleMinimize}
                className="chat-action-btn"
                title={isMinimized ? t('chat.maximize') : t('chat.minimize')}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button 
                onClick={toggleWidget}
                className="chat-action-btn"
                title={t('chat.close')}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="chat-messages">
                {isLoading ? (
                  <div className="chat-loading">
                    <div className="loading-spinner"></div>
                    <p>{t('chat.loading')}</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`message ${user && message.senderId === user.id ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <p>{message.content}</p>
                          <span className="message-time">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="chat-input">
                <div className="chat-input-container">
                  <button className="chat-input-action" title={t('chat.attachFile')}>
                    <Paperclip size={16} />
                  </button>
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder={currentConversation ? t('chat.typeMessage') : t('chat.initializing')}
                    className="chat-textarea"
                    rows={1}
                    disabled={isLoading}
                  />
                  <button 
                    className="chat-input-action" 
                    title={t('chat.emoji')}
                  >
                    <Smile size={16} />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !currentConversation || isLoading}
                    className="chat-send-btn"
                    title={t('chat.send')}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
