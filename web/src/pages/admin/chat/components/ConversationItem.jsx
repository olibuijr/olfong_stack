import { User, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const ConversationItem = ({
  conversation,
  isSelected,
  onSelect
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ARCHIVED':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };
  const customer = conversation.participants.find(p => p.user.role === 'CUSTOMER')?.user;
  const lastMessage = conversation.messages?.[0];
  const unreadCount = conversation._count?.messages || 0;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {customer?.fullName || customer?.username || 'Unknown Customer'}
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
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {lastMessage ? formatTime(lastMessage.createdAt) : formatTime(conversation.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
