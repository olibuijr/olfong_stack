import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLanguage } from "../../contexts/LanguageContext";
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  fetchConversations,
    sendMessage,
    updateConversationStatus,
    markMessagesAsRead,
    handleNewMessage,
    setCurrentConversation} from '../../store/slices/chatSlice';
import socketService from '../../services/socket';
import ConversationSidebar from './chat/components/ConversationSidebar';
import ChatArea from './chat/components/ChatArea';

const Chat = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    conversations, 
    currentConversation, 
    messages, 
    isLoading, 
    otherUserTyping 
  } = useSelector((state) => state.chat);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Refs
  const typingTimeoutRef = useRef(null);

  // Check if user is admin or delivery
  useEffect(() => {
    if (user && !['ADMIN', 'DELIVERY'].includes(user.role)) {
      toast.error(t('adminChat', 'accessDeniedMessage'));
      return;
    }
  }, [user, t]);

  // Load conversations on mount
  useEffect(() => {
    if (user && ['ADMIN', 'DELIVERY'].includes(user.role)) {
      dispatch(fetchConversations());
    }
  }, [dispatch, user]);

  // Socket event listeners
  useEffect(() => {
    if (!user) return;

    const handleNewMessageReceived = (data) => {
      dispatch(handleNewMessage({
        message: data,
        currentUserId: user.id
      }));
    };

    const handleMessageRead = (data) => {
      dispatch(handleNewMessage({
        message: {
          ...data,
          isRead: true,
          readAt: data.readAt
        },
        currentUserId: user.id
      }));
    };

    socketService.on('new-message', handleNewMessageReceived);
    socketService.on('message-read', handleMessageRead);

    return () => {
      socketService.removeListener('new-message', handleNewMessageReceived);
      socketService.removeListener('message-read', handleMessageRead);
    };
  }, [dispatch, user]);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = !searchTerm || 
      conv.participants.some(p => 
        p.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      conv.messages?.some(m => 
        m.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus = !statusFilter || conv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle conversation selection
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await dispatch(setCurrentConversation(conversation)).unwrap();
    
    // Mark messages as read
    try {
      await dispatch(markMessagesAsRead(conversation.id)).unwrap();
    } catch (error) {
      console.warn('Failed to mark messages as read:', error);
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;

    try {
      await dispatch(sendMessage({
        conversationId: currentConversation.id,
        content: newMessage.trim(),
        messageType: 'TEXT'
      })).unwrap();
      
      setNewMessage('');
      
      if (currentConversation) {
        socketService.emitTypingStop(currentConversation.id, user.id);
      }
    } catch (error) {
      toast.error(t('adminChat', 'sendMessageError'));
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (currentConversation) {
      socketService.emitTypingStart(currentConversation.id, user.id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (currentConversation) {
        socketService.emitTypingStop(currentConversation.id, user.id);
      }
    }, 1000);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle status update
  const handleUpdateStatus = async (conversationId, status) => {
    try {
      await dispatch(updateConversationStatus({
        conversationId,
        status
      })).unwrap();
      
      toast.success(t('adminChat', 'statusUpdated'));
    } catch (error) {
      toast.error(t('adminChat', 'updateStatusError'));
    }
  };

  if (!user || !['ADMIN', 'DELIVERY'].includes(user.role)) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('adminChat', 'accessDenied')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('adminChat', 'accessDeniedMessage')}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-2rem)] flex flex-col mt-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-t-lg">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('adminChat', 'title')}</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t('adminChat', 'subtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-[calc(100vh-2rem)] bg-white dark:bg-gray-800 border-l border-r border-b border-gray-200 dark:border-gray-700 rounded-b-lg">
          <div className="flex flex-1 overflow-hidden h-full">
            {/* Conversations Sidebar */}
            <ConversationSidebar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              conversations={conversations}
              isLoading={isLoading}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              filteredConversations={filteredConversations}
            />

            {/* Chat Area */}
            <ChatArea
              currentConversation={currentConversation}
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              isLoading={isLoading}
              otherUserTyping={otherUserTyping}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              onKeyPress={handleKeyPress}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Chat;
