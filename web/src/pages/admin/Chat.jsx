import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  MessageCircle,
  Send,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Video,
  Archive,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Users,
  Settings,
  Minimize2,
  Maximize2,
  X,
  Paperclip,
  Smile,
  Circle,
  Eye,
  EyeOff,
  Star,
  Flag,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  fetchConversations, 
  fetchMessages, 
  sendMessage, 
  joinConversation, 
  updateConversationStatus,
  setCurrentConversation,
  handleNewMessage,
  handleUserTyping,
  setOtherUserTyping
} from '../../store/slices/chatSlice';
import socketService from '../../services/socket';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminChat = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    conversations, 
    currentConversation, 
    messages, 
    isLoading, 
    isTyping,
    otherUserTyping,
    error 
  } = useSelector((state) => state.chat);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConversationSettings, setShowConversationSettings] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isFullscreen]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isFullscreen]);

  // Check if user is admin or delivery
  const canManageChat = user?.role === 'ADMIN' || user?.role === 'DELIVERY';

  useEffect(() => {
    if (canManageChat) {
      loadConversations();
    }
  }, [canManageChat]);

  // Socket event listeners
  useEffect(() => {
    if (!canManageChat) return;

    const handleNewMessage = (data) => {
      dispatch(handleNewMessage({ ...data, currentUserId: user.id }));
      
      // Show notification for new customer messages
      if (data.message.sender.role === 'CUSTOMER') {
        toast.success(t('adminChat.newCustomerMessage', { 
          customer: data.message.sender.fullName || data.message.sender.username 
        }));
      }
    };

    const handleUserTyping = (data) => {
      dispatch(setOtherUserTyping(data.isTyping));
    };

    const handleConversationUpdate = (data) => {
      // Handle conversation updates
      console.log('Conversation updated:', data);
    };

    socketService.on('new-message', handleNewMessage);
    socketService.on('user-typing', handleUserTyping);
    socketService.on('conversation-updated', handleConversationUpdate);
    socketService.on('new-customer-message', (data) => {
      toast.success(t('adminChat.newCustomerMessage', { 
        customer: data.message.sender.fullName || data.message.sender.username 
      }));
    });

    return () => {
      socketService.removeListener('new-message', handleNewMessage);
      socketService.removeListener('user-typing', handleUserTyping);
      socketService.removeListener('conversation-updated', handleConversationUpdate);
    };
  }, [canManageChat, user.id, dispatch, t]);

  const loadConversations = async () => {
    try {
      await dispatch(fetchConversations({
        status: statusFilter,
        page: 1,
        limit: 50
      })).unwrap();
    } catch (error) {
      toast.error(t('adminChat.loadConversationsError'));
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    dispatch(setCurrentConversation(conversation));
    
    try {
      await dispatch(fetchMessages(conversation.id)).unwrap();
      
      // Join conversation room
      socketService.joinConversation(conversation.id);
      
      // Join conversation as admin/delivery
      await dispatch(joinConversation(conversation.id)).unwrap();
    } catch (error) {
      toast.error(t('adminChat.joinConversationError'));
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;

    try {
      await dispatch(sendMessage({
        conversationId: currentConversation.id,
        content: newMessage.trim(),
        messageType: 'TEXT'
      })).unwrap();
      
      setNewMessage('');
      setIsTyping(false);
      
      if (currentConversation) {
        socketService.emitTypingStop(currentConversation.id, user.id);
      }
    } catch (error) {
      toast.error(t('adminChat.sendMessageError'));
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && currentConversation) {
      dispatch(setOtherUserTyping(true));
      socketService.emitTypingStart(currentConversation.id, user.id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      dispatch(setOtherUserTyping(false));
      if (currentConversation) {
        socketService.emitTypingStop(currentConversation.id, user.id);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const updateStatus = async (conversationId, status) => {
    try {
      await dispatch(updateConversationStatus({
        conversationId,
        status
      })).unwrap();
      
      toast.success(t('adminChat.statusUpdated'));
    } catch (error) {
      toast.error(t('adminChat.updateStatusError'));
    }
  };

  const updatePriority = async (conversationId, priority) => {
    try {
      await dispatch(updateConversationStatus({
        conversationId,
        priority
      })).unwrap();
      
      toast.success(t('adminChat.priorityUpdated'));
    } catch (error) {
      toast.error(t('adminChat.updatePriorityError'));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <Circle className="h-4 w-4 text-green-500" />;
      case 'ARCHIVED': return <Archive className="h-4 w-4 text-gray-500" />;
      case 'RESOLVED': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'NORMAL': return 'text-blue-600 bg-blue-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'URGENT': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return t('adminChat.justNow');
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participants.some(p => 
      p.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = !statusFilter || conv.status === statusFilter;
    const matchesPriority = !priorityFilter || conv.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!canManageChat) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">{t('adminChat.accessDenied')}</h1>
            <p className="text-gray-600">{t('adminChat.accessDeniedMessage')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'h-[calc(100vh-2rem)] flex flex-col'} ${!isFullscreen ? 'mt-0' : ''}`}>
      {/* Header - only show when not in fullscreen */}
      {!isFullscreen && (
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('adminChat.title')}</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t('adminChat.subtitle')}</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  title={isFullscreen ? t('adminChat.exitFullscreen') : t('adminChat.enterFullscreen')}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                  {isFullscreen ? t('adminChat.exitFullscreen') : t('adminChat.enterFullscreen')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isFullscreen ? 'h-full' : 'h-[calc(100vh-2rem)]'}`}>
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Conversations Sidebar */}
            <div className={`${isFullscreen ? 'w-1/3' : 'w-full sm:w-1/3 lg:w-1/4'} border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col h-full`}>
              {/* Filters */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder={t('adminChat.searchConversations')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">{t('adminChat.allStatuses')}</option>
                      <option value="ACTIVE">{t('adminChat.active')}</option>
                      <option value="ARCHIVED">{t('adminChat.archived')}</option>
                      <option value="RESOLVED">{t('adminChat.resolved')}</option>
                    </select>
                    
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">{t('adminChat.allPriorities')}</option>
                      <option value="LOW">{t('adminChat.low')}</option>
                      <option value="NORMAL">{t('adminChat.normal')}</option>
                      <option value="HIGH">{t('adminChat.high')}</option>
                      <option value="URGENT">{t('adminChat.urgent')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <LoadingSpinner size="small" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">{t('adminChat.noConversations')}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => {
                      const customer = conversation.participants.find(p => p.user.role === 'CUSTOMER')?.user;
                      const lastMessage = conversation.messages?.[0];
                      const unreadCount = conversation._count?.messages || 0;
                      
                      return (
                        <div
                          key={conversation.id}
                          onClick={() => selectConversation(conversation)}
                          className={`p-4 cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            selectedConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {customer?.fullName || customer?.username || t('adminChat.unknownCustomer')}
                                </h3>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(conversation.status)}
                                  {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                      {unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {lastMessage && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                                  {lastMessage.content}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(conversation.priority)}`}>
                                  {conversation.priority}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(conversation.lastMessageAt || conversation.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
          </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-gray-800 h-full ${!currentConversation ? 'hidden sm:flex' : ''}`}>
              {currentConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Mobile back button */}
                        <button
                          onClick={() => setCurrentConversation(null)}
                          className="sm:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {currentConversation.participants.find(p => p.user.role === 'CUSTOMER')?.user?.fullName || 
                             currentConversation.participants.find(p => p.user.role === 'CUSTOMER')?.user?.username ||
                             t('adminChat.unknownCustomer')}
                          </h2>
                          {otherUserTyping && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">{t('adminChat.customerTyping')}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isFullscreen && (
                          <button
                            onClick={() => setIsFullscreen(false)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            title="Exit fullscreen (Esc)"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Exit Fullscreen
                          </button>
                        )}
                        
                        <select
                          value={currentConversation.status}
                          onChange={(e) => updateStatus(currentConversation.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="ACTIVE">{t('adminChat.active')}</option>
                          <option value="ARCHIVED">{t('adminChat.archived')}</option>
                          <option value="RESOLVED">{t('adminChat.resolved')}</option>
                        </select>
                        
                        <select
                          value={currentConversation.priority}
                          onChange={(e) => updatePriority(currentConversation.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="LOW">{t('adminChat.low')}</option>
                          <option value="NORMAL">{t('adminChat.normal')}</option>
                          <option value="HIGH">{t('adminChat.high')}</option>
                          <option value="URGENT">{t('adminChat.urgent')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">{t('adminChat.noMessages')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === user.id 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.senderId === user.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-lg">
                    <div className="flex items-end space-x-3">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Paperclip size={20} />
                      </button>
                      
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={handleTyping}
                          onKeyPress={handleKeyPress}
                          placeholder={t('adminChat.typeMessage')}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows={1}
                        />
                      </div>
                      
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('adminChat.selectConversation')}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('adminChat.selectConversationMessage')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Exit Fullscreen Button */}
      {isFullscreen && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsFullscreen(false)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            title="Exit fullscreen (Esc)"
          >
            <X className="h-4 w-4 mr-2" />
            Exit Fullscreen
          </button>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminChat;
