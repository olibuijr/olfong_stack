import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLanguage } from "../../contexts/LanguageContext";
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import socketService from '../../services/socket';
import api from '../../services/api';

import './ChatWidget.css';

const ChatWidget = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Widget state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  // Chat state
  const [currentConversation, setCurrentConversation] = useState(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [selectedTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  
  // Initialize chat
  const initializeChat = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const response = await api.get('/chat/conversations');
      
      // Set first conversation as current if available
      if (response.data.length > 0) {
        setCurrentConversation(response.data[0]);
        await loadMessages(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;

    const messageData = {
      content: newMessage.trim(),
      messageType: 'TEXT'
    };

    try {
      const response = await api.post(`/chat/conversations/${currentConversation.id}/messages`, messageData);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle typing
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      // Typing timeout
    }, 1000);
  };

  // Effects
  useEffect(() => {
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversation]);

  // Socket effects
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleNewMessage = (data) => {
      const message = data.message || data;
      if (message.conversationId === currentConversation?.id) {
        setMessages(prev => [...prev, message]);
      }
      setUnreadCount(prev => prev + 1);
    };

    const handleTypingStatus = (data) => {
      if (data.conversationId === currentConversation?.id) {
        setOtherUserTyping(data.isTyping);
      }
    };

    socketService.on('new-message', handleNewMessage);
    socketService.on('user-typing', handleTypingStatus);

    return () => {
      socketService.off('new-message', handleNewMessage);
      socketService.off('user-typing', handleTypingStatus);
    };
  }, [isAuthenticated, currentConversation]);

  // Don't show chat widget on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-6 right-6 z-50 md:bottom-4 md:right-4">
        <button
          onClick={() => navigate('/login')}
          className="bg-primary-600 dark:bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 dark:hover:bg-primary-600 active:scale-95 transition-all duration-200 hover:shadow-xl"
          aria-label={t('chat.title')}
        >
          <MessageCircle size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 z-50 md:bottom-6 md:right-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 dark:bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 dark:hover:bg-primary-600 active:scale-95 transition-all duration-200 hover:shadow-xl relative"
          aria-label={t('chat.title')}
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold animate-pulse" aria-label={`${unreadCount} unread messages`}>
              {unreadCount}
            </span>
          )}
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-96 max-w-[calc(100vw-2rem)] h-[500px] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 text-white p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <MessageCircle size={18} />
              </div>
              <h3 className="font-semibold text-lg">{t('chat.title')}</h3>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                          message.senderId === user?.id
                            ? 'bg-primary-600 dark:bg-primary-700 text-white rounded-br-none shadow-sm'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none shadow-sm border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p className={`text-xs mt-1 opacity-70 ${
                          message.senderId === user?.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {otherUserTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-xl rounded-bl-none shadow-sm border border-gray-200 dark:border-gray-600">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={t('chat.typeMessage')}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition-all duration-200 active:scale-95"
                    aria-label="Send message"
                  >
                    <Send size={18} />
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